#!/usr/bin/env python3
"""Vídeos verticales estilo TikTok/Reels para cada guía: B-roll de Pexels + tarjetas + subtítulos sincronizados + voz.

Uso: ~/venv/bin/python scripts/make_videos.py [slug ...]
Requiere: Pillow, imageio-ffmpeg (o ffmpeg), PEXELS_API_KEY y un motor de voz:
`say` en macOS o edge-tts (voz neuronal) en cualquier sistema. Variables: TTS_ENGINE, TTS_VOICE, TTS_RATE.
Salida: marketing/videos/<slug>.mp4 y <slug>.txt (texto de publicación con atribuciones).
"""
import json, os, re, subprocess, sys, shutil, tempfile, time, wave, urllib.request, urllib.parse, hashlib, ssl
from functools import lru_cache
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
MANROPE = os.path.join(ROOT, "assets", "fonts", "Manrope.ttf")
MAC_FONTS = {
    "black": "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "bold": "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "reg": "/System/Library/Fonts/Supplemental/Arial.ttf",
}
VARIATIONS = {"black": "ExtraBold", "bold": "Bold", "reg": "Medium"}
SITE_URL = json.load(open(os.path.join(ROOT, "site.config.json"), encoding="utf-8"))["url"].rstrip("/")
SITE_HOST = urllib.parse.urlparse(SITE_URL).netloc
SITE_SPOKEN = SITE_HOST.replace(".", " punto ").replace("-", " ")
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

# --- Motor de voz: `say` en macOS, edge-tts (voz neuronal) en el resto ---
EDGE_VOICE = os.environ.get("TTS_VOICE", "es-ES-ElviraNeural")
EDGE_RATE = os.environ.get("TTS_RATE", "+30%")


def pick_engine():
    """Devuelve ('say', voz) en macOS con voz española, o ('edge', voz) si no."""
    if os.environ.get("TTS_ENGINE"):
        return os.environ["TTS_ENGINE"], EDGE_VOICE
    if shutil.which("say"):
        out = subprocess.run(["say", "-v", "?"], capture_output=True, text=True).stdout
        for pref in ("Mónica (Mejorada)", "Mónica (Enhanced)", "Marisol", "Mónica"):
            if pref in out:
                return "say", pref
    return "edge", EDGE_VOICE


ENGINE, VOICE = pick_engine()

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
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) TendenciaTop/1.0"
GENERIC = {"hogar": ["modern home interior", "cozy living room", "home life"], "cocina": ["modern kitchen", "cooking at home"],
           "bienestar": ["healthy lifestyle", "wellness morning"], "tecnologia": ["technology gadgets", "modern lifestyle tech"]}

def pexels_search(query, per_page=12):
    """Candidatos verticales para una consulta, cacheados en disco."""
    key = env("PEXELS_API_KEY")
    if not key:
        raise SystemExit("Falta PEXELS_API_KEY (variable de entorno o .env.local)")
    os.makedirs(BROLL, exist_ok=True)
    cache = os.path.join(BROLL, "q_" + hashlib.md5(query.encode()).hexdigest()[:10] + ".json")
    if os.path.exists(cache):
        return json.load(open(cache))
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": query, "orientation": "portrait", "size": "medium", "per_page": per_page})
    req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": UA})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    out = []
    for v in data.get("videos", []):
        if v["duration"] < 4:
            continue
        files = [f for f in v["video_files"] if f.get("width") and f.get("height") and f["height"] > f["width"]]
        if not files:
            continue
        f = min(files, key=lambda f: abs(f["width"] - 1080))
        out.append({"id": v["id"], "link": f["link"],
                    "credit": f"Vídeo de {v['user']['name']} en Pexels ({v['url']})"})
    json.dump(out, open(cache, "w"))
    return out


def download_clip(cand):
    path = os.path.join(BROLL, f"{cand['id']}.mp4")
    if not os.path.exists(path) or os.path.getsize(path) < 10000:
        req = urllib.request.Request(cand["link"], headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=180) as r, open(path, "wb") as fh:
            shutil.copyfileobj(r, fh)
    return path


def pick_clips(queries, n):
    """n clips DISTINTOS repartidos entre las consultas, para que no se repita el fondo."""
    pools, seen = [], set()
    for q in queries:
        try:
            pools.append(pexels_search(q))
        except Exception as e:
            print(f"  aviso: falló la búsqueda '{q}': {e}")
    pools = [p for p in pools if p]
    if not pools:
        raise SystemExit("Pexels no devolvió ningún vídeo para estas consultas")
    elegidos = []
    for i in range(n):
        orden = [pools[i % len(pools)]] + pools
        cand = next((c for pool in orden for c in pool if c["id"] not in seen), None)
        if cand is None:                      # se agotaron: se permite repetir
            cand = pools[i % len(pools)][0]
        else:
            seen.add(cand["id"])
        elegidos.append((download_clip(cand), cand["credit"]))
    return elegidos


def broll_queries(a):
    """Consultas de B-roll: las afinadas a mano o, si no, las que trae la propia guía."""
    if a["slug"] in BROLL_QUERIES:
        return BROLL_QUERIES[a["slug"]]
    qs = [a.get("photoQuery")] + [p.get("imageQuery") for p in a["products"][:5]]
    qs = [q for q in qs if q]
    return qs or GENERIC[a["category"]]


# --- Texto y tipografía ---
@lru_cache(maxsize=None)
def font(kind, size):
    """kind: black | bold | reg. Usa Manrope empaquetada; si no está, Arial de macOS."""
    if os.path.exists(MANROPE):
        f = ImageFont.truetype(MANROPE, size)
        try:
            f.set_variation_by_name(VARIATIONS[kind])
        except Exception:
            pass
        return f
    return ImageFont.truetype(MAC_FONTS[kind], size)

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
    d.text((60, 64), "Tendencia", font=font("black", 46), fill=ACCENT + (255,), stroke_width=2, stroke_fill=(0, 0, 0, 180))
    d.text((60 + d.textlength("Tendencia", font=font("black", 46)) + 14, 64), "Top", font=font("black", 46), fill=FG + (255,), stroke_width=2, stroke_fill=(0, 0, 0, 180))
    return img, d

def card_hook(a, topic):
    img, d = base_layer()
    d.rounded_rectangle([60, 300, 60 + 300, 360], radius=30, fill=ACCENT + (255,))
    d.text((60 + 28, 312), CATS.get(a["category"], "").upper(), font=font("bold", 30), fill=FG + (255,))
    text_block(d, (60, 400), f"¿Qué {topic} comprar en 2026?", font("black", 92), FG + (255,), W - 120, lh=104, stroke=4, stroke_fill=(0, 0, 0, 200))
    return img

def card_product(i, p):
    img, d = base_layer()
    d.text((60, 250), f"{i}", font=font("black", 170), fill=ACCENT + (255,), stroke_width=4, stroke_fill=(0, 0, 0, 200))
    d.text((60 + d.textlength(f"{i}", font=font("black", 170)) + 8, 345), "/5", font=font("black", 60), fill=MUTED + (255,), stroke_width=3, stroke_fill=(0, 0, 0, 200))
    if p.get("badge"):
        bw = d.textlength(p["badge"].upper(), font=font("bold", 30)) + 56
        d.rounded_rectangle([60, 450, 60 + bw, 512], radius=31, fill=ACCENT + (255,))
        d.text((88, 462), p["badge"].upper(), font=font("bold", 30), fill=FG + (255,))
    y = text_block(d, (60, 545), p["name"], font("black", 80), FG + (255,), W - 120, lh=92, max_lines=3, stroke=4, stroke_fill=(0, 0, 0, 210))
    d.text((60, y + 8), p["priceRange"], font=font("black", 56), fill=ACCENT + (255,), stroke_width=3, stroke_fill=(0, 0, 0, 200))
    return img

def card_cta(a):
    img, d = base_layer()
    text_block(d, (60, 330), "La guía completa con enlaces está en", font("black", 64), FG + (255,), W - 120, lh=76, stroke=4, stroke_fill=(0, 0, 0, 210))
    d.rounded_rectangle([60, 560, W - 60, 700], radius=34, fill=ACCENT + (255,))
    d.text((96, 596), SITE_HOST, font=font("black", 68 if len(SITE_HOST) <= 20 else 56), fill=FG + (255,))
    y = 780
    for q in a["quickPick"][:5]:
        y = text_block(d, (60, y), f"{q['label']}: {q['product']}", font("bold", 38), FG + (255,), W - 120, lh=48, max_lines=2, stroke=3, stroke_fill=(0, 0, 0, 200)) + 10
    return img

def caption_png(text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    f = font("black", 66); lines = wrap(d, text.upper(), f, W - 140)
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
    """Sintetiza `text` en un WAV mono 44,1 kHz y devuelve su duración en segundos."""
    if ENGINE == "say":
        subprocess.run(["say", "-v", VOICE, "-r", "190", "-o", path,
                        "--data-format=LEI16@44100", text], check=True)
    else:
        mp3 = path + ".mp3"
        last = None
        for intento in range(3):
            try:
                subprocess.run([sys.executable, "-m", "edge_tts", "--voice", VOICE,
                                "--rate", EDGE_RATE, "--text", text, "--write-media", mp3],
                               check=True, capture_output=True, timeout=120)
                if os.path.getsize(mp3) > 1000:
                    break
                last = RuntimeError("audio vacío")
            except Exception as e:
                last = e
                time.sleep(2 + 3 * intento)
        else:
            raise RuntimeError(f"edge-tts falló tras 3 intentos: {last}")
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", mp3,
                        "-ar", "44100", "-ac", "1", path], check=True)
        os.remove(mp3)
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()

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
    scenes = []  # (tarjeta, narración)
    scenes.append((card_hook(a, topic), f"¿Qué {topic} comprar? Estos son los cinco que merecen la pena."))
    for i, p in enumerate(a["products"][:5], 1):
        scenes.append((card_product(i, p), f"Número {i}: {p['name']}. {p['pros'][0]}."))
    scenes.append((card_cta(a), f"Guía completa y enlaces en {SITE_SPOKEN}."))
    clips = pick_clips(broll_queries(a), len(scenes))
    # audio primero para conocer duraciones
    audios = [scene_audio(nar, tmp, k) for k, (_, nar) in enumerate(scenes)]
    T = sum(d for _, _, d in audios) + 0.3 * len(scenes)
    partes = []; credits = []; t0 = 0.0
    for k, ((card, _), (wav, timeline, d), (broll, credit)) in enumerate(zip(scenes, audios, clips)):
        if credit and credit not in credits: credits.append(credit)
        dur = d + 0.3
        partes.append(render_scene(tmp, k, broll, card, timeline, wav, dur, t0, T)); t0 += dur
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for c in partes: f.write(f"file '{c}'\n")
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{slug}.mp4")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
    tags = "#" + " #".join([CATS.get(a["category"], "hogar").lower(), "guiadecompra", "amazon", "tendencias", "comprasinteligentes", topic.split()[0]])
    caption = (f"¿Qué {topic} comprar en 2026? Los 5 que merecen la pena:\n\n" + "\n".join(f"{i}. {p['name']} · {p.get('badge','')}" for i, p in enumerate(a['products'][:5], 1)) +
               f"\n\nGuía completa y enlaces: {SITE_URL}/guias/{slug}/\n\n"
               "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.\n\n" + tags +
               "\n\nCréditos de vídeo: " + " · ".join(credits))
    open(os.path.join(OUT, f"{slug}.txt"), "w").write(caption)
    shutil.rmtree(tmp)
    return out, T

if __name__ == "__main__":
    arts = json.load(open(DATA))
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--latest" in sys.argv:                    # la guía publicada más reciente
        args = [max(arts, key=lambda a: (a.get("updated") or a["date"], -arts.index(a)))["slug"]]
        print("guía más reciente:", args[0])
    want = set(args)
    print(f"motor de voz: {ENGINE} · {VOICE}")
    print("tipografía:", "Manrope (empaquetada)" if os.path.exists(MANROPE) else "Arial de macOS")
    for a in arts:
        if want and a["slug"] not in want: continue
        out, T = build(a); print(f"OK {os.path.basename(out)} {T:.1f}s")
