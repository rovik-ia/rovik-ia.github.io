"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { CONTACT } from "@/lib/content";
import { SITE, asset } from "@/lib/site";
import { INTEGRATIONS } from "@/lib/integrations";
import { attributionFrom, leadMailto, leadSubject, leadText, sendLead, type Lead } from "@/lib/lead";
import { track } from "@/lib/analytics";
import { PREFILL_EVENT, type Prefill } from "@/lib/prefill";

type Field = "nombre" | "email" | "telefono" | "mensaje" | "privacidad";
type Errors = Partial<Record<Field, string>>;
type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; via: "endpoint" | "mailto"; lead: Lead } | { state: "error"; lead: Lead };

const LIMITS = { nombre: 80, email: 120, empresa: 120, telefono: 20, mensaje: 2000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,19}$/;
/** Envíos más rápidos que esto tras cargar la página se consideran automáticos. */
const MIN_FILL_MS = 2500;

/** Quita caracteres de control (salvo saltos de línea en el mensaje) y recorta. */
function clean(v: FormDataEntryValue | null, max: number, multiline = false): string {
  const s = typeof v === "string" ? v : "";
  const stripped = multiline ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "") : s.replace(/[\u0000-\u001F\u007F]/g, " ");
  return stripped.trim().slice(0, max);
}

interface Props {
  origin?: string;
  code?: string;
  label?: string;
  title?: string;
  lead?: string;
  placeholder?: string;
}

export default function Contact({
  origin = "home",
  code = CONTACT.code,
  label = CONTACT.label,
  title = CONTACT.title,
  lead = CONTACT.lead,
  placeholder = "Ej.: facturamos bien pero todo depende de mí y quiero que el equipo venda solo.",
}: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [copied, setCopied] = useState(false);
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const loadedAt = useRef(0);
  const direct = INTEGRATIONS.form.enabled;

  useEffect(() => {
    loadedAt.current = Date.now();
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<Prefill>).detail;
      if (!detail) return;
      setStatus({ state: "idle" });
      // El formulario puede estar desmontado (mensaje enviado): se rellena en el siguiente render
      window.setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.value = detail.mensaje.slice(0, LIMITS.mensaje);
          setPrefilledFrom(detail.origen);
        }
      }, 0);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  useEffect(() => {
    if (status.state === "sent" || status.state === "error") doneRef.current?.focus();
  }, [status.state]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.state === "sending") return;
    const fd = new FormData(e.currentTarget);
    const data = {
      nombre: clean(fd.get("nombre"), LIMITS.nombre),
      email: clean(fd.get("email"), LIMITS.email),
      empresa: clean(fd.get("empresa"), LIMITS.empresa),
      telefono: clean(fd.get("telefono"), LIMITS.telefono),
      mensaje: clean(fd.get("mensaje"), LIMITS.mensaje, true),
      privacidad: fd.get("privacidad") === "on",
      trampa: clean(fd.get("web_empresa"), 200),
    };
    const next: Errors = {};
    if (data.nombre.length < 2) next.nombre = "Escribe tu nombre.";
    if (!EMAIL_RE.test(data.email)) next.email = "Revisa el correo: parece incompleto.";
    if (data.telefono && !PHONE_RE.test(data.telefono)) next.telefono = "Revisa el teléfono o déjalo en blanco.";
    if (data.mensaje.length < 10) next.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
    if (!data.privacidad) next.privacidad = "Necesitamos tu conformidad para responderte.";
    setErrors(next);
    const first = Object.keys(next)[0] as Field | undefined;
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const leadData: Lead = {
      nombre: data.nombre,
      email: data.email,
      empresa: data.empresa || undefined,
      telefono: data.telefono || undefined,
      mensaje: data.mensaje,
      origen: prefilledFrom ? `${origin} · ${prefilledFrom}` : origin,
    };
    const attr = attributionFrom(window.location.search);

    // Robots: campo trampa relleno o envío instantáneo. Se simula éxito y no se envía nada.
    if (data.trampa || Date.now() - loadedAt.current < MIN_FILL_MS) {
      setStatus({ state: "sent", via: direct ? "endpoint" : "mailto", lead: leadData });
      return;
    }

    if (direct) {
      setStatus({ state: "sending" });
      const ok = await sendLead(leadData, attr, INTEGRATIONS.form);
      if (ok) {
        track("generate_lead", { origen: origin });
        setStatus({ state: "sent", via: "endpoint", lead: leadData });
      } else {
        setStatus({ state: "error", lead: leadData });
      }
      return;
    }
    track("contact_mailto", { origen: origin });
    setStatus({ state: "sent", via: "mailto", lead: leadData });
    window.location.href = leadMailto(leadData, attr);
  };

  const copy = async (l: Lead) => {
    try {
      await navigator.clipboard.writeText(`Para: ${SITE.email}\nAsunto: ${leadSubject(l)}\n\n${leadText(l, attributionFrom(window.location.search))}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const fieldCls = (f?: Field) =>
    `mt-2 block w-full border bg-bg px-4 py-3.5 text-base text-fg placeholder:text-muted/80 transition-colors focus:border-cyan focus:outline-none ${
      f && errors[f] ? "border-alert" : "border-line-2 hover:border-muted"
    }`;

  const done = status.state === "sent" || status.state === "error";

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative overflow-hidden border-t border-line bg-bg py-24 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_85%_100%,rgb(200_16_46/0.14),transparent_70%)]" />
      <div className="shell relative grid gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <SectionLabel code={code} label={label} tone="red" className="reveal" />
          <h2 id="contacto-title" className="display reveal mt-6 text-balance text-[2.5rem] leading-[0.92] sm:text-6xl lg:text-[4.6rem]">
            {title}
          </h2>
          <p className="reveal mt-6 max-w-md text-pretty text-lg text-fg-2">{lead}</p>

          <ol className="reveal mt-10 border-t border-line-2">
            {CONTACT.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr] border-b border-line-2 py-5">
                <span className="hud-num text-sm text-gold">0{i + 1}</span>
                <div>
                  <p className="font-semibold text-fg">{s.title}</p>
                  <p className="mt-1 text-[0.95rem] text-fg-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="reveal mt-8 text-fg-2">
            ¿Prefieres escribir directamente?{" "}
            <a href={`mailto:${SITE.email}`} className="link-hud font-mono text-[0.95rem]">
              {SITE.email}
            </a>
          </p>
          {SITE.whatsapp && (
            <p className="reveal mt-3 text-fg-2">
              O por WhatsApp:{" "}
              <a href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`} className="link-hud font-mono text-[0.95rem]" rel="noopener noreferrer" target="_blank">
                +{SITE.whatsapp.replace(/\D/g, "")}
              </a>
            </p>
          )}
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="reveal hud-frame border border-line-2 bg-bg-2 p-5 [--hud-corner:var(--red)] sm:p-8">
            {done ? (
              <div role="status">
                {status.state === "sent" && status.via === "endpoint" && (
                  <>
                    <h3 ref={doneRef} tabIndex={-1} className="display-md text-3xl text-fg outline-none">
                      Solicitud recibida
                    </h3>
                    <p className="mt-4 text-fg-2">
                      Gracias, {status.lead.nombre.split(" ")[0]}. Te escribiremos a <strong className="text-fg">{status.lead.email}</strong> con los siguientes pasos.
                    </p>
                  </>
                )}
                {status.state === "sent" && status.via === "mailto" && (
                  <>
                    <h3 ref={doneRef} tabIndex={-1} className="display-md text-3xl text-fg outline-none">
                      Mensaje preparado
                    </h3>
                    <p className="mt-4 text-fg-2">
                      Hemos abierto tu programa de correo con el mensaje listo para enviar a <strong className="text-fg">{SITE.email}</strong>. Solo tienes que
                      pulsar «Enviar».
                    </p>
                    <p className="mt-3 text-sm text-muted">¿No se ha abierto? Copia el mensaje y pégalo en un correo nuevo.</p>
                  </>
                )}
                {status.state === "error" && (
                  <>
                    <h3 ref={doneRef} tabIndex={-1} className="display-md text-3xl text-fg outline-none">
                      No se ha podido enviar
                    </h3>
                    <p className="mt-4 text-fg-2">
                      Puede ser la conexión. Tus datos no se han perdido: envíalos por correo con un clic o cópialos y escríbenos a{" "}
                      <strong className="text-fg">{SITE.email}</strong>.
                    </p>
                  </>
                )}
                {(status.state === "error" || (status.state === "sent" && status.via === "mailto")) && (
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a href={leadMailto(status.lead, {})} className="btn btn-primary">
                      {status.state === "error" ? "Enviar por correo" : "Abrir correo de nuevo"}
                    </a>
                    <button type="button" onClick={() => copy(status.lead)} className="btn btn-ghost">
                      {copied ? "Copiado" : "Copiar mensaje"}
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => setStatus({ state: "idle" })} className="hud-label mt-6 min-h-11 text-muted transition-colors hover:text-fg">
                  ← {status.state === "sent" && status.via === "endpoint" ? "Enviar otra solicitud" : "Editar mensaje"}
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-nota" aria-busy={status.state === "sending"}>
                <p className="hud-label text-muted">Solicitud de diagnóstico</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-nombre" className="text-sm font-medium text-fg">
                      Nombre
                    </label>
                    <input
                      id="f-nombre"
                      name="nombre"
                      autoComplete="name"
                      maxLength={LIMITS.nombre}
                      required
                      aria-invalid={!!errors.nombre}
                      aria-describedby={errors.nombre ? "e-nombre" : undefined}
                      className={fieldCls("nombre")}
                    />
                    {errors.nombre && (
                      <p id="e-nombre" className="mt-2 text-sm text-alert">
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="f-email" className="text-sm font-medium text-fg">
                      Correo
                    </label>
                    <input
                      id="f-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={LIMITS.email}
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "e-email" : undefined}
                      className={fieldCls("email")}
                    />
                    {errors.email && (
                      <p id="e-email" className="mt-2 text-sm text-alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="f-empresa" className="text-sm font-medium text-fg">
                      Empresa y sector <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <input id="f-empresa" name="empresa" autoComplete="organization" maxLength={LIMITS.empresa} className={fieldCls()} />
                  </div>
                  <div>
                    <label htmlFor="f-telefono" className="text-sm font-medium text-fg">
                      Teléfono <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <input
                      id="f-telefono"
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={LIMITS.telefono}
                      aria-invalid={!!errors.telefono}
                      aria-describedby={errors.telefono ? "e-telefono" : undefined}
                      className={fieldCls("telefono")}
                    />
                    {errors.telefono && (
                      <p id="e-telefono" className="mt-2 text-sm text-alert">
                        {errors.telefono}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="f-mensaje" className="text-sm font-medium text-fg">
                      ¿Qué quieres conseguir?
                    </label>
                    {prefilledFrom && (
                      <p className="mt-1 text-sm text-cyan" role="status">
                        Hemos añadido tu {prefilledFrom}. Puedes editarlo antes de enviar.
                      </p>
                    )}
                    <textarea
                      ref={messageRef}
                      id="f-mensaje"
                      name="mensaje"
                      rows={5}
                      maxLength={LIMITS.mensaje}
                      required
                      placeholder={placeholder}
                      aria-invalid={!!errors.mensaje}
                      aria-describedby={errors.mensaje ? "e-mensaje" : undefined}
                      className={`${fieldCls("mensaje")} resize-y`}
                    />
                    {errors.mensaje && (
                      <p id="e-mensaje" className="mt-2 text-sm text-alert">
                        {errors.mensaje}
                      </p>
                    )}
                  </div>
                  {/* Campo trampa para robots: invisible y fuera del orden de tabulación */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="f-web-empresa">No rellenes este campo</label>
                    <input id="f-web-empresa" name="web_empresa" tabIndex={-1} autoComplete="off" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-start gap-3">
                    <input
                      id="f-privacidad"
                      name="privacidad"
                      type="checkbox"
                      required
                      aria-invalid={!!errors.privacidad}
                      aria-describedby={errors.privacidad ? "e-privacidad" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--red)]"
                    />
                    <label htmlFor="f-privacidad" className="text-sm text-fg-2">
                      Acepto que Rovik use estos datos solo para responder a mi solicitud, según la{" "}
                      <a href={asset("/privacidad/")} className="link-hud">
                        política de privacidad
                      </a>
                      .
                    </label>
                  </div>
                  {errors.privacidad && (
                    <p id="e-privacidad" className="mt-2 text-sm text-alert">
                      {errors.privacidad}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary mt-8 w-full" disabled={status.state === "sending"}>
                  {status.state === "sending" ? (
                    <>
                      <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Solicitar diagnóstico
                      <Arrow />
                    </>
                  )}
                </button>
                <p id="form-nota" className="mt-4 text-center text-xs text-muted">
                  {direct
                    ? "Te responderemos por correo. Tus datos solo se usan para contestarte."
                    : "Se abrirá tu programa de correo con el mensaje preparado. Esta web no guarda lo que escribes."}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
