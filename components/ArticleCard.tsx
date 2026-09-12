import Link from "next/link";
import type { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/site";

export default function ArticleCard({ a }: { a: Article }) {
  return (
    <Link href={`/guias/${a.slug}/`} className="block bg-card border border-line rounded-xl p-5 hover:border-accent transition-colors">
      <div className="text-xs uppercase tracking-wide text-accent font-semibold">{CATEGORIES[a.category].name}</div>
      <h3 className="font-bold text-lg mt-1 leading-snug">{a.title}</h3>
      <p className="text-sm text-muted mt-2 line-clamp-3">{a.description}</p>
      <div className="text-xs text-muted mt-3">{formatDate(a.updated ?? a.date)} · {a.readingMinutes} min de lectura</div>
    </Link>
  );
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
