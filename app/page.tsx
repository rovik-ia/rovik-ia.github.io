import Link from "next/link";
import { articles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import Disclosure from "@/components/Disclosure";
import { CATEGORIES, SITE } from "@/lib/site";

export default function Home() {
  const sorted = [...articles].sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date));
  return (
    <div className="space-y-10">
      <section className="pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Guías de compra claras de los productos que <span className="text-accent">más se buscan</span> en España
        </h1>
        <p className="text-muted mt-4 max-w-2xl leading-relaxed">
          Comparamos lo que de verdad importa de cada producto, sin listas infinitas ni jerga. Cada guía explica qué mirar,
          qué modelos merecen la pena en cada presupuesto y para quién es cada uno.
        </p>
        <div className="mt-5"><Disclosure /></div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold">Últimas guías</h2>
          <span className="text-sm text-muted">{articles.length} guías publicadas</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">{sorted.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Por categoría</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CATEGORIES).map(([slug, c]) => (
            <Link key={slug} href={`/categorias/${slug}/`} className="bg-card border border-line rounded-xl p-4 hover:border-accent">
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-muted mt-1">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card border border-line rounded-xl p-6">
        <h2 className="text-xl font-bold">Cómo elegimos</h2>
        <p className="text-muted mt-2 leading-relaxed">
          Para cada guía revisamos análisis independientes, fichas técnicas y la experiencia de uso publicada por compradores, y
          después filtramos por lo que afecta al día a día: consumo, ruido, mantenimiento y coste real a lo largo del tiempo.
          No aceptamos productos a cambio de posicionarlos. Si un enlace te lleva a Amazon, {SITE.name} puede recibir una comisión.
        </p>
      </section>
    </div>
  );
}
