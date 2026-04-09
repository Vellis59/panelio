export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const parsed = new URL(url);

    // SSRF Protection: Validate URL is not pointing to internal/private networks
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return res.status(400).json({ error: "Only http and https protocols are allowed" });
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost variants
    const localhostPatterns = [
      "localhost",
      "127.",
      "0.0.0.0",
      "::1",
      "[::]",
    ];
    if (localhostPatterns.some((pattern) => hostname === pattern || hostname.startsWith(pattern))) {
      return res.status(400).json({ error: "Access to localhost is not allowed" });
    }

    // Block private IPv4 ranges (RFC 1918)
    const privateIPv4Patterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // link-local
    ];
    if (privateIPv4Patterns.some((pattern) => pattern.test(hostname))) {
      return res.status(400).json({ error: "Access to private networks is not allowed" });
    }

    // Block IPv6 private ranges
    if (hostname.startsWith("fc") || hostname.startsWith("fd")) {
      return res.status(400).json({ error: "Access to private IPv6 networks is not allowed" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(parsed.origin, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);
    return res.status(200).json({ status: response.ok ? "up" : "down" });
  } catch (error) {
    // Log the error for debugging but don't expose details
    console.error("ping-url error:", error.message);
    return res.status(200).json({ status: "down" });
  }
}
