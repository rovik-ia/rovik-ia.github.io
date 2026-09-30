"use client";

import { useRef, useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { C_CALC } from "@/lib/content-construccion";
import { LIMITS, eur, leak, normalize, num, type LeakInput } from "@/lib/calculator";
import { prefillContact } from "@/lib/prefill";
import { track } from "@/lib/analytics";

const EXAMPLE: LeakInput = { workers: 12, hoursPerWeek: 2, rate: 28 };

const FIELDS: { key: keyof LeakInput; label: string; unit: string; step: number; hint: string }[] = [
  { key: "workers", label: "Operarios en obra", unit: "operarios", step: 1, hint: "Personas que trabajan en obra cada semana." },
  {
    key: "hoursPerWeek",
    label: "Horas sin parte firmado",
    unit: "h / semana y operario",
    step: 0.5,
    hint: "Horas trabajadas que no acaban en un albarán firmado por el cliente.",
  },
  { key: "rate", label: "Precio de facturación", unit: "€ / hora", step: 1, hint: "Lo que facturas por hora de trabajo." },
];

type Raw = Record<keyof LeakInput, string>;
const toRaw = (i: LeakInput): Raw => ({ workers: String(i.workers), hoursPerWeek: String(i.hoursPerWeek), rate: String(i.rate) });

export default function LeakCalculator() {
  // Texto tal como lo escribe el visitante; el cálculo usa siempre valores normalizados
  const [raw, setRaw] = useState<Raw>(toRaw(EXAMPLE));
  const tracked = useRef(false);
  const parse = (s: string, fallback: number) => {
    const n = Number(s.replace(",", "."));
    return s.trim() === "" || !Number.isFinite(n) ? fallback : n;
  };
  const v = normalize({
    workers: parse(raw.workers, EXAMPLE.workers),
    hoursPerWeek: parse(raw.hoursPerWeek, 0),
    rate: parse(raw.rate, EXAMPLE.rate),
  });
  const r = leak(v);

  const set = (key: keyof LeakInput, value: string) => {
    setRaw((prev) => ({ ...prev, [key]: value }));
    if (!tracked.current) {
      tracked.current = true;
      track("calculator_used");
    }
  };
  const settle = (key: keyof LeakInput) => setRaw((prev) => ({ ...prev, [key]: String(v[key]) }));

  const send = () =>
    prefillContact({
      origen: "cálculo de fugas",
      mensaje: `Cálculo de fugas: ${v.workers} operarios, ${String(v.hoursPerWeek).replace(".", ",")} h/semana sin parte por operario y ${v.rate} €/h. Resultado estimado: ${num(r.hoursMonth)} h/mes y ${eur(r.euroMonth)} al mes sin facturar (${eur(r.euroYear)} al año). Quiero medirlo con nuestros partes reales.`,
    });

  return (
    <section id="calculadora" aria-labelledby="calc-title" className="blueprint relative border-t border-line bg-bg-2 py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <SectionLabel code={C_CALC.code} label={C_CALC.label} tone="red" className="reveal" />
          <h2 id="calc-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-5xl lg:text-[3.6rem]">
            {C_CALC.title}
          </h2>
          <p className="reveal mt-6 max-w-md text-pretty text-lg text-fg-2">{C_CALC.lead}</p>
        </div>

        <div className="reveal hud-frame border border-line-2 bg-bg p-5 [--hud-corner:var(--gold)] sm:p-8 lg:col-span-7">
          <div className="grid gap-7">
            {FIELDS.map((f) => {
              const lim = LIMITS[f.key];
              return (
                <div key={f.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <label htmlFor={`c-${f.key}`} className="font-medium text-fg">
                      {f.label}
                    </label>
                    <p className="flex items-baseline gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={lim.min}
                        max={lim.max}
                        step={f.step}
                        value={raw[f.key]}
                        onChange={(e) => set(f.key, e.target.value)}
                        onBlur={() => settle(f.key)}
                        aria-label={`${f.label} (${f.unit})`}
                        className="hud-num w-20 border border-line-2 bg-bg-2 px-2 py-1.5 text-right text-lg text-fg focus:border-cyan focus:outline-none"
                      />
                      <span className="hud-label text-muted">{f.unit}</span>
                    </p>
                  </div>
                  <input
                    id={`c-${f.key}`}
                    type="range"
                    min={lim.min}
                    max={f.key === "workers" ? 100 : lim.max}
                    step={f.step}
                    value={Math.min(v[f.key], f.key === "workers" ? 100 : lim.max)}
                    onChange={(e) => set(f.key, e.target.value)}
                    aria-describedby={`h-${f.key}`}
                    className="mt-3 h-11 w-full cursor-pointer accent-[var(--red)]"
                  />
                  <p id={`h-${f.key}`} className="text-sm text-muted">
                    {f.hint}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t border-line-2 pt-6" aria-live="polite">
            <p className="hud-label text-muted">Trabajo que no llegas a cobrar (estimación)</p>
            <dl className="mt-4 grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-fg-2">Horas al mes</dt>
                <dd className="hud-num mt-1 text-2xl text-fg">{num(r.hoursMonth)} h</dd>
              </div>
              <div>
                <dt className="text-sm text-fg-2">Al mes</dt>
                <dd className="hud-num mt-1 text-2xl text-fg">{eur(r.euroMonth)}</dd>
              </div>
              <div>
                <dt className="text-sm text-fg-2">Al año</dt>
                <dd className="hud-num mt-1 text-3xl font-bold text-gold sm:text-4xl">{eur(r.euroYear)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              Cálculo: operarios × horas sin parte por semana × {num(52)} semanas ÷ 12 × precio por hora. Los valores iniciales son de ejemplo: pon los tuyos.
            </p>
            <button type="button" onClick={send} className="btn btn-primary mt-6 w-full sm:w-auto">
              Quiero medirlo con mis partes
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
