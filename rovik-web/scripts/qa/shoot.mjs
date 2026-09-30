#!/usr/bin/env node
// Capturas de revisión: node scripts/qa/shoot.mjs <url> <outdir> [anchor1,anchor2...] [widths]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3100/";
const out = process.argv[3] ?? "shots";
const anchors = (process.argv[4] ?? "top").split(",");
const widths = (process.argv[5] ?? "390,1440").split(",").map(Number);
const HEIGHTS = { 375: 667, 390: 844, 768: 1024, 1024: 768, 1280: 800, 1440: 900 };
fs.mkdirSync(out, { recursive: true });

const base = "/opt/pw-browsers";
const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
const browser = await chromium.launch({
  executablePath: path.join(base, dir, "chrome-linux/chrome"),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHTS[w] ?? 900 }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 768 });
  const page = await ctx.newPage();
  // Chromium sin GPU renderiza WebGL por software y la web muestra imágenes: se simula GPU para revisar el 3D
  if (!process.env.NO_FAKE_GPU) await page.addInitScript(() => {
    for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const o = C.prototype.getParameter;
      C.prototype.getParameter = function (p) { return p === 0x9246 || p === 0x1f01 ? "ANGLE (Test GPU)" : o.call(this, p); };
    }
  });
  const errors = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  for (const a of anchors) {
    if (a === "top") await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    else if (a.startsWith("y=")) await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Number(a.slice(2)));
    else if (a.startsWith("pct=")) await page.evaluate((p) => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * p, behavior: "instant" }), Number(a.slice(4)) / 100);
    else if (a === "full") {
      await page.screenshot({ path: path.join(out, `${w}-full.png`), fullPage: true });
      continue;
    } else {
      const [id, off] = a.split("+");
      await page.evaluate(([sel, o]) => { const el = document.getElementById(sel); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + Number(o || 0), behavior: "instant" }); }, [id, off]);
    }
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(out, `${w}-${a.replace(/[^a-z0-9=+-]/gi, "_")}.png`) });
  }
  const overflow = await page.evaluate((vw) => Math.max(window.innerWidth, document.documentElement.scrollWidth) - vw, w);
  console.log(`${w}px overflowX=${overflow} errors=${errors.length}`);
  errors.slice(0, 8).forEach((e) => console.log("  ", e.slice(0, 300)));
  await ctx.close();
}
await browser.close();
