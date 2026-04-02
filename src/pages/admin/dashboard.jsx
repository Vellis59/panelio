import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

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
        <button onClick={() => onSave({ name, href, description, icon, ping })} disabled={!name || !href}
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
        <button onClick={() => onSave({ name, abbr, href })} disabled={!name || !href}
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

  const saveNewService = async (groupName, data) => {
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: data }),
    });
    setAddingService(null);
    fetchServices();
  };

  const updateService = async (groupName, oldName, data) => {
    await fetch("/api/admin/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: oldName, updates: data }),
    });
    setEditingService(null);
    fetchServices();
  };

  const deleteService = async (groupName, serviceName) => {
    if (!confirm(`Delete service "${serviceName}"?`)) return;
    await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName, service: serviceName }),
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Homepage Admin</title>
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Homepage Admin</h1>
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
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{groupName}</h3>
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
                    {addingService === groupName && (
                      <ServiceForm
                        onSave={(data) => saveNewService(groupName, data)}
                        onCancel={() => setAddingService(null)}
                      />
                    )}
                    {items.map((svc, idx) => {
                      const svcName = Object.keys(svc)[0];
                      const svcData = svc[svcName];
                      return (
                        <div key={idx}>
                          {editingService?.group === groupName && editingService?.index === idx ? (
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
                    {items.length === 0 && !addingService && (
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
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{groupName}</h3>
                    <div className="flex gap-2">
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
  const isEdit = widget !== null;
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
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const updates = JSON.parse(json);
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

