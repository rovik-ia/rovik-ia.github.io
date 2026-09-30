// Medición publicitaria bajo consentimiento. Sin IDs configurados o sin permiso del visitante,
// ninguna función de este archivo carga scripts ni envía datos.
import { INTEGRATIONS } from "./integrations";

export type Consent = "granted" | "denied";
export type TrackEvent = "generate_lead" | "contact_mailto" | "scan_complete" | "calculator_used";

const KEY = "rovik-consent-v1";
export const CONSENT_EVENT = "rovik:consent-open";

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    _fbq?: Fbq;
    __rovikTracking?: boolean;
  }
}

export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(KEY);
    if (!v) return null;
    const { value, at } = JSON.parse(v) as { value: Consent; at: number };
    // La elección caduca a los 12 meses (criterio de la AEPD para volver a preguntar)
    if (Date.now() - at > 365 * 24 * 3600 * 1000) return null;
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // Sin almacenamiento: se volverá a preguntar en la próxima visita
  }
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Carga las etiquetas configuradas. Solo se llama tras el consentimiento explícito. */
export function startTracking() {
  const t = INTEGRATIONS.tracking;
  if (!t.enabled || window.__rovikTracking) return;
  window.__rovikTracking = true;

  const gIds = [t.ga4, t.googleAds].filter(Boolean);
  if (gIds.length) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag necesita el objeto arguments tal cual
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "denied" });
    window.gtag("js", new Date());
    for (const id of gIds) window.gtag("config", id, { anonymize_ip: true });
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gIds[0])}`);
  }

  if (t.metaPixel) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", t.metaPixel);
    fbq("track", "PageView");
  }
}

/** Evento de conversión o interacción. Nunca incluye datos personales. */
export function track(event: TrackEvent, params: Record<string, string | number> = {}) {
  if (!window.__rovikTracking) return;
  const t = INTEGRATIONS.tracking;
  window.gtag?.("event", event, params);
  if (event === "generate_lead" && t.googleAds && t.googleAdsLeadLabel) {
    window.gtag?.("event", "conversion", { send_to: `${t.googleAds}/${t.googleAdsLeadLabel}` });
  }
  if (window.fbq) {
    if (event === "generate_lead") window.fbq("track", "Lead", { content_name: String(params.origen ?? "web") });
    else window.fbq("trackCustom", event, params);
  }
}

export function openConsent() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
