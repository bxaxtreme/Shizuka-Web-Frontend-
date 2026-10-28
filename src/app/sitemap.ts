import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl.endsWith("/") ? siteConfig.siteUrl : `${siteConfig.siteUrl}/`;
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "commands/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "features/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "premium/", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "dashboard/", changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  return pages.map((page) => ({
    url: new URL(page.path, base).toString(),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
