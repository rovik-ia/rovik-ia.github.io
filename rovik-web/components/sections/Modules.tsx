"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { MODULES } from "@/lib/content";
import { asset } from "@/lib/site";

export default function Modules() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = MODULES.items;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = items.length - 1;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next >= 0) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section id="modulos" aria-labelledby="modulos-title" className="relative border-t border-line bg-bg-2 py-24 lg:py-36">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionLabel code={MODULES.code} label={MODULES.label} className="reveal" />
            <h2 id="modulos-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[4.2rem]">
              {MODULES.title}
            </h2>
          </div>
          <p className="reveal self-end text-pretty text-lg text-fg-2 lg:col-span-4 lg:col-start-9">{MODULES.lead}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          <div role="tablist" aria-label="Módulos de Rovik" aria-orientation="vertical" className="grid grid-cols-2 border-l border-t border-line-2 lg:col-span-4 lg:flex lg:flex-col lg:border-l-0">
            {items.map((m, i) => {
              const selected = i === active;
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${m.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${m.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`group relative flex min-h-[5.5rem] items-center justify-between gap-4 border-b border-r border-line-2 py-4 text-left transition-colors lg:min-h-0 lg:border-r-0 lg:py-5 ${
                    selected ? "text-fg" : "text-muted hover:text-fg-2"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-[2px] origin-top bg-red transition-transform duration-500 ${selected ? "scale-y-100" : "scale-y-0"}`}
                  />
                  <span className="flex flex-col gap-1 pl-4 lg:flex-row lg:items-baseline lg:gap-4 lg:pl-5">
                    <span className={`hud-label ${selected ? "text-gold" : ""}`}>{m.code}</span>
                    <span className="flex flex-col">
                      <span className="display text-[1.08rem] min-[400px]:text-[1.25rem] sm:text-[1.7rem] lg:text-[2.2rem]">{m.name}</span>
                      <span className="mt-1 hidden text-[0.95rem] font-normal normal-case lg:block">{m.service}</span>
                    </span>
                  </span>
                  <Arrow className={`mr-3 hidden shrink-0 transition-opacity lg:mr-0 lg:block ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            {items.map((m, i) => (
              <div
                key={m.id}
                role="tabpanel"
                id={`panel-${m.id}`}
                aria-labelledby={`tab-${m.id}`}
                hidden={i !== active}
                tabIndex={0}
                className="grid gap-8 md:grid-cols-2 md:gap-10 lg:pl-6"
              >
                <div className="hud-frame relative aspect-[6/5] overflow-hidden border border-line bg-bg [--hud-corner:var(--gold)]">
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_55%_at_50%_50%,rgb(127_231_255/0.08),transparent_70%)]" />
                  <img
                    src={asset(`/img/${m.image}-640.webp`)}
                    srcSet={`${asset(`/img/${m.image}-640.webp`)} 640w, ${asset(`/img/${m.image}-1200.webp`)} 1200w`}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    alt={m.alt}
                    width={1200}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="relative h-full w-full object-cover"
                  />
                  <p className="hud-label absolute left-4 top-4 text-cyan" aria-hidden="true">
                    {m.code} · {m.name}
                  </p>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold tracking-tight text-fg">{m.service}</h3>
                  <p className="mt-3 text-pretty text-lg text-fg-2">{m.text}</p>
                  <p className="hud-label mt-8 text-muted">Qué incluye</p>
                  <ul className="mt-3 border-t border-line">
                    {m.deliverables.map((d) => (
                      <li key={d} className="flex gap-3 border-b border-line py-3 text-fg-2">
                        <span aria-hidden="true" className="mt-[0.6em] h-1 w-2.5 shrink-0 bg-red" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <a href="#contacto" className="link-hud mt-6 inline-flex min-h-11 items-center gap-3 self-start font-mono text-sm uppercase tracking-[0.12em]">
                    Quiero este módulo
                    <Arrow />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
