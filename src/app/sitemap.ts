import type { MetadataRoute } from "next";
import { env } from "@/server/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${env.APP_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${env.APP_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${env.APP_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
