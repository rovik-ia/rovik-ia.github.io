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

// Portada de la vista previa (el anfitrión envuelve este fragmento en su propio documento)
fs.writeFileSync(
  path.join(out, "portada.html"),
  `<title>Rovik Web</title>
<style>
:root{color-scheme:dark;--bg:#07080a;--fg:#eef0f3;--muted:#98a0ac;--red:#c8102e;--line:#2a303a;--cyan:#7fe7ff}
body{background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;margin:0}
main{min-height:100vh;box-sizing:border-box;display:grid;place-content:center;gap:28px;padding-block:40px;padding-inline:16px;max-width:34rem;margin:0 auto}
p.k{font:500 12px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0}
h1{font-size:clamp(2rem,7vw,2.8rem);line-height:1;margin:0;letter-spacing:-.01em;text-transform:uppercase}
h1 span{color:#ff5a6a}
.opts{display:grid;gap:12px}
a.o{display:block;text-decoration:none;color:var(--fg);border:1px solid var(--line);padding:18px 20px}
a.o:hover,a.o:focus-visible{border-color:var(--cyan);outline:none}
a.o.p{background:var(--red);border-color:var(--red)}
a.o b{display:block;font:700 13px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase}
a.o small{display:block;margin-top:4px;color:#d6dae0;font-size:14px}
a.o:not(.p) small{color:var(--muted)}
</style>
<main>
  <p class="k">Vista previa privada · Rovik</p>
  <h1>Ponle <span>armadura</span> a tu empresa.</h1>
  <div class="opts">
    <a class="o p" href="site/index.html"><b>Ver la web →</b><small>Se adapta a tu pantalla: móvil en el móvil, escritorio en el ordenador.</small></a>
    <a class="o" href="escritorio.html"><b>Ver versión PC en este dispositivo</b><small>La web a 1440 px (tamaño de ordenador), escalada a tu pantalla. En el móvil, mejor en horizontal.</small></a>
  </div>
</main>
`
);

// Vista de escritorio: la web a 1440 px dentro de un marco escalado al ancho disponible
fs.writeFileSync(
  path.join(out, "escritorio.html"),
  `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Rovik · versión PC</title>
<style>
html,body{margin:0;height:100%;background:#07080a;color:#eef0f3;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
.bar{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #1d2129}
.bar p{margin:0;font:500 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#98a0ac}
.bar a{color:#7fe7ff}
.stage{position:relative;overflow:hidden}
iframe{position:absolute;left:0;top:0;width:1440px;border:0;transform-origin:0 0;background:#07080a}
</style></head>
<body>
<div class="bar" id="bar"><p>Versión PC · 1440 px · escala <span id="z"></span></p><a href="site/index.html">Ver versión adaptable</a></div>
<div class="stage" id="stage"><iframe id="f" src="site/index.html" title="Web de Rovik a tamaño de ordenador"></iframe></div>
<script>
var f=document.getElementById("f"),st=document.getElementById("stage"),bar=document.getElementById("bar"),z=document.getElementById("z");
function fit(){var s=Math.min(1,window.innerWidth/1440),avail=window.innerHeight-bar.offsetHeight,h=Math.max(400,avail/s);
f.style.transform="scale("+s+")";f.style.height=h+"px";st.style.height=avail+"px";z.textContent=Math.round(s*100)+" %";}
window.addEventListener("resize",fit);fit();
</script>
</body></html>
`
);

const n = fs.readdirSync(out, { recursive: true }).length;
console.log(`Vista previa en ${out} (${n} entradas)`);
