import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import { CATEGORIES, SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ["", "sobre/", "afiliacion/", "aviso-legal/", "privacidad/", "cookies/"].map((p) => ({
    url: `${SITE.url}/${p}`, lastModified: now,
  }));
  const cats = Object.keys(CATEGORIES).map((c) => ({ url: `${SITE.url}/categorias/${c}/`, lastModified: now }));
  const guides = articles.map((a) => ({ url: `${SITE.url}/guias/${a.slug}/`, lastModified: new Date(a.updated ?? a.date) }));
  return [...statics, ...cats, ...guides];
}
