import checkAndCopyConfig, { getSettings } from "utils/config/config";

export default function handler(req, res) {
  try {
    checkAndCopyConfig("settings.yaml");
    const settings = getSettings();

    return res.status(200).json({
      color: settings?.color || "slate",
      theme: settings?.theme || "dark",
    });
  } catch {
    return res.status(200).json({
      color: "slate",
      theme: "dark",
    });
  }
}
