import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-30");
  return [
    { url: `${SITE.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/aviso-legal/`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/privacidad/`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/cookies/`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
