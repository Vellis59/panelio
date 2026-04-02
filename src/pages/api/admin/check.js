import { verifyToken, getTokenFromRequest } from "utils/admin/auth";

/**
 * GET /api/admin/check - check if current session is valid
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = getTokenFromRequest(req);
  const valid = verifyToken(token);
  return res.status(200).json({ authenticated: valid });
}
