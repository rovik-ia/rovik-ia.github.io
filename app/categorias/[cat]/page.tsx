import type { Metadata } from "next";
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
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">{c.name}</h1>
      <p className="text-muted mt-2">{c.description}</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">{list.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
      {list.length === 0 && <p className="text-muted mt-8">Todavía no hay guías en esta categoría.</p>}
    </div>
  );
}
