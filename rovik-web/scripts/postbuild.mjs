#!/usr/bin/env node
/**
 * Endurece la web exportada en out/ antes de publicarla. Sin dependencias.
 *
 * 1. Content-Security-Policy por página con la huella SHA-256 de cada script en línea:
 *    el navegador solo ejecuta los scripts propios y bloquea cualquier inyección.
 * 2. Política de referer prudente.
 * 3. Cabeceras HTTP para plataformas que las admiten (out/_headers) y .nojekyll.
 * 4. CNAME si site.config.json apunta a un dominio propio.
 *
 * GitHub Pages no admite cabeceras propias, por eso la CSP va además en <meta>.
 * Limitación conocida de <meta>: no admite frame-ancestors ni report-uri (van en _headers/vercel.json).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECURITY_HEADERS } from "./security-headers.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");
if (!fs.existsSync(out)) {
  console.error("No existe out/: ejecuta antes next build");
  process.exit(1);
}

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const EXECUTABLE = new Set(["", "text/javascript", "application/javascript", "module"]);

function hashes(html) {
  const set = new Set();
  for (const [, attrs, body] of html.matchAll(SCRIPT)) {
    if (/\bsrc\s*=/i.test(attrs) || !body) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? "").toLowerCase();
    if (!EXECUTABLE.has(type)) continue;
    set.add(`'sha256-${crypto.createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  return [...set].sort();
}

function policy(h) {
  return [
    "default-src 'self'",
    `script-src 'self' ${h.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : d.name.endsWith(".html") ? [p] : [];
  });
}

let pages = 0;
let total = 0;
for (const file of walk(out)) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/gi, "").replace(/<meta name="referrer"[^>]*>/gi, "");
  const h = hashes(html);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(h)}"/><meta name="referrer" content="strict-origin-when-cross-origin"/>`;
  const anchor = html.match(/<meta charSet="utf-8"\s*\/?>/i) ?? html.match(/<head[^>]*>/i);
  if (!anchor) {
    console.warn("Sin <head>:", path.relative(out, file));
    continue;
  }
  const at = anchor.index + anchor[0].length;
  html = html.slice(0, at) + meta + html.slice(at);
  fs.writeFileSync(file, html);
  pages += 1;
  total += h.length;
}

// Cabeceras para Netlify / Cloudflare Pages
const headerLines = ["/*", ...Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`), "", "/_next/static/*", "  Cache-Control: public, max-age=31536000, immutable", "", "/img/*", "  Cache-Control: public, max-age=2592000", ""];
fs.writeFileSync(path.join(out, "_headers"), headerLines.join("\n"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");

const config = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));

// security.txt (RFC 9116) con la URL canónica de la configuración
const siteUrl = config.url.replace(/\/$/, "");
const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
fs.mkdirSync(path.join(out, ".well-known"), { recursive: true });
fs.writeFileSync(
  path.join(out, ".well-known/security.txt"),
  [`Contact: mailto:${config.email}`, `Expires: ${expires}`, "Preferred-Languages: es, en", `Canonical: ${siteUrl}/.well-known/security.txt`, ""].join("\n")
);
const host = new URL(config.url).host;
const cname = path.join(out, "CNAME");
let state = "sin CNAME (dominio de GitHub)";
if (host && !host.endsWith("github.io") && !process.env.BASE_PATH) {
  fs.writeFileSync(cname, host + "\n");
  state = `CNAME -> ${host}`;
} else if (fs.existsSync(cname)) fs.rmSync(cname);

console.log(`CSP aplicada a ${pages} páginas, ${total} scripts en línea autorizados por huella · ${state}`);
