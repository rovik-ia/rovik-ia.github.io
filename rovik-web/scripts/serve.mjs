#!/usr/bin/env node
// Servidor estático mínimo para probar out/ tal como se publica.
//   node scripts/serve.mjs [puerto] [subruta]   p. ej.: node scripts/serve.mjs 4173 /rovik-web
// Con HEADERS=1 añade las cabeceras de seguridad (simula Vercel/Netlify).
import http from "node:http";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECURITY_HEADERS } from "./security-headers.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
const port = Number(process.argv[2] ?? 4173);
const base = (process.argv[3] ?? "").replace(/\/$/, "");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".ico": "image/x-icon" };

http
  .createServer((req, res) => {
    let url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (base) {
      if (!url.startsWith(base)) return send(404);
      url = url.slice(base.length) || "/";
    }
    let file = path.normalize(path.join(root, url));
    if (!file.startsWith(root)) return send(403);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) return send(404, path.join(root, "404.html"));
    return send(200, file);

    function send(code, f) {
      const headers = { "Content-Type": TYPES[path.extname(f ?? "")] ?? "application/octet-stream" };
      if (process.env.HEADERS) Object.assign(headers, SECURITY_HEADERS);
      const compressible = /text|javascript|json|xml|svg/.test(headers["Content-Type"]);
      // Como GitHub Pages o Vercel: compresión para texto si el navegador la acepta
      if (f && fs.existsSync(f) && compressible && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
        res.writeHead(code, { ...headers, "Content-Encoding": "gzip", Vary: "Accept-Encoding" });
        fs.createReadStream(f).pipe(zlib.createGzip()).pipe(res);
        return;
      }
      res.writeHead(code, headers);
      if (f && fs.existsSync(f)) fs.createReadStream(f).pipe(res);
      else res.end(String(code));
    }
  })
  .listen(port, () => console.log(`out/ en http://localhost:${port}${base}/`));
