import Link from "next/link";
import { articles } from "@/lib/articles";
import { allProducts, topPicks } from "@/lib/products";
import ArticleCard from "@/components/ArticleCard";
import BuyButton from "@/components/BuyButton";
import Ticker from "@/components/Ticker";
import TrustBar from "@/components/TrustBar";
import Disclosure from "@/components/Disclosure";
import { CATEGORIES } from "@/lib/site";

export default function Home() {
  const sorted = [...articles].sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date));
  const [first, ...rest] = sorted;
  const picks = topPicks();
  const estrella = picks[0];
  const destacados = picks.slice(1, 7);
  const productos = allProducts();
  const totalProductos = productos.length;
  const actualizado = new Date((first.updated ?? first.date) + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "long",
  });

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src="/img/_hero.jpg" srcSet="/img/_hero-800.jpg 800w, /img/_hero.jpg 1600w" sizes="100vw" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 img-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/85 to-ink/55" />
        <div className="absolute -top-32 -right-24 w-[34rem] h-[34rem] rounded-full bg-accent/25 blur-3xl" aria-hidden />
        <div className="container relative py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1.15fr_minmax(0,22rem)] gap-10 lg:gap-12 items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-200">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-orange-300 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-orange-300" />
              </span>
              Una guía nueva cada día
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.04] mt-6">
              Deja de comparar durante horas.
              <span className="block text-accent">Te decimos cuál comprar.</span>
            </h1>
            <p className="text-white/80 mt-6 text-lg max-w-xl leading-relaxed">
              Guías de compra independientes de los productos más buscados en España. Elegimos con
              criterios claros y te llevamos directo al modelo que encaja contigo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos/" className="bg-accent-dark hover:bg-accent-deep text-white font-bold rounded-xl px-6 py-3.5 text-lg">
                Buscar mi producto
              </Link>
              <Link href="#guias" className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold rounded-xl px-6 py-3.5 text-lg">
                Ver las {articles.length} guías
              </Link>
            </div>
            <TrustBar guias={articles.length} productos={totalProductos} actualizado={actualizado} />
          </div>

          <aside className="card overflow-hidden text-fg">
            <div className="bg-accent-dark text-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em]">
              La recomendación de hoy
            </div>
            <a
              href={estrella.href}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="block aspect-[16/10] bg-line overflow-hidden"
              aria-hidden
              tabIndex={-1}
            >
              <img src={estrella.img} alt="" className="img-cover" />
            </a>
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-wider font-bold text-accent-dark">
                {estrella.badge ?? estrella.categoryName} · {estrella.topic}
              </div>
              <div className="font-extrabold text-xl leading-snug mt-1">{estrella.name}</div>
              <p className="text-sm text-muted mt-1.5">{estrella.pro}</p>
              <div className="font-bold mt-3">{estrella.priceRange}</div>
              <div className="mt-3">
                <BuyButton href={estrella.href} label="Ver precio en Amazon" />
              </div>
              <p className="text-[11px] text-muted mt-2.5 leading-snug">
                Enlace de afiliado. El precio que pagas es el mismo.
              </p>
              <Link href={estrella.guideUrl} className="block text-xs text-muted underline underline-offset-4 hover:text-fg mt-2">
                Ver por qué y con qué lo hemos comparado
              </Link>
            </div>
          </aside>
          </div>
        </div>
      </section>

      <Ticker productos={productos} />

      <div className="container -mt-6 relative"><Disclosure /></div>

      <section className="container pt-12">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Lo más recomendado</h2>
            <p className="text-muted mt-1">La mejor opción de cada guía, con su precio a un clic.</p>
          </div>
          <Link href="/productos/" className="text-sm font-bold text-accent-dark underline underline-offset-4">
            Ver los {totalProductos} productos
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destacados.map((p) => (
            <li key={p.key} className="card overflow-hidden flex flex-col">
              <Link href={p.guideUrl} aria-hidden tabIndex={-1} className="block aspect-[16/10] bg-line overflow-hidden">
                <img src={p.img} alt="" loading="lazy" className="img-cover" />
              </Link>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="text-[11px] uppercase tracking-wider font-bold text-accent-dark">
                  {p.badge ?? p.categoryName} · {p.topic}
                </div>
                <h3 className="font-extrabold leading-snug">{p.name}</h3>
                <p className="text-sm text-muted">{p.pro}</p>
                <div className="text-sm font-bold mt-auto pt-2">{p.priceRange}</div>
                <BuyButton href={p.href} size="sm" label="Ver precio en Amazon" />
                <Link href={p.guideUrl} className="text-xs text-muted underline underline-offset-4 hover:text-fg">
                  Comparar con los otros 4 modelos
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="guias" className="container pt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Últimas guías</h2>
            <p className="text-muted mt-1">Una guía nueva cada día. {articles.length} publicadas.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2"><ArticleCard a={first} big /></div>
          <div className="grid gap-5">{rest.slice(0, 2).map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">{rest.slice(2).map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
      </section>

      <section className="container pt-16">
        <h2 className="text-3xl font-extrabold tracking-tight mb-5">Por categoría</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(CATEGORIES).map(([slug, c]) => {
            const cover = articles.find((a) => a.category === slug);
            const n = articles.filter((a) => a.category === slug).length;
            return (
              <Link key={slug} href={`/categorias/${slug}/`} className="card overflow-hidden group relative aspect-[4/3] text-white">
                {cover && <img src={`/img/guias/${cover.slug}.jpg`} alt="" loading="lazy" className="img-cover absolute inset-0 group-hover:scale-[1.04] transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <div className="font-extrabold text-xl">{c.name}</div>
                  <div className="text-xs text-white/75 mt-0.5">{n} {n === 1 ? "guía" : "guías"}</div>
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
            ["Con criterio", "Cada guía explica qué mirar y por qué. Después, los modelos que lo cumplen en cada presupuesto."],
            ["Al día", "Revisamos precios, novedades y disponibilidad y marcamos la fecha de la última actualización en cada guía."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="text-accent-dark font-extrabold text-xl mb-2">{t}</div>
              <p className="text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
