import { requireAdmin } from "utils/admin/auth";
import { isDemo } from "utils/admin/demo";
import { readConfig, writeConfig } from "utils/admin/yaml-crud";
import { promises as fs } from "fs";
import path from "path";
import { CONF_DIR } from "utils/config/config";

/**
 * /api/admin/export - GET: export all config as JSON bundle
 * /api/admin/import - POST: import config bundle (blocked in demo mode)
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      // Export all config files (allowed in demo mode)
      const configFiles = ["services.yaml", "bookmarks.yaml", "settings.yaml", "widgets.yaml", "docker.yaml", "kubernetes.yaml"];
      const bundle = {};

      for (const file of configFiles) {
        try {
          bundle[file] = await readConfig(file);
        } catch {
          bundle[file] = null;
        }
      }

      // Also export custom CSS/JS if they exist
      for (const extra of ["custom.css", "custom.js"]) {
        const filePath = path.join(CONF_DIR, extra);
        try {
          bundle[extra] = await fs.readFile(filePath, "utf8");
        } catch {
          bundle[extra] = null;
        }
      }

      bundle._exportedAt = new Date().toISOString();
      bundle._version = "1.0.0";

      res.setHeader("Content-Disposition", `attachment; filename="panelio-config-${new Date().toISOString().slice(0, 10)}.json"`);
      return res.status(200).json(bundle);
    }

    if (req.method === "POST") {
      // Import config bundle - BLOCKED in demo mode
      if (isDemo()) {
        return res.status(403).json({ error: "Demo mode: imports are disabled" });
      }

      const { config } = req.body;
      if (!config || typeof config !== "object") {
        return res.status(400).json({ error: "Missing config bundle" });
      }

      const yamlFiles = ["services.yaml", "bookmarks.yaml", "settings.yaml", "widgets.yaml", "docker.yaml", "kubernetes.yaml"];
      const imported = [];

      for (const file of yamlFiles) {
        if (config[file] !== undefined && config[file] !== null) {
          await writeConfig(file, config[file]);
          imported.push(file);
        }
      }

      // Import custom CSS/JS
      for (const extra of ["custom.css", "custom.js"]) {
        if (config[extra] !== undefined && config[extra] !== null) {
          const filePath = path.join(CONF_DIR, extra);
          await fs.writeFile(filePath, config[extra], "utf8");
          imported.push(extra);
        }
      }

      return res.status(200).json({ success: true, imported });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
