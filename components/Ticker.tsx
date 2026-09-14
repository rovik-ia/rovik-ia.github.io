import Link from "next/link";
import type { FlatProduct } from "@/lib/products";

/**
 * Cinta con los productos recomendados. Se mueve sola, se para al pasar el ratón
 * y se convierte en una fila deslizable si el sistema pide menos movimiento.
 */
export default function Ticker({ productos }: { productos: FlatProduct[] }) {
  const lista = productos.slice(0, 18);
  const fila = (aria: boolean) => (
    <ul className="flex items-stretch gap-3 pr-3" aria-hidden={aria ? undefined : true}>
      {lista.map((p, i) => (
        <li key={`${p.key}-${aria ? "a" : "b"}-${i}`}>
          <Link
            href={`${p.guideUrl}#producto-${p.key.split("-").pop()}`}
            tabIndex={aria ? 0 : -1}
            className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/20 transition-colors"
          >
            <img src={p.img} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-white/10" />
            <span className="whitespace-nowrap">
              <span className="block text-sm font-bold text-white leading-tight">{p.name}</span>
              <span className="block text-xs text-white/65">{p.priceRange}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-y border-white/10 bg-ink py-3">
      <div className="marquee-track">
        {fila(true)}
        {fila(false)}
      </div>
    </div>
  );
}
