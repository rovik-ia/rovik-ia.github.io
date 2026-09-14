import Link from "next/link";
import type { Article } from "@/lib/types";
import { amazonHref } from "@/lib/products";
import BuyButton from "./BuyButton";

/** Tabla de acceso rápido: todos los modelos con su enlace a Amazon, sin bajar por la página. */
export default function QuickCompare({ a }: { a: Article }) {
  return (
    <section className="card p-5 sm:p-6 my-8 not-prose">
      <h2 className="text-xl font-extrabold tracking-tight">Los 5 modelos, de un vistazo</h2>
      <p className="text-sm text-muted mt-1">
        Pulsa para ver el precio actual en Amazon, o baja para leer el análisis de cada uno.
      </p>
      <ul className="mt-4 divide-y divide-line">
        {a.products.map((p, i) => (
          <li key={p.name} className="py-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link href={`#producto-${i + 1}`} aria-label={`Ver el análisis de ${p.name}`} className="shrink-0">
              <img
                src={`/img/productos/${a.slug}-${i + 1}.jpg`}
                alt=""
                loading="lazy"
                className="w-20 h-16 object-cover rounded-lg bg-line"
              />
            </Link>
            <div className="min-w-[9rem] flex-1">
              {p.badge && (
                <div className="text-[11px] uppercase tracking-wider font-bold text-accent-dark">{p.badge}</div>
              )}
              <div className="font-extrabold leading-snug">{p.name}</div>
              <div className="text-sm text-muted">{p.priceRange}</div>
            </div>
            <BuyButton href={amazonHref(p)} size="sm" label="Ver precio" />
          </li>
        ))}
      </ul>
    </section>
  );
}
