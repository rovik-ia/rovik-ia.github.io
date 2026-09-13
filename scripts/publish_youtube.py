#!/usr/bin/env python3
"""Sube un vídeo a YouTube como Short mediante la API oficial de YouTube Data v3.

Uso: python3 scripts/publish_youtube.py marketing/videos/<slug>.mp4
Credenciales (entorno o .env.local):
  YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN
Opcional: YOUTUBE_PRIVACIDAD = public | unlisted | private   (por defecto public)

El token de actualización se obtiene una sola vez con scripts/youtube_oauth.py.
"""
import json, os, sys, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from social_common import CTX, env, load_article, youtube_meta

TOKEN_URL = "https://oauth2.googleapis.com/token"
UPLOAD_URL = ("https://www.googleapis.com/upload/youtube/v3/videos"
              "?uploadType=resumable&part=snippet,status")


def access_token():
    datos = urllib.parse.urlencode({
        "client_id": env("YOUTUBE_CLIENT_ID"),
        "client_secret": env("YOUTUBE_CLIENT_SECRET"),
        "refresh_token": env("YOUTUBE_REFRESH_TOKEN"),
        "grant_type": "refresh_token",
    }).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(TOKEN_URL, data=datos),
                                    timeout=60, context=CTX) as r:
            return json.load(r)["access_token"]
    except urllib.error.HTTPError as e:
        sys.exit("ERROR al renovar el token de YouTube: " + e.read().decode("utf-8", "replace")[:400])


def subir(video, titulo, descripcion, etiquetas, privacidad):
    token = access_token()
    cuerpo = json.dumps({
        "snippet": {"title": titulo, "description": descripcion, "tags": etiquetas,
                    "categoryId": "26", "defaultLanguage": "es", "defaultAudioLanguage": "es"},
        "status": {"privacyStatus": privacidad, "selfDeclaredMadeForKids": False,
                   "madeForKids": False},
    }).encode()
    tam = os.path.getsize(video)

    req = urllib.request.Request(UPLOAD_URL, data=cuerpo)
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("Content-Type", "application/json; charset=UTF-8")
    req.add_header("X-Upload-Content-Length", str(tam))
    req.add_header("X-Upload-Content-Type", "video/mp4")
    try:
        with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
            destino = r.headers["Location"]
    except urllib.error.HTTPError as e:
        sys.exit("ERROR al iniciar la subida: " + e.read().decode("utf-8", "replace")[:600])

    put = urllib.request.Request(destino, data=open(video, "rb").read(), method="PUT")
    put.add_header("Content-Type", "video/mp4")
    put.add_header("Content-Length", str(tam))
    try:
        with urllib.request.urlopen(put, timeout=900, context=CTX) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit("ERROR al subir el vídeo: " + e.read().decode("utf-8", "replace")[:600])


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: publish_youtube.py <ruta del mp4>")
    video = sys.argv[1]
    if not os.path.exists(video):
        sys.exit(f"No existe {video}")
    if not all(env(k) for k in ("YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN")):
        print("AVISO: faltan credenciales de YouTube; no se publica nada.")
        return

    slug = os.path.splitext(os.path.basename(video))[0]
    titulo, descripcion, etiquetas = youtube_meta(load_article(slug))
    privacidad = env("YOUTUBE_PRIVACIDAD") or "public"
    print(f"subiendo a YouTube ({privacidad}): {titulo}")
    r = subir(video, titulo, descripcion, etiquetas, privacidad)
    vid = r.get("id")
    print(f"publicado: https://www.youtube.com/shorts/{vid}")
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"youtube_url=https://www.youtube.com/shorts/{vid}\n")


if __name__ == "__main__":
    main()
