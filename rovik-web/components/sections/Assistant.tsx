"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { CoreMark } from "@/components/ui/Logo";
import { QUESTIONS, SYSTEMS, buildReport, reportAsText, scoreSystems, type Answers, type Report } from "@/lib/diagnosis";
import { mailto } from "@/lib/site";

interface Message {
  id: number;
  from: "ai" | "user";
  text: string;
}

const INTRO =
  "Hola, soy ROVIK.IA, el copiloto de Rovik. Voy a escanear tu empresa con siete preguntas y te devolveré un informe con tus fugas principales, el módulo por el que empezar y un plan de 30 días. Todo ocurre en tu navegador: no envío ni guardo nada.";

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

/** Texto que se escribe carácter a carácter (instantáneo con movimiento reducido). */
function Typed({ text, instant, onDone }: { text: string; instant: boolean; onDone?: () => void }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  const shown = instant ? text.length : n;
  useEffect(() => {
    if (instant) return;
    const total = text.length;
    const step = Math.max(1, Math.round(total / 45));
    const id = window.setInterval(() => {
      setN((v) => {
        const next = Math.min(total, v + step);
        if (next >= total) window.clearInterval(id);
        return next;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text, instant]);
  useEffect(() => {
    if (shown >= text.length && !done.current) {
      done.current = true;
      onDone?.();
    }
  }, [shown, text.length, onDone]);
  const complete = shown >= text.length;
  return (
    <>
      <span aria-hidden="true" className={complete ? "" : "caret"}>
        {text.slice(0, shown)}
      </span>
      {complete && <span className="sr-only">{text}</span>}
    </>
  );
}

function Bar({ label, hint, value }: { label: string; hint: string; value: number | null }) {
  const tone = value === null ? "bg-line-2" : value < 45 ? "bg-alert" : value < 65 ? "bg-gold" : "bg-ok";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="hud-label text-fg-2">{label}</p>
        <p className="hud-num text-sm text-fg">{value === null ? "--" : value}</p>
      </div>
      <div className="mt-2 h-1.5 w-full bg-bg-3" role="presentation">
        <div className={`h-full origin-left transition-all duration-700 ${tone}`} style={{ width: `${value ?? 0}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">{hint}</p>
    </div>
  );
}

function Dial({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = value < 45 ? "var(--alert)" : value < 65 ? "var(--gold)" : "var(--ok)";
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} stroke="var(--bg-3)" strokeWidth="6" fill="none" />
        <circle cx="60" cy="60" r={r} stroke={tone} strokeWidth="6" fill="none" strokeDasharray={`${(value / 100) * c} ${c}`} className="transition-all duration-1000" />
        <circle cx="60" cy="60" r="42" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="2 4" fill="none" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="hud-num text-4xl font-bold text-fg">{value}</span>
        <span className="hud-label text-[0.6rem] text-muted">/ 100</span>
      </div>
    </div>
  );
}

export default function Assistant() {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1); // -1: sin empezar; 0..6 pregunta; 7 procesando/terminado
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [voice, setVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [copied, setCopied] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLHeadingElement>(null);
  const idRef = useRef(0);
  const voiceRef = useRef(false);

  useEffect(() => {
    // Capacidad del navegador: solo se conoce en cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceRef.current || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/ROVIK\.IA/g, "Róvik I A").replace(/Rovik/g, "Róvik"));
    u.lang = "es-ES";
    const v = synth.getVoices().find((x) => x.lang?.toLowerCase().startsWith("es"));
    if (v) u.voice = v;
    u.rate = 1.04;
    u.pitch = 0.82;
    synth.speak(u);
  }, []);

  const push = useCallback(
    (from: Message["from"], text: string) => {
      idRef.current += 1;
      setMessages((m) => [...m, { id: idRef.current, from, text }]);
      if (from === "ai") {
        setTyping(true);
        speak(text);
      }
    },
    [speak]
  );

  // Mantener el final de la conversación a la vista sin mover la página
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, typing, reduce]);

  const start = () => {
    setStep(0);
    push("ai", QUESTIONS[0].prompt);
  };

  const answer = (qi: number, optionId: string, label: string) => {
    const q = QUESTIONS[qi];
    const next = { ...answers, [q.id]: optionId };
    setAnswers(next);
    push("user", label);
    const ni = qi + 1;
    setStep(ni);
    window.setTimeout(
      () => {
        if (ni < QUESTIONS.length) {
          push("ai", QUESTIONS[ni].prompt);
        } else {
          push("ai", "Escaneo completado. Cruzando tus respuestas con el protocolo de Rovik…");
          window.setTimeout(
            () => {
              const r = buildReport(next);
              setReport(r);
              push("ai", `Informe listo. Tu índice de escalabilidad es ${r.overall} sobre 100. Te recomiendo empezar por el módulo ${r.moduleName}.`);
            },
            reduce ? 50 : 1100
          );
        }
      },
      reduce ? 0 : 380
    );
  };

  const reset = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setMessages([]);
    setAnswers({});
    setReport(null);
    setStep(-1);
    setTyping(false);
    setCopied(false);
  };

  const onTypedDone = useCallback(() => setTyping(false), []);

  // Tras escribir una pregunta, el foco va a su primera opción (flujo de teclado continuo)
  useEffect(() => {
    if (typing) return;
    if (step >= 0 && step < QUESTIONS.length && messages.length > 0) {
      optionsRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    }
    if (report && step >= QUESTIONS.length) {
      const el = reportRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.8) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [typing, step, messages.length, report, reduce]);

  const partial = useMemo(() => {
    const answered = Object.keys(answers).length;
    if (answered < 2) return null;
    return scoreSystems(answers);
  }, [answers]);

  const toggleVoice = () => {
    const on = !voice;
    setVoice(on);
    voiceRef.current = on;
    if (!on && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (on) {
      const last = [...messages].reverse().find((m) => m.from === "ai");
      speak(last?.text ?? INTRO);
    }
  };

  const reportText = report ? reportAsText(answers, report) : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const q = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null;
  const lastIsAi = messages[messages.length - 1]?.from === "ai";

  return (
    <section id="rovik-ia" aria-labelledby="rovik-ia-title" className="relative overflow-hidden border-t border-line bg-bg py-24 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_0%,rgb(127_231_255/0.07),transparent_70%)]" />
      <div className="shell relative">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionLabel code="04" label="Copiloto ROVIK.IA" tone="cyan" className="reveal" />
            <h2 id="rovik-ia-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[4.2rem]">
              Escaneo tu empresa en 60 segundos.
            </h2>
          </div>
          <p className="reveal self-end text-pretty text-lg text-fg-2 lg:col-span-4 lg:col-start-9">
            Siete preguntas. Un informe con tus fugas, el módulo por el que empezar y un plan de 30 días. Sin registro y sin enviar datos.
          </p>
        </div>

        <div className="reveal hud-frame mt-12 border border-line-2 bg-bg-2 [--hud-corner:var(--cyan)] lg:mt-16">
          {/* Barra de estado */}
          <div className="flex items-center justify-between gap-4 border-b border-line-2 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <CoreMark className="h-6 w-6" />
              <p className="hud-label text-fg">
                ROVIK.IA <span className="hidden text-muted sm:inline">· Copiloto de negocio</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="hud-label hidden items-center gap-2 text-muted sm:flex" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan blink" />
                {step < 0 ? "En espera" : step < QUESTIONS.length ? `Pregunta ${step + 1}/${QUESTIONS.length}` : report ? "Informe listo" : "Procesando"}
              </p>
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-pressed={voice}
                  aria-label="Voz de ROVIK.IA"
                  className="hud-label flex min-h-11 items-center gap-2 px-2 text-fg-2 transition-colors hover:text-fg"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
                    {voice && <path d="M11 5.5c.9.7 1.4 1.5 1.4 2.5s-.5 1.8-1.4 2.5M12.6 3.5C14 4.7 14.7 6.2 14.7 8s-.7 3.3-2.1 4.5" stroke="currentColor" strokeWidth="1.2" />}
                  </svg>
                  <span aria-hidden="true">
                    Voz <span className={voice ? "text-cyan" : "text-muted"}>{voice ? "on" : "off"}</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-12">
            {/* Conversación */}
            <div className="flex min-h-[18rem] flex-col border-line-2 lg:col-span-7 lg:min-h-[34rem] lg:border-r">
              <div ref={logRef} role="log" aria-live="polite" aria-label="Conversación con ROVIK.IA" className="max-h-[60svh] flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6 lg:max-h-[34rem]">
                <div className="max-w-[36rem]">
                  <p className="hud-label mb-1.5 text-cyan">ROVIK.IA</p>
                  <p className="text-pretty text-fg">{INTRO}</p>
                </div>
                {messages.map((m, i) =>
                  m.from === "ai" ? (
                    <div key={m.id} className="max-w-[36rem]">
                      <p className="hud-label mb-1.5 text-cyan">ROVIK.IA</p>
                      <p className="text-pretty text-fg">
                        <Typed text={m.text} instant={reduce || i < messages.length - 1} onDone={i === messages.length - 1 ? onTypedDone : undefined} />
                      </p>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[80%] border border-line-2 bg-bg-3 px-4 py-2.5 text-fg-2">
                        <span className="sr-only">Tu respuesta: </span>
                        {m.text}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="border-t border-line-2 px-4 py-5 sm:px-6">
                {step < 0 && (
                  <button type="button" onClick={start} className="btn btn-primary w-full sm:w-auto">
                    Iniciar escaneo
                    <Arrow />
                  </button>
                )}
                {q && !(typing && lastIsAi) && (
                  <div ref={optionsRef} role="group" aria-label={q.prompt} className="flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => answer(step, o.id, o.label)}
                        className="min-h-11 border border-line-2 bg-bg px-4 py-2 text-left text-[0.95rem] text-fg-2 transition-colors hover:border-cyan hover:text-fg focus-visible:border-cyan"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
                {q && typing && lastIsAi && <p className="hud-label text-muted">ROVIK.IA está escribiendo…</p>}
                {step >= QUESTIONS.length && !report && <p className="hud-label text-cyan blink">Procesando escaneo…</p>}
                {report && (
                  <button type="button" onClick={reset} className="hud-label min-h-11 text-muted transition-colors hover:text-fg">
                    ↺ Repetir escaneo
                  </button>
                )}
              </div>
            </div>

            {/* Panel de escaneo / informe */}
            <div className="border-t border-line-2 px-4 py-6 sm:px-6 lg:col-span-5 lg:border-t-0">
              {!report ? (
                <div>
                  <p className="hud-label text-muted">Escaneo en tiempo real</p>
                  <div className="mt-6 space-y-6">
                    {SYSTEMS.map((s) => (
                      <Bar key={s.id} label={s.label} hint={s.hint} value={partial ? partial[s.id] : null} />
                    ))}
                  </div>
                  <p className="mt-8 text-sm text-muted">
                    {partial ? "Los valores se ajustan con cada respuesta." : "Los sistemas se calibran a partir de la segunda respuesta."}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 ref={reportRef} tabIndex={-1} className="hud-label text-cyan outline-none">
                    Informe de escaneo
                  </h3>
                  <p className="mt-1 text-sm text-muted">{report.sectorLabel}</p>
                  <div className="mt-5 flex items-center gap-5">
                    <Dial value={report.overall} />
                    <div>
                      <p className="hud-label text-muted">Índice de escalabilidad</p>
                      <p className="mt-2 text-sm text-fg-2">Módulo recomendado</p>
                      <p className="mt-0.5 text-lg font-semibold text-gold">{report.moduleName}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
                    {SYSTEMS.map((s) => (
                      <div key={s.id}>
                        <div className="flex justify-between">
                          <span className="hud-label text-[0.65rem] text-fg-2">{s.label}</span>
                          <span className="hud-num text-xs text-fg">{report.scores[s.id]}</span>
                        </div>
                        <div className="mt-1.5 h-1 bg-bg-3">
                          <div
                            className={`h-full ${report.scores[s.id] < 45 ? "bg-alert" : report.scores[s.id] < 65 ? "bg-gold" : "bg-ok"}`}
                            style={{ width: `${report.scores[s.id]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {report.notice && (
                    <p className="mt-6 border-l-2 border-cyan bg-bg-3 px-4 py-3 text-sm text-fg-2">
                      <span className="hud-label mb-1 block text-cyan">Por qué no empezamos por automatizar</span>
                      {report.notice}
                    </p>
                  )}
                  <p className="hud-label mt-6 text-muted">Fugas principales</p>
                  <ul className="mt-2 space-y-2">
                    {report.leaks.map((l) => (
                      <li key={l} className="flex gap-3 text-sm text-fg-2">
                        <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-alert" />
                        {l}
                      </li>
                    ))}
                  </ul>
                  <p className="hud-label mt-6 text-muted">Plan de 30 días</p>
                  <ol className="mt-2 space-y-2">
                    {report.plan.map((p, i) => (
                      <li key={p} className="flex gap-3 text-sm text-fg-2">
                        <span className="hud-num shrink-0 text-gold">0{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a href={mailto("Informe de escaneo ROVIK.IA", reportText + "\n\nMe gustaría comentarlo en una sesión de diagnóstico.")} className="btn btn-primary">
                      Enviar informe a Rovik
                      <Arrow />
                    </a>
                    <button type="button" onClick={copy} className="btn btn-ghost">
                      {copied ? "Copiado" : "Copiar informe"}
                    </button>
                  </div>
                  <p className="mt-5 text-xs text-muted">
                    Orientativo: es un análisis automático de tus respuestas y no sustituye al diagnóstico con una persona.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
