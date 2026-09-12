#!/usr/bin/env python3
"""Vídeos verticales estilo TikTok/Reels para cada guía: B-roll de Pexels + tarjetas + subtítulos sincronizados + voz.

Uso: ~/venv/bin/python scripts/make_videos.py [slug ...]
Requiere: Pillow, imageio-ffmpeg (o ffmpeg), voz de macOS (say) y PEXELS_API_KEY en .env.local.
Salida: marketing/videos/<slug>.mp4 y <slug>.txt (texto de publicación con atribuciones).
"""
import json, os, re, subprocess, sys, shutil, tempfile, wave, urllib.request, urllib.parse, hashlib, ssl
try:
    import certifi; _CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _CTX = ssl.create_default_context()
urllib.request.install_opener(urllib.request.build_opener(urllib.request.HTTPSHandler(context=_CTX)))
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "marketing", "data", "articles.json")
OUT = os.path.join(ROOT, "marketing", "videos")
BROLL = os.path.join(ROOT, "marketing", "broll")
W, H, FPS = 1080, 1920, 30
FG = (255, 255, 255); ACCENT = (232, 93, 24); MUTED = (215, 218, 225)
F_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
F_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
F_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
CATS = {"hogar": "Hogar", "cocina": "Cocina", "bienestar": "Bienestar", "tecnologia": "Tecnología"}

def env(key):
    if os.environ.get(key): return os.environ[key]
    p = os.path.join(ROOT, ".env.local")
    if os.path.exists(p):
        for ln in open(p):
            if ln.startswith(key + "="): return ln.split("=", 1)[1].strip()
    return None

def ffmpeg_bin():
    if shutil.which("ffmpeg"): return shutil.which("ffmpeg")
    import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
FFMPEG = ffmpeg_bin()

def pick_voice():
    out = subprocess.run(["say", "-v", "?"], capture_output=True, text=True).stdout
    for pref in ("Mónica (Mejorada)", "Mónica (Enhanced)", "Marisol", "Mónica"):
        if pref in out: return pref
    return "Mónica"
VOICE = pick_voice()

# --- Búsquedas de B-roll por guía (inglés: Pexels indexa mejor) ---
BROLL_QUERIES = {
    "mejores-freidoras-de-aire": ["air fryer", "healthy cooking kitchen", "modern kitchen counter", "family dinner home", "roasted vegetables oven", "kitchen appliance modern"],
    "mejores-robots-aspiradores-calidad-precio": ["robot vacuum cleaner", "clean living room floor", "modern apartment interior", "pet dog at home floor", "smart home", "clean home"],
    "mejores-calefactores-bajo-consumo": ["cozy home winter", "electric heater", "warm living room blanket", "autumn window rain", "home office cozy", "person warming hands"],
    "mejores-pistolas-de-masaje": ["massage gun", "athlete recovery muscle", "gym training legs", "running workout", "stretching at home", "sports recovery"],
    "mejores-smartwatch-calidad-precio": ["smartwatch wrist", "running with smartwatch", "fitness tracker", "sleep tracking bed", "morning jogging city", "smartwatch close up"],
    "mejores-deshumidificadores": ["condensation window", "dehumidifier home", "laundry drying indoor", "rainy day home", "humid wall mold", "cozy apartment"],
    "mejores-mantas-electricas": ["cozy blanket sofa", "reading in bed blanket", "electric blanket", "warm bed winter", "hot tea sofa", "cozy bedroom"],
    "mejores-auriculares-inalambricos-menos-100-euros": ["wireless earbuds", "listening music headphones city", "earbuds close up", "commuting train music", "working with earbuds", "running with earbuds"],
    "mejores-purificadores-de-aire": ["air purifier home", "clean air living room plants", "allergy sneezing", "bedroom fresh air", "modern living room", "breathing fresh air"],
    "mejores-cepillos-de-dientes-electricos": ["electric toothbrush", "brushing teeth bathroom", "smile teeth close up", "bathroom morning routine", "toothbrush close up", "dental care"],
    "mejores-sillas-de-escritorio-ergonomicas": ["ergonomic office chair", "home office desk", "working from home laptop", "back pain sitting", "modern workspace", "office chair close up"],
}
GENERIC = {"hogar": ["modern home interior", "cozy living room", "home life"], "cocina": ["modern kitchen", "cooking at home"],
           "bienestar": ["healthy lifestyle", "wellness morning"], "tecnologia": ["technology gadgets", "modern lifestyle tech"]}

def pexels_video(query, min_dur=4):
    """Devuelve (ruta_mp4, atribución) para una consulta, usando caché local."""
    key = env("PEXELS_API_KEY")
    if not key: raise SystemExit("Falta PEXELS_API_KEY en .env.local")
    os.makedirs(BROLL, exist_ok=True)
    h = hashlib.md5(query.encode()).hexdigest()[:10]
    meta = os.path.join(BROLL, f"{h}.json")
    if os.path.exists(meta):
        m = json.load(open(meta))
        if os.path.exists(m["path"]): return m["path"], m["credit"]
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": query, "orientation": "portrait", "size": "medium", "per_page": 8})
    UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) TendenciaTop/1.0"
    req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": UA})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    best = None
    for v in data.get("videos", []):
        if v["duration"] < min_dur: continue
        files = [f for f in v["video_files"] if f.get("width") and f.get("height") and f["height"] > f["width"]]
        if not files: continue
        f = min(files, key=lambda f: abs(f["width"] - 1080))
        best = (v, f); break
    if not best: return None, None
    v, f = best
    path = os.path.join(BROLL, f"{h}.mp4")
    with urllib.request.urlopen(urllib.request.Request(f["link"], headers={"User-Agent": UA}), timeout=120) as r, open(path, "wb") as fh:
        shutil.copyfileobj(r, fh)
    credit = f"Vídeo de {v['user']['name']} en Pexels ({v['url']})"
    json.dump({"path": path, "credit": credit, "query": query}, open(meta, "w"))
    return path, credit

# --- Texto y tipografía ---
def font(p, s): return ImageFont.truetype(p, s)

def wrap(draw, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= max_w: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def text_block(draw, xy, text, f, fill, max_w, lh=None, max_lines=None, stroke=0, stroke_fill=(0, 0, 0)):
    x, y = xy; lines = wrap(draw, text, f, max_w)
    if max_lines and len(lines) > max_lines: lines = lines[:max_lines]; lines[-1] = lines[-1].rstrip(".,") + "…"
    lh = lh or int(f.size * 1.15)
    for ln in lines:
        draw.text((x, y), ln, font=f, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill); y += lh
    return y

def gradient_layer():
    """Capa RGBA con oscurecido arriba y abajo para legibilidad."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); px = img.load()
    for y in range(H):
        a = 0
        if y < 520: a = int(190 * (1 - y / 520))
        elif y > H - 900: a = int(215 * ((y - (H - 900)) / 900))
        a = max(a, 70)
        for x in range(W): px[x, y] = (8, 8, 12, a)
    return img

GRAD = None
def base_layer():
    global GRAD
    if GRAD is None: GRAD = gradient_layer()
    img = GRAD.copy(); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 10], fill=ACCENT + (255,))
    d.text((60, 64), "Tendencia", font=font(F_BLACK, 46), fill=ACCENT + (255,), stroke_width=2, stroke_fill=(0, 0, 0, 180))
    d.text((60 + d.textlength("Tendencia", font=font(F_BLACK, 46)) + 14, 64), "Top", font=font(F_BLACK, 46), fill=FG + (255,), stroke_width=2, stroke_fill=(0, 0, 0, 180))
    return img, d

def card_hook(a, topic):
    img, d = base_layer()
    d.rounded_rectangle([60, 300, 60 + 300, 360], radius=30, fill=ACCENT + (255,))
    d.text((60 + 28, 312), CATS.get(a["category"], "").upper(), font=font(F_BOLD, 30), fill=FG + (255,))
    text_block(d, (60, 400), f"¿Qué {topic} comprar en 2026?", font(F_BLACK, 92), FG + (255,), W - 120, lh=104, stroke=4, stroke_fill=(0, 0, 0, 200))
    return img

def card_product(i, p):
    img, d = base_layer()
    d.text((60, 250), f"{i}", font=font(F_BLACK, 170), fill=ACCENT + (255,), stroke_width=4, stroke_fill=(0, 0, 0, 200))
    d.text((60 + d.textlength(f"{i}", font=font(F_BLACK, 170)) + 8, 345), "/5", font=font(F_BLACK, 60), fill=MUTED + (255,), stroke_width=3, stroke_fill=(0, 0, 0, 200))
    if p.get("badge"):
        bw = d.textlength(p["badge"].upper(), font=font(F_BOLD, 30)) + 56
        d.rounded_rectangle([60, 450, 60 + bw, 512], radius=31, fill=ACCENT + (255,))
        d.text((88, 462), p["badge"].upper(), font=font(F_BOLD, 30), fill=FG + (255,))
    y = text_block(d, (60, 545), p["name"], font(F_BLACK, 80), FG + (255,), W - 120, lh=92, max_lines=3, stroke=4, stroke_fill=(0, 0, 0, 210))
    d.text((60, y + 8), p["priceRange"], font=font(F_BLACK, 56), fill=ACCENT + (255,), stroke_width=3, stroke_fill=(0, 0, 0, 200))
    return img

def card_cta(a):
    img, d = base_layer()
    text_block(d, (60, 330), "La guía completa con enlaces está en", font(F_BLACK, 64), FG + (255,), W - 120, lh=76, stroke=4, stroke_fill=(0, 0, 0, 210))
    d.rounded_rectangle([60, 560, W - 60, 700], radius=34, fill=ACCENT + (255,))
    d.text((96, 596), "rovik-ia.github.io", font=font(F_BLACK, 68), fill=FG + (255,))
    y = 780
    for q in a["quickPick"][:5]:
        y = text_block(d, (60, y), f"{q['label']}: {q['product']}", font(F_BOLD, 38), FG + (255,), W - 120, lh=48, max_lines=2, stroke=3, stroke_fill=(0, 0, 0, 200)) + 10
    return img

def caption_png(text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    f = font(F_BLACK, 66); lines = wrap(d, text.upper(), f, W - 140)
    lh = 80; total = lh * len(lines); y = H - 640 - total // 2
    for ln in lines:
        w = d.textlength(ln, font=f); x = (W - w) / 2
        d.text((x, y), ln, font=f, fill=(255, 240, 120, 255), stroke_width=7, stroke_fill=(0, 0, 0, 255)); y += lh
    return img

def progress_png(frac):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, int(W * frac), 10], fill=ACCENT + (255,))
    return img

# --- Audio ---
def phrases(text, max_words=6):
    out = []
    for sent in re.split(r"(?<=[.!?;:,])\s+", text.strip()):
        words = sent.split()
        while words:
            n = max_words if len(words) <= max_words or len(words) > max_words * 1.5 else (len(words) + 1) // 2
            out.append(" ".join(words[:n]).strip(",")); words = words[n:]
    return [p for p in out if p]

def tts(text, path):
    subprocess.run(["say", "-v", VOICE, "-r", "190", "-o", path, "--data-format=LEI16@44100", text], check=True)
    with wave.open(path) as w: return w.getnframes() / w.getframerate()

def scene_audio(text, tmp, idx):
    """TTS por frases; devuelve (wav_concatenado, [(frase, t_ini, t_fin)], duración)."""
    frames = b""; timeline = []; t = 0.0; params = None; gap = 0.12
    for j, ph in enumerate(phrases(text)):
        p = os.path.join(tmp, f"a{idx}_{j}.wav"); d = tts(ph, p)
        with wave.open(p) as w:
            params = w.getparams(); frames += w.readframes(w.getnframes())
        timeline.append((ph, t, t + d)); t += d
        frames += b"\x00" * int(gap * params.framerate * params.sampwidth * params.nchannels); t += gap
    out = os.path.join(tmp, f"scene{idx}.wav")
    with wave.open(out, "wb") as w: w.setparams(params); w.writeframes(frames)
    return out, timeline, t

# --- Render ---
def render_scene(tmp, idx, broll, card, timeline, audio, dur, t0, T):
    card_p = os.path.join(tmp, f"card{idx}.png"); card.save(card_p)
    caps = []
    for j, (ph, a, b) in enumerate(timeline):
        p = os.path.join(tmp, f"cap{idx}_{j}.png"); caption_png(ph).save(p); caps.append((p, a, b))
    inputs = ["-stream_loop", "-1", "-i", broll, "-i", card_p]
    for p, _, _ in caps: inputs += ["-i", p]
    inputs += ["-i", audio]
    fc = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS},eq=saturation=1.1[bg];[bg][1:v]overlay=0:0[v0]"
    last = "v0"
    for j, (p, a, b) in enumerate(caps):
        fc += f";[{last}][{j+2}:v]overlay=0:0:enable='between(t,{a:.2f},{b+0.1:.2f})'[v{j+1}]"; last = f"v{j+1}"
    fc += f";[{last}]drawbox=x=0:y=0:w='iw*({t0}+t)/{T}':h=10:color=0xE85D18@1:t=fill,format=yuv420p[vout]"
    out = os.path.join(tmp, f"c{idx}.mp4")
    cmd = [FFMPEG, "-y", "-loglevel", "error"] + inputs + ["-filter_complex", fc, "-map", "[vout]", "-map", f"{len(caps)+2}:a",
           "-t", f"{dur:.2f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-maxrate", "3500k", "-bufsize", "7000k", "-r", str(FPS), "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-profile:v", "high", "-level", "4.0", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", out]
    subprocess.run(cmd, check=True)
    return out

def topic_of(a):
    t = a["title"].lower(); t = re.sub(r"^(las|los)\s+mejores\s+", "", t)
    return re.split(r"\s+(de\s+2026|en\s+2026|2026|:|para\s+la|para\s+el|para\s+este|por\s+tama|calidad|sin\s+)", t)[0].strip(" ,")

def build(a):
    slug = a["slug"]; topic = topic_of(a); tmp = tempfile.mkdtemp(prefix="tt_")
    queries = BROLL_QUERIES.get(slug) or GENERIC[a["category"]] * 3
    scenes = []  # (card, narración, query)
    scenes.append((card_hook(a, topic), f"¿Qué {topic} comprar? Estos son los cinco que merecen la pena.", queries[0]))
    for i, p in enumerate(a["products"][:5], 1):
        nar = f"Número {i}: {p['name']}. {p['pros'][0]}. Ideal para {p['idealFor'].rstrip('.')}."
        scenes.append((card_product(i, p), nar, queries[min(i, len(queries) - 1)]))
    scenes.append((card_cta(a), "Tienes la guía completa con enlaces a Amazon en rovik-ia punto github punto io. También en la bio.", queries[0]))
    # audio primero para conocer duraciones
    audios = [scene_audio(nar, tmp, k) for k, (_, nar, _) in enumerate(scenes)]
    T = sum(d for _, _, d in audios) + 0.3 * len(scenes)
    clips = []; credits = []; t0 = 0.0
    for k, ((card, _, q), (wav, timeline, d)) in enumerate(zip(scenes, audios)):
        broll, credit = pexels_video(q)
        if not broll:
            broll, credit = pexels_video(GENERIC[a["category"]][0])
        if credit and credit not in credits: credits.append(credit)
        dur = d + 0.3
        clips.append(render_scene(tmp, k, broll, card, timeline, wav, dur, t0, T)); t0 += dur
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for c in clips: f.write(f"file '{c}'\n")
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{slug}.mp4")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
    tags = "#" + " #".join([CATS.get(a["category"], "hogar").lower(), "guiadecompra", "amazon", "tendencias", "comprasinteligentes", topic.split()[0]])
    caption = (f"¿Qué {topic} comprar en 2026? Los 5 que merecen la pena:\n\n" + "\n".join(f"{i}. {p['name']} · {p.get('badge','')}" for i, p in enumerate(a['products'][:5], 1)) +
               f"\n\nGuía completa y enlaces: https://rovik-ia.github.io/guias/{slug}/\n\n"
               "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.\n\n" + tags +
               "\n\nCréditos de vídeo: " + " · ".join(credits))
    open(os.path.join(OUT, f"{slug}.txt"), "w").write(caption)
    shutil.rmtree(tmp)
    return out, T

if __name__ == "__main__":
    arts = json.load(open(DATA)); want = set(sys.argv[1:])
    print("voz:", VOICE)
    for a in arts:
        if want and a["slug"] not in want: continue
        out, T = build(a); print(f"OK {os.path.basename(out)} {T:.1f}s")
