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
export const servicesOps = {
  async list() {
    return readConfig("services.yaml");
  },

  async add(groupName, service) {
    const groups = await this.list();
    let group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) {
      group = { [groupName]: [] };
      groups.push(group);
    }
    const services = group[groupName];
    services.push({ [service.name]: { ...service } });
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async update(groupName, serviceName, updates) {
    const groups = await this.list();
    const group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    const services = group[groupName];
    const idx = services.findIndex((s) => Object.keys(s)[0] === serviceName);
    if (idx === -1) throw new Error(`Service "${serviceName}" not found in group "${groupName}"`);

    // If renaming, update the key
    const oldService = services[idx];
    const oldKey = Object.keys(oldService)[0];
    const newKey = updates.name || oldKey;
    const existingData = oldService[oldKey];
    delete updates.name; // Don't store name as a field

    services[idx] = { [newKey]: { ...existingData, ...updates } };
    await writeConfig("services.yaml", groups);
    return groups;
  },

  async remove(groupName, serviceName) {
    const groups = await this.list();
    const group = groups.find((g) => Object.keys(g)[0] === groupName);
    if (!group) throw new Error(`Group "${groupName}" not found`);
    group[groupName] = group[groupName].filter((s) => Object.keys(s)[0] !== serviceName);

    // Remove empty groups
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
    if (groups.find((g) => Object.keys(g)[0] === groupName)) {
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
