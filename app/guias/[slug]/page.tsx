import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/articles";
import ProductCard from "@/components/ProductCard";
import ArticleCard, { formatDate } from "@/components/ArticleCard";
import Disclosure from "@/components/Disclosure";
import { CATEGORIES, SITE } from "@/lib/site";
import credits from "@/lib/photoCredits.json";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `${SITE.url}/guias/${a.slug}/` },
    openGraph: { title: a.title, description: a.description, type: "article", publishedTime: a.date, modifiedTime: a.updated ?? a.date, images: [`/img/guias/${a.slug}.jpg`] },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const credit = (credits as unknown as Record<string, { photographer: string; url: string }>)[a.slug];
  const related = articles.filter((x) => x.slug !== a.slug && x.category === a.category).slice(0, 3);
  const more = related.length < 3 ? articles.filter((x) => x.slug !== a.slug && !related.includes(x)).slice(0, 3 - related.length) : [];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description,
    image: `${SITE.url}/img/guias/${a.slug}.jpg`, datePublished: a.date, dateModified: a.updated ?? a.date,
    author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/guias/${a.slug}/`,
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="relative isolate bg-ink text-white overflow-hidden">
        <img src={`/img/guias/${a.slug}.jpg`} alt="" className="absolute inset-0 img-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="container relative py-20 sm:py-28 max-w-4xl">
          <nav className="text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> › <Link href={`/categorias/${a.category}/`} className="hover:text-white">{CATEGORIES[a.category].name}</Link>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">{a.title}</h1>
          <p className="text-white/80 mt-5 text-lg leading-relaxed max-w-2xl">{a.description}</p>
          <div className="text-sm text-white/60 mt-5">Actualizado el {formatDate(a.updated ?? a.date)} · {a.readingMinutes} min de lectura{credit ? <> · Foto: <a href={credit.url} className="underline" rel="noopener" target="_blank">{credit.photographer}</a></> : null}</div>
        </div>
      </header>

      <div className="container max-w-3xl">
        <div className="mt-6"><Disclosure /></div>
        <div className="prose mt-8">
          {a.intro.map((p, i) => <p key={i}>{p}</p>)}
          <div className="card p-6 my-8 not-prose">
            <div className="font-extrabold text-lg mb-3">Resumen rápido</div>
            <ul className="space-y-2 text-[15px]">
              {a.quickPick.map((q, i) => (
                <li key={q.label} className="flex gap-3">
                  <span className="text-accent font-bold min-w-[11rem]">{q.label}</span>
                  <a href={`#producto-${i + 1}`} className="underline decoration-line underline-offset-4 hover:decoration-accent">{q.product}</a>
                </li>
              ))}
            </ul>
          </div>
          <h2>Qué mirar antes de comprar</h2>
          {a.criteria.map((c) => (<div key={c.title}><h3>{c.title}</h3><p>{c.text}</p></div>))}
          <h2>Los modelos que merecen la pena</h2>
          <div className="not-prose">{a.products.map((p, i) => <ProductCard key={p.name} p={p} index={i} slug={a.slug} />)}</div>
          <h2>Consejos para acertar</h2>
          <ul>{a.buyingTips.map((t) => <li key={t}>{t}</li>)}</ul>
          <h2>Preguntas frecuentes</h2>
          {a.faq.map((f) => (<div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>))}
          <h2>Conclusión</h2>
          <p>{a.conclusion}</p>
        </div>
      </div>

      <section className="container pt-16">
        <h2 className="text-2xl font-extrabold tracking-tight mb-5">Te puede interesar</h2>
        <div className="grid sm:grid-cols-3 gap-5">{[...related, ...more].map((x) => <ArticleCard key={x.slug} a={x} />)}</div>
      </section>
    </article>
  );
}
