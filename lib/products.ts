import { articles } from "./articles";
import { amazonProductUrl, amazonSearchUrl, CATEGORIES } from "./site";
import type { Article } from "./types";

export type FlatProduct = {
  key: string;
  name: string;
  badge?: string;
  priceRange: string;
  pro: string;
  idealFor: string;
  href: string;
  img: string;
  guideSlug: string;
  guideTitle: string;
  guideUrl: string;
  category: string;
  categoryName: string;
  topic: string;
  date: string;
};

/** "Las mejores freidoras de aire de 2026 por..." -> "freidoras de aire" */
export function topicOf(a: Article): string {
  let t = a.title.toLowerCase().replace(/^(las|los)\s+mejores\s+/, "");
  t = t.split(/\s+(?:de\s+2026|en\s+2026|2026|:|para\s+la|para\s+el|para\s+este|por\s+tama|calidad|sin\s+)/)[0];
  return t.replace(/[,\s]+$/, "");
}

export function amazonHref(p: { asin?: string; searchQuery: string }): string {
  return p.asin ? amazonProductUrl(p.asin) : amazonSearchUrl(p.searchQuery);
}

export function allProducts(): FlatProduct[] {
  const out: FlatProduct[] = [];
  for (const a of articles) {
    const topic = topicOf(a);
    a.products.forEach((p, i) => {
      out.push({
        key: `${a.slug}-${i + 1}`,
        name: p.name,
        badge: p.badge,
        priceRange: p.priceRange,
        pro: p.pros[0] ?? "",
        idealFor: p.idealFor,
        href: amazonHref(p),
        img: `/img/productos/${a.slug}-${i + 1}.jpg`,
        guideSlug: a.slug,
        guideTitle: a.title,
        guideUrl: `/guias/${a.slug}/`,
        category: a.category,
        categoryName: CATEGORIES[a.category]?.name ?? a.category,
        topic,
        date: a.updated ?? a.date,
      });
    });
  }
  return out.sort((x, y) => y.date.localeCompare(x.date));
}

/** La recomendación principal de cada guía, para los accesos rápidos de portada. */
export function topPicks(): FlatProduct[] {
  const vistos = new Set<string>();
  return allProducts().filter((p) => {
    if (vistos.has(p.guideSlug)) return false;
    vistos.add(p.guideSlug);
    return true;
  });
}
