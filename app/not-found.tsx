import Link from "next/link";
import { articles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

export default function NotFound() {
  return (
    <div className="container pt-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Esta página no existe</h1>
      <p className="text-muted mt-3 text-lg">Puede que el enlace esté mal escrito o que la guía se haya movido. Estas son las últimas guías publicadas.</p>
      <Link href="/" className="inline-block mt-5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl px-5 py-3">Volver a la portada</Link>
      <div className="grid sm:grid-cols-3 gap-5 mt-10">{articles.slice(0, 3).map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
    </div>
  );
}
