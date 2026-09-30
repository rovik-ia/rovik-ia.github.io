"use client";

import { useEffect, useRef, useState } from "react";
import CoreCanvas from "@/components/core/CoreCanvas";
import SectionLabel from "@/components/ui/SectionLabel";
import { PROTOCOL } from "@/lib/content";
import { asset } from "@/lib/site";

const PHASES = PROTOCOL.phases.length;

/**
 * Protocolo de ensamblaje: el núcleo se monta pieza a pieza mientras el visitante recorre
 * las cinco fases. El texto fluye con el scroll normal (sin secuestrarlo); el lienzo va fijo.
 */
export default function Protocol() {
  const listRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const list = listRef.current;
      if (!list) return;
      const r = list.getBoundingClientRect();
      const anchor = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (anchor - r.top) / r.height));
      progressRef.current = p;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setActive(Math.min(PHASES - 1, Math.floor(p * PHASES)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const phase = PROTOCOL.phases[active];

  return (
    <section id="protocolo" aria-labelledby="protocolo-title" className="blueprint relative border-t border-line bg-bg pt-24 lg:pt-36">
      <div className="shell">
        <SectionLabel code={PROTOCOL.code} label={PROTOCOL.label} className="reveal" />
        <h2 id="protocolo-title" className="display reveal mt-6 max-w-5xl text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[4.6rem]">
          {PROTOCOL.title}
        </h2>
        <p className="reveal mt-7 max-w-2xl text-pretty text-lg text-fg-2">{PROTOCOL.lead}</p>
      </div>

      <div className="shell relative mt-10 grid lg:mt-4 lg:grid-cols-12 lg:gap-6">
        {/* Visor fijo con el núcleo */}
        <div className="sticky top-[var(--header-h)] z-10 -mx-[var(--gutter)] h-[46svh] self-start bg-bg lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mx-0 lg:h-[calc(100svh-var(--header-h))] lg:bg-transparent">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-10 h-10 bg-gradient-to-b from-bg to-transparent lg:hidden" />
          <CoreCanvas
            mode="sequence"
            progressRef={progressRef}
            className="absolute inset-0"
            fallback={
              <img
                src={asset(`/img/core-fase-${active + 1}-1000.webp`)}
                alt=""
                width={1000}
                height={1000}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain"
              />
            }
          />
          {/* Lectura del visor */}
          <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-3 lg:inset-x-8 lg:bottom-10" aria-hidden="true">
            <div className="flex items-end justify-between gap-4">
              <p className="hud-label text-cyan">
                Fase {phase.code} / 0{PHASES} · {phase.verb}
              </p>
              <p className="hud-label hidden text-muted sm:block">Ensamblaje del sistema</p>
            </div>
            <div className="mt-2 h-px w-full bg-line-2">
              <span ref={barRef} className="block h-px w-full origin-left bg-cyan" style={{ transform: "scaleX(0)" }} />
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {PROTOCOL.phases.map((p, i) => (
                <span key={p.code} className={`hud-label text-[0.62rem] ${i <= active ? "text-fg" : "text-muted"}`}>
                  {p.code}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ol ref={listRef} className="relative min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          {PROTOCOL.phases.map((p, i) => {
            const isActive = i === active;
            return (
              <li key={p.code} className="flex min-h-[78svh] items-center py-10 lg:min-h-[92svh]">
                <article className={`w-full border-l-2 pl-6 transition-colors duration-500 lg:pl-8 ${isActive ? "border-red" : "border-line-2"}`}>
                  <p className="hud-label flex items-center gap-3 text-muted">
                    <span className={isActive ? "text-gold" : ""}>Fase {p.code}</span>
                    <span aria-hidden="true" className="h-px w-6 bg-line-2" />
                    {p.name}
                  </p>
                  <h3 className={`display mt-4 text-[2.05rem] transition-colors duration-500 sm:text-6xl ${isActive ? "text-fg" : "text-muted"}`}>
                    {p.verb}
                  </h3>
                  <p className="mt-5 max-w-md text-pretty text-lg text-fg-2">{p.text}</p>
                  <dl className="mt-7 grid max-w-md gap-4 border-t border-line pt-5 sm:grid-cols-2">
                    <div>
                      <dt className="hud-label text-muted">Entregable</dt>
                      <dd className="mt-1.5 text-[0.95rem] text-fg">{p.deliverable}</dd>
                    </div>
                    <div>
                      <dt className="hud-label text-muted">Métrica</dt>
                      <dd className="mt-1.5 text-[0.95rem] text-gold">{p.metric}</dd>
                    </div>
                  </dl>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
