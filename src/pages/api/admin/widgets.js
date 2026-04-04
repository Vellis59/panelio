import { requireAdmin } from "utils/admin/auth";
import { demoBlock } from "utils/admin/demo";
import { readConfig, writeConfig } from "utils/admin/yaml-crud";

/**
 * /api/admin/widgets
 * GET    - list all widgets
 * POST   - add a widget
 * PUT    - update a widget by index
 * DELETE - remove a widget by index
 */
async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const widgets = await readConfig("widgets.yaml");
        return res.status(200).json(widgets);
      }

      case "POST": {
        const { widget } = req.body;
        if (!widget || !widget.type) {
          return res.status(400).json({ error: "Missing widget type" });
        }
        const widgets = await readConfig("widgets.yaml");
        widgets.push({ [widget.type]: widget.options || {} });
        await writeConfig("widgets.yaml", widgets);
        return res.status(201).json(widgets);
      }

      case "PUT": {
        const { index, widget } = req.body;
        if (index === undefined || !widget) {
          return res.status(400).json({ error: "Missing index or widget" });
        }
        const widgets = await readConfig("widgets.yaml");
        if (index < 0 || index >= widgets.length) {
          return res.status(400).json({ error: "Invalid index" });
        }
        widgets[index] = { [widget.type]: widget.options || {} };
        await writeConfig("widgets.yaml", widgets);
        return res.status(200).json(widgets);
      }

      case "DELETE": {
        const { index } = req.body;
        if (index === undefined) {
          return res.status(400).json({ error: "Missing index" });
        }
        const widgets = await readConfig("widgets.yaml");
        if (index < 0 || index >= widgets.length) {
          return res.status(400).json({ error: "Invalid index" });
        }
        widgets.splice(index, 1);
        await writeConfig("widgets.yaml", widgets);
        return res.status(200).json(widgets);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export default demoBlock(handler);
