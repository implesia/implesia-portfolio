import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain files in out/, served by Cloudflare as Workers static assets. See wrangler.jsonc.
  output: "export",
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
};

export default nextConfig;
