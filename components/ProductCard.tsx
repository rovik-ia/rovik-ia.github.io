import type { Product } from "@/lib/types";
import { amazonProductUrl, amazonSearchUrl } from "@/lib/site";

export default function ProductCard({ p, index }: { p: Product; index: number }) {
  const href = p.asin ? amazonProductUrl(p.asin) : amazonSearchUrl(p.searchQuery);
  return (
    <section id={`producto-${index + 1}`} className="card p-6 sm:p-7 my-6 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="text-4xl font-extrabold text-accent leading-none pt-1">{index + 1}</div>
          <div>
            {p.badge && <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-soft text-accent rounded-full px-2.5 py-1 mb-2">{p.badge}</span>}
            <h3 className="text-2xl font-extrabold leading-snug tracking-tight">{p.name}</h3>
          </div>
        </div>
        <div className="text-sm text-muted whitespace-nowrap">Precio orientativo <strong className="text-fg text-base">{p.priceRange}</strong></div>
      </div>
      <p className="mt-4 leading-relaxed text-[1.02rem]">{p.summary}</p>
      <div className="grid sm:grid-cols-2 gap-5 mt-5 text-sm">
        <div className="rounded-xl bg-bg p-4">
          <div className="font-bold mb-2">Lo mejor</div>
          <ul className="list-disc pl-5 space-y-1.5">{p.pros.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="rounded-xl bg-bg p-4">
          <div className="font-bold mb-2">A tener en cuenta</div>
          <ul className="list-disc pl-5 space-y-1.5">{p.cons.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
      <p className="text-sm mt-4"><span className="font-bold">Ideal para:</span> {p.idealFor}</p>
      <a href={href} target="_blank" rel="nofollow sponsored noopener" className="inline-flex items-center gap-2 mt-5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl px-5 py-3 transition-colors">
        Ver precio en Amazon.es <span aria-hidden>→</span>
      </a>
    </section>
  );
}
