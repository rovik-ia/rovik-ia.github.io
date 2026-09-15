#!/usr/bin/env python3
"""Endurece la web ya compilada en out/ antes de publicarla. Solo usa la biblioteca estándar.

1. Añade a cada página una Content-Security-Policy con la huella SHA-256 de cada script en línea
   de esa página. Así el navegador solo ejecuta los scripts propios y bloquea cualquier inyectado.
2. Añade una política de referer prudente.
3. Escribe out/CNAME si site.config.json apunta a un dominio propio.

GitHub Pages no permite enviar cabeceras HTTP propias, por eso la política va en una etiqueta meta.
Limitación conocida: en meta no funcionan frame-ancestors ni report-uri.
"""
import base64, glob, hashlib, json, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
SCRIPT = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>", re.S | re.I)
EJECUTABLES = {"", "text/javascript", "application/javascript", "module"}
META_CSP = re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>', re.I)
META_REF = re.compile(r'<meta name="referrer"[^>]*>', re.I)


def huellas(html):
    out = set()
    for attrs, cuerpo in SCRIPT.findall(html):
        if re.search(r"\bsrc\s*=", attrs, re.I) or not cuerpo:
            continue
        m = re.search(r"""\btype\s*=\s*["']?([^"'\s>]+)""", attrs, re.I)
        if (m.group(1).lower() if m else "") not in EJECUTABLES:
            continue
        digest = hashlib.sha256(cuerpo.encode("utf-8")).digest()
        out.add("'sha256-" + base64.b64encode(digest).decode() + "'")
    return sorted(out)


def politica(hs):
    return "; ".join([
        "default-src 'self'",
        "script-src 'self' " + " ".join(hs),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "manifest-src 'self'",
        "upgrade-insecure-requests",
    ])


def main():
    if not os.path.isdir(OUT):
        sys.exit("No existe out/: ejecuta antes npm run build")
    paginas = sorted(glob.glob(os.path.join(OUT, "**", "*.html"), recursive=True))
    total = 0
    sin_cabecera = []
    for ruta in paginas:
        html = open(ruta, encoding="utf-8").read()
        html = META_CSP.sub("", META_REF.sub("", html))
        hs = huellas(html)
        total += len(hs)
        metas = (f'<meta http-equiv="Content-Security-Policy" content="{politica(hs)}"/>'
                 '<meta name="referrer" content="strict-origin-when-cross-origin"/>')
        m = re.search(r'<meta charSet="utf-8"\s*/?>', html, re.I) or re.search(r"<head[^>]*>", html, re.I)
        if not m:
            sin_cabecera.append(os.path.relpath(ruta, OUT))
            continue
        html = html[:m.end()] + metas + html[m.end():]
        open(ruta, "w", encoding="utf-8").write(html)

    url = json.load(open(os.path.join(ROOT, "site.config.json"), encoding="utf-8"))["url"]
    host = urllib.parse.urlparse(url).netloc
    cname = os.path.join(OUT, "CNAME")
    if host and not host.endswith("github.io"):
        open(cname, "w").write(host + "\n")
        estado = f"CNAME -> {host}"
    else:
        if os.path.exists(cname):
            os.remove(cname)
        estado = "sin CNAME (dominio de GitHub)"
    if sin_cabecera:
        print("Sin cabecera HTML, se dejan intactos:", ", ".join(sin_cabecera))
    print(f"CSP aplicada a {len(paginas) - len(sin_cabecera)} páginas, {total} scripts en línea autorizados por huella · {estado}")


if __name__ == "__main__":
    main()
