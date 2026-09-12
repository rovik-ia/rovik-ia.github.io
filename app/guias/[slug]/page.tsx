import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/articles";
import ProductCard from "@/components/ProductCard";
import Disclosure from "@/components/Disclosure";
import { formatDate } from "@/components/ArticleCard";
import { CATEGORIES, SITE } from "@/lib/site";

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
    openGraph: { title: a.title, description: a.description, type: "article", publishedTime: a.date, modifiedTime: a.updated ?? a.date },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.updated ?? a.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/guias/${a.slug}/`,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <article className="max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <nav className="text-sm text-muted mb-4">
        <Link href="/" className="hover:text-fg">Inicio</Link> ›{" "}
        <Link href={`/categorias/${a.category}/`} className="hover:text-fg">{CATEGORIES[a.category].name}</Link>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{a.title}</h1>
      <p className="text-muted mt-3 text-lg leading-relaxed">{a.description}</p>
      <div className="text-sm text-muted mt-3">
        Actualizado el {formatDate(a.updated ?? a.date)} · {a.readingMinutes} min de lectura
      </div>
      <div className="mt-4"><Disclosure /></div>

      <div className="prose mt-8">
        {a.intro.map((p, i) => <p key={i}>{p}</p>)}

        <div className="bg-card border border-line rounded-xl p-5 my-6 not-prose">
          <div className="font-bold mb-2">Resumen rápido</div>
          <ul className="space-y-1.5 text-sm">
            {a.quickPick.map((q, i) => (
              <li key={q.label} className="flex gap-2">
                <span className="text-accent font-semibold min-w-[11rem]">{q.label}:</span>
                <a href={`#producto-${i + 1}`} className="underline">{q.product}</a>
              </li>
            ))}
          </ul>
        </div>

        <h2>Qué mirar antes de comprar</h2>
        {a.criteria.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
        ))}

        <h2>Los modelos que merecen la pena</h2>
        <div className="not-prose">{a.products.map((p, i) => <ProductCard key={p.name} p={p} index={i} />)}</div>

        <h2>Consejos para acertar</h2>
        <ul>{a.buyingTips.map((t) => <li key={t}>{t}</li>)}</ul>

        <h2>Preguntas frecuentes</h2>
        {a.faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <h2>Conclusión</h2>
        <p>{a.conclusion}</p>
      </div>
    </article>
  );
}
