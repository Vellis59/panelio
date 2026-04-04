export const isDemo = () => process.env.DEMO_MODE === "true";

export function demoBlock(handler) {
  return async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD" && isDemo()) {
      return res.status(403).json({ error: "Demo mode: writes are disabled" });
    }
    return handler(req, res);
  };
}
