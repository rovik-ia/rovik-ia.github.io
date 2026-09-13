import Link from "next/link";
import { CATEGORIES } from "@/lib/site";

/** Fila de categorías, visible solo en móvil (en escritorio ya están en la cabecera). */
export default function CategoryBar() {
  return (
    <nav className="sm:hidden border-b border-line bg-card">
      <div className="container flex gap-2 overflow-x-auto py-2.5">
        {Object.entries(CATEGORIES).map(([slug, c]) => (
          <Link
            key={slug}
            href={`/categorias/${slug}/`}
            className="whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-accent"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
