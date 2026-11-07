import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@node-rs/argon2", "sharp", "pino"],
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  // Addresses from the previous website keep working (and keep their search ranking).
  async redirects() {
    return [
      { source: "/about", destination: "/kuhusu", permanent: true },
      { source: "/products", destination: "/bidhaa", permanent: true },
      { source: "/gallery", destination: "/picha", permanent: true },
      { source: "/contact", destination: "/wasiliana", permanent: true },
      { source: "/auth/login", destination: "/admin/login", permanent: true },
    ];
  },
};

export default config;
