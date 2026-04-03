import { readConfig } from "utils/admin/yaml-crud";

export default async function handler(req, res) {
  try {
    const settings = await readConfig("settings.yaml");
    return res.status(200).json({
      color: settings.color || "slate",
      theme: settings.theme || "dark",
      panelioThemePreset: settings.panelioThemePreset || "dark-mirror",
      panelioCardStyle: settings.panelioCardStyle || "panelio",
      panelioShowStatusDot: settings.panelioShowStatusDot === true,
    });
  } catch {
    return res.status(200).json({
      color: "slate",
      theme: "dark",
      panelioThemePreset: "dark-mirror",
      panelioCardStyle: "panelio",
      panelioShowStatusDot: false,
    });
  }
}
