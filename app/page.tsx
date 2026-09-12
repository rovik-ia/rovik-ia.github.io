import Link from "next/link";
import { articles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import Disclosure from "@/components/Disclosure";
import { CATEGORIES } from "@/lib/site";

export default function Home() {
  const sorted = [...articles].sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date));
  const [first, ...rest] = sorted;
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src="/img/_hero.jpg" alt="" className="absolute inset-0 img-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <div className="container relative py-24 sm:py-32 max-w-3xl">
          <div className="text-[12px] uppercase tracking-[0.18em] font-bold text-accent mb-4">Guías de compra independientes</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Compra bien a la primera. <span className="text-accent">Sin listas infinitas.</span>
          </h1>
          <p className="text-white/75 mt-6 text-lg max-w-xl leading-relaxed">
            Analizamos los productos más buscados en España y te decimos qué mirar, qué modelo encaja con tu presupuesto y para quién es cada uno.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/guias/${first.slug}/`} className="bg-accent hover:bg-accent-dark text-white font-bold rounded-xl px-5 py-3">Última guía: {CATEGORIES[first.category].name}</Link>
            <Link href="#guias" className="bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl px-5 py-3">Ver todas las guías</Link>
          </div>
        </div>
      </section>

      <div className="container -mt-6 relative"><Disclosure /></div>

      <section id="guias" className="container pt-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Últimas guías</h2>
            <p className="text-muted mt-1">Actualizadas cada semana. {articles.length} guías publicadas.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2"><ArticleCard a={first} big /></div>
          <div className="grid gap-5">{rest.slice(0, 2).map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">{rest.slice(2).map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
      </section>

      <section className="container pt-16">
        <h2 className="text-3xl font-extrabold tracking-tight mb-6">Por categoría</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(CATEGORIES).map(([slug, c]) => {
            const cover = articles.find((a) => a.category === slug);
            return (
              <Link key={slug} href={`/categorias/${slug}/`} className="card overflow-hidden group relative aspect-[4/3] text-white">
                {cover && <img src={`/img/guias/${cover.slug}.jpg`} alt="" loading="lazy" className="img-cover absolute inset-0 group-hover:scale-[1.04] transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <div className="font-extrabold text-2xl">{c.name}</div>
                  <div className="text-sm text-white/75 mt-1">{c.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container pt-16">
        <div className="card p-8 grid md:grid-cols-3 gap-8">
          {[
            ["Independientes", "Ninguna marca paga por aparecer ni por subir puestos. Vivimos de las comisiones de afiliación, que no cambian tu precio."],
            ["Con criterio", "Cada guía explica primero qué mirar y por qué. Después, los modelos que lo cumplen en cada presupuesto."],
            ["Al día", "Revisamos precios, novedades y disponibilidad y marcamos la fecha de la última actualización en cada guía."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="text-accent font-extrabold text-xl mb-2">{t}</div>
              <p className="text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
