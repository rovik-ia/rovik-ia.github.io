#!/usr/bin/env node
/**
 * Vídeo del recorrido completo de la web (fotograma a fotograma, fluido aunque no haya GPU).
 *   node scripts/qa/tour.mjs <url> <salida.mp4> [ancho] [alto]
 * Necesita ffmpeg con libx264 (FFMPEG=/ruta o `pip install imageio-ffmpeg`).
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:4173/";
const outFile = path.resolve(process.argv[3] ?? "recorrido.mp4");
const W = Number(process.argv[4] ?? 1440);
const H = Number(process.argv[5] ?? 900);
const FPS = 30;
const frames = fs.mkdtempSync(path.join(os.tmpdir(), "tour-"));

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    return execFileSync("python3", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"]).toString().trim();
  } catch {
    return "ffmpeg";
  }
}

const base = "/opt/pw-browsers";
const dir = fs.existsSync(base) && fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (dir ? path.join(base, dir, "chrome-linux/chrome") : undefined),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: W < 768, hasTouch: W < 1024 });
const page = await ctx.newPage();
// Sin GPU, la web sirve imágenes estáticas: para el vídeo se simula una GPU y se ve el 3D real
await page.addInitScript(() => {
  for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
    const o = C.prototype.getParameter;
    C.prototype.getParameter = function (p) {
      return p === 0x9246 || p === 0x1f01 ? "ANGLE (Tour GPU)" : o.call(this, p);
    };
  }
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => {
  const c = document.querySelector("#inicio canvas");
  return c && getComputedStyle(c).opacity !== "0";
}, null, { timeout: 30000 }).catch(() => {});

let n = 0;
let y = 0;
const shot = async () => {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(frames, `${String(n++).padStart(5, "0")}.jpg`), type: "jpeg", quality: 84 });
};
const scrollTo = (top) => page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), top);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const top = (sel, offset = 0) =>
  page.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY + o) : 0;
  }, [sel, offset]);

async function move(target, seconds) {
  const from = y;
  const total = Math.max(1, Math.round(seconds * FPS));
  for (let i = 1; i <= total; i++) {
    y = from + (target - from) * ease(i / total);
    await scrollTo(y);
    await shot();
  }
}
async function hold(seconds, each) {
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    if (each) await each(i);
    await shot();
  }
}

const t0 = Date.now();
// Portada: el núcleo termina de montarse
await hold(3);
// Fugas
await move(await top("#fugas"), 1.6);
await hold(1.4);
await move(await top("#fugas", 420), 1.4);
await hold(0.6);
// Protocolo: ensamblaje fase a fase
await move(await top("#protocolo"), 1.4);
await hold(0.8);
const listTop = await top("#protocolo ol");
const listEnd = listTop + (await page.evaluate(() => document.querySelector("#protocolo ol").getBoundingClientRect().height)) - H * 0.7;
await move(listTop - H * 0.25, 1.2);
await move(listEnd, 11);
await hold(1.2);
// Módulos: recorrido por las pestañas
await move(await top("#modulos", -10), 1.4);
await hold(3.2, async (i) => {
  if (i === 25) await page.getByRole("tab").nth(1).click();
  if (i === 55) await page.getByRole("tab").nth(2).click();
  if (i === 80) await page.getByRole("tab").nth(3).click();
});
// ROVIK.IA: escaneo completo
await move(await top("#rovik-ia", 150), 1.4);
await page.getByRole("button", { name: "Iniciar escaneo" }).click();
const picks = [1, 1, 0, 2, 2, 0, 0];
for (const p of picks) {
  await hold(0.9);
  await page.locator("#rovik-ia [role=group] button").nth(p).click({ timeout: 15000 });
}
await page.getByRole("heading", { name: "Informe de escaneo" }).waitFor({ timeout: 15000 });
y = await page.evaluate(() => window.scrollY);
await hold(1);
await move(await top("#rovik-ia .hud-frame", -90), 1.2);
await hold(2.5);
// Casos: galería horizontal
await move(await top("#casos"), 1.4);
const casesEnd = await page.evaluate(() => {
  const s = document.querySelector("#casos");
  return s.getBoundingClientRect().top + window.scrollY + s.getBoundingClientRect().height - window.innerHeight;
});
await move(casesEnd, 7);
await hold(0.6);
// Reglas, FAQ y contacto
await move(await top("#protocolos"), 1.4);
await hold(1.4);
await move(await top("#faq"), 1.2);
await page.locator("#faq summary").first().click();
await hold(1.4);
await move(await top("#contacto"), 1.4);
await hold(2);
await move(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight), 1.6);
await hold(1.2);
await browser.close();

console.log(`${n} fotogramas en ${Math.round((Date.now() - t0) / 1000)} s`);
execFileSync(ffmpegPath(), ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%05d.jpg"), "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-vf", `scale=${Math.min(W, 1280)}:-2`, "-movflags", "+faststart", outFile]);
fs.rmSync(frames, { recursive: true, force: true });
console.log(`Vídeo: ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB, ${(n / FPS).toFixed(1)} s)`);
