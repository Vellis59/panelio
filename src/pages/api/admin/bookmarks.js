import { requireAdmin } from "utils/admin/auth";
import { bookmarksOps } from "utils/admin/yaml-crud";

/**
 * /api/admin/bookmarks
 * GET    - list all bookmark groups
 * POST   - add bookmark or group (action: "addBookmark" | "addGroup" | "removeGroup")
 * PUT    - update a bookmark
 * DELETE - remove a bookmark
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const groups = await bookmarksOps.list();
        return res.status(200).json(groups);
      }

      case "POST": {
        const { action, group, bookmark } = req.body;

        if (action === "addGroup") {
          if (!group) return res.status(400).json({ error: "Missing group name" });
          const result = await bookmarksOps.addGroup(group);
          return res.status(201).json(result);
        }

        if (action === "removeGroup") {
          if (!group) return res.status(400).json({ error: "Missing group name" });
          const result = await bookmarksOps.removeGroup(group);
          return res.status(200).json(result);
        }

        // Default: add bookmark
        if (!group || !bookmark) {
          return res.status(400).json({ error: "Missing group or bookmark" });
        }
        const result = await bookmarksOps.add(group, bookmark);
        return res.status(201).json(result);
      }

      case "PUT": {
        const { group, bookmark, updates } = req.body;
        if (!group || !bookmark) {
          return res.status(400).json({ error: "Missing group or bookmark name" });
        }
        const result = await bookmarksOps.update(group, bookmark, updates || {});
        return res.status(200).json(result);
      }

      case "DELETE": {
        const { group, bookmark } = req.body;
        if (!group || !bookmark) {
          return res.status(400).json({ error: "Missing group or bookmark name" });
        }
        const result = await bookmarksOps.remove(group, bookmark);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
