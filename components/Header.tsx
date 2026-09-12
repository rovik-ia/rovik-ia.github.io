import Link from "next/link";
import { CATEGORIES } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-line">
      <div className="container h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-extrabold tracking-tight text-xl">
          <span className="text-accent">Tendencia</span> Top
        </Link>
        <nav className="flex gap-5 text-sm font-medium text-muted overflow-x-auto">
          {Object.entries(CATEGORIES).map(([slug, c]) => (
            <Link key={slug} href={`/categorias/${slug}/`} className="hover:text-fg whitespace-nowrap">{c.name}</Link>
          ))}
          <Link href="/sobre/" className="hover:text-fg whitespace-nowrap">Sobre nosotros</Link>
        </nav>
      </div>
    </header>
  );
}
