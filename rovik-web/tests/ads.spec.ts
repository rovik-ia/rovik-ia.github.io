// Batería con formulario y medición ACTIVADOS (compilación de prueba: `npm run test:ads`).
// Comprueba lo que exige el RGPD/LSSI y lo que necesita una campaña: nada de terceros antes del
// consentimiento, conversión registrada al enviar y atribución de campaña en la solicitud.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.skip(!process.env.ADS_BUILD, "solo con la compilación de prueba de integraciones (npm run test:ads)");

const THIRD = /googletagmanager\.com|google-analytics\.com|doubleclick\.net|googleadservices\.com|facebook\.net|facebook\.com/;

async function mockThirdParties(page: Page) {
  const hits: string[] = [];
  await page.route(THIRD, (route) => {
    hits.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return hits;
}

async function mockForm(page: Page, status = 200) {
  const posts: Record<string, string>[] = [];
  await page.route("https://formspree.io/**", async (route) => {
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, accept", "access-control-allow-methods": "POST" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    posts.push(JSON.parse(route.request().postData() ?? "{}"));
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ ok: status === 200 }), headers: cors });
  });
  return posts;
}

async function fillForm(page: Page) {
  // El formulario descarta envíos en los primeros 2,5 s (robots)
  await page.waitForTimeout(2600);
  await page.fill("#f-nombre", "Ana Prueba");
  await page.fill("#f-email", "ana@empresa.es");
  await page.fill("#f-telefono", "+34 600 000 000");
  await page.fill("#f-mensaje", "Tenemos 3 obras y partes en papel.");
  await page.check("#f-privacidad");
  await page.locator("#contacto form").getByRole("button", { name: /Solicitar diagnóstico/ }).click();
}

test("antes de decidir no se contacta con Google ni Meta", async ({ page }) => {
  const hits = await mockThirdParties(page);
  await page.goto("/constructoras/", { waitUntil: "networkidle" });
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toBeVisible();
  await page.waitForTimeout(800);
  expect(hits).toEqual([]);
  expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
});

test("rechazar: nada se carga y la decisión se recuerda", async ({ page }) => {
  const hits = await mockThirdParties(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Rechazar" }).click();
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toHaveCount(0);
  expect(hits).toEqual([]);
});

test("aceptar: carga Google y Meta y se puede retirar desde el pie", async ({ page }) => {
  const hits = await mockThirdParties(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect.poll(() => hits.some((h) => h.includes("googletagmanager.com/gtag/js"))).toBe(true);
  await expect.poll(() => hits.some((h) => h.includes("connect.facebook.net"))).toBe(true);
  const dl = await page.evaluate(() => JSON.stringify(window.dataLayer?.map((a) => Array.from(a as ArrayLike<unknown>))));
  expect(dl).toContain("G-TEST12345");
  expect(dl).toContain("AW-123456789");
  await page.getByRole("button", { name: "Preferencias de cookies" }).click();
  await expect(page.getByRole("region", { name: "Aviso de cookies" })).toBeVisible();
});

test("envío con servicio: atribución de campaña y conversión sin datos personales", async ({ page }) => {
  await mockThirdParties(page);
  const posts = await mockForm(page);
  await page.goto("/constructoras/?utm_source=google&utm_medium=cpc&utm_campaign=obra-horas&gclid=TEST123#contacto", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Aceptar" }).click();
  await fillForm(page);
  await expect(page.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]).toMatchObject({
    nombre: "Ana Prueba",
    email: "ana@empresa.es",
    telefono: "+34 600 000 000",
    origen: "constructoras",
    utm_source: "google",
    utm_campaign: "obra-horas",
    gclid: "TEST123",
  });
  const dl = await page.evaluate(() => JSON.stringify(window.dataLayer?.map((a) => Array.from(a as ArrayLike<unknown>))));
  expect(dl).toContain("AW-123456789/abcDEF123");
  expect(dl).toContain("generate_lead");
  expect(dl).not.toContain("ana@empresa.es");
  expect(dl).not.toContain("Ana Prueba");
});

test("si el servicio falla, se ofrece el correo sin perder los datos", async ({ page }) => {
  await mockThirdParties(page);
  await mockForm(page, 500);
  await page.goto("/#contacto", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Rechazar" }).click();
  await fillForm(page);
  await expect(page.getByRole("heading", { name: "No se ha podido enviar" })).toBeVisible();
  const href = decodeURIComponent((await page.getByRole("link", { name: "Enviar por correo" }).getAttribute("href")) ?? "");
  expect(href).toContain("Ana Prueba");
});

test("el campo trampa para robots no envía nada", async ({ page }) => {
  await mockThirdParties(page);
  const posts = await mockForm(page);
  await page.goto("/#contacto", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Rechazar" }).click();
  await page.evaluate(() => {
    (document.getElementById("f-web-empresa") as HTMLInputElement).value = "spam";
  });
  await fillForm(page);
  await expect(page.getByRole("heading", { name: "Solicitud recibida" })).toBeVisible();
  expect(posts).toHaveLength(0);
});

test("la CSP incluye exactamente los orígenes de las integraciones activas", async ({ page }) => {
  await page.goto("/");
  const csp = (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content")) ?? "";
  expect(csp).toContain("connect-src 'self' https://formspree.io");
  expect(csp).toMatch(/script-src 'self' 'sha256-[^;]*https:\/\/www\.googletagmanager\.com/);
  expect(csp).toContain("https://connect.facebook.net");
  expect(csp).not.toContain("unsafe-eval");
});

test("la política de cookies describe las cookies activas", async ({ page }) => {
  await page.goto("/cookies/");
  await expect(page.getByRole("table")).toContainText("_gcl_au");
  await expect(page.getByRole("table")).toContainText("_fbp");
});

test("aviso de cookies accesible (WCAG 2.1 AA) y con foco alcanzable", async ({ page }) => {
  await mockThirdParties(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/constructoras/", { waitUntil: "networkidle" });
  const banner = page.getByRole("region", { name: "Aviso de cookies" });
  await expect(banner).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[aria-label="Aviso de cookies"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  const reject = banner.getByRole("button", { name: "Rechazar" });
  const accept = banner.getByRole("button", { name: "Aceptar" });
  const [r, a] = [await reject.boundingBox(), await accept.boundingBox()];
  // Rechazar igual de visible que aceptar (mismo tamaño)
  expect(Math.abs(r!.height - a!.height)).toBeLessThan(2);
  expect(Math.abs(r!.width - a!.width)).toBeLessThan(24);
  await page.screenshot({ path: `test-results/aviso-cookies-${page.viewportSize()!.width}.png` });
});
