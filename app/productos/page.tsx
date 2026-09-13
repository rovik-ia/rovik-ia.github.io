import type { Metadata } from "next";
import { allProducts } from "@/lib/products";
import { CATEGORIES, SITE } from "@/lib/site";
import ProductFinder from "@/components/ProductFinder";
import Disclosure from "@/components/Disclosure";

export const metadata: Metadata = {
  title: "Todos los productos recomendados",
  description:
    "Busca cualquier producto recomendado en Tendencia Top y ve directo a su ficha en Amazon.es, sin dar vueltas por la web.",
  alternates: { canonical: `${SITE.url}/productos/` },
};

export default function ProductosPage() {
  const productos = allProducts();
  const categorias = Object.entries(CATEGORIES).map(([slug, c]) => ({ slug, name: c.name }));
  return (
    <div className="container pt-10 pb-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Todos los productos</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Los {productos.length} productos que recomendamos, en una sola página. Busca el tuyo y ve directo
        a su precio en Amazon.
      </p>
      <div className="mt-4 mb-2"><Disclosure /></div>
      <ProductFinder productos={productos} categorias={categorias} />
    </div>
  );
}
