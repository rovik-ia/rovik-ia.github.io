#!/usr/bin/env node
/**
 * Convierte out/ en una vista previa que funciona servida desde cualquier subruta
 * (p. ej. una vista previa privada de claude.ai): rutas relativas y base de fragmentos
 * calculada en el navegador. No se usa para producción.
 *
 *   node scripts/preview/build-preview.mjs <destino>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(root, "out");
const out = path.resolve(process.argv[2] ?? path.join(root, "preview"));
const dest = path.join(out, "site");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
for (const f of ["_headers", "CNAME", ".nojekyll", "404.html", "404", "_not-found", "robots.txt", "sitemap.xml", ".well-known"]) {
  fs.rmSync(path.join(dest, f), { recursive: true, force: true });
}
// Ficheros de datos RSC: no hacen falta sin navegación en cliente
for (const f of fs.readdirSync(dest, { recursive: true })) if (String(f).endsWith(".txt")) fs.rmSync(path.join(dest, String(f)));

// Polyfills para navegadores sin módulos ES (no aplican a ningún navegador actual)
const polyfills = new Set();
for (const f of fs.readdirSync(path.join(dest, "_next/static/chunks"))) {
  const file = path.join(dest, "_next/static/chunks", f);
  if (/\snoModule=""/.test(fs.readFileSync(path.join(dest, "index.html"), "utf8").match(new RegExp(`<script[^>]*${f}[^>]*>`))?.[0] ?? "")) {
    polyfills.add(f);
    fs.rmSync(file);
  }
}

const PAGES = { "index.html": 0, "aviso-legal/index.html": 1, "privacidad/index.html": 1, "cookies/index.html": 1 };
const LEGAL = ["aviso-legal", "privacidad", "cookies"];

for (const [rel, depth] of Object.entries(PAGES)) {
  const file = path.join(dest, rel);
  const up = depth ? "../".repeat(depth) : "./";
  const home = depth ? `${up}index.html` : "";
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<script[^>]*\snoModule=""[^>]*><\/script>/g, "");
  // La CSP de producción va ligada a las huellas; en la vista previa manda la del anfitrión
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/gi, "");
  // Enlaces internos
  html = html.replace(/href="\/#([^"]*)"/g, (_, h) => `href="${home}#${h}"`);
  html = html.replace(/href="\/"/g, `href="${home || "#inicio"}"`);
  for (const l of LEGAL) html = html.split(`href="/${l}/"`).join(`href="${up}${l}/index.html"`);
  // Recursos y fragmentos: de raíz absoluta a relativa
  html = html.replace(/(["'(\s,])\/(_next|img)\//g, `$1${up}$2/`);
  html = html.replace(/\\"\/(_next|img)\//g, `\\"${up}$1/`);
  html = html.replace(/(["'\s])\/(icon\.svg|apple-icon\.png|og\.jpg)/g, `$1${up}$2`);
  // Turbopack registra cada fragmento con el valor literal de su atributo src: la base debe tener
  // exactamente esa misma forma relativa para que registro y espera coincidan.
  const boot = `<script>self.TURBOPACK_CHUNK_BASE_PATH=${JSON.stringify(up + "_next/")};</script>`;
  html = html.replace(/<head>/, `<head>${boot}`);
  fs.writeFileSync(file, html);
}

// Página que abre la vista previa (el anfitrión envuelve este fragmento en su propio documento)
fs.writeFileSync(
  path.join(out, "portada.html"),
  `<title>Rovik Web</title>
<style>:root{color-scheme:dark}body{background:#07080a;color:#eef0f3;font:16px/1.6 system-ui,sans-serif;margin:0}
main{min-height:100vh;display:grid;place-items:center;padding-inline:16px;text-align:center}a{color:#7fe7ff}</style>
<main><p>Abriendo la vista previa de Rovik… <a id="ir" href="site/index.html">Abrir la web</a></p></main>
<script>location.replace(new URL("site/index.html", location.href).href);</script>
`
);
const n = fs.readdirSync(out, { recursive: true }).length;
console.log(`Vista previa en ${out} (${n} entradas)`);
