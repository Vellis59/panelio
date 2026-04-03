import { NextResponse } from "next/server";

function normalizeHost(value) {
  return value?.trim().toLowerCase();
}

function stripDefaultPort(host) {
  if (!host) return host;
  if (host.startsWith("[") && host.endsWith("]:80")) return host.slice(0, -3);
  if (host.startsWith("[") && host.endsWith("]:443")) return host.slice(0, -4);
  if (host.endsWith(":80")) return host.slice(0, -3);
  if (host.endsWith(":443")) return host.slice(0, -4);
  return host;
}

function buildAllowedHosts() {
  const port = process.env.PORT || 3000;
  const defaults = [`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`];
  const configured = process.env.HOMEPAGE_ALLOWED_HOSTS
    ? process.env.HOMEPAGE_ALLOWED_HOSTS.split(",").map((entry) => entry.trim()).filter(Boolean)
    : [];

  const expanded = new Set();
  [...defaults, ...configured].forEach((entry) => {
    const normalized = normalizeHost(entry);
    if (!normalized) return;
    expanded.add(normalized);
    expanded.add(stripDefaultPort(normalized));
  });

  return expanded;
}

function getPanelioHostHelp(host, allowedHosts) {
  const hostText = host || "(missing host header)";
  const suggestedEnv = host ? `HOMEPAGE_ALLOWED_HOSTS=${host}` : "HOMEPAGE_ALLOWED_HOSTS=<your-domain:port>";

  return {
    error: "Host validation failed.",
    message: `This request used the host \"${hostText}\", but it is not currently allowed.`,
    hint: "Add the exact host to HOMEPAGE_ALLOWED_HOSTS, or use * only if you fully trust the deployment environment.",
    suggestedEnv,
    allowedHosts: Array.from(allowedHosts),
    docs: "/docs/troubleshooting/host-validation",
  };
}

export function middleware(req) {
  // Check the Host header, if HOMEPAGE_ALLOWED_HOSTS is set
  const host = normalizeHost(req.headers.get("host"));
  const allowAll = process.env.HOMEPAGE_ALLOWED_HOSTS === "*";
  const allowedHosts = buildAllowedHosts();

  if (!allowAll && (!host || (!allowedHosts.has(host) && !allowedHosts.has(stripDefaultPort(host))))) {
    console.error(
      `Host validation failed for: ${host}. Allowed hosts: ${Array.from(allowedHosts).join(", ")}. Hint: Set HOMEPAGE_ALLOWED_HOSTS to include the exact host shown here.`,
    );
    return NextResponse.json(getPanelioHostHelp(host, allowedHosts), { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
