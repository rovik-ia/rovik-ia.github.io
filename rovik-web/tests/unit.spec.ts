import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readIntegrations, cspSources, WEB3FORMS_ENDPOINT } from "../scripts/integrations.mjs";
import { attributionFrom, leadText, sendLead, type Lead } from "../lib/lead";
import { leak, normalize } from "../lib/calculator";

const LEAD: Lead = { nombre: "Ana", email: "ana@empresa.es", mensaje: "Quiero medir mis fugas", origen: "constructoras" };

test.describe("Integraciones", () => {
  test("sin configuración no hay integraciones ni orígenes extra en la CSP", () => {
    const i = readIntegrations({}, {});
    expect(i.form.enabled).toBe(false);
    expect(i.tracking.enabled).toBe(false);
    expect(cspSources(i)).toEqual({ script: [], connect: [], img: [], frame: [] });
  });

  test("valores no válidos se descartan con aviso", () => {
    const i = readIntegrations(
      { form: { provider: "formspree", endpoint: "http://formspree.io/f/abc" }, tracking: { ga4: "UA-1", googleAds: "AW-12", metaPixel: "x" } },
      {}
    );
    expect(i.form.enabled).toBe(false);
    expect(i.tracking.enabled).toBe(false);
    expect(i.warnings.length).toBeGreaterThanOrEqual(3);
  });

  test("las variables de entorno tienen prioridad sobre el archivo", () => {
    const i = readIntegrations(
      { tracking: { ga4: "G-FILE1234" } },
      { NEXT_PUBLIC_GA4_ID: "G-ENV12345", NEXT_PUBLIC_FORM_PROVIDER: "web3forms", NEXT_PUBLIC_FORM_ACCESS_KEY: "12345678-1234-1234-1234-123456789abc" }
    );
    expect(i.tracking.ga4).toBe("G-ENV12345");
    expect(i.form).toMatchObject({ provider: "web3forms", endpoint: WEB3FORMS_ENDPOINT, enabled: true });
  });

  test("un endpoint genérico debe ser https y sin credenciales", () => {
    expect(readIntegrations({ form: { provider: "generic", endpoint: "https://user:pw@hooks.example.com/x" } }, {}).form.enabled).toBe(false);
    expect(readIntegrations({ form: { provider: "generic", endpoint: "javascript:alert(1)" } }, {}).form.enabled).toBe(false);
    expect(readIntegrations({ form: { provider: "generic", endpoint: "https://hooks.example.com/x" } }, {}).form.enabled).toBe(true);
  });

  test("la CSP solo abre los orígenes de lo que está activo", () => {
    const onlyForm = cspSources(readIntegrations({ form: { provider: "formspree", endpoint: "https://formspree.io/f/abcd1234" } }, {}));
    expect(onlyForm.connect).toEqual(["https://formspree.io"]);
    expect(onlyForm.script).toEqual([]);
    const ads = cspSources(readIntegrations({ tracking: { googleAds: "AW-123456789", googleAdsLeadLabel: "abcDEF123" } }, {}));
    expect(ads.script).toContain("https://www.googletagmanager.com");
    expect(ads.script).not.toContain("https://connect.facebook.net");
    const meta = cspSources(readIntegrations({ tracking: { metaPixel: "1234567890123" } }, {}));
    expect(meta.script).toEqual(["https://connect.facebook.net"]);
  });
});

test.describe("Envío de solicitudes", () => {
  test("atribución de campaña desde la URL, saneada", () => {
    const a = attributionFrom("?utm_source=google&utm_campaign=obra<script>&gclid=Cj0KCQ&otro=1");
    expect(a).toEqual({ utm_source: "google", utm_campaign: "obrascript", gclid: "Cj0KCQ" });
    expect(leadText(LEAD, a)).toContain("utm_campaign: obrascript");
  });

  test("Formspree: JSON con asunto y respuesta al remitente", async () => {
    let sent: { url: string; body: Record<string, string> } | null = null;
    const ok = await sendLead(LEAD, { utm_source: "google" }, { provider: "formspree", endpoint: "https://formspree.io/f/abcd1234", accessKey: "", enabled: true }, async (url, init) => {
      sent = { url, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ ok: true }) };
    });
    expect(ok).toBe(true);
    expect(sent!.url).toBe("https://formspree.io/f/abcd1234");
    expect(sent!.body).toMatchObject({ _replyto: "ana@empresa.es", nombre: "Ana", origen: "constructoras", utm_source: "google" });
  });

  test("Web3Forms: exige success en la respuesta", async () => {
    const form = { provider: "web3forms" as const, endpoint: WEB3FORMS_ENDPOINT, accessKey: "12345678-1234-1234-1234-123456789abc", enabled: true };
    const okFetch = async () => ({ ok: true, json: async () => ({ success: true }) });
    const badFetch = async () => ({ ok: true, json: async () => ({ success: false }) });
    expect(await sendLead(LEAD, {}, form, okFetch)).toBe(true);
    expect(await sendLead(LEAD, {}, form, badFetch)).toBe(false);
  });

  test("errores de red o HTTP no lanzan: devuelven false", async () => {
    const form = { provider: "generic" as const, endpoint: "https://hooks.example.com/x", accessKey: "", enabled: true };
    expect(await sendLead(LEAD, {}, form, async () => ({ ok: false, json: async () => ({}) }))).toBe(false);
    expect(
      await sendLead(LEAD, {}, form, async () => {
        throw new Error("offline");
      })
    ).toBe(false);
    expect(await sendLead(LEAD, {}, { ...form, enabled: false }, async () => ({ ok: true, json: async () => ({}) }))).toBe(false);
  });
});

test.describe("Calculadora de fugas", () => {
  test("cálculo mensual y anual", () => {
    // 20 operarios × 3 h/semana × 52/12 semanas = 260 h/mes; × 30 €/h = 7.800 €/mes
    expect(leak({ workers: 20, hoursPerWeek: 3, rate: 30 })).toEqual({ hoursMonth: 260, euroMonth: 7800, euroYear: 93600 });
  });

  test("entradas fuera de rango o no numéricas se acotan", () => {
    expect(normalize({ workers: -5, hoursPerWeek: 99, rate: Number.NaN })).toEqual({ workers: 1, hoursPerWeek: 20, rate: 10 });
    expect(leak({ workers: 0, hoursPerWeek: 0, rate: 0 }).euroMonth).toBe(0);
  });
});

test.describe("Kit de Google Ads", () => {
  const read = (f: string) => readFileSync(join(__dirname, "../marketing/google-ads", f), "utf8");
  const rows = (f: string) =>
    read(f)
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const [a, b, ...rest] = l.split(",");
        return [a, b, rest.join(",").replace(/^"(.*)"$/, "$1")];
      });

  test("anuncios dentro de los límites de Google Ads", () => {
    const ads = rows("anuncios-rsa.csv");
    const headlines = ads.filter((r) => r[1] === "Headline").map((r) => r[2]);
    const descriptions = ads.filter((r) => r[1] === "Description").map((r) => r[2]);
    const paths = ads.filter((r) => r[1].startsWith("Path")).map((r) => r[2]);
    expect(headlines.length).toBeGreaterThanOrEqual(3);
    expect(headlines.length).toBeLessThanOrEqual(15);
    expect(descriptions.length).toBeGreaterThanOrEqual(2);
    expect(descriptions.length).toBeLessThanOrEqual(4);
    for (const h of headlines) expect(h.length, h).toBeLessThanOrEqual(30);
    for (const d of descriptions) expect(d.length, d).toBeLessThanOrEqual(90);
    for (const p of paths) expect(p.length, p).toBeLessThanOrEqual(15);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  test("palabras clave apuntan a páginas que existen y no chocan con las negativas", () => {
    const kws = read("palabras-clave.csv").trim().split("\n").slice(1).map((l) => l.split(","));
    const negatives = read("negativas.txt")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    for (const [, , keyword, match, url] of kws) {
      expect(["Exact", "Phrase", "Broad"]).toContain(match);
      expect(existsSync(join(__dirname, "../app", url.replace(/^\/|\/$/g, ""), "page.tsx")), url).toBe(true);
      for (const n of negatives) expect(` ${keyword} `.includes(` ${n} `), `${keyword} bloqueada por «${n}»`).toBe(false);
    }
  });
});
