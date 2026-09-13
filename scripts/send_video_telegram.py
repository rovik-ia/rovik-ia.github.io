#!/usr/bin/env python3
"""Envía un vídeo por Telegram con su texto de publicación como pie.

Uso: python3 scripts/send_video_telegram.py marketing/videos/<slug>.mp4
Necesita TELEGRAM_TOKEN y TELEGRAM_CHAT_ID (entorno o .env.local).
Telegram admite hasta 50 MB por vídeo enviado desde un bot.
"""
import html, json, os, ssl, sys, urllib.error, urllib.request, uuid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()
LIMITE_PIE = 1024
LIMITE_MB = 50


def env(key):
    if os.environ.get(key):
        return os.environ[key].strip()
    p = os.path.join(ROOT, ".env.local")
    if os.path.exists(p):
        for ln in open(p, encoding="utf-8"):
            if ln.startswith(key + "="):
                return ln.split("=", 1)[1].strip()
    return None


def post_multipart(url, campos, archivo):
    frontera = uuid.uuid4().hex
    cuerpo = bytearray()
    for k, v in campos.items():
        cuerpo += (f"--{frontera}\r\nContent-Disposition: form-data; "
                   f'name="{k}"\r\n\r\n{v}\r\n').encode()
    nombre, datos = archivo
    cuerpo += (f"--{frontera}\r\nContent-Disposition: form-data; name=\"video\"; "
               f'filename="{nombre}"\r\nContent-Type: video/mp4\r\n\r\n').encode()
    cuerpo += datos + b"\r\n"
    cuerpo += f"--{frontera}--\r\n".encode()
    req = urllib.request.Request(url, data=bytes(cuerpo))
    req.add_header("Content-Type", f"multipart/form-data; boundary={frontera}")
    with urllib.request.urlopen(req, timeout=600, context=CTX) as r:
        return json.load(r)


def pie(video):
    """Texto de publicación asociado al vídeo, recortado al límite de Telegram."""
    txt = os.path.splitext(video)[0] + ".txt"
    if not os.path.exists(txt):
        return "Vídeo listo para publicar."
    bruto = open(txt, encoding="utf-8").read()
    bruto = bruto.split("\n\nCréditos de vídeo:")[0].strip()
    cuerpo = html.escape(bruto)
    cabecera = "<b>Vídeo listo para publicar</b>\nCopia este texto al subirlo:\n\n"
    disponible = LIMITE_PIE - len(cabecera) - 1
    if len(cuerpo) > disponible:
        cuerpo = cuerpo[:disponible - 1] + "…"
    return cabecera + cuerpo


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: send_video_telegram.py <ruta del mp4>")
    video = sys.argv[1]
    if not os.path.exists(video):
        sys.exit(f"No existe {video}")
    mb = os.path.getsize(video) / 1048576
    if mb > LIMITE_MB:
        sys.exit(f"El vídeo pesa {mb:.1f} MB y Telegram admite {LIMITE_MB} MB como máximo")

    token, chat = env("TELEGRAM_TOKEN"), env("TELEGRAM_CHAT_ID")
    if not (token and chat):
        print("AVISO: faltan TELEGRAM_TOKEN o TELEGRAM_CHAT_ID; no se envía el vídeo.")
        return

    campos = {"chat_id": chat, "caption": pie(video), "parse_mode": "HTML",
              "supports_streaming": "true"}
    try:
        r = post_multipart(f"https://api.telegram.org/bot{token}/sendVideo",
                           campos, (os.path.basename(video), open(video, "rb").read()))
        print(f"enviado ({mb:.1f} MB):", r.get("ok"))
    except urllib.error.HTTPError as e:
        sys.exit("ERROR Telegram: " + e.read().decode("utf-8", "replace")[:400])


if __name__ == "__main__":
    main()
