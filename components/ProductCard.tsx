import type { Product } from "@/lib/types";
import { amazonProductUrl, amazonSearchUrl } from "@/lib/site";

export default function ProductCard({ p, index }: { p: Product; index: number }) {
  const href = p.asin ? amazonProductUrl(p.asin) : amazonSearchUrl(p.searchQuery);
  return (
    <section id={`producto-${index + 1}`} className="bg-card border border-line rounded-xl p-5 sm:p-6 my-6 scroll-mt-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {p.badge && <span className="inline-block text-xs font-semibold bg-accent-soft text-accent rounded-full px-2.5 py-1 mb-2">{p.badge}</span>}
          <h3 className="text-xl font-bold leading-snug">{index + 1}. {p.name}</h3>
        </div>
        <div className="text-sm text-muted whitespace-nowrap">Precio orientativo: <strong className="text-fg">{p.priceRange}</strong></div>
      </div>
      <p className="mt-3 leading-relaxed">{p.summary}</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="font-semibold mb-1">Lo mejor</div>
          <ul className="list-disc pl-5 space-y-1">{p.pros.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div>
          <div className="font-semibold mb-1">A tener en cuenta</div>
          <ul className="list-disc pl-5 space-y-1">{p.cons.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
      <p className="text-sm mt-4"><span className="font-semibold">Ideal para:</span> {p.idealFor}</p>
      <a href={href} target="_blank" rel="nofollow sponsored noopener" className="inline-block mt-4 bg-accent text-white font-semibold rounded-lg px-4 py-2.5 hover:opacity-90">
        Ver precio en Amazon.es
      </a>
    </section>
  );
}
