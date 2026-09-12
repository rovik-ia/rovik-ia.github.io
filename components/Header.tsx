import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/site";

export default function Header() {
  return (
    <header className="border-b border-line bg-card/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-extrabold tracking-tight text-lg">
          <span className="text-accent">Tendencia</span> Top
        </Link>
        <nav className="flex gap-4 text-sm text-muted overflow-x-auto">
          {Object.entries(CATEGORIES).map(([slug, c]) => (
            <Link key={slug} href={`/categorias/${slug}/`} className="hover:text-fg whitespace-nowrap">
              {c.name}
            </Link>
          ))}
          <Link href="/sobre/" className="hover:text-fg whitespace-nowrap">Sobre {SITE.name}</Link>
        </nav>
      </div>
    </header>
  );
}
