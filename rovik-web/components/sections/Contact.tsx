"use client";

import { useRef, useState, type FormEvent } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { CONTACT } from "@/lib/content";
import { SITE, asset, mailto } from "@/lib/site";

type Field = "nombre" | "email" | "empresa" | "mensaje" | "privacidad";
type Errors = Partial<Record<Field, string>>;

const LIMITS = { nombre: 80, email: 120, empresa: 120, mensaje: 1500 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Quita caracteres de control (salvo saltos de línea en el mensaje) y recorta. */
function clean(v: FormDataEntryValue | null, max: number, multiline = false): string {
  const s = typeof v === "string" ? v : "";
  const stripped = multiline ? s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "") : s.replace(/[\u0000-\u001F\u007F]/g, " ");
  return stripped.trim().slice(0, max);
}

export default function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nombre: clean(fd.get("nombre"), LIMITS.nombre),
      email: clean(fd.get("email"), LIMITS.email),
      empresa: clean(fd.get("empresa"), LIMITS.empresa),
      mensaje: clean(fd.get("mensaje"), LIMITS.mensaje, true),
      privacidad: fd.get("privacidad") === "on",
    };
    const next: Errors = {};
    if (data.nombre.length < 2) next.nombre = "Escribe tu nombre.";
    if (!EMAIL_RE.test(data.email)) next.email = "Revisa el correo: parece incompleto.";
    if (data.mensaje.length < 10) next.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
    if (!data.privacidad) next.privacidad = "Necesitamos tu conformidad para responderte.";
    setErrors(next);
    const first = Object.keys(next)[0] as Field | undefined;
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const subject = `Diagnóstico Rovik · ${data.empresa || data.nombre}`;
    const body = [
      `Nombre: ${data.nombre}`,
      `Correo: ${data.email}`,
      data.empresa ? `Empresa: ${data.empresa}` : "",
      "",
      "Qué quiero conseguir:",
      data.mensaje,
    ]
      .filter((l, i) => l !== "" || i === 3)
      .join("\n");
    setSent({ subject, body });
    window.location.href = mailto(subject, body);
    window.setTimeout(() => doneRef.current?.focus(), 50);
  };

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(`Para: ${SITE.email}\nAsunto: ${sent.subject}\n\n${sent.body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const fieldCls = (f: Field) =>
    `mt-2 block w-full border bg-bg px-4 py-3.5 text-base text-fg placeholder:text-muted/80 transition-colors focus:border-cyan focus:outline-none ${
      errors[f] ? "border-alert" : "border-line-2 hover:border-muted"
    }`;

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative overflow-hidden border-t border-line bg-bg py-24 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_85%_100%,rgb(200_16_46/0.14),transparent_70%)]" />
      <div className="shell relative grid gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <SectionLabel code={CONTACT.code} label={CONTACT.label} tone="red" className="reveal" />
          <h2 id="contacto-title" className="display reveal mt-6 text-balance text-[2.5rem] leading-[0.92] sm:text-6xl lg:text-[4.6rem]">
            {CONTACT.title}
          </h2>
          <p className="reveal mt-6 max-w-md text-pretty text-lg text-fg-2">{CONTACT.lead}</p>

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
            {sent ? (
              <div role="status">
                <h3 ref={doneRef} tabIndex={-1} className="display-md text-3xl text-fg outline-none">
                  Mensaje preparado
                </h3>
                <p className="mt-4 text-fg-2">
                  Hemos abierto tu programa de correo con el mensaje listo para enviar a <strong className="text-fg">{SITE.email}</strong>. Solo tienes que pulsar
                  «Enviar».
                </p>
                <p className="mt-3 text-sm text-muted">¿No se ha abierto? Copia el mensaje y pégalo en un correo nuevo.</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={copy} className="btn btn-primary">
                    {copied ? "Copiado" : "Copiar mensaje"}
                  </button>
                  <a href={mailto(sent.subject, sent.body)} className="btn btn-ghost">
                    Abrir correo de nuevo
                  </a>
                </div>
                <button type="button" onClick={() => setSent(null)} className="hud-label mt-6 min-h-11 text-muted transition-colors hover:text-fg">
                  ← Editar mensaje
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-nota">
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
                  <div className="sm:col-span-2">
                    <label htmlFor="f-empresa" className="text-sm font-medium text-fg">
                      Empresa y sector <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <input id="f-empresa" name="empresa" autoComplete="organization" maxLength={LIMITS.empresa} className={fieldCls("empresa")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="f-mensaje" className="text-sm font-medium text-fg">
                      ¿Qué quieres conseguir?
                    </label>
                    <textarea
                      id="f-mensaje"
                      name="mensaje"
                      rows={5}
                      maxLength={LIMITS.mensaje}
                      required
                      placeholder="Ej.: facturamos bien pero todo depende de mí y quiero que el equipo venda solo."
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
                <button type="submit" className="btn btn-primary mt-8 w-full">
                  Solicitar diagnóstico
                  <Arrow />
                </button>
                <p id="form-nota" className="mt-4 text-center text-xs text-muted">
                  Se abrirá tu programa de correo con el mensaje preparado. Esta web no guarda lo que escribes.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
