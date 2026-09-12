import Link from "next/link";
import type { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/site";

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArticleCard({ a, big = false }: { a: Article; big?: boolean }) {
  return (
    <Link href={`/guias/${a.slug}/`} className="card overflow-hidden group flex flex-col hover:-translate-y-0.5 transition-transform">
      <div className={`${big ? "aspect-[16/9]" : "aspect-[16/10]"} overflow-hidden bg-line`}>
        <img src={`/img/guias/${a.slug}.jpg`} alt="" loading="lazy" className="img-cover group-hover:scale-[1.03] transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.14em] text-accent font-bold">{CATEGORIES[a.category].name}</div>
        <h3 className={`font-extrabold leading-snug tracking-tight ${big ? "text-2xl" : "text-lg"}`}>{a.title}</h3>
        <p className="text-sm text-muted line-clamp-2">{a.description}</p>
        <div className="text-xs text-muted mt-1">{formatDate(a.updated ?? a.date)} · {a.readingMinutes} min</div>
      </div>
    </Link>
  );
}
