"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "inicio", code: "00", label: "Inicio" },
  { id: "fugas", code: "01", label: "Fugas" },
  { id: "protocolo", code: "02", label: "Protocolo" },
  { id: "modulos", code: "03", label: "Módulos" },
  { id: "rovik-ia", code: "04", label: "ROVIK.IA" },
  { id: "casos", code: "05", label: "Casos" },
  { id: "protocolos", code: "06", label: "Reglas" },
  { id: "faq", code: "07", label: "FAQ" },
  { id: "contacto", code: "08", label: "Despegue" },
];

/** Altímetro lateral (escritorio ancho): muestra la sección actual y permite saltar. */
export default function ScrollHud() {
  const [active, setActive] = useState("inicio");
  const [alt, setAlt] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setAlt(Math.round((window.scrollY / max) * 100));
      const mid = window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav aria-label="Progreso de la página" className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 2xl:block">
      <p className="hud-label mb-4 text-right text-[0.62rem] text-muted" aria-hidden="true">
        ALT <span className="hud-num text-fg-2">{String(alt).padStart(3, "0")}</span>
      </p>
      <ol className="pointer-events-auto flex flex-col items-end gap-2.5">
        {SECTIONS.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={on ? "location" : undefined} className="group flex items-center gap-3 py-0.5">
                <span className={`hud-label text-[0.62rem] transition-all duration-300 ${on ? "text-fg opacity-100" : "text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
                  {s.label}
                </span>
                <span className={`block h-px transition-all duration-300 ${on ? "w-8 bg-red" : "w-4 bg-line-2 group-hover:bg-muted"}`} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
