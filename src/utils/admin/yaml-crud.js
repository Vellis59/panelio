import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import { CONF_DIR } from "utils/config/config";
import createLogger from "utils/logger";

const logger = createLogger("adminYaml");

/**
 * Trigger Next.js revalidation of the homepage after config changes
 */
async function triggerRevalidate() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    await fetch(`${baseUrl}/api/revalidate`);
    logger.debug("Revalidation triggered");
  } catch (e) {
    logger.warn(`Revalidation failed: ${e.message}`);
  }
}

/**
 * Read and parse a YAML config file
 */
export async function readConfig(filename) {
  const filePath = path.join(CONF_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = yaml.load(raw);
    return data || [];
  } catch (e) {
    if (e.code === "ENOENT") return [];
    logger.error(`Failed to read ${filename}: ${e.message}`);
    throw e;
  }
}

/**
 * Write data to a YAML config file with backup
 */
export async function writeConfig(filename, data) {
  const filePath = path.join(CONF_DIR, filename);
  const backupPath = path.join(CONF_DIR, `${filename}.bak`);

  // Backup existing file
  try {
    await fs.copyFile(filePath, backupPath);
  } catch {
    // File might not exist yet, that's fine
  }

  // Write new content
  const content = yaml.dump(data, { lineWidth: -1, quotingType: '"', forceQuotes: false });
  await fs.writeFile(filePath, content, "utf8");

  // Trigger homepage revalidation (fire and forget)
  triggerRevalidate();
  return true;
}

/**
 * CRUD operations for services.yaml
 */
function findGroupEntry(groups, groupName) {
  return groups.find((g) => Object.keys(g)[0] === groupName);
}

function findSubgroupEntry(groupItems, subgroupName) {
  return groupItems.find((item) => {
    const key = Object.keys(item)[0];
    const val = item[key];
    return Array.isArray(val) && typeof val[0] === "object" && !val[0].href;
  });
}

function isSubgroupItem(item) {
  const key = Object.keys(item)[0];
  const val = item[key];
  return Array.isArray(val);
}

function getServiceItems(groupItems) {
  return groupItems.filter((item) => !isSubgroupItem(item));
}

function getSubgroupItems(groupItems) {
  return groupItems.filter((item) => isSubgroupItem(item));
}

export const servicesOps = {
  async list() {
    return readConfig("services.yaml");
  },

  async add(groupName, service, subgroupName) {
    const groups = await this.list();
    let group = findGroupEntry(groups, groupName);
    if (!group) {
      group = { [groupName]: [] };
      groups.push(group);
    }
    const items = group[groupName];

    if (subgroupName) {
      let sub = items.find((item) => isSubgroupItem(item) && Object.keys(item)[0] === subgroupName);
      if (!sub) {
        throw new Error(`Sub-group "${subgroupName}" not found in group "${groupName}"`);
      }
      sub[subgroupName].push({ [service.name]: { ...service } });
    } else {
      items.push({ [service.name]: { ...service } });
    }

    await writeConfig("services.yaml", groups);
    return groups;
  },

  async update(groupName, serviceName, updates, subgroupName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);

    let target;
    if (subgroupName) {
      target = group[groupName].find((item) => isSubgroupItem(item) && Object.keys(item)[0] === subgroupName);
      if (!target) throw new Error(`Sub-group "${subgroupName}" not found`);
      target = target[subgroupName];
    } else {
      target = group[groupName];
    }

    const idx = target.findIndex((s) => Object.keys(s)[0] === serviceName);
    if (idx === -1) throw new Error(`Service "${serviceName}" not found`);

    const oldService = target[idx];
    const oldKey = Object.keys(oldService)[0];
    const newKey = updates.name || oldKey;
    const existingData = oldService[oldKey];
    delete updates.name;

    target[idx] = { [newKey]: { ...existingData, ...updates } };
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async remove(groupName, serviceName, subgroupName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);

    let target;
    if (subgroupName) {
      const sub = group[groupName].find((item) => isSubgroupItem(item) && Object.keys(item)[0] === subgroupName);
      if (!sub) throw new Error(`Sub-group "${subgroupName}" not found`);
      target = sub[subgroupName];
    } else {
      target = group[groupName];
    }

    const idx = target.findIndex((s) => Object.keys(s)[0] === serviceName);
    if (idx !== -1) target.splice(idx, 1);

    // Clean up empty subgroups
    if (subgroupName && target.length === 0) {
      const subIdx = group[groupName].findIndex((item) => isSubgroupItem(item) && Object.keys(item)[0] === subgroupName);
      if (subIdx !== -1) group[groupName].splice(subIdx, 1);
    }

    if (group[groupName].length === 0) {
      const gIdx = groups.indexOf(group);
      groups.splice(gIdx, 1);
    }

    await writeConfig("services.yaml", groups);
    return groups;
  },

  async reorder(groups) {
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async addGroup(groupName) {
    const groups = await this.list();
    if (findGroupEntry(groups, groupName)) {
      throw new Error(`Group "${groupName}" already exists`);
    }
    groups.push({ [groupName]: [] });
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async removeGroup(groupName) {
    let groups = await this.list();
    groups = groups.filter((g) => Object.keys(g)[0] !== groupName);
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async renameGroup(oldName, newName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, oldName);
    if (!group) throw new Error(`Group "${oldName}" not found`);
    if (findGroupEntry(groups, newName)) {
      throw new Error(`Group "${newName}" already exists`);
    }
    const index = groups.indexOf(group);
    const items = group[oldName];
    groups[index] = { [newName]: items };
    await writeConfig("services.yaml", groups);
    return groups;
  },

  // --- Nested sub-group operations ---

  async addSubgroup(groupName, subgroupName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    const items = group[groupName];

    const existing = items.find((item) => Object.keys(item)[0] === subgroupName);
    if (existing) throw new Error(`"${subgroupName}" already exists in group "${groupName}"`);

    items.push({ [subgroupName]: [] });
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async renameSubgroup(groupName, oldSubName, newSubName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    const items = group[groupName];

    const sub = items.find((item) => isSubgroupItem(item) && Object.keys(item)[0] === oldSubName);
    if (!sub) throw new Error(`Sub-group "${oldSubName}" not found`);

    const existing = items.find((item) => Object.keys(item)[0] === newSubName);
    if (existing) throw new Error(`"${newSubName}" already exists in group "${groupName}"`);

    const subItems = sub[oldSubName];
    const idx = items.indexOf(sub);
    items[idx] = { [newSubName]: subItems };
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async removeSubgroup(groupName, subgroupName) {
    const groups = await this.list();
    const group = findGroupEntry(groups, groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    const items = group[groupName];

    const idx = items.findIndex((item) => isSubgroupItem(item) && Object.keys(item)[0] === subgroupName);
    if (idx === -1) throw new Error(`Sub-group "${subgroupName}" not found`);

    items.splice(idx, 1);
    await writeConfig("services.yaml", groups);
    return groups;
  },
};

/**
 * CRUD operations for bookmarks.yaml
 */
export const bookmarksOps = {
  async list() {
    return readConfig("bookmarks.yaml");
  },

  async add(groupName, bookmark) {
    const groups = await this.list();
    let group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) {
      group = { [groupName]: [] };
      groups.push(group);
    }
    group[groupName].push({
      [bookmark.name]: [{ abbr: bookmark.abbr || "", href: bookmark.href }],
    });
    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },

  async update(groupName, bookmarkName, updates) {
    const groups = await this.list();
    const group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    const idx = group[groupName].findIndex((b) => Object.keys(b)[0] === bookmarkName);
    if (idx === -1) throw new Error(`Bookmark "${bookmarkName}" not found`);

    const old = group[groupName][idx];
    const oldKey = Object.keys(old)[0];
    const oldData = old[oldKey][0];
    const newKey = updates.name || oldKey;
    delete updates.name;

    group[groupName][idx] = {
      [newKey]: [{ ...oldData, ...updates }],
    };
    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },

  async remove(groupName, bookmarkName) {
    const groups = await this.list();
    const group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    group[groupName] = group[groupName].filter((b) => Object.keys(b)[0] !== bookmarkName);

    if (group[groupName].length === 0) {
      const gIdx = groups.indexOf(group);
      groups.splice(gIdx, 1);
    }

    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },

  async addGroup(groupName) {
    const groups = await this.list();
    if (groups.find((g) => Object.keys(g)[0] === groupName)) {
      throw new Error(`Group "${groupName}" already exists`);
    }
    groups.push({ [groupName]: [] });
    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },

  async removeGroup(groupName) {
    let groups = await this.list();
    groups = groups.filter((g) => Object.keys(g)[0] !== groupName);
    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },

  async renameGroup(oldName, newName) {
    const groups = await this.list();
    const group = groups.find((g) => Object.keys(g)[0] === oldName);
    if (!group) throw new Error(`Group "${oldName}" not found`);
    if (groups.find((g) => Object.keys(g)[0] === newName)) {
      throw new Error(`Group "${newName}" already exists`);
    }

    const index = groups.indexOf(group);
    const items = group[oldName];
    groups[index] = { [newName]: items };
    await writeConfig("bookmarks.yaml", groups);
    return groups;
  },
};

/**
 * Read/write settings.yaml
 */
export const settingsOps = {
  async get() {
    return readConfig("settings.yaml");
  },

  async update(updates) {
    const current = await this.get();
    const merged = { ...current, ...updates };
    await writeConfig("settings.yaml", merged);
    return merged;
  },
};
