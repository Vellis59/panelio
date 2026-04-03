import { isAdminEnabled, validatePassword, generateToken } from "utils/admin/auth";

/**
 * POST /api/admin/login
 * Body: { password: "..." }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminEnabled()) {
    return res.status(403).json({
      error: "Admin not configured. Set PANELIO_ADMIN_PASSWORD env var. HOMEPAGE_ADMIN_PASSWORD is still supported as a legacy fallback.",
    });
  }

  const { password } = req.body;

  if (!password || !validatePassword(password)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateToken();

  // Set cookie
  res.setHeader("Set-Cookie", `panelio_admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  return res.status(200).json({ success: true, token });
}
