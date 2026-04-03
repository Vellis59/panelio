import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BackupTab from "components/admin/BackupTab";

export function normalizeUserUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (/^(mailto:|tel:|javascript:|#|\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[^\s]+\.[^\s]+/.test(trimmed) || /^localhost(?::\d+)?(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

// --- Service Form Component ---
function ServiceForm({ group, service, onSave, onCancel }) {
  const [name, setName] = useState(service ? Object.keys(service)[0] : "");
  const existing = service ? service[Object.keys(service)[0]] : {};
  const [href, setHref] = useState(existing.href || "");
  const [description, setDescription] = useState(existing.description || "");
  const [icon, setIcon] = useState(existing.icon || "");
  const [ping, setPing] = useState(existing.ping || "");

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-3">
      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-200">
        {service ? "Edit Service" : "Add Service"}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)}
          className="col-span-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="URL *" value={href} onChange={(e) => setHref(e.target.value)}
          className="col-span-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="col-span-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="Icon (e.g. si-plex)" value={icon} onChange={(e) => setIcon(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="Ping URL" value={ping} onChange={(e) => setPing(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave({ name, href: normalizeUserUrl(href), description, icon, ping: normalizeUserUrl(ping) })} disabled={!name || !href}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm">
          Save
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- Bookmark Form Component ---
function BookmarkForm({ bookmark, onSave, onCancel }) {
  const [name, setName] = useState(bookmark ? Object.keys(bookmark)[0] : "");
  const existing = bookmark ? bookmark[Object.keys(bookmark)[0]][0] : {};
  const [abbr, setAbbr] = useState(existing.abbr || "");
  const [href, setHref] = useState(existing.href || "");

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-3">
      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-200">
        {bookmark ? "Edit Bookmark" : "Add Bookmark"}
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)}
          className="col-span-2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="Abbr" value={abbr} onChange={(e) => setAbbr(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        <input placeholder="URL *" value={href} onChange={(e) => setHref(e.target.value)}
          className="col-span-3 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave({ name, abbr, href: normalizeUserUrl(href) })} disabled={!name || !href}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm">
          Save
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- Sub-group Section Component ---
function SubgroupSection({ groupName, subgroupName, subItems, editingService, setEditingService, updateService, deleteService, addingServiceToSubgroup, setAddingServiceToSubgroup, saveNewService, renamingSubgroup, setRenamingSubgroup, renameSubgroup, removeSubgroup }) {
  return (
    <div className="ml-4 pl-3 border-l-2 border-blue-400 dark:border-blue-500 mt-2 mb-2">
      <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        {renamingSubgroup?.group === groupName && renamingSubgroup?.oldName === subgroupName ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input autoFocus defaultValue={subgroupName}
              onKeyDown={(e) => {
                if (e.key === "Enter") renameSubgroup(groupName, subgroupName, e.currentTarget.value);
                if (e.key === "Escape") setRenamingSubgroup(null);
              }}
              className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs flex-1"
            />
            <button onClick={(e) => renameSubgroup(groupName, subgroupName, e.currentTarget.parentElement.querySelector("input")?.value || subgroupName)}
              className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">Save</button>
            <button onClick={() => setRenamingSubgroup(null)}
              className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
          </div>
        ) : (
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">📁 {subgroupName}</span>
        )}
        <div className="flex gap-1.5">
          <button onClick={() => setRenamingSubgroup({ group: groupName, oldName: subgroupName })}
            className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded dark:bg-amber-900 dark:text-amber-300">Rename</button>
          <button onClick={() => setAddingServiceToSubgroup(`${groupName}/${subgroupName}`)}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-300">+ Service</button>
          <button onClick={() => removeSubgroup(groupName, subgroupName)}
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-300">Delete</button>
        </div>
      </div>
      <div className="mt-1">
        {addingServiceToSubgroup === `${groupName}/${subgroupName}` && (
          <ServiceForm
            onSave={(data) => saveNewService(groupName, data, subgroupName)}
            onCancel={() => setAddingServiceToSubgroup(null)}
          />
        )}
        {subItems.map((svc, idx) => {
          const svcName = Object.keys(svc)[0];
          const svcData = svc[svcName];
          const isEditing = editingService?.group === groupName && editingService?.index === idx && editingService?.subgroup === subgroupName;
          return (
            <div key={idx}>
              {isEditing ? (
                <ServiceForm
                  service={svc}
                  onSave={(data) => { updateService(groupName, svcName, data, subgroupName); setEditingService(null); }}
                  onCancel={() => setEditingService(null)}
                />
              ) : (
                <div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{svcName}</span>
                    {svcData.description && <span className="text-gray-400 text-xs ml-2">{svcData.description}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {svcData.href && <a href={svcData.href} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{svcData.href}</a>}
                    <button onClick={() => setEditingService({ group: groupName, index: idx, subgroup: subgroupName })} className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded dark:bg-amber-900 dark:text-amber-300">Edit</button>
                    <button onClick={() => deleteService(groupName, svcName, subgroupName)} className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded dark:bg-red-900 dark:text-red-300">Del</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {subItems.length === 0 && !addingServiceToSubgroup && (
          <p className="text-gray-400 text-xs text-center py-1">No services in this sub-group</p>
        )}
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null); // { group, index }
  const [addingService, setAddingService] = useState(null); // group name
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [addingBookmark, setAddingBookmark] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [renamingServiceGroup, setRenamingServiceGroup] = useState(null);
  const [renamingBookmarkGroup, setRenamingBookmarkGroup] = useState(null);
  const [addingSubgroup, setAddingSubgroup] = useState(null); // "groupName"
  const [renamingSubgroup, setRenamingSubgroup] = useState(null); // { group, oldName }
  const [addingServiceToSubgroup, setAddingServiceToSubgroup] = useState(null); // "groupName/subgroupName"

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/admin/services");
    if (res.ok) setServices(await res.json());
  }, []);

  const fetchBookmarks = useCallback(async () => {
    const res = await fetch("/api/admin/bookmarks");
    if (res.ok) setBookmarks(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/admin/check").then((r) => r.json()).then((d) => {
      if (!d.authenticated) {
        router.replace("/admin");
      } else {
        Promise.all([fetchServices(), fetchBookmarks()]).finally(() => setLoading(false));
      }
    });
  }, [router, fetchServices, fetchBookmarks]);

  const logout = async () => {
    document.cookie = "panelio_admin_token=; Path=/; Max-Age=0";
    document.cookie = "homepage_admin_token=; Path=/; Max-Age=0";
    router.replace("/admin");
  };

  // --- Service Actions ---
  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addGroup", group: newGroupName.trim() }),
    });
    setNewGroupName("");
    fetchServices();
  };

  const removeGroup = async (name) => {
    if (!confirm(`Delete group "${name}" and all its services?`)) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeGroup", group: name }),
    });
    fetchServices();
  };

  const renameServiceGroup = async (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingServiceGroup(null);
      return;
    }
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renameGroup", oldGroup: oldName, newGroup: trimmed }),
    });
    setRenamingServiceGroup(null);
    fetchServices();
  };

  const saveNewService = async (groupName, data, subgroupName) => {
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: data, subgroup: subgroupName || undefined }),
    });
    setAddingService(null);
    setAddingServiceToSubgroup(null);
    fetchServices();
  };

  const updateService = async (groupName, oldName, data, subgroupName) => {
    await fetch("/api/admin/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: oldName, updates: data, subgroup: subgroupName || undefined }),
    });
    setEditingService(null);
    fetchServices();
  };

  const deleteService = async (groupName, serviceName, subgroupName) => {
    if (!confirm(`Delete service "${serviceName}"?`)) return;
    await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: serviceName, subgroup: subgroupName || undefined }),
    });
    fetchServices();
  };

  // --- Sub-group Actions ---
  const addSubgroup = async (groupName, subgroupName) => {
    const trimmed = subgroupName.trim();
    if (!trimmed) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addSubgroup", group: groupName, subgroup: trimmed }),
    });
    setAddingSubgroup(null);
    fetchServices();
  };

  const renameSubgroup = async (groupName, oldSubName, newSubName) => {
    const trimmed = newSubName.trim();
    if (!trimmed || trimmed === oldSubName) {
      setRenamingSubgroup(null);
      return;
    }
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renameSubgroup", group: groupName, oldSubgroup: oldSubName, newSubgroup: trimmed }),
    });
    setRenamingSubgroup(null);
    fetchServices();
  };

  const removeSubgroup = async (groupName, subgroupName) => {
    if (!confirm(`Delete sub-group "${subgroupName}" and all its services?`)) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeSubgroup", group: groupName, subgroup: subgroupName }),
    });
    fetchServices();
  };

  // --- Bookmark Actions ---
  const addBookmarkGroup = async () => {
    if (!newGroupName.trim()) return;
    await fetch("/api/admin/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addGroup", group: newGroupName.trim() }),
    });
    setNewGroupName("");
    fetchBookmarks();
  };

  const removeBookmarkGroup = async (name) => {
    if (!confirm(`Delete bookmark group "${name}"?`)) return;
    await fetch("/api/admin/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeGroup", group: name }),
    });
    fetchBookmarks();
  };

  const renameBookmarkGroup = async (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingBookmarkGroup(null);
      return;
    }
    await fetch("/api/admin/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renameGroup", oldGroup: oldName, newGroup: trimmed }),
    });
    setRenamingBookmarkGroup(null);
    fetchBookmarks();
  };

  const saveNewBookmark = async (groupName, data) => {
    await fetch("/api/admin/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, bookmark: data }),
    });
    setAddingBookmark(null);
    fetchBookmarks();
  };

  const updateBookmark = async (groupName, oldName, data) => {
    await fetch("/api/admin/bookmarks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, bookmark: oldName, updates: data }),
    });
    setEditingBookmark(null);
    fetchBookmarks();
  };

  const deleteBookmark = async (groupName, bookmarkName) => {
    if (!confirm(`Delete bookmark "${bookmarkName}"?`)) return;
    await fetch("/api/admin/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, bookmark: bookmarkName }),
    });
    fetchBookmarks();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  const tabs = [
    { id: "services", label: "Services", icon: "📦" },
    { id: "bookmarks", label: "Bookmarks", icon: "🔖" },
    { id: "widgets", label: "Widgets", icon: "🧩" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "preview", label: "Preview", icon: "👁️" },
    { id: "backup", label: "Backup", icon: "💾" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Panelio Admin</title>
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Panelio Admin</h1>
            <nav className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-blue-600 hover:underline">← View Homepage</a>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Widgets Tab */}
        {tab === "widgets" && (
          <WidgetsTab />
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <SettingsTab />
        )}

        {/* Preview Tab */}
        {tab === "preview" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Live Preview</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <iframe
                src="/"
                className="w-full border-0"
                style={{ height: "80vh" }}
                title="Homepage Preview"
              />
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {tab === "backup" && (
          <BackupTab />
        )}

        {/* Services Tab */}
        {tab === "services" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <input
                placeholder="New group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1"
              />
              <button onClick={addGroup} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                + Add Group
              </button>
            </div>

            {services.length === 0 && (
              <p className="text-gray-400 text-center py-8">No service groups yet. Add one above!</p>
            )}

            {services.map((group) => {
              const groupName = Object.keys(group)[0];
              const items = group[groupName];
              return (
                <div key={groupName} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                    {renamingServiceGroup?.oldName === groupName ? (
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <input
                          autoFocus
                          defaultValue={groupName}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameServiceGroup(groupName, e.currentTarget.value);
                            if (e.key === "Escape") setRenamingServiceGroup(null);
                          }}
                          className="px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1"
                        />
                        <button
                          onClick={(e) => renameServiceGroup(groupName, e.currentTarget.parentElement.querySelector("input")?.value || groupName)}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenamingServiceGroup(null)}
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{groupName}</h3>
                    )}
                    <div className="flex gap-1 items-center">
                      <button onClick={async () => {
                        const gIdx = services.findIndex((g) => Object.keys(g)[0] === groupName);
                        if (gIdx > 0) {
                          const newGroups = [...services]; [newGroups[gIdx-1], newGroups[gIdx]] = [newGroups[gIdx], newGroups[gIdx-1]];
                          setServices(newGroups);
                          await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorder", groups: newGroups }) });
                        }
                      }} disabled={services.findIndex((g) => Object.keys(g)[0] === groupName) === 0}
                        className="text-xs px-1 py-1 text-gray-400 hover:text-blue-500 disabled:opacity-20">↑</button>
                      <button onClick={async () => {
                        const gIdx = services.findIndex((g) => Object.keys(g)[0] === groupName);
                        if (gIdx < services.length - 1) {
                          const newGroups = [...services]; [newGroups[gIdx], newGroups[gIdx+1]] = [newGroups[gIdx+1], newGroups[gIdx]];
                          setServices(newGroups);
                          await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorder", groups: newGroups }) });
                        }
                      }} disabled={services.findIndex((g) => Object.keys(g)[0] === groupName) === services.length - 1}
                        className="text-xs px-1 py-1 text-gray-400 hover:text-blue-500 disabled:opacity-20">↓</button>
                      <span className="mx-1">|</span>
                      <button onClick={() => setRenamingServiceGroup({ oldName: groupName })}
                        className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded dark:bg-amber-900 dark:text-amber-300">
                        Rename
                      </button>
                      <button onClick={() => setAddingSubgroup(groupName)}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded dark:bg-purple-900 dark:text-purple-300">
                        + Sub-group
                      </button>
                      <button onClick={() => setAddingService(groupName)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-300">
                        + Service
                      </button>
                      <button onClick={() => removeGroup(groupName)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-300">
                        Delete Group
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {addingSubgroup === groupName && (
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          placeholder="Sub-group name..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) addSubgroup(groupName, e.currentTarget.value);
                            if (e.key === "Escape") setAddingSubgroup(null);
                          }}
                          className="px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1"
                        />
                        <button
                          onClick={(e) => addSubgroup(groupName, e.currentTarget.parentElement.querySelector("input")?.value || "")}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs"
                        >Create</button>
                        <button
                          onClick={() => setAddingSubgroup(null)}
                          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 rounded text-xs"
                        >Cancel</button>
                      </div>
                    )}
                    {addingService === groupName && (
                      <ServiceForm
                        onSave={(data) => saveNewService(groupName, data)}
                        onCancel={() => setAddingService(null)}
                      />
                    )}
                    {items.map((svc, idx) => {
                      const svcName = Object.keys(svc)[0];
                      const svcData = svc[svcName];

                      // Check if this is a sub-group entry (array = sub-group, object with href = service)
                      if (Array.isArray(svcData)) {
                        return (
                          <SubgroupSection
                            key={svcName}
                            groupName={groupName}
                            subgroupName={svcName}
                            subItems={svcData}
                            editingService={editingService}
                            setEditingService={setEditingService}
                            updateService={updateService}
                            deleteService={deleteService}
                            addingServiceToSubgroup={addingServiceToSubgroup}
                            setAddingServiceToSubgroup={setAddingServiceToSubgroup}
                            saveNewService={saveNewService}
                            renamingSubgroup={renamingSubgroup}
                            setRenamingSubgroup={setRenamingSubgroup}
                            renameSubgroup={renameSubgroup}
                            removeSubgroup={removeSubgroup}
                          />
                        );
                      }

                      // Regular service entry
                      return (
                        <div key={idx}>
                          {editingService?.group === groupName && editingService?.index === idx && !editingService?.subgroup ? (
                            <ServiceForm
                              service={svc}
                              onSave={(data) => updateService(groupName, svcName, data)}
                              onCancel={() => setEditingService(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{svcName}</span>
                                {svcData.description && (
                                  <span className="text-gray-400 text-sm ml-2">{svcData.description}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {svcData.href && (
                                  <a href={svcData.href} target="_blank" rel="noreferrer"
                                    className="text-xs text-blue-500 hover:underline">{svcData.href}</a>
                                )}
                                <button onClick={() => setEditingService({ group: groupName, index: idx })}
                                  className="text-xs text-gray-400 hover:text-blue-500">✏️</button>
                                <button onClick={() => deleteService(groupName, svcName)}
                                  className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {items.length === 0 && !addingService && !addingSubgroup && (
                      <p className="text-gray-400 text-sm text-center py-2">No services in this group</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookmarks Tab */}
        {/* Bookmarks Tab */}
        {tab === "bookmarks" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <input
                placeholder="New group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBookmarkGroup()}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1"
              />
              <button onClick={addBookmarkGroup} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                + Add Group
              </button>
            </div>

            {bookmarks.length === 0 && (
              <p className="text-gray-400 text-center py-8">No bookmark groups yet. Add one above!</p>
            )}

            {bookmarks.map((group) => {
              const groupName = Object.keys(group)[0];
              const items = group[groupName];
              return (
                <div key={groupName} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                    {renamingBookmarkGroup?.oldName === groupName ? (
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <input
                          autoFocus
                          defaultValue={groupName}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameBookmarkGroup(groupName, e.currentTarget.value);
                            if (e.key === "Escape") setRenamingBookmarkGroup(null);
                          }}
                          className="px-3 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1"
                        />
                        <button
                          onClick={(e) => renameBookmarkGroup(groupName, e.currentTarget.parentElement.querySelector("input")?.value || groupName)}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenamingBookmarkGroup(null)}
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{groupName}</h3>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setRenamingBookmarkGroup({ oldName: groupName })}
                        className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded dark:bg-amber-900 dark:text-amber-300">
                        Rename
                      </button>
                      <button onClick={() => setAddingBookmark(groupName)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-300">
                        + Bookmark
                      </button>
                      <button onClick={() => removeBookmarkGroup(groupName)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-300">
                        Delete Group
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {addingBookmark === groupName && (
                      <BookmarkForm
                        onSave={(data) => saveNewBookmark(groupName, data)}
                        onCancel={() => setAddingBookmark(null)}
                      />
                    )}
                    {items.map((bm, idx) => {
                      const bmName = Object.keys(bm)[0];
                      const bmData = bm[bmName][0];
                      return (
                        <div key={idx}>
                          {editingBookmark?.group === groupName && editingBookmark?.index === idx ? (
                            <BookmarkForm
                              bookmark={bm}
                              onSave={(data) => updateBookmark(groupName, bmName, data)}
                              onCancel={() => setEditingBookmark(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <div className="flex items-center gap-2">
                                {bmData.abbr && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded font-mono">
                                    {bmData.abbr}
                                  </span>
                                )}
                                <span className="font-medium text-gray-700 dark:text-gray-200">{bmName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {bmData.href && (
                                  <a href={bmData.href} target="_blank" rel="noreferrer"
                                    className="text-xs text-blue-500 hover:underline">{bmData.href}</a>
                                )}
                                <button onClick={() => setEditingBookmark({ group: groupName, index: idx })}
                                  className="text-xs text-gray-400 hover:text-blue-500">✏️</button>
                                <button onClick={() => deleteBookmark(groupName, bmName)}
                                  className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// --- Widgets Tab Component ---
const WIDGET_TYPES = [
  "resources", "search", "weather", "openweathermap", "weatherapi", "openmeteo",
  "datetime", "glances", "docker", "kubernetes", "clock", "logo",
];

function WidgetForm({ widget, index, onSave, onCancel }) {
  const isEdit = widget != null;
  const existingType = isEdit ? Object.keys(widget)[0] : "";
  const existingOpts = isEdit ? widget[existingType] : {};

  const [type, setType] = useState(existingType);
  const [optionsJson, setOptionsJson] = useState(
    JSON.stringify(existingOpts, null, 2)
  );
  const [error, setError] = useState("");

  const handleSave = () => {
    try {
      const opts = optionsJson.trim() ? JSON.parse(optionsJson) : {};
      onSave({ type, options: opts }, index);
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-3">
      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-200">
        {isEdit ? `Edit Widget #${index}` : "Add Widget"}
      </h4>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Type</label>
          {isEdit ? (
            <input value={type} readOnly className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
          ) : (
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
              <option value="">Select type...</option>
              {WIDGET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Options (JSON)</label>
          <textarea value={optionsJson} onChange={(e) => { setOptionsJson(e.target.value); setError(""); }}
            rows={6}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
            placeholder='{ "cpu": true, "memory": true }' />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleSave} disabled={!type}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm">
          Save
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function WidgetsTab() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);

  const fetchWidgets = useCallback(async () => {
    const res = await fetch("/api/admin/widgets");
    if (res.ok) setWidgets(await res.json());
  }, []);

  useEffect(() => { fetchWidgets().finally(() => setLoading(false)); }, [fetchWidgets]);

  const addWidget = async (widgetData) => {
    await fetch("/api/admin/widgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widget: widgetData }),
    });
    setAdding(false);
    fetchWidgets();
  };

  const updateWidget = async (widgetData, idx) => {
    await fetch("/api/admin/widgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: idx, widget: widgetData }),
    });
    setEditingIdx(null);
    fetchWidgets();
  };

  const deleteWidget = async (idx) => {
    const w = widgets[idx];
    const type = Object.keys(w)[0];
    if (!confirm(`Delete widget "${type}" #${idx}?`)) return;
    await fetch("/api/admin/widgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: idx }),
    });
    fetchWidgets();
  };

  if (loading) return <p className="text-gray-400 text-center py-8">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Widgets</h2>
        <button onClick={() => setAdding(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
          + Add Widget
        </button>
      </div>

      {adding && (
        <WidgetForm onSave={addWidget} onCancel={() => setAdding(false)} />
      )}

      {widgets.length === 0 && !adding && (
        <p className="text-gray-400 text-center py-8">No widgets configured. Add one above!</p>
      )}

      {widgets.map((w, idx) => {
        const type = Object.keys(w)[0];
        const opts = w[type];
        return (
          <div key={idx}>
            {editingIdx === idx ? (
              <WidgetForm widget={w} index={idx} onSave={updateWidget} onCancel={() => setEditingIdx(null)} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-3">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{type}</span>
                    <span className="text-xs text-gray-400 ml-2">#{idx}</span>
                    <pre className="text-xs text-gray-500 mt-1 ml-0">{JSON.stringify(opts, null, 2)}</pre>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingIdx(idx)} className="text-xs text-gray-400 hover:text-blue-500">✏️</button>
                    <button onClick={() => deleteWidget(idx)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Settings Tab Component ---
function SettingsTab() {
  const [settings, setSettings] = useState({});
  const [json, setJson] = useState("");
  const [overviewTitle, setOverviewTitle] = useState("");
  const [overviewSubtitle, setOverviewSubtitle] = useState("");
  const [overviewDescription, setOverviewDescription] = useState("");
  const [greetingName, setGreetingName] = useState("");
  const [showGreeting, setShowGreeting] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [cardStyle, setCardStyle] = useState("panelio");
  const [themePreset, setThemePreset] = useState("velvet-night");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setJson(JSON.stringify(data, null, 2));
        setOverviewTitle(data.panelioOverviewTitle || "");
        setOverviewSubtitle(data.panelioOverviewSubtitle || "");
        setOverviewDescription(data.panelioOverviewDescription || "");
        setGreetingName(data.panelioGreetingName || "");
        setShowGreeting(data.panelioShowGreeting !== false);
        setShowClock(data.panelioShowClock !== false);
        setCardStyle(data.panelioCardStyle || "panelio");
        setThemePreset(data.panelioThemePreset || "velvet-night");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      let updates = JSON.parse(json);
      // Merge overview fields
      if (overviewTitle) updates.panelioOverviewTitle = overviewTitle;
      else delete updates.panelioOverviewTitle;
      if (overviewSubtitle) updates.panelioOverviewSubtitle = overviewSubtitle;
      else delete updates.panelioOverviewSubtitle;
      if (overviewDescription) updates.panelioOverviewDescription = overviewDescription;
      else delete updates.panelioOverviewDescription;
      if (greetingName) updates.panelioGreetingName = greetingName;
      else delete updates.panelioGreetingName;
      updates.panelioShowGreeting = showGreeting;
      updates.panelioShowClock = showClock;
      updates.panelioCardStyle = cardStyle;
      updates.panelioThemePreset = themePreset;
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Save failed");
      }
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-center py-8">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
        <div className="flex gap-2 items-center">
          {success && <span className="text-green-500 text-sm">✅ Saved!</span>}
          <button onClick={saveSettings} disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* Panelio Overview customization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-3">🏠 Homepage Overview</h3>
        <p className="text-xs text-gray-400 mb-3">Customize the overview section shown on your homepage.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title</label>
            <input
              value={overviewTitle}
              onChange={(e) => setOverviewTitle(e.target.value)}
              placeholder="Panelio Overview"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Subtitle</label>
            <input
              value={overviewSubtitle}
              onChange={(e) => setOverviewSubtitle(e.target.value)}
              placeholder="Your dashboard at a glance"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input
              value={overviewDescription}
              onChange={(e) => setOverviewDescription(e.target.value)}
              placeholder="Auto-generated if left empty"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-3">🪟 Service Card Style</h3>
        <p className="text-xs text-gray-400 mb-3">Choose the visual style for service cards on the homepage.</p>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Card style</label>
          <select
            value={cardStyle}
            onChange={(e) => setCardStyle(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="panelio">Panelio — Soft Glass</option>
            <option value="classic">Classic — Current style</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-3">🎨 Panelio Theme Preset</h3>
        <p className="text-xs text-gray-400 mb-3">Choose the global visual atmosphere for the Panelio style.</p>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Theme preset</label>
          <select
            value={themePreset}
            onChange={(e) => setThemePreset(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="velvet-night">Velvet Night</option>
            <option value="ember-grid">Ember Grid</option>
            <option value="cloudmilk">Cloudmilk</option>
            <option value="solar-linen">Solar Linen</option>
            <option value="north-sea">North Sea</option>
            <option value="dark-mirror">Dark Mirror</option>
          </select>
        </div>
      </div>

      {/* Panelio Greeting & Clock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-3">👋 Header Greeting & Clock</h3>
        <p className="text-xs text-gray-400 mb-3">Customize the greeting and clock shown in the header of your homepage.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Your name (shown in greeting)</label>
            <input
              value={greetingName}
              onChange={(e) => setGreetingName(e.target.value)}
              placeholder="Leave empty for generic greeting"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={showGreeting} onChange={(e) => setShowGreeting(e.target.checked)} className="rounded" />
              Show greeting message
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} className="rounded" />
              Show clock & date
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="text-xs text-gray-400 mb-2">
          Edit settings.yaml as JSON. Common keys: title, description, language, layout, color, theme, providers, etc.
        </p>
        <textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setError(""); setSuccess(false); }}
          rows={20}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
        />
      </div>
    </div>
  );
}

