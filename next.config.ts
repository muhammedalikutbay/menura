import type { NextConfig } from "next";

// Content-Security-Policy is set per request with a nonce in src/proxy.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    serverActions: {
      // Images are downscaled in the browser before upload; the server caps them at 4 MB.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    localPatterns: [{ pathname: "/media/**" }],
  },
  async redirects() {
    return [
      { source: "/dashboard/categories", destination: "/dashboard/menu", permanent: true },
      { source: "/dashboard/products", destination: "/dashboard/menu", permanent: true },
      { source: "/dashboard/settings", destination: "/dashboard/restaurant", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
