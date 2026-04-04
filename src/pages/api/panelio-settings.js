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
      panelioGreetingName: settings.panelioGreetingName || "",
      panelioShowGreeting: settings.panelioShowGreeting !== false,
      panelioShowClock: settings.panelioShowClock !== false,
      language: settings.language || "en",
    });
  } catch {
    return res.status(200).json({
      color: "slate",
      theme: "dark",
      panelioThemePreset: "dark-mirror",
      panelioCardStyle: "panelio",
      panelioShowStatusDot: false,
      panelioGreetingName: "",
      panelioShowGreeting: true,
      panelioShowClock: true,
      language: "en",
    });
  }
}
