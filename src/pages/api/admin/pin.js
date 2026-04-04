import { requireAdmin } from "utils/admin/auth";
import { demoBlock } from "utils/admin/demo";
import { settingsOps } from "utils/admin/yaml-crud";

/**
 * /api/admin/pin
 * POST - toggle pin status for a service
 * Body: { group, service } — adds to pinned, removes if already pinned
 */
async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { group, service } = req.body;
    if (!group || !service) {
      return res.status(400).json({ error: "Missing group or service" });
    }

    const settings = await settingsOps.get();
    const key = `${group}::${service}`;
    let pinned = settings.panelioPinned || [];

    if (pinned.includes(key)) {
      pinned = pinned.filter((k) => k !== key);
    } else {
      pinned.push(key);
    }

    await settingsOps.update({ panelioPinned: pinned });
    return res.status(200).json({ pinned });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export default demoBlock(handler);
