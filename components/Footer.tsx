import Link from "next/link";
import { SITE, AFFILIATE_DISCLOSURE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-12 text-sm text-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <p className="max-w-3xl">{AFFILIATE_DISCLOSURE} Los precios y la disponibilidad pueden cambiar; comprueba siempre la ficha en Amazon antes de comprar. Amazon y el logotipo de Amazon son marcas de Amazon.com, Inc. o sus afiliados.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/sobre/" className="hover:text-fg">Sobre nosotros</Link>
          <Link href="/afiliacion/" className="hover:text-fg">Aviso de afiliación</Link>
          <Link href="/aviso-legal/" className="hover:text-fg">Aviso legal</Link>
          <Link href="/privacidad/" className="hover:text-fg">Privacidad</Link>
          <Link href="/cookies/" className="hover:text-fg">Cookies</Link>
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}. Contacto: {SITE.email}</p>
      </div>
    </footer>
  );
}
