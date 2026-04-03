import { useState } from "react";

// --- Backup Tab Component ---
export default function BackupTab() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleExport = () => {
    fetch("/api/admin/export", { credentials: "same-origin" })
      .then((r) => {
        if (!r.ok) throw new Error("Export failed: " + r.status);
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `panelio-config-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => setError(e.message));
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError("");
    setResult(null);

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Import failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Import / Export</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">📥 Export Configuration</h3>
          <p className="text-sm text-gray-500 mb-4">
            Download all config files (services, bookmarks, widgets, settings, custom CSS/JS) as a single JSON bundle.
          </p>
          <button onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
            Download Backup
          </button>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">📤 Import Configuration</h3>
          <p className="text-sm text-gray-500 mb-4">
            Restore from a previously exported JSON backup. This will overwrite existing config files!
          </p>
          <label className={`inline-block px-4 py-2 rounded text-sm text-white cursor-pointer ${importing ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}>
            {importing ? "Importing..." : "Choose Backup File"}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          {result && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded text-sm">
              <p className="text-green-700 dark:text-green-300 font-medium">✅ Import successful!</p>
              <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                Imported: {result.imported?.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          ⚠️ <strong>Warning:</strong> Importing will overwrite your current configuration. Auto-backups are saved as <code>.bak</code> files, but export first to be safe.
        </p>
      </div>
    </div>
  );
}
