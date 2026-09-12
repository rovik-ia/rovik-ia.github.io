import Link from "next/link";
import { SITE, AFFILIATE_DISCLOSURE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-20">
      <div className="container py-12 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-sm">
          <div className="font-extrabold text-xl text-white"><span className="text-accent">Tendencia</span> Top</div>
          <p className="max-w-xl leading-relaxed">{AFFILIATE_DISCLOSURE} Los precios y la disponibilidad pueden cambiar; comprueba siempre la ficha en Amazon antes de comprar. Amazon y el logotipo de Amazon son marcas de Amazon.com, Inc. o sus afiliados.</p>
          <p className="text-white/50">Fotografías y vídeos de <a href="https://www.pexels.com" className="underline" rel="noopener" target="_blank">Pexels</a> y sus autores.</p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/sobre/" className="hover:text-white">Sobre nosotros</Link>
          <Link href="/afiliacion/" className="hover:text-white">Aviso de afiliación</Link>
          <Link href="/aviso-legal/" className="hover:text-white">Aviso legal</Link>
          <Link href="/privacidad/" className="hover:text-white">Privacidad</Link>
          <Link href="/cookies/" className="hover:text-white">Cookies</Link>
          <a href={`mailto:${SITE.email}`} className="hover:text-white">Contacto</a>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4 text-xs text-white/40">© {new Date().getFullYear()} {SITE.name}. Guías de compra independientes.</div>
      </div>
    </footer>
  );
}
