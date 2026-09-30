#!/usr/bin/env node
/**
 * Renderiza en Chromium sin pantalla las imágenes estáticas del núcleo (póster del hero,
 * fases del protocolo para movimiento reducido, módulos) y la imagen para redes sociales.
 *
 *   npm run render            -> todas
 *   npm run render -- hero    -> solo las que contienen "hero"
 *   PREVIEW=dir npm run render -> guarda PNG sin optimizar en dir (para revisar)
 */
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const cache = path.join(here, ".cache");
const outDir = path.join(root, "public/img");
fs.mkdirSync(cache, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const executablePath = process.env.CHROMIUM_PATH || findChromium();
function findChromium() {
  const base = "/opt/pw-browsers";
  if (!fs.existsSync(base)) return undefined;
  const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  const p = dir && path.join(base, dir, "chrome-linux/chrome");
  return p && fs.existsSync(p) ? p : undefined;
}

// Póster: vista frontal ligeramente girada, el objeto completo
const SHOTS = [
  { name: "core-hero", width: 1400, height: 1400, assembly: 1, time: 1.3, distance: 8.6, view: { yaw: -0.42, pitch: 0.2 }, sizes: [560, 900, 1400] },
  ...[0, 1, 2, 3, 4].map((i) => ({
    name: `core-fase-${i + 1}`,
    width: 1200,
    height: 1200,
    assembly: [0.19, 0.39, 0.59, 0.79, 1][i],
    time: 1.3,
    distance: 9.2,
    view: { yaw: -0.62 + [0.19, 0.39, 0.59, 0.79, 1][i] * 0.85, pitch: 0.3 - [0.19, 0.39, 0.59, 0.79, 1][i] * 0.14 },
    sizes: [600, 1000],
  })),
  { name: "modulo-nucleo", width: 1200, height: 1000, assembly: 1, time: 0.6, distance: 4.4, view: { yaw: -0.55, pitch: 0.32 }, only: ["core", "ring"], sizes: [640, 1200] },
  { name: "modulo-propulsion", width: 1200, height: 1000, assembly: 1, time: 0.9, distance: 5.2, view: { yaw: 0.75, pitch: 0.55, roll: 0.3 }, only: ["ring", "core"], sizes: [640, 1200] },
  { name: "modulo-copiloto", width: 1200, height: 1000, assembly: 1, time: 2.4, distance: 8.2, view: { yaw: -0.9, pitch: 0.75 }, only: ["core", "hud"], sizes: [640, 1200] },
  { name: "modulo-blindaje", width: 1200, height: 1000, assembly: 1, time: 1.1, distance: 6.2, view: { yaw: 0.62, pitch: -0.42, roll: -0.5, offsetX: -0.3, offsetY: 0.2 }, only: ["armor", "core", "ring"], sizes: [640, 1200] },
];

const filter = process.argv[2];
const preview = process.env.PREVIEW;

const bundle = path.join(cache, "bundle.js");
await build({ entryPoints: [path.join(here, "entry.ts")], bundle: true, format: "iife", outfile: bundle, target: "es2020", logLevel: "warning" });
fs.writeFileSync(path.join(cache, "index.html"), `<!doctype html><meta charset="utf-8"><body style="margin:0;background:transparent"><script src="bundle.js"></script>`);

const browser = await chromium.launch({
  executablePath,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
page.on("console", (m) => m.type() === "error" && console.error("[page]", m.text()));
page.on("pageerror", (e) => console.error("[page]", e.message));
await page.goto("file://" + path.join(cache, "index.html"));

for (const s of SHOTS) {
  if (filter && !s.name.includes(filter)) continue;
  const t0 = Date.now();
  const dataUrl = await page.evaluate((shot) => window.shot(shot), s);
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  if (preview) {
    fs.mkdirSync(preview, { recursive: true });
    const bg = await sharp(png).flatten({ background: "#07080a" }).png().toBuffer();
    fs.writeFileSync(path.join(preview, `${s.name}.png`), bg);
  } else {
    for (const w of s.sizes) {
      const img = sharp(png).resize({ width: w });
      await img.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(path.join(outDir, `${s.name}-${w}.webp`));
    }
  }
  console.log(`${s.name} ${Date.now() - t0} ms`);
}
await browser.close();
