"use client";

import { useEffect, useRef, useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { CASES } from "@/lib/content";
import { asset } from "@/lib/site";

const KIND_TONE: Record<string, string> = {
  "Producto propio": "text-gold border-gold/50",
  "Proyecto propio": "text-gold border-gold/50",
  "Prototipo funcional": "text-cyan border-cyan/50",
  "Plataforma a medida": "text-fg border-line-2",
  "Propuesta de rediseño": "text-fg-2 border-line-2",
};

/**
 * Archivo de misiones. En escritorio la galería avanza en horizontal con el scroll vertical
 * (sección fijada); en móvil y con movimiento reducido es un carrusel nativo deslizable.
 */
export default function Cases() {
  const outerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!outer || !viewport || !track) return;
    if (!pinned) {
      track.style.transform = "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeight(null);
      return;
    }
    let distance = 0;
    let raf = 0;
    const measure = () => {
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setHeight(distance + viewport.clientHeight);
    };
    const update = () => {
      raf = 0;
      const r = outer.getBoundingClientRect();
      const range = Math.max(1, r.height - viewport.clientHeight);
      const p = Math.min(1, Math.max(0, -r.top / range));
      track.style.transform = `translate3d(${-p * distance}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(track);
    ro.observe(viewport);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pinned]);

  return (
    <section id="casos" aria-labelledby="casos-title" className="relative border-t border-line bg-bg">
      <div ref={outerRef} style={pinned && height ? { height } : undefined}>
        <div
          ref={viewportRef}
          className={`flex flex-col justify-center overflow-hidden py-24 ${pinned ? "sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] py-0" : ""}`}
        >
          <div
            ref={trackRef}
            className={`flex gap-5 will-change-transform ${
              pinned ? "items-center pl-[var(--gutter)] pr-[12vw]" : "flex-col"
            }`}
          >
            {/* Cabecera */}
            <div className={`flex shrink-0 flex-col justify-center ${pinned ? "w-[30rem] pr-10" : "shell"}`}>
              <SectionLabel code={CASES.code} label={CASES.label} className="reveal" />
              <h2 id="casos-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[4.2rem]">
                {CASES.title}
              </h2>
              <p className="reveal mt-6 max-w-md text-pretty text-lg text-fg-2">{CASES.lead}</p>
              <p className="hud-label reveal mt-8 hidden text-muted lg:block" aria-hidden="true">
                {pinned ? "Sigue bajando para recorrer el archivo →" : ""}
              </p>
            </div>

            <ol
              aria-label="Proyectos (desliza en horizontal)"
              tabIndex={pinned ? undefined : 0}
              className={`flex gap-5 ${pinned ? "" : "snap-x-rail mt-10 overflow-x-auto px-[var(--gutter)] pb-4 [scroll-padding-inline:var(--gutter)] focus-visible:outline-offset-[-2px]"}`}
            >
              {CASES.items.map((c, i) => (
                <li
                  key={c.id}
                  className={`group flex shrink-0 flex-col ${pinned ? "w-[min(62vw,54rem,calc((100svh-19rem)*1.6))]" : "w-[86vw] max-w-[34rem] sm:w-[70vw]"}`}
                >
                  <article className="flex h-full flex-col">
                    <div className="hud-frame relative aspect-[16/10] overflow-hidden border border-line-2 bg-bg-2 [--hud-corner:var(--red)]">
                      <img
                        src={asset(`/img/${c.image}-800.webp`)}
                        srcSet={`${asset(`/img/${c.image}-800.webp`)} 800w, ${asset(`/img/${c.image}-1400.webp`)} 1400w`}
                        sizes="(min-width: 1024px) 62vw, 86vw"
                        alt={c.alt}
                        width={1400}
                        height={875}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]"
                      />
                      <p className="hud-label absolute left-3 top-3 bg-bg/85 px-2 py-1 text-fg" aria-hidden="true">
                        Misión 0{i + 1}
                      </p>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                      <div>
                        <p className="hud-label text-muted">{c.sector}</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-fg sm:text-2xl">{c.title}</h3>
                      </div>
                      <p className={`hud-label self-start justify-self-start whitespace-nowrap border px-2.5 py-1 ${KIND_TONE[c.kind]}`}>{c.kind}</p>
                    </div>
                    <p className="mt-3 max-w-2xl text-pretty text-fg-2">{c.text}</p>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1" aria-label="Áreas">
                      {c.tags.map((t) => (
                        <li key={t} className="hud-label text-muted">
                          / {t}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </div>

          {pinned && (
            <div className="shell mt-8" aria-hidden="true">
              <div className="h-px w-full bg-line-2">
                <span ref={barRef} className="block h-px w-full origin-left bg-red" style={{ transform: "scaleX(0)" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
