#!/usr/bin/env python3
"""Genera los borradores de campañas (Google Ads Editor CSV + plan Meta) a partir de las guías."""
import json, csv, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
arts = json.load(open(os.path.join(ROOT, "marketing/data/articles.json")))
SITE = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site.config.json"), encoding="utf-8"))["url"].rstrip("/")
DAILY_BUDGET_EUR = 5.00

def clip(s, n):
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[: n - 1].rstrip(" ,.;:") + "…"

def topic(a):
    # "Las mejores freidoras de aire de 2026 por..." -> "freidoras de aire"
    t = a["title"].lower()
    t = re.sub(r"^(las|los)\s+mejores\s+", "", t)
    t = re.split(r"\s+(de\s+2026|en\s+2026|2026|:|para\s+la|para\s+el|para\s+este|por\s+tama|calidad|sin\s+)", t)[0]
    return t.strip(" ,")

def keywords(a):
    t = topic(a)
    base = [f"mejores {t}", f"top {t}", f"{t} calidad precio", f"comparativa {t}", f"{t} 2026", f"guía de compra {t}", f"{t} opiniones"]
    brands = []
    for p in a["products"][:5]:
        first = p["name"].split()[0]
        if first.lower() not in ("de'longhi",) and len(first) > 2:
            brands.append(f"{first.lower()} {t}")
    return list(dict.fromkeys(base + brands))[:10]

rows = []
for a in arts:
    t = topic(a)
    ag = clip(t.capitalize(), 40)
    url = f"{SITE}/guias/{a['slug']}/"
    heads = [clip(f"Mejores {t}", 30), clip(f"{t.capitalize()} 2026", 30), "Guía de compra clara", "Comparativa sin humo", clip(f"Qué {t} comprar", 30),
             "5 modelos que merecen la pena", "Por presupuesto y uso", "Precios orientativos", "Pros y contras reales", clip(f"{t.capitalize()} calidad precio", 30)]
    heads = list(dict.fromkeys(h for h in heads if h))[:10]
    descs = [clip(a["description"], 90), clip(f"Criterios de elección, {len(a['products'])} modelos recomendados y para quién es cada uno.", 90),
             "Guía independiente en español. Sin listas infinitas ni jerga. Actualizada 2026.", clip(f"{a['quickPick'][0]['label']}: {a['quickPick'][0]['product']}. Lee la comparativa completa.", 90)]
    for kw in keywords(a):
        rows.append({"Campaign": "Tendencia Top · Búsqueda", "Campaign Type": "Search", "Campaign Daily Budget": f"{DAILY_BUDGET_EUR:.2f}", "Networks": "Google search",
                     "Languages": "es", "Location": "Spain", "Bid Strategy Type": "Maximize clicks", "Max CPC bid limit": "0.35",
                     "Ad Group": ag, "Ad Group Type": "Standard", "Keyword": kw, "Criterion Type": "Phrase", "Final URL": url})
    row = {"Campaign": "Tendencia Top · Búsqueda", "Ad Group": ag, "Ad type": "Responsive search ad", "Final URL": url, "Path 1": "guias", "Path 2": clip(t.split()[0], 15)}
    for i, h in enumerate(heads, 1): row[f"Headline {i}"] = h
    for i, d in enumerate(descs, 1): row[f"Description {i}"] = d
    rows.append(row)

fields = list(dict.fromkeys(k for r in rows for k in r))
with open(os.path.join(ROOT, "marketing/google-ads/tendencia-top-busqueda.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)

# Negativas comunes
with open(os.path.join(ROOT, "marketing/google-ads/palabras-negativas.txt"), "w") as f:
    f.write("\n".join(["gratis", "segunda mano", "wallapop", "milanuncios", "reparar", "reparación", "manual", "pdf", "recambio", "piezas", "alquiler", "amazon", "mediamarkt", "pccomponentes", "el corte inglés", "carrefour", "opiniones ocu"]))

# Plan Meta (JSON listo para crear con el MCP oficial de Meta)
meta = {
  "campaign": {"name": "Tendencia Top · Tráfico guías", "objective": "OUTCOME_TRAFFIC", "status": "PAUSED", "buying_type": "AUCTION", "special_ad_categories": []},
  "adsets": [],
}
for a in arts:
    t = topic(a)
    meta["adsets"].append({
        "name": clip(t.capitalize(), 60), "daily_budget_eur": 3.0, "status": "PAUSED", "optimization_goal": "LANDING_PAGE_VIEWS", "billing_event": "IMPRESSIONS",
        "targeting": {"geo_locations": {"countries": ["ES"]}, "age_min": 25, "age_max": 64, "publisher_platforms": ["facebook", "instagram"],
                      "instagram_positions": ["stream", "reels", "story"], "facebook_positions": ["feed", "video_feeds", "story", "facebook_reels"],
                      "interests_hint": [t, a["category"], "compras online"]},
        "ad": {"name": clip(a["title"], 80), "format": "video", "video_file": f"marketing/videos/{a['slug']}.mp4",
               "primary_text": clip(a["description"], 125), "headline": clip(f"Mejores {t} 2026", 40), "description": "Guía de compra independiente",
               "call_to_action": "LEARN_MORE", "link": f"{SITE}/guias/{a['slug']}/?utm_source=meta&utm_medium=paid&utm_campaign={a['slug']}"},
    })
json.dump(meta, open(os.path.join(ROOT, "marketing/meta-ads/campana-trafico.json"), "w"), ensure_ascii=False, indent=2)
print(f"google: {len(rows)} filas, meta: {len(meta['adsets'])} conjuntos")
