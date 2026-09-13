#!/usr/bin/env python3
"""Publica un Reel en Instagram mediante la API oficial de Instagram Graph.

Uso: python3 scripts/publish_instagram.py <URL pública del mp4> <slug>
Credenciales (entorno o .env.local): IG_USER_ID, IG_ACCESS_TOKEN

Instagram descarga el vídeo desde la URL, así que tiene que ser pública.
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from social_common import CTX, env, instagram_caption, load_article

API = "https://graph.facebook.com/v21.0"
ESPERA_MAX = 600   # Instagram tarda en procesar el vídeo


def pedir(url, datos=None):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(datos).encode() if datos else None)
    try:
        with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", "replace")[:600]
        sys.exit(f"ERROR de Instagram: {detalle}")


def main():
    if len(sys.argv) < 3:
        sys.exit("Uso: publish_instagram.py <URL del mp4> <slug>")
    video_url, slug = sys.argv[1], sys.argv[2]

    uid, token = env("IG_USER_ID"), env("IG_ACCESS_TOKEN")
    if not (uid and token):
        print("AVISO: faltan IG_USER_ID o IG_ACCESS_TOKEN; no se publica nada.")
        return

    pie = instagram_caption(load_article(slug))
    print("creando el contenedor del Reel…")
    r = pedir(f"{API}/{uid}/media", {"media_type": "REELS", "video_url": video_url,
                                     "caption": pie, "share_to_feed": "true",
                                     "access_token": token})
    creacion = r["id"]

    esperado = 0
    while esperado < ESPERA_MAX:
        time.sleep(15)
        esperado += 15
        estado = pedir(f"{API}/{creacion}?" + urllib.parse.urlencode(
            {"fields": "status_code,status", "access_token": token}))
        code = estado.get("status_code")
        print(f"  procesando… {code} ({esperado}s)")
        if code == "FINISHED":
            break
        if code == "ERROR":
            sys.exit(f"Instagram no pudo procesar el vídeo: {estado.get('status')}")
    else:
        sys.exit("Instagram no terminó de procesar el vídeo a tiempo")

    print("publicando…")
    pub = pedir(f"{API}/{uid}/media_publish", {"creation_id": creacion, "access_token": token})
    print("publicado, id:", pub.get("id"))
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"instagram_id={pub.get('id')}\n")


if __name__ == "__main__":
    main()
