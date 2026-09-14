#!/usr/bin/env python3
"""Utilidades compartidas por los publicadores de redes sociales."""
import json, os, re, ssl, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "marketing", "data", "articles.json")
SITE = json.load(open(os.path.join(ROOT, "site.config.json"), encoding="utf-8"))["url"].rstrip("/")
DISCLOSURE = ("En calidad de Afiliado de Amazon, obtengo ingresos por las compras "
              "adscritas que cumplen los requisitos aplicables.")
CATS = {"hogar": "Hogar", "cocina": "Cocina", "bienestar": "Bienestar", "tecnologia": "Tecnología"}

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()


def env(key):
    """Variable de entorno o, en local, valor de .env.local (nunca se sube al repo)."""
    if os.environ.get(key):
        return os.environ[key].strip()
    p = os.path.join(ROOT, ".env.local")
    if os.path.exists(p):
        for ln in open(p, encoding="utf-8"):
            if ln.startswith(key + "="):
                return ln.split("=", 1)[1].strip()
    return None


def load_article(slug):
    for a in json.load(open(DATA, encoding="utf-8")):
        if a["slug"] == slug:
            return a
    raise SystemExit(f"No encuentro la guía {slug} en {DATA}")


def guide_url(slug, source):
    """URL de la guía con parámetros de campaña, para saber qué red trae visitas."""
    return f"{SITE}/guias/{slug}/?utm_source={source}&utm_medium=social&utm_campaign={slug}"


def topic(a):
    t = re.sub(r"^(las|los)\s+mejores\s+", "", a["title"].lower())
    t = re.split(r"\s+(de\s+2026|en\s+2026|2026|:|para\s+la|para\s+el|para\s+este|por\s+tama|calidad|sin\s+)", t)[0]
    return t.strip(" ,")


def hashtags(a, extra=()):
    base = [CATS.get(a["category"], "hogar").lower(), "guiadecompra", "amazon",
            "comprasinteligentes", "ofertas", re.sub(r"[^a-záéíóúñ]", "", topic(a).split()[0])]
    return " ".join("#" + h for h in dict.fromkeys(list(base) + list(extra)) if h)


def lista_productos(a, n=5):
    return "\n".join(f"{i}. {p['name']}" for i, p in enumerate(a["products"][:n], 1))


def youtube_meta(a):
    """Título (máx. 100), descripción y etiquetas para YouTube Shorts."""
    titulo = a["title"]
    if len(titulo) > 95:
        titulo = titulo[:94].rsplit(" ", 1)[0] + "…"
    url = guide_url(a["slug"], "youtube")
    desc = (f"{a['description']}\n\n"
            f"Los 5 modelos del vídeo:\n{lista_productos(a)}\n\n"
            f"👉 Guía completa, criterios de elección y enlaces a Amazon:\n{url}\n\n"
            f"{DISCLOSURE}\n"
            f"Imágenes y vídeos de Pexels.\n\n{hashtags(a, ['shorts'])}")
    etiquetas = [topic(a), f"mejores {topic(a)}", f"{topic(a)} 2026",
                 "guía de compra", "comparativa", CATS.get(a["category"], "hogar")]
    return titulo, desc[:4900], etiquetas


def instagram_caption(a):
    """Pie para Reels (máx. 2200). En Instagram los enlaces del pie no son pulsables."""
    url = f"{SITE}/guias/{a['slug']}/"
    texto = (f"¿Qué {topic(a)} comprar en 2026? Estos son los 5 que merecen la pena:\n\n"
             f"{lista_productos(a)}\n\n"
             f"🔗 Guía completa con los criterios de elección y los enlaces en el perfil.\n"
             f"{url}\n\n"
             f"{DISCLOSURE}\n\n{hashtags(a)}")
    return texto[:2190]
