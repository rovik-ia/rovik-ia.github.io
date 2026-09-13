import Link from "next/link";
import { CATEGORIES } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-line">
      <div className="container h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-extrabold tracking-tight text-xl">
          <span className="text-accent">Tendencia</span> Top
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted overflow-x-auto">
            {Object.entries(CATEGORIES).map(([slug, c]) => (
              <Link key={slug} href={`/categorias/${slug}/`} className="hover:text-fg whitespace-nowrap">{c.name}</Link>
            ))}
          </nav>
          <Link href="/productos/" className="shrink-0 whitespace-nowrap rounded-lg bg-accent-dark px-3.5 py-2 text-sm font-bold text-white hover:bg-accent-deep">
            Buscar producto
          </Link>
        </div>
      </div>
    </header>
  );
}
