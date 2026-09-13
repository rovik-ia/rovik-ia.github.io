#!/usr/bin/env python3
"""Publica un Reel en Instagram con la API oficial de Instagram Graph.

Uso: python3 scripts/publish_instagram.py <ruta del mp4> <slug> [URL pública de respaldo]
Credenciales (entorno o .env.local): IG_USER_ID, IG_ACCESS_TOKEN

Sube el archivo directamente (upload_type=resumable). Si esa vía falla y se ha
indicado una URL pública, reintenta con el método clásico `video_url`.
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from social_common import CTX, env, instagram_caption, load_article

API = "https://graph.facebook.com/v21.0"
RUPLOAD = "https://rupload.facebook.com/ig-api-upload/v21.0"
ESPERA_MAX = 900


def pedir(url, datos=None):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(datos).encode() if datos else None)
    with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
        return json.load(r)


def detalle(e):
    try:
        return e.read().decode("utf-8", "replace")[:500]
    except Exception:
        return str(e)


def crear_contenedor(uid, token, pie, resumable, video_url=None):
    datos = {"media_type": "REELS", "caption": pie, "share_to_feed": "true", "access_token": token}
    if resumable:
        datos["upload_type"] = "resumable"
    else:
        datos["video_url"] = video_url
    return pedir(f"{API}/{uid}/media", datos)["id"]


def subir_archivo(contenedor, token, ruta):
    datos = open(ruta, "rb").read()
    req = urllib.request.Request(f"{RUPLOAD}/{contenedor}", data=datos, method="POST")
    req.add_header("Authorization", "OAuth " + token)
    req.add_header("offset", "0")
    req.add_header("file_size", str(len(datos)))
    req.add_header("Content-Type", "application/octet-stream")
    with urllib.request.urlopen(req, timeout=900, context=CTX) as r:
        return json.load(r)


def esperar(contenedor, token):
    transcurrido = 0
    while transcurrido < ESPERA_MAX:
        time.sleep(15)
        transcurrido += 15
        estado = pedir(f"{API}/{contenedor}?" + urllib.parse.urlencode(
            {"fields": "status_code,status", "access_token": token}))
        code = estado.get("status_code")
        print(f"  procesando… {code} ({transcurrido}s)")
        if code == "FINISHED":
            return True
        if code == "ERROR":
            print("  Instagram rechazó el vídeo:", estado.get("status"))
            return False
    print("  Instagram no terminó de procesar a tiempo")
    return False


def main():
    if len(sys.argv) < 3:
        sys.exit("Uso: publish_instagram.py <ruta del mp4> <slug> [URL pública]")
    ruta, slug = sys.argv[1], sys.argv[2]
    url_respaldo = sys.argv[3] if len(sys.argv) > 3 else None

    uid, token = env("IG_USER_ID"), env("IG_ACCESS_TOKEN")
    if not (uid and token):
        print("AVISO: faltan IG_USER_ID o IG_ACCESS_TOKEN; no se publica nada.")
        return
    if not os.path.exists(ruta):
        sys.exit(f"No existe {ruta}")

    pie = instagram_caption(load_article(slug))
    contenedor = None

    try:
        print("subiendo el archivo directamente a Instagram…")
        contenedor = crear_contenedor(uid, token, pie, resumable=True)
        subir_archivo(contenedor, token, ruta)
    except urllib.error.HTTPError as e:
        print("  la subida directa falló:", detalle(e))
        contenedor = None

    if contenedor is None or not esperar(contenedor, token):
        if not url_respaldo:
            sys.exit("No se pudo publicar en Instagram y no hay URL de respaldo")
        print("reintentando con la URL pública…")
        try:
            contenedor = crear_contenedor(uid, token, pie, resumable=False, video_url=url_respaldo)
        except urllib.error.HTTPError as e:
            sys.exit("ERROR de Instagram: " + detalle(e))
        if not esperar(contenedor, token):
            sys.exit("Instagram no pudo procesar el vídeo por ninguna de las dos vías")

    try:
        pub = pedir(f"{API}/{uid}/media_publish", {"creation_id": contenedor, "access_token": token})
    except urllib.error.HTTPError as e:
        sys.exit("ERROR al publicar en Instagram: " + detalle(e))
    print("publicado en Instagram, id:", pub.get("id"))


if __name__ == "__main__":
    main()
