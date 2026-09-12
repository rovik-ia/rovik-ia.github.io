#!/usr/bin/env python3
"""Descarga una fotografía de Pexels por guía (y una para la portada) a public/img y guarda los créditos."""
import json, os, io, ssl, urllib.request, urllib.parse
from PIL import Image
try:
    import certifi; CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()
urllib.request.install_opener(urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX)))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = next((l.split("=",1)[1].strip() for l in open(os.path.join(ROOT, ".env.local")) if l.startswith("PEXELS_API_KEY=")), None)
UA = "Mozilla/5.0 TendenciaTop/1.0"
QUERIES = {
  "_hero": "modern bright living room interior",
  "mejores-freidoras-de-aire": "air fryer kitchen",
  "mejores-robots-aspiradores-calidad-precio": "robot vacuum cleaner floor",
  "mejores-calefactores-bajo-consumo": "cozy home winter blanket window",
  "mejores-pistolas-de-masaje": "massage gun athlete",
  "mejores-smartwatch-calidad-precio": "smartwatch wrist running",
  "mejores-deshumidificadores": "window condensation rain home",
  "mejores-mantas-electricas": "cozy blanket sofa reading",
  "mejores-auriculares-inalambricos-menos-100-euros": "wireless earbuds close up",
  "mejores-purificadores-de-aire": "air purifier living room plants",
  "mejores-cepillos-de-dientes-electricos": "electric toothbrush bathroom",
  "mejores-sillas-de-escritorio-ergonomicas": "ergonomic office chair home office",
}
credits = {}
for slug, q in QUERIES.items():
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 5})
    data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"Authorization": KEY, "User-Agent": UA}), timeout=30))
    photos = data.get("photos", [])
    if not photos: print("sin fotos:", slug); continue
    ph = photos[0]
    raw = urllib.request.urlopen(urllib.request.Request(ph["src"]["large2x"], headers={"User-Agent": UA}), timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im.thumbnail((1600, 1600))
    # recorte 16:9
    w, h = im.size; th = int(w * 9 / 16)
    if h > th: im = im.crop((0, (h - th)//2, w, (h - th)//2 + th))
    out = os.path.join(ROOT, "public", "img", "guias" if slug != "_hero" else "", f"{slug}.jpg").replace("//", "/")
    im.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    credits[slug] = {"photographer": ph["photographer"], "url": ph["url"], "photographer_url": ph["photographer_url"]}
    print(f"{slug}: {os.path.getsize(out)//1024} KB · {ph['photographer']}")
json.dump(credits, open(os.path.join(ROOT, "lib", "photoCredits.json"), "w"), ensure_ascii=False, indent=2)
