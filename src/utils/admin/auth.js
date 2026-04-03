const ADMIN_PASSWORD = process.env.PANELIO_ADMIN_PASSWORD || process.env.HOMEPAGE_ADMIN_PASSWORD;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_COOKIE_NAME = "panelio_admin_token";

/**
 * Check if admin is enabled (password is configured)
 */
export function isAdminEnabled() {
  return !!ADMIN_PASSWORD;
}

/**
 * Validate admin password and return a simple token
 */
export function validatePassword(password) {
  if (!isAdminEnabled()) return false;
  return password === ADMIN_PASSWORD;
}

/**
 * Generate a simple session token
 */
export function generateToken() {
  const crypto = require("crypto");
  const payload = {
    ts: Date.now(),
    rand: crypto.randomBytes(16).toString("hex"),
  };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64url");
  // Sign with HMAC
  const secret = ADMIN_PASSWORD;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("base64url");
  return `${token}.${sig}`;
}

/**
 * Verify a session token
 */
export function verifyToken(token) {
  if (!token || !isAdminEnabled()) return false;
  try {
    const crypto = require("crypto");
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expectedSig = crypto
      .createHmac("sha256", ADMIN_PASSWORD)
      .update(payload)
      .digest("base64url");
    if (sig !== expectedSig) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    // Check expiry
    if (Date.now() - data.ts > TOKEN_EXPIRY) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract token from request (cookie or Authorization header)
 */
export function getTokenFromRequest(req) {
  // Check cookie first
  const cookie = req.headers.cookie || "";
  const panelioMatch = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]*)`));
  if (panelioMatch) return panelioMatch[1];

  const legacyMatch = cookie.match(/(?:^|;\s*)homepage_admin_token=([^;]*)/);
  if (legacyMatch) return legacyMatch[1];

  // Check Authorization header
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

/**
 * Middleware-like helper: verify admin request or return 401
 * Returns true if authorized, false otherwise.
 */
export function requireAdmin(req, res) {
  if (!isAdminEnabled()) {
    res.status(403).json({ error: "Admin not configured. Set PANELIO_ADMIN_PASSWORD env var. HOMEPAGE_ADMIN_PASSWORD is still supported as a legacy fallback." });
    return false;
  }
  const token = getTokenFromRequest(req);
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
