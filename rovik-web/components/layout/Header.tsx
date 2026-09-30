"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { NAV, asset } from "@/lib/site";

export default function Header() {
  // En la página de campaña la cabecera es mínima: sin menú que distraiga del objetivo
  const landing = (usePathname() ?? "").includes("constructoras");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Menú móvil: bloqueo de scroll, Escape y foco atrapado
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel) {
        const f = Array.from(panel.querySelectorAll<HTMLElement>("a,button"));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth >= 1024 && close(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  // Desde páginas interiores los anclajes apuntan a la home
  const home = asset("/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/95" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        <a href={home} className="relative z-[60] -m-2 p-2" aria-label="Rovik, ir al inicio">
          <Logo />
        </a>

        {landing ? (
          <p className="hud-label hidden text-muted md:block">Construcción · Obra · Subcontratas</p>
        ) : (
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={`${home}${item.href}`} className="group hud-label flex items-center gap-2 py-2 text-fg-2 transition-colors hover:text-fg">
                  <span className="text-muted transition-colors group-hover:text-gold">{item.code}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        )}

        <div className="flex items-center gap-3">
          <p className="hud-label hidden items-center gap-2 text-muted xl:flex" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-ok blink" />
            Sistema en línea
          </p>
          <a
            href={landing ? "#contacto" : `${home}#contacto`}
            className={`btn btn-primary !min-h-[42px] !px-4 !text-[0.72rem] ${landing ? "inline-flex" : "hidden sm:inline-flex"}`}
          >
            {landing ? "Diagnóstico" : "Solicitar diagnóstico"}
          </a>
          {!landing && (
          <button
            ref={buttonRef}
            type="button"
            className="relative z-[60] -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span className={`absolute left-0 top-0 h-[2px] w-6 bg-fg transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-[2px] bg-fg transition-all duration-300 ${open ? "w-6 -translate-y-[5px] -rotate-45" : "w-4"}`} />
            </span>
          </button>
          )}
        </div>
      </div>

      <div
        id="menu-movil"
        ref={panelRef}
        hidden={!open}
        className="blueprint fixed inset-0 z-[55] overflow-y-auto bg-bg pt-[calc(var(--header-h)+1.5rem)] lg:hidden"
      >
        <nav aria-label="Menú móvil" className="shell flex min-h-full flex-col pb-10">
          <p className="hud-label mb-6 text-muted">Navegación · Sistema Rovik</p>
          <ul className="border-t border-line">
            {[{ href: "#inicio", label: "Inicio", code: "00" }, ...NAV, { href: "#contacto", label: "Contacto", code: "08" }].map((item) => (
              <li key={item.href} className="border-b border-line">
                <a
                  href={`${home}${item.href}`}
                  onClick={() => close(false)}
                  className="flex items-baseline gap-4 py-4 text-fg transition-colors hover:text-gold"
                >
                  <span className="hud-label text-red-text">{item.code}</span>
                  <span className="display text-[1.9rem]">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={`${home}#contacto`} onClick={() => close(false)} className="btn btn-primary mt-8 w-full">
            Solicitar diagnóstico
          </a>
        </nav>
      </div>
    </header>
  );
}
