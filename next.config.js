const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    DEMO_MODE: process.env.DEMO_MODE || "false",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "t1.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
    ],
    unoptimized: true,
  },
  i18n,
};

module.exports = nextConfig;
