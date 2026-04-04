import { requireAdmin } from "utils/admin/auth";
import { demoBlock } from "utils/admin/demo";
import { settingsOps } from "utils/admin/yaml-crud";

/**
 * /api/admin/settings
 * GET - get settings
 * PUT - update settings
 */
async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const settings = await settingsOps.get();
        return res.status(200).json(settings);
      }

      case "PUT": {
        const { updates } = req.body;
        if (!updates) return res.status(400).json({ error: "Missing updates" });
        const result = await settingsOps.update(updates);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export default demoBlock(handler);
