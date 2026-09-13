import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { CATEGORIES } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ cat }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const c = CATEGORIES[cat];
  return c ? { title: `Guías de ${c.name}`, description: c.description } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = CATEGORIES[cat];
  if (!c) notFound();
  const list = articles.filter((a) => a.category === cat);
  const cover = list[0];
  const nProductos = list.reduce((n, a) => n + a.products.length, 0);
  return (
    <div>
      <header className="relative isolate bg-ink text-white overflow-hidden">
        {cover && <img src={`/img/guias/${cover.slug}.jpg`} srcSet={`/img/guias/${cover.slug}-800.jpg 800w, /img/guias/${cover.slug}.jpg 1600w`} sizes="100vw" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 img-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <div className="container relative py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{c.name}</h1>
          <p className="text-white/75 mt-3 text-lg">{c.description}</p>
          <Link href={`/productos/?cat=${cat}`} className="inline-block mt-6 bg-accent-dark hover:bg-accent-deep text-white font-bold rounded-xl px-5 py-3">
            Ver los {nProductos} productos de {c.name}
          </Link>
        </div>
      </header>
      <div className="container pt-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{list.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
        {list.length === 0 && <p className="text-muted">Todavía no hay guías en esta categoría.</p>}
      </div>
    </div>
  );
}
