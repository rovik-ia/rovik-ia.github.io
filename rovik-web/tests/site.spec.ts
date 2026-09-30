import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/aviso-legal/", "/privacidad/", "/cookies/"];

/** Simula una GPU real: en CI Chromium renderiza WebGL por software y la web sirve imágenes estáticas. */
async function fakeGpu(page: Page) {
  await page.addInitScript(() => {
    for (const Ctx of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const original = Ctx.prototype.getParameter;
      Ctx.prototype.getParameter = function (this: WebGLRenderingContext, p: number) {
        if (p === 0x9246 || p === 0x1f01) return "ANGLE (Test GPU)";
        return original.call(this, p);
      };
    }
  });
}

/** Registra errores de consola, excepciones y violaciones de CSP de la página. */
async function watch(page: Page) {
  const problems: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    if (!r.url().startsWith("mailto:")) problems.push(`requestfailed: ${r.url()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()}: ${r.url()}`);
  });
  return problems;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

test.describe("Carga y seguridad", () => {
  for (const path of PAGES) {
    test(`${path} carga sin errores, 404 ni violaciones de CSP`, async ({ page }) => {
      const problems = await watch(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await scrollThrough(page);
      await page.waitForTimeout(1500);
      expect(problems).toEqual([]);
    });
  }

  test("cada página lleva CSP por huella sin unsafe-inline/eval en scripts", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
      expect(csp, path).toBeTruthy();
      const script = csp!.split(";").find((d) => d.trim().startsWith("script-src"))!;
      expect(script).toContain("'sha256-");
      expect(script).not.toContain("unsafe-inline");
      expect(script).not.toContain("unsafe-eval");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    }
  });

  test("el núcleo 3D se ensambla bajo la CSP estricta", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio-1440" && info.project.name !== "movil-390", "basta con dos tamaños");
    await fakeGpu(page);
    const problems = await watch(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#inicio canvas")).toHaveCSS("opacity", "1", { timeout: 20_000 });
    await page.locator("#protocolo ol").scrollIntoViewIfNeeded();
    await expect(page.locator("#protocolo canvas")).toHaveCSS("opacity", "1", { timeout: 20_000 });
    expect(problems).toEqual([]);
  });

  test("sin GPU (WebGL por software) se sirven las imágenes estáticas", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio-1440", "basta con un tamaño");
    await page.addInitScript(() => {
      const original = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function (this: WebGL2RenderingContext, p: number) {
        if (p === 0x9246 || p === 0x1f01) return "Google SwiftShader";
        return original.call(this, p);
      };
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#inicio canvas")).toHaveCount(0);
    await expect(page.locator('#inicio img[src*="core-hero"]')).toBeVisible();
  });

  test("los enlaces externos no filtran la ventana de origen", async ({ page }) => {
    await page.goto("/");
    const blank = page.locator('a[target="_blank"]');
    for (let i = 0; i < (await blank.count()); i++) {
      await expect(blank.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });
});

test.describe("Diseño adaptable", () => {
  test("sin desbordamiento horizontal en ninguna página", async ({ page }) => {
    const width = page.viewportSize()!.width;
    for (const path of PAGES) {
      await page.goto(path, { waitUntil: "networkidle" });
      await scrollThrough(page);
      const sizes = await page.evaluate(() => ({ inner: window.innerWidth, scroll: document.documentElement.scrollWidth }));
      expect(sizes.inner, path).toBe(width);
      expect(sizes.scroll, path).toBeLessThanOrEqual(width);
    }
  });

  test("objetivos táctiles de al menos 44 px en móvil", async ({ page }, info) => {
    test.skip(!info.project.name.startsWith("movil"), "solo móvil");
    await page.goto("/");
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("main a, main button, header a, header button, summary")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height < 40)
        .filter(({ el }) => !el.closest("p, label, li:not([class*=border])")) // enlaces dentro de texto corrido: exentos (WCAG 2.5.8)
        .map(({ el, r }) => `${el.tagName} "${el.textContent?.trim().slice(0, 30)}" ${Math.round(r.height)}px`)
    );
    expect(small).toEqual([]);
  });
});

test.describe("Accesibilidad", () => {
  for (const path of PAGES) {
    test(`${path} sin violaciones WCAG 2.1 AA (axe)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      await scrollThrough(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      expect(summary).toEqual([]);
    });
  }

  test("un único h1 y jerarquía de encabezados sin saltos", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const levels = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1])));
      expect(levels.filter((l) => l === 1), path).toHaveLength(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `${path} h${levels[i - 1]}→h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test("enlace para saltar al contenido", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test("movimiento reducido: sin lienzo 3D, con imágenes estáticas", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator('#inicio img[src*="core-hero"]')).toBeVisible();
  });
});

test.describe("Recorridos de conversión", () => {
  test("ROVIK.IA completa el escaneo y prepara el informe", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#rovik-ia");
    await page.getByRole("button", { name: "Iniciar escaneo" }).click();
    for (let i = 0; i < 7; i++) {
      const group = page.locator("#rovik-ia [role=group]");
      await expect(group).toBeVisible();
      await group.getByRole("button").nth(i % 3).click();
    }
    await expect(page.getByRole("heading", { name: "Informe de escaneo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Informe de escaneo" })).toBeFocused();
    const mail = page.getByRole("link", { name: /Enviar informe a Rovik/ });
    await expect(mail).toHaveAttribute("href", /^mailto:inforovik\.ia@gmail\.com\?subject=Informe/);
    await expect(page.locator("#rovik-ia")).toContainText("Plan de 30 días");
    await page.getByRole("button", { name: /Repetir escaneo/ }).click();
    await expect(page.getByRole("button", { name: "Iniciar escaneo" })).toBeVisible();
  });

  test("el escaneo se completa solo con teclado", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio-1440", "basta con un tamaño");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#rovik-ia");
    await page.getByRole("button", { name: "Iniciar escaneo" }).focus();
    await page.keyboard.press("Enter");
    for (let i = 0; i < 7; i++) {
      await expect(page.locator("#rovik-ia [role=group] button").first()).toBeFocused();
      await page.keyboard.press("Enter");
    }
    await expect(page.getByRole("heading", { name: "Informe de escaneo" })).toBeFocused();
  });

  test("el formulario valida y prepara el correo", async ({ page }) => {
    await page.goto("/#contacto");
    const form = page.locator("#contacto form");
    await form.getByRole("button", { name: /Solicitar diagnóstico/ }).click();
    await expect(page.locator("#f-nombre")).toBeFocused();
    await expect(page.locator("#f-nombre")).toHaveAttribute("aria-invalid", "true");
    await expect(form).toContainText("Escribe tu nombre.");
    await expect(form).toContainText("Revisa el correo");
    await expect(form).toContainText("Necesitamos tu conformidad");

    await page.fill("#f-nombre", "Ana Prueba");
    await page.fill("#f-email", "ana@empresa.es");
    await page.fill("#f-empresa", "Empresa de prueba");
    await page.fill("#f-mensaje", "Queremos que el equipo venda sin depender de mí.");
    await page.check("#f-privacidad");
    await form.getByRole("button", { name: /Solicitar diagnóstico/ }).click();
    await expect(page.getByRole("heading", { name: "Mensaje preparado" })).toBeVisible();
    const again = page.getByRole("link", { name: "Abrir correo de nuevo" });
    const href = decodeURIComponent((await again.getAttribute("href")) ?? "");
    expect(href).toContain("mailto:inforovik.ia@gmail.com");
    expect(href).toContain("Ana Prueba");
    expect(href).toContain("Empresa de prueba");
  });

  test("el formulario neutraliza caracteres de control en los datos", async ({ page }) => {
    await page.goto("/#contacto");
    await page.fill("#f-nombre", "Ana\u0007 <b>x</b>");
    await page.fill("#f-email", "ana@empresa.es");
    await page.fill("#f-mensaje", "Mensaje con\u0000 nulos y <script>alert(1)</script>");
    await page.check("#f-privacidad");
    await page.locator("#contacto form").getByRole("button", { name: /Solicitar diagnóstico/ }).click();
    const href = decodeURIComponent((await page.getByRole("link", { name: "Abrir correo de nuevo" }).getAttribute("href")) ?? "");
    expect(href).not.toMatch(/[\u0000\u0007]/);
    // El texto viaja como texto plano en el correo: nunca se inserta como HTML en la página
    expect(await page.locator("#contacto b").count()).toBe(0);
  });

  test("módulos: pestañas accesibles con flechas", async ({ page }) => {
    await page.goto("/#modulos");
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-propulsion")).toBeVisible();
    await expect(page.locator("#panel-nucleo")).toBeHidden();
    await page.keyboard.press("End");
    await expect(tabs.nth(3)).toBeFocused();
  });

  test("CTA principal lleva al escáner y al formulario", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Escanear mi empresa/ })).toHaveAttribute("href", "#rovik-ia");
    await expect(page.locator("#contacto")).toHaveCount(1);
    await expect(page.locator("#rovik-ia")).toHaveCount(1);
  });

  test("menú móvil: abre, atrapa el foco y se cierra con Escape", async ({ page }, info) => {
    test.skip(!info.project.name.startsWith("movil") && info.project.name !== "tableta-768", "solo pantallas sin menú de escritorio");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Abrir menú" });
    await toggle.click();
    const panel = page.locator("#menu-movil");
    await expect(panel).toBeVisible();
    // El panel cubre toda la pantalla (un ancestro con filter/transform lo recortaría)
    const box = await panel.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(page.viewportSize()!.height - 1);
    await expect(panel.getByRole("link", { name: /Contacto/ })).toBeInViewport();
    await expect(page.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest("#menu-movil"));
    expect(inside).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir menú" })).toBeFocused();
  });
});

test.describe("SEO", () => {
  test("metadatos, canónica, Open Graph y datos estructurados", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Rovik/);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc!.length).toBeGreaterThan(110);
    expect(desc!.length).toBeLessThan(260);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.jpg$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    const types = ld["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["ProfessionalService", "WebSite", "FAQPage"]));
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("robots.txt y sitemap.xml publicados", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/privacidad/");
  });

  test("todas las imágenes de contenido tienen texto alternativo", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const missing = await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src));
    expect(missing).toEqual([]);
  });

  test("anclas internas apuntan a secciones que existen", async ({ page }) => {
    await page.goto("/");
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
        .map((a) => new URL(a.href))
        .filter((u) => u.origin === location.origin && u.hash)
        .map((u) => u.hash.slice(1))
        .filter((id) => !document.getElementById(id))
    );
    expect(broken).toEqual([]);
  });

  test("página 404 propia", async ({ page }) => {
    const res = await page.goto("/no-existe/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Fuera de rumbo." })).toBeVisible();
  });
});
