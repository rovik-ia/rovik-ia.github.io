import type { Product } from "@/lib/types";
import { amazonProductUrl, amazonSearchUrl } from "@/lib/site";
import credits from "@/lib/photoCredits.json";

type Credit = { photographer: string; url: string };

export default function ProductCard({ p, index, slug }: { p: Product; index: number; slug: string }) {
  const href = p.asin ? amazonProductUrl(p.asin) : amazonSearchUrl(p.searchQuery);
  const key = `${slug}-${index + 1}`;
  const credit = ((credits as unknown as { products?: Record<string, Credit> }).products ?? {})[key];
  return (
    <section id={`producto-${index + 1}`} className="card overflow-hidden my-6 scroll-mt-24">
      <div className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <figure className="relative aspect-[4/3] sm:aspect-auto sm:min-h-full bg-line">
          <img src={`/img/productos/${key}.jpg`} alt={`Imagen ilustrativa: ${p.name}`} loading="lazy" className="img-cover absolute inset-0" />
          <span className="absolute top-3 left-3 text-3xl font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">{index + 1}</span>
          {credit && <figcaption className="absolute bottom-0 inset-x-0 text-[10px] text-white/80 bg-gradient-to-t from-black/60 to-transparent px-3 pt-4 pb-1.5">Imagen ilustrativa · Foto: <a href={credit.url} rel="noopener" target="_blank" className="underline">{credit.photographer}</a></figcaption>}
        </figure>
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {p.badge && <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-accent-soft text-accent rounded-full px-2.5 py-1 mb-2">{p.badge}</span>}
              <h3 className="text-2xl font-extrabold leading-snug tracking-tight">{p.name}</h3>
            </div>
            <div className="text-sm text-muted whitespace-nowrap">Precio orientativo <strong className="text-fg text-base">{p.priceRange}</strong></div>
          </div>
          <p className="mt-4 leading-relaxed">{p.summary}</p>
          <div className="grid md:grid-cols-2 gap-4 mt-5 text-sm">
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
            Ver precio y fotos oficiales en Amazon.es <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
