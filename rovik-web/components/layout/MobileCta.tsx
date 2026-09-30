"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Arrow from "@/components/ui/Arrow";

/**
 * Barra fija inferior en móvil y tableta: aparece al pasar la portada y se oculta al llegar al
 * formulario o mientras se muestra el aviso de cookies. La visita desde un anuncio casi siempre es móvil.
 */
export default function MobileCta() {
  const pathname = usePathname() ?? "/";
  const landing = pathname.includes("constructoras");
  const show = landing || pathname === "/";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const contact = document.getElementById("contacto");
      const inContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      const consentOpen = document.documentElement.hasAttribute("data-consent-open");
      setVisible(window.scrollY > window.innerHeight * 0.75 && !inContact && !consentOpen);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // El aviso de cookies marca <html data-consent-open>: al cerrarlo, la barra vuelve
    const mo = new MutationObserver(onScroll);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-consent-open"] });
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!show) return null;

  const secondary = landing ? { href: "#calculadora", label: "Calcular" } : { href: "#rovik-ia", label: "Escanear" };

  return (
    <div
      data-cta-bar
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line-2 bg-bg/95 pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="shell grid grid-cols-[auto_1fr] gap-3 py-3">
        <a href={secondary.href} tabIndex={visible ? 0 : -1} className="btn btn-ghost !min-h-12 !px-4 !text-[0.72rem]">
          {secondary.label}
        </a>
        <a href="#contacto" tabIndex={visible ? 0 : -1} className="btn btn-primary !min-h-12 !text-[0.72rem]">
          Pedir diagnóstico
          <Arrow />
        </a>
      </div>
    </div>
  );
}
