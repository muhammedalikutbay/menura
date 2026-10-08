import type { MetadataRoute } from "next";
import { env } from "@/server/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/m/"],
      disallow: ["/dashboard", "/api", "/onboarding"],
    },
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
