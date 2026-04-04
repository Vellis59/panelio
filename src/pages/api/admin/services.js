import { requireAdmin } from "utils/admin/auth";
import { demoBlock } from "utils/admin/demo";
import { servicesOps } from "utils/admin/yaml-crud";

/**
 * /api/admin/services
 * GET  - list all service groups
 * POST - add a service or group (action: "addService" | "addGroup" | "removeGroup" | "reorder")
 * PUT  - update a service
 * DELETE - remove a service
 */
async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const groups = await servicesOps.list();
        return res.status(200).json(groups);
      }

      case "POST": {
        const { action, group, service } = req.body;

        if (action === "addGroup") {
          if (!group) return res.status(400).json({ error: "Missing group name" });
          const result = await servicesOps.addGroup(group);
          return res.status(201).json(result);
        }

        if (action === "removeGroup") {
          if (!group) return res.status(400).json({ error: "Missing group name" });
          const result = await servicesOps.removeGroup(group);
          return res.status(200).json(result);
        }

        if (action === "renameGroup") {
          const { oldGroup, newGroup } = req.body;
          if (!oldGroup || !newGroup) return res.status(400).json({ error: "Missing old or new group name" });
          const result = await servicesOps.renameGroup(oldGroup, newGroup);
          return res.status(200).json(result);
        }

        if (action === "addSubgroup") {
          const { group, subgroup } = req.body;
          if (!group || !subgroup) return res.status(400).json({ error: "Missing group or subgroup name" });
          const result = await servicesOps.addSubgroup(group, subgroup);
          return res.status(201).json(result);
        }

        if (action === "renameSubgroup") {
          const { group, oldSubgroup, newSubgroup } = req.body;
          if (!group || !oldSubgroup || !newSubgroup) return res.status(400).json({ error: "Missing group, oldSubgroup or newSubgroup" });
          const result = await servicesOps.renameSubgroup(group, oldSubgroup, newSubgroup);
          return res.status(200).json(result);
        }

        if (action === "removeSubgroup") {
          const { group, subgroup } = req.body;
          if (!group || !subgroup) return res.status(400).json({ error: "Missing group or subgroup name" });
          const result = await servicesOps.removeSubgroup(group, subgroup);
          return res.status(200).json(result);
        }

        if (action === "reorder") {
          const { groups } = req.body;
          if (!groups) return res.status(400).json({ error: "Missing groups" });
          const result = await servicesOps.reorder(groups);
          return res.status(200).json(result);
        }

        // Default: add service (optionally into a subgroup)
        const { subgroup } = req.body;
        if (!group || !service) {
          return res.status(400).json({ error: "Missing group or service" });
        }
        const result = await servicesOps.add(group, service, subgroup);
        return res.status(201).json(result);
      }

      case "PUT": {
        const { group, service, updates, subgroup } = req.body;
        if (!group || !service) {
          return res.status(400).json({ error: "Missing group or service name" });
        }
        const result = await servicesOps.update(group, service, updates || {}, subgroup);
        return res.status(200).json(result);
      }

      case "DELETE": {
        const { group, service, subgroup } = req.body;
        if (!group || !service) {
          return res.status(400).json({ error: "Missing group or service name" });
        }
        const result = await servicesOps.remove(group, service, subgroup);
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
