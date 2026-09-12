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
KEY = os.environ.get("PEXELS_API_KEY")
if not KEY and os.path.exists(os.path.join(ROOT, ".env.local")):
    KEY = next((l.split("=",1)[1].strip() for l in open(os.path.join(ROOT, ".env.local")) if l.startswith("PEXELS_API_KEY=")), None)
if not KEY: raise SystemExit("Falta PEXELS_API_KEY")
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
import sys
credits_path = os.path.join(ROOT, "lib", "photoCredits.json")
credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}
GENERIC = {"hogar": "modern home interior", "cocina": "modern kitchen", "bienestar": "healthy lifestyle wellness", "tecnologia": "modern technology gadgets"}
targets = dict(QUERIES)
arts_path = os.path.join(ROOT, "marketing", "data", "articles.json")
if os.path.exists(arts_path):
    for a in json.load(open(arts_path)):
        targets.setdefault(a["slug"], a.get("photoQuery") or GENERIC.get(a["category"], "modern home"))
only_missing = "--missing" in sys.argv
for slug, q in targets.items():
    dest = os.path.join(ROOT, "public", "img", "guias" if slug != "_hero" else "", f"{slug}.jpg").replace("//", "/")
    if only_missing and os.path.exists(dest): continue
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
    small = im.copy(); small.thumbnail((800, 800)); small.save(out[:-4] + "-800.jpg", "JPEG", quality=76, optimize=True, progressive=True)
    credits[slug] = {"photographer": ph["photographer"], "url": ph["url"], "photographer_url": ph["photographer_url"]}
    print(f"{slug}: {os.path.getsize(out)//1024} KB · {ph['photographer']}")

# --- Imágenes ilustrativas por producto ---
PRODUCT_QUERIES = {
  "mejores-sillas-de-escritorio-ergonomicas": ["ergonomic office chair", "office chair home office desk", "mesh office chair", "office chair back support", "small office chair desk"],
  "mejores-calefactores-bajo-consumo": ["ceramic fan heater", "oil radiator heater", "wall panel heater", "small electric heater", "electric heater living room"],
  "mejores-pistolas-de-masaje": ["massage gun", "massage gun leg athlete", "percussion massager back", "mini massage gun", "massage gun shoulder"],
  "mejores-freidoras-de-aire": ["air fryer", "air fryer basket food", "air fryer small kitchen", "air fryer family meal", "kitchen counter appliance glass"],
  "mejores-robots-aspiradores-calidad-precio": ["robot vacuum", "robot vacuum wood floor", "robot vacuum mop", "robot vacuum dock", "robot vacuum carpet"],
  "mejores-smartwatch-calidad-precio": ["smartwatch wrist", "smartwatch running", "smartwatch health heart rate", "apple watch wrist", "fitness tracker wrist"],
  "mejores-deshumidificadores": ["dehumidifier", "dehumidifier living room", "dehumidifier bedroom", "laundry drying indoor", "portable dehumidifier home"],
  "mejores-mantas-electricas": ["electric blanket bed", "heated blanket sofa", "cozy blanket couch", "heating pad back", "couple bed blanket"],
  "mejores-auriculares-inalambricos-menos-100-euros": ["wireless earbuds", "earbuds charging case", "earbuds white close up", "earbuds music commute", "black earbuds"],
  "mejores-purificadores-de-aire": ["air purifier", "air purifier living room", "air purifier bedroom", "small air purifier desk", "air purifier home plants"],
  "mejores-cepillos-de-dientes-electricos": ["electric toothbrush", "electric toothbrush bathroom", "sonic toothbrush", "electric toothbrush white", "electric toothbrush close up"],
}
def search_photos(q, per_page=10):
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "per_page": per_page})
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"Authorization": KEY, "User-Agent": UA}), timeout=30)).get("photos", [])
def save_photo(ph, out, max_w=900):
    raw = urllib.request.urlopen(urllib.request.Request(ph["src"]["large"], headers={"User-Agent": UA}), timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB"); im.thumbnail((max_w, max_w))
    w, h = im.size; th = int(w * 3 / 4)
    if h > th: im = im.crop((0, (h - th)//2, w, (h - th)//2 + th))
    im.save(out, "JPEG", quality=78, optimize=True, progressive=True)
credits.setdefault("products", {})
ov_path = os.path.join(ROOT, "lib", "photoOverrides.json")
OVERRIDES = json.load(open(ov_path)) if os.path.exists(ov_path) else {}
def get_photo(pid):
    return json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.pexels.com/v1/photos/{pid}", headers={"Authorization": KEY, "User-Agent": UA}), timeout=30))
os.makedirs(os.path.join(ROOT, "public", "img", "productos"), exist_ok=True)
if os.path.exists(arts_path):
    for a in json.load(open(arts_path)):
        slug = a["slug"]; used = set(); cache = {}
        for i, prod in enumerate(a["products"][:5], 1):
            key = f"{slug}-{i}"
            out = os.path.join(ROOT, "public", "img", "productos", f"{key}.jpg")
            if only_missing and os.path.exists(out): continue
            if key in OVERRIDES:
                pick = get_photo(OVERRIDES[key]); used.add(pick["id"]); save_photo(pick, out)
                credits["products"][key] = {"photographer": pick["photographer"], "url": pick["url"]}
                print(f"{key}: override {pick['id']} · {pick['photographer']}"); continue
            q = prod.get("imageQuery") or (PRODUCT_QUERIES.get(slug) or [None]*5)[i-1] or a.get("photoQuery") or targets.get(slug)
            photos = cache.get(q) or search_photos(q); cache[q] = photos
            pick = next((p for p in photos if p["id"] not in used), None)
            if not pick:
                fb = a.get("photoQuery") or targets.get(slug) or GENERIC[a["category"]]
                photos = cache.get(fb) or search_photos(fb, 15); cache[fb] = photos
                pick = next((p for p in photos if p["id"] not in used), None)
            if not pick: print("sin foto:", key); continue
            used.add(pick["id"]); save_photo(pick, out)
            credits["products"][key] = {"photographer": pick["photographer"], "url": pick["url"]}
            print(f"{key}: {os.path.getsize(out)//1024} KB · {pick['photographer']}")
json.dump(credits, open(credits_path, "w"), ensure_ascii=False, indent=2)
print("hecho")
