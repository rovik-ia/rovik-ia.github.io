#!/usr/bin/env python3
"""Envía el resumen del informe diario a WhatsApp.

Proveedores admitidos (se elige el primero configurado):
  1. CallMeBot  -> CALLMEBOT_APIKEY + WHATSAPP_PHONE        (gratuito, uso personal)
  2. Twilio     -> TWILIO_SID + TWILIO_TOKEN + TWILIO_FROM + WHATSAPP_PHONE

Uso:
  python3 scripts/notify_whatsapp.py [--dry-run] [--report reports/AAAA-MM-DD.md]

Las credenciales se leen de variables de entorno y, en local, de .env.local
(ese archivo está ignorado por git y nunca se sube al repositorio).
"""
import argparse, base64, glob, os, re, sys, urllib.parse, urllib.request, ssl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

MAX_LEN = 900  # margen de sobra para la URL de CallMeBot


def env(key: str) -> str | None:
    """Variable de entorno o, si no existe, valor de .env.local."""
    if os.environ.get(key):
        return os.environ[key].strip()
    path = os.path.join(ROOT, ".env.local")
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip()
    return None


def latest_report(explicit: str | None) -> str:
    if explicit:
        return explicit
    files = sorted(glob.glob(os.path.join(ROOT, "reports", "20*.md")))
    if not files:
        sys.exit("No hay informes en reports/")
    return files[-1]


def section(md: str, title: str) -> str:
    """Devuelve el cuerpo de una sección '## title' hasta el siguiente '##'."""
    m = re.search(rf"^##\s+{re.escape(title)}\s*$(.*?)(?=^##\s|\Z)", md, re.M | re.S)
    return m.group(1).strip() if m else ""


def parse(path: str) -> dict:
    md = open(path, encoding="utf-8").read()
    date = os.path.basename(path)[:10]

    guide = section(md, "Guía publicada")
    title = ""
    m = re.search(r"\*\*T[íi]tulo:\*\*\s*(.+)", guide)
    if m:
        title = m.group(1).strip()
    else:  # formatos alternativos: primera línea en negrita de la sección
        m = re.search(r"\*\*(.+?)\*\*", guide, re.S)
        if m:
            title = " ".join(m.group(1).split())
    title = title.strip(" *")

    m = re.search(r"https://rovik-ia\.github\.io/guias/[\w\-/]+", md)
    url = m.group(0) if m else "https://rovik-ia.github.io/"

    m = re.search(r"(\d+)\s+gu[íi]as", section(md, "Total de guías publicadas") or md)
    total = m.group(1) if m else "?"

    sales = " ".join(section(md, "Ventas").split())
    if sales.startswith("Sin datos de ventas"):
        sales = "Sin datos de ventas todavía."
    sales = sales[:220]

    tips = re.findall(r"^\d+\.\s*\*\*(.+?)\*\*", section(md, "Sugerencias para mañana"), re.M)

    return {"date": date, "title": title, "url": url, "total": total, "sales": sales, "tips": tips}


def build_message(d: dict) -> str:
    day, month, year = d["date"][8:10], d["date"][5:7], d["date"][:4]
    lines = [
        f"*Tendencia Top* · {day}/{month}/{year}",
        "",
        f"📄 Guía de hoy: {d['title']}" if d["title"] else "📄 Guía de hoy publicada",
        d["url"],
        "",
        f"📚 Total publicado: {d['total']} guías",
        f"💶 Ventas: {d['sales']}",
    ]
    if d["tips"]:
        lines += ["", "🔜 Mañana: " + ", ".join(d["tips"][:2])]
    msg = "\n".join(lines)
    return msg if len(msg) <= MAX_LEN else msg[: MAX_LEN - 1] + "…"


def send_callmebot(phone: str, key: str, msg: str) -> str:
    url = "https://api.callmebot.com/whatsapp.php?" + urllib.parse.urlencode(
        {"phone": phone, "text": msg, "apikey": key}
    )
    with urllib.request.urlopen(url, timeout=60, context=CTX) as r:
        return r.read().decode("utf-8", "replace")[:300]


def send_twilio(sid: str, token: str, frm: str, phone: str, msg: str) -> str:
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = urllib.parse.urlencode(
        {"From": f"whatsapp:{frm}", "To": f"whatsapp:{phone}", "Body": msg}
    ).encode()
    req = urllib.request.Request(url, data=data)
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
    req.add_header("Authorization", "Basic " + auth)
    with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
        return r.read().decode("utf-8", "replace")[:300]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="solo muestra el mensaje")
    ap.add_argument("--report", help="ruta de un informe concreto")
    args = ap.parse_args()

    path = latest_report(args.report)
    msg = build_message(parse(path))
    print(f"--- informe: {os.path.relpath(path, ROOT)}\n{msg}\n---")

    if args.dry_run:
        return

    phone = env("WHATSAPP_PHONE")
    if not phone:
        print("AVISO: falta WHATSAPP_PHONE; no se envía nada.")
        return
    if not phone.startswith("+"):
        phone = "+" + phone.lstrip("00").lstrip()

    cmb = env("CALLMEBOT_APIKEY")
    sid, token, frm = env("TWILIO_SID"), env("TWILIO_TOKEN"), env("TWILIO_FROM")
    if cmb:
        print("enviando por CallMeBot…")
        print(send_callmebot(phone, cmb, msg))
    elif sid and token and frm:
        print("enviando por Twilio…")
        print(send_twilio(sid, token, frm, phone, msg))
    else:
        print("AVISO: no hay proveedor configurado (CALLMEBOT_APIKEY o TWILIO_*); no se envía nada.")


if __name__ == "__main__":
    main()
