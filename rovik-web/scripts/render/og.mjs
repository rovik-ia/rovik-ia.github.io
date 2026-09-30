#!/usr/bin/env node
// Imagen para redes sociales (1200x630) a partir del render del núcleo: node scripts/render/og.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const font = (f) => fs.readFileSync(path.join(root, "scripts/render/fonts", f)).toString("base64");
const core = fs.readFileSync(path.join(root, "public/img/core-hero-900.webp")).toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font("archivo-latin.woff2")}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:"JetBrains Mono";src:url(data:font/woff2;base64,${font("jetbrains-mono-latin.woff2")}) format("woff2");font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#07080a;color:#eef0f3;font-family:Archivo,sans-serif;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.035) 1px,transparent 1px);background-size:48px 48px}
.glow{position:absolute;inset:0;background:radial-gradient(40% 60% at 78% 52%,rgba(200,16,46,.22),transparent 70%)}
.core{position:absolute;right:-40px;top:50%;width:640px;height:640px;transform:translateY(-50%)}
.txt{position:absolute;left:64px;top:64px;bottom:64px;width:640px;display:flex;flex-direction:column}
.label{font-family:"JetBrains Mono",monospace;font-size:17px;letter-spacing:.16em;text-transform:uppercase;color:#98a0ac;display:flex;gap:14px;align-items:center}
.label i{width:9px;height:9px;background:#c8102e;display:block}
h1{margin-top:34px;font-stretch:125%;font-weight:800;text-transform:uppercase;font-size:78px;line-height:.9;letter-spacing:-.01em}
h1 span{color:#e0223f;display:block}
.brand{margin-top:auto;display:flex;align-items:center;gap:14px;font-stretch:125%;font-weight:800;font-size:30px;letter-spacing:.06em;text-transform:uppercase}
.brand small{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:15px;letter-spacing:.14em;color:#7fe7ff;margin-left:18px}
</style></head><body>
<div class="grid"></div><div class="glow"></div>
<img class="core" src="data:image/webp;base64,${core}">
<div class="txt">
  <p class="label"><i></i>Consultoría · Marketing · IA</p>
  <h1>Ponle<span>armadura</span>a tu empresa.</h1>
  <div class="brand"><svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#c8102e" stroke-width="2.5" stroke-dasharray="38 6" transform="rotate(-62 16 16)"/><circle cx="16" cy="16" r="8.5" stroke="#e3ac45" stroke-width="1.6"/><path d="M16 11.2l4.16 2.4v4.8L16 20.8l-4.16-2.4v-4.8z" fill="#7fe7ff"/></svg>Rovik<small>Sistema de escalado empresarial</small></div>
</div>
</body></html>`;

const base = "/opt/pw-browsers";
const dir = fs.existsSync(base) && fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (dir ? path.join(base, dir, "chrome-linux/chrome") : undefined) });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
if (!fonts.some((f) => f.includes("Archivo"))) throw new Error("No se cargó Archivo: revisa scripts/render/fonts");
const png = await page.screenshot();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, "public/og.jpg"));
await browser.close();
console.log("public/og.jpg");
