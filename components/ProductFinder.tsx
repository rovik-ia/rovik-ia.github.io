"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { FlatProduct } from "@/lib/products";
import BuyButton from "./BuyButton";

export default function ProductFinder({
  productos,
  categorias,
}: {
  productos: FlatProduct[];
  categorias: { slug: string; name: string }[];
}) {
  const [texto, setTexto] = useState("");
  const [cat, setCat] = useState("");

  useEffect(() => {
    const inicial = new URLSearchParams(window.location.search).get("cat");
    if (inicial && categorias.some((c) => c.slug === inicial)) setCat(inicial);
  }, [categorias]);

  const filtrados = useMemo(() => {
    const q = texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
    return productos.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!q) return true;
      const heno = `${p.name} ${p.topic} ${p.guideTitle} ${p.categoryName} ${p.badge ?? ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
      return q.split(/\s+/).every((t) => heno.includes(t));
    });
  }, [productos, texto, cat]);

  return (
    <div>
      <div className="sticky top-16 z-20 bg-bg/95 backdrop-blur py-4 -mx-5 px-5 border-b border-line">
        <label className="block">
          <span className="sr-only">Buscar producto</span>
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca: freidora, robot, auriculares, calefactor…"
            className="w-full rounded-xl border border-line bg-card px-4 py-3.5 text-base outline-none focus:border-accent"
          />
        </label>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => setCat("")}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold border transition-colors ${
              cat === "" ? "bg-accent-dark text-white border-accent-dark" : "bg-card border-line hover:border-accent"
            }`}
          >
            Todo
          </button>
          {categorias.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug === cat ? "" : c.slug)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold border transition-colors ${
                cat === c.slug ? "bg-accent-dark text-white border-accent-dark" : "bg-card border-line hover:border-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted mt-4">
        {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
      </p>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filtrados.map((p) => (
          <li key={p.key} className="card overflow-hidden flex flex-col">
            <Link href={p.guideUrl} className="block aspect-[4/3] bg-line overflow-hidden">
              <img src={p.img} alt="" loading="lazy" className="img-cover" />
            </Link>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="text-[11px] uppercase tracking-wider font-bold text-accent-dark">
                {p.badge ?? p.categoryName}
              </div>
              <h3 className="font-extrabold leading-snug">{p.name}</h3>
              <p className="text-sm text-muted">{p.pro}</p>
              <div className="text-sm mt-auto pt-2">
                <span className="font-bold">{p.priceRange}</span>
              </div>
              <BuyButton href={p.href} size="sm" label="Ver precio en Amazon" />
              <Link href={p.guideUrl} className="text-xs text-muted underline underline-offset-4 hover:text-fg">
                Por qué lo recomendamos
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {filtrados.length === 0 && (
        <p className="text-muted mt-10">
          No hay resultados. Prueba con otra palabra, por ejemplo freidora, aspirador o smartwatch.
        </p>
      )}
    </div>
  );
}
