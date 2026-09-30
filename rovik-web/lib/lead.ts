// Envío de solicitudes. Con un servicio de formularios configurado se envían directamente;
// sin él, se prepara un correo en el programa del visitante (respaldo sin coste ni terceros).
import type { FormConfig } from "../scripts/integrations.mjs";
import { mailto } from "./site";

export interface Lead {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  mensaje: string;
  /** Página o bloque desde el que se envía (home, constructoras…). */
  origen: string;
}

export type Attribution = Partial<Record<(typeof ATTR_KEYS)[number], string>>;

const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid"] as const;

/** Parámetros de campaña de la URL actual (sin guardar nada en el dispositivo). */
export function attributionFrom(search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const k of ATTR_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v.replace(/[^\w.\-~:@/+ ]/g, "").slice(0, 120);
  }
  return out;
}

export function leadSubject(lead: Lead): string {
  return `Diagnóstico Rovik · ${lead.empresa || lead.nombre}`;
}

export function leadText(lead: Lead, attr: Attribution = {}): string {
  const lines = [
    `Nombre: ${lead.nombre}`,
    `Correo: ${lead.email}`,
    lead.empresa ? `Empresa: ${lead.empresa}` : "",
    lead.telefono ? `Teléfono: ${lead.telefono}` : "",
    "",
    "Qué quiero conseguir:",
    lead.mensaje,
  ].filter((l, i) => l !== "" || i === 4);
  const campaign = Object.entries(attr).map(([k, v]) => `${k}: ${v}`);
  if (campaign.length) lines.push("", `Origen: ${lead.origen}`, ...campaign);
  return lines.join("\n");
}

export function leadMailto(lead: Lead, attr: Attribution = {}): string {
  return mailto(leadSubject(lead), leadText(lead, attr));
}

type FetchLike = (input: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

/** Envía la solicitud al servicio configurado. Nunca lanza: devuelve si se entregó. */
export async function sendLead(lead: Lead, attr: Attribution, form: FormConfig, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<boolean> {
  if (!form.enabled) return false;
  const fields = {
    nombre: lead.nombre,
    email: lead.email,
    empresa: lead.empresa ?? "",
    telefono: lead.telefono ?? "",
    mensaje: lead.mensaje,
    origen: lead.origen,
    ...attr,
  };
  const subject = leadSubject(lead);
  const body =
    form.provider === "web3forms"
      ? { access_key: form.accessKey, subject, from_name: "Web de Rovik", replyto: lead.email, ...fields }
      : form.provider === "formspree"
        ? { _subject: subject, _replyto: lead.email, ...fields }
        : { subject, ...fields };
  const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timer = controller ? setTimeout(() => controller.abort(), 12000) : undefined;
  try {
    const res = await fetchImpl(form.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller?.signal,
    });
    if (!res.ok) return false;
    if (form.provider === "web3forms") {
      const data = (await res.json().catch(() => ({}))) as { success?: boolean };
      return data.success === true;
    }
    return true;
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
