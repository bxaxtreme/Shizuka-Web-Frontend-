import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { siteConfig } from "@/data/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("sitemap.xml", siteConfig.siteUrl).toString(),
  };
}
