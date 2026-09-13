import type { Article } from "@/lib/types";
import { amazonHref } from "@/lib/products";
import BuyButton from "./BuyButton";

/** Barra fija en móvil con la recomendación principal, siempre a un toque de Amazon. */
export default function StickyBuy({ a }: { a: Article }) {
  const p = a.products[0];
  if (!p) return null;
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-line px-4 py-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider font-bold text-accent-dark">
          {p.badge ?? "Recomendado"}
        </div>
        <div className="font-bold text-sm truncate">{p.name}</div>
      </div>
      <BuyButton href={amazonHref(p)} size="sm" label="Ver precio" />
    </div>
  );
}
