// Integraciones opcionales (formulario con servicio y medición publicitaria).
// Fuente única para la web (lib/integrations.ts) y para el endurecimiento (scripts/postbuild.mjs):
// lo que no está configurado o no pasa la validación no existe, ni en la página ni en la CSP.

/**
 * @typedef {"formspree" | "web3forms" | "generic" | ""} FormProvider
 * @typedef {{ provider: FormProvider, endpoint: string, accessKey: string, enabled: boolean }} FormConfig
 * @typedef {{ ga4: string, googleAds: string, googleAdsLeadLabel: string, metaPixel: string, enabled: boolean }} TrackingConfig
 * @typedef {{ form: FormConfig, tracking: TrackingConfig, warnings: string[] }} Integrations
 */

const RE = {
  ga4: /^G-[A-Z0-9]{4,16}$/,
  googleAds: /^AW-\d{6,14}$/,
  label: /^[A-Za-z0-9_-]{6,40}$/,
  metaPixel: /^\d{10,20}$/,
  web3formsKey: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  formspree: /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]{4,32}$/,
};

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/** @param {unknown} v */
const str = (v) => (typeof v === "string" ? v.trim() : "");

/** @param {string} u */
function httpsUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

/**
 * @param {{ form?: Record<string, unknown>, tracking?: Record<string, unknown> }} config  contenido de site.config.json
 * @param {Record<string, string | undefined>} env  variables NEXT_PUBLIC_* (tienen prioridad sobre el archivo)
 * @returns {Integrations}
 */
export function readIntegrations(config, env) {
  const warnings = [];
  const f = config.form ?? {};
  const t = config.tracking ?? {};
  const pick = (envName, fileValue) => str(env[envName]) || str(fileValue);

  // Formulario
  let provider = /** @type {FormProvider} */ (pick("NEXT_PUBLIC_FORM_PROVIDER", f.provider).toLowerCase());
  let endpoint = pick("NEXT_PUBLIC_FORM_ENDPOINT", f.endpoint);
  let accessKey = pick("NEXT_PUBLIC_FORM_ACCESS_KEY", f.accessKey);
  if (provider === "web3forms") {
    endpoint = WEB3FORMS_ENDPOINT;
    if (!RE.web3formsKey.test(accessKey)) {
      if (accessKey) warnings.push("Clave de Web3Forms con formato no válido: formulario por correo.");
      provider = "";
    }
  } else if (provider === "formspree") {
    accessKey = "";
    if (!RE.formspree.test(endpoint)) {
      if (endpoint) warnings.push("Endpoint de Formspree no válido (https://formspree.io/f/xxxx): formulario por correo.");
      provider = "";
    }
  } else if (provider === "generic") {
    accessKey = "";
    endpoint = httpsUrl(endpoint);
    if (!endpoint) {
      warnings.push("Endpoint genérico no válido (debe ser https): formulario por correo.");
      provider = "";
    }
  } else {
    if (provider) warnings.push(`Proveedor de formulario desconocido «${provider}»: formulario por correo.`);
    provider = "";
  }
  if (!provider) {
    endpoint = "";
    accessKey = "";
  }

  // Medición
  const check = (value, re, name) => {
    if (!value) return "";
    if (re.test(value)) return value;
    warnings.push(`${name} con formato no válido: se ignora.`);
    return "";
  };
  const ga4 = check(pick("NEXT_PUBLIC_GA4_ID", t.ga4), RE.ga4, "ID de GA4");
  const googleAds = check(pick("NEXT_PUBLIC_GOOGLE_ADS_ID", t.googleAds), RE.googleAds, "ID de Google Ads");
  const googleAdsLeadLabel = googleAds ? check(pick("NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL", t.googleAdsLeadLabel), RE.label, "Etiqueta de conversión de Google Ads") : "";
  const metaPixel = check(pick("NEXT_PUBLIC_META_PIXEL_ID", t.metaPixel), RE.metaPixel, "ID del píxel de Meta");

  return {
    form: { provider, endpoint, accessKey, enabled: Boolean(provider) },
    tracking: { ga4, googleAds, googleAdsLeadLabel, metaPixel, enabled: Boolean(ga4 || googleAds || metaPixel) },
    warnings,
  };
}

/**
 * Orígenes que la CSP debe admitir para las integraciones activas (y solo esos).
 * @param {Integrations} i
 */
export function cspSources(i) {
  const s = { script: new Set(), connect: new Set(), img: new Set(), frame: new Set() };
  if (i.form.enabled) s.connect.add(new URL(i.form.endpoint).origin);
  if (i.tracking.ga4 || i.tracking.googleAds) {
    s.script.add("https://www.googletagmanager.com");
    ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://www.googletagmanager.com"].forEach((o) => s.connect.add(o));
    ["https://*.google-analytics.com", "https://www.googletagmanager.com"].forEach((o) => s.img.add(o));
  }
  if (i.tracking.googleAds) {
    ["https://www.googleadservices.com", "https://googleads.g.doubleclick.net", "https://www.google.com"].forEach((o) => s.script.add(o));
    ["https://www.googleadservices.com", "https://googleads.g.doubleclick.net", "https://www.google.com", "https://*.doubleclick.net"].forEach((o) => s.connect.add(o));
    ["https://www.googleadservices.com", "https://googleads.g.doubleclick.net", "https://www.google.com", "https://www.google.es"].forEach((o) => s.img.add(o));
    ["https://td.doubleclick.net", "https://www.googletagmanager.com"].forEach((o) => s.frame.add(o));
  }
  if (i.tracking.metaPixel) {
    s.script.add("https://connect.facebook.net");
    ["https://www.facebook.com", "https://connect.facebook.net"].forEach((o) => s.connect.add(o));
    s.img.add("https://www.facebook.com");
  }
  return { script: [...s.script], connect: [...s.connect], img: [...s.img], frame: [...s.frame] };
}

/** Variables de entorno relevantes (para leerlas en Node). */
export function envFromProcess() {
  const names = [
    "NEXT_PUBLIC_FORM_PROVIDER",
    "NEXT_PUBLIC_FORM_ENDPOINT",
    "NEXT_PUBLIC_FORM_ACCESS_KEY",
    "NEXT_PUBLIC_GA4_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL",
    "NEXT_PUBLIC_META_PIXEL_ID",
  ];
  return Object.fromEntries(names.map((n) => [n, process.env[n]]));
}
