#!/usr/bin/env python3
"""Obtiene UNA SOLA VEZ el token de actualización de YouTube (hay que ejecutarlo en el Mac).

Uso: python3 scripts/youtube_oauth.py <CLIENT_ID> <CLIENT_SECRET>

Abre el navegador, pide permiso con tu cuenta de Google y muestra el token de
actualización, que es el que hay que guardar como secreto YOUTUBE_REFRESH_TOKEN.
El token no se envía a ningún sitio: se imprime en tu terminal.
"""
import http.server, json, socket, ssl, sys, threading, urllib.parse, urllib.request, webbrowser

SCOPE = ("https://www.googleapis.com/auth/youtube.upload "
         "https://www.googleapis.com/auth/youtube.readonly")
try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

codigo = {}


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        codigo.update({k: v[0] for k, v in q.items()})
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        ok = "code" in codigo
        self.wfile.write(("<h2>%s</h2><p>Ya puedes cerrar esta pestaña y volver a la terminal.</p>"
                          % ("Permiso concedido" if ok else "No se concedió el permiso")).encode())

    def log_message(self, *a):
        pass


def puerto_libre():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def main():
    if len(sys.argv) < 3:
        sys.exit("Uso: youtube_oauth.py <CLIENT_ID> <CLIENT_SECRET>")
    cid, secreto = sys.argv[1].strip(), sys.argv[2].strip()

    puerto = puerto_libre()
    redirect = f"http://localhost:{puerto}"
    srv = http.server.HTTPServer(("127.0.0.1", puerto), Handler)
    threading.Thread(target=srv.handle_request, daemon=True).start()

    auth = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": cid, "redirect_uri": redirect, "response_type": "code",
        "scope": SCOPE, "access_type": "offline", "prompt": "consent",
    })
    print("Abriendo el navegador para dar permiso…")
    print("Si no se abre solo, copia esta dirección:\n" + auth + "\n")
    webbrowser.open(auth)

    for _ in range(120):
        if codigo:
            break
        __import__("time").sleep(1)
    if "code" not in codigo:
        sys.exit("No se recibió el permiso: " + json.dumps(codigo))

    datos = urllib.parse.urlencode({
        "code": codigo["code"], "client_id": cid, "client_secret": secreto,
        "redirect_uri": redirect, "grant_type": "authorization_code",
    }).encode()
    with urllib.request.urlopen(
            urllib.request.Request("https://oauth2.googleapis.com/token", data=datos),
            timeout=60, context=CTX) as r:
        tok = json.load(r)

    try:
        req = urllib.request.Request(
            "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
            headers={"Authorization": "Bearer " + tok["access_token"]})
        with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
            canales = json.load(r).get("items", [])
        for c in canales:
            print(f"\nCanal autorizado: {c['snippet']['title']} ({c['snippet'].get('customUrl', '')}) · id {c['id']}")
        if not canales:
            print("\nAVISO: esta cuenta no tiene canal de YouTube. Crea el canal y repite.")
    except Exception as e:
        print("\nNo se pudo leer el canal autorizado:", e)

    if "refresh_token" not in tok:
        sys.exit("Google no devolvió token de actualización. Revoca el acceso de la app en "
                 "https://myaccount.google.com/permissions y vuelve a intentarlo.")
    print("\n=== GUARDA ESTO COMO SECRETO YOUTUBE_REFRESH_TOKEN ===")
    print(tok["refresh_token"])
    print("======================================================")


if __name__ == "__main__":
    main()
