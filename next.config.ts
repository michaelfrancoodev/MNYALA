import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

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
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`,
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
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
