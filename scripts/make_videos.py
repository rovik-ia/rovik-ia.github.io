#!/usr/bin/env python3
"""Genera vídeos verticales (1080x1920) para TikTok/Reels/Shorts a partir de las guías.

Uso: python3 scripts/make_videos.py [slug ...]   (sin argumentos: todas las guías)
Requiere: Pillow, ffmpeg y la voz "Mónica" de macOS (say).
Salida: marketing/videos/<slug>.mp4 + <slug>.txt (texto para la publicación).
"""
import json, os, subprocess, sys, shutil, tempfile, wave
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "marketing", "data", "articles.json")
OUT = os.path.join(ROOT, "marketing", "videos")
W, H = 1080, 1920
FPS = 30
BG = (22, 24, 29); FG = (250, 250, 248); MUTED = (170, 175, 185); ACCENT = (232, 93, 24); CARD = (32, 35, 42)
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
def _ffmpeg():
    if shutil.which("ffmpeg"): return shutil.which("ffmpeg")
    try:
        import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "/usr/local/bin/ffmpeg"
FFMPEG = _ffmpeg()
VOICE = "Mónica"
CATS = {"hogar": "Hogar", "cocina": "Cocina", "bienestar": "Bienestar", "tecnologia": "Tecnología"}

def font(path, size):
    return ImageFont.truetype(path, size)

def wrap(draw, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= max_w: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def draw_text(draw, xy, text, f, fill, max_w, line_h=None, max_lines=None):
    x, y = xy
    lines = wrap(draw, text, f, max_w)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]; lines[-1] = lines[-1].rstrip(".,") + "…"
    lh = line_h or int(f.size * 1.18)
    for ln in lines:
        draw.text((x, y), ln, font=f, fill=fill); y += lh
    return y

def base():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # barra superior de marca
    d.rectangle([0, 0, W, 8], fill=ACCENT)
    d.text((72, 70), "Tendencia", font=font(FONT_BLACK, 44), fill=ACCENT)
    d.text((72 + d.textlength("Tendencia", font=font(FONT_BLACK, 44)) + 14, 70), "Top", font=font(FONT_BLACK, 44), fill=FG)
    d.text((72, H - 120), "Guías de compra · enlaces de afiliado de Amazon", font=font(FONT_REG, 28), fill=MUTED)
    return img, d

def scene_intro(a):
    img, d = base()
    d.rounded_rectangle([72, 330, 72 + 260, 330 + 56], radius=28, fill=ACCENT)
    d.text((72 + 26, 330 + 10), CATS.get(a["category"], a["category"]).upper(), font=font(FONT_BOLD, 30), fill=FG)
    y = draw_text(d, (72, 430), a["title"], font(FONT_BLACK, 82), FG, W - 144, line_h=96, max_lines=6)
    draw_text(d, (72, y + 40), a["description"], font(FONT_REG, 40), MUTED, W - 144, line_h=52, max_lines=5)
    d.text((72, H - 260), "5 modelos en 40 segundos", font=font(FONT_BOLD, 40), fill=ACCENT)
    return img

def scene_product(a, i, p):
    img, d = base()
    d.text((72, 300), f"{i}/5", font=font(FONT_BLACK, 120), fill=ACCENT)
    if p.get("badge"):
        bw = d.textlength(p["badge"].upper(), font=font(FONT_BOLD, 30)) + 52
        d.rounded_rectangle([300, 340, 300 + bw, 396], radius=28, fill=CARD, outline=ACCENT, width=3)
        d.text((326, 350), p["badge"].upper(), font=font(FONT_BOLD, 30), fill=FG)
    y = draw_text(d, (72, 470), p["name"], font(FONT_BLACK, 72), FG, W - 144, line_h=84, max_lines=3)
    d.text((72, y + 10), f"Precio orientativo: {p['priceRange']}", font=font(FONT_BOLD, 40), fill=ACCENT)
    y += 90
    d.rounded_rectangle([72, y, W - 72, y + 560], radius=32, fill=CARD)
    yy = y + 40
    d.text((110, yy), "Lo mejor", font=font(FONT_BOLD, 36), fill=ACCENT); yy += 56
    for pro in p["pros"][:3]:
        yy = draw_text(d, (110, yy), "• " + pro, font(FONT_REG, 38), FG, W - 220, line_h=48, max_lines=2) + 10
    yy += 16
    d.text((110, yy), "A tener en cuenta", font=font(FONT_BOLD, 36), fill=MUTED); yy += 56
    for con in p["cons"][:1]:
        yy = draw_text(d, (110, yy), "• " + con, font(FONT_REG, 38), MUTED, W - 220, line_h=48, max_lines=2)
    draw_text(d, (72, y + 600), "Ideal para: " + p["idealFor"], font(FONT_REG, 36), MUTED, W - 144, line_h=46, max_lines=3)
    return img

def scene_outro(a):
    img, d = base()
    draw_text(d, (72, 380), "Guía completa, criterios de elección y enlaces a Amazon.es en", font(FONT_BOLD, 56), FG, W - 144, line_h=70)
    d.rounded_rectangle([72, 700, W - 72, 860], radius=32, fill=ACCENT)
    d.text((110, 745), "rovik-ia.github.io", font=font(FONT_BLACK, 66), fill=FG)
    draw_text(d, (72, 940), "Resumen rápido", font(FONT_BOLD, 44), ACCENT, W - 144)
    yy = 1010
    for q in a["quickPick"][:5]:
        yy = draw_text(d, (72, yy), f"{q['label']}: {q['product']}", font(FONT_REG, 38), FG, W - 144, line_h=48, max_lines=2) + 8
    draw_text(d, (72, H - 300), "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.", font(FONT_REG, 26), MUTED, W - 144, line_h=34)
    return img

def narration(a):
    parts = [f"{a['title']}. Cinco modelos, en un minuto."]
    for i, p in enumerate(a["products"][:5], 1):
        parts.append(f"Número {i}: {p['name']}. {p.get('badge','')}. {p['pros'][0]}. Ideal para {p['idealFor'].rstrip('.')}.")
    parts.append("Tienes la guía completa con todos los enlaces en rovik-ia punto github punto io. Enlaces de afiliado de Amazon.")
    return parts

def tts(text, path):
    subprocess.run(["say", "-v", VOICE, "-r", "195", "-o", path, "--data-format=LEI16@44100", text], check=True)
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()

def build(a):
    slug = a["slug"]
    tmp = tempfile.mkdtemp(prefix="tt_")
    scenes = [scene_intro(a)] + [scene_product(a, i, p) for i, p in enumerate(a["products"][:5], 1)] + [scene_outro(a)]
    texts = narration(a)
    clips = []; total = 0.0
    for idx, (img, txt) in enumerate(zip(scenes, texts)):
        png = os.path.join(tmp, f"s{idx}.png"); img.save(png)
        wav = os.path.join(tmp, f"s{idx}.wav"); dur = tts(txt, wav) + 0.5; total += dur
        clip = os.path.join(tmp, f"c{idx}.mp4")
        frames = int(dur * FPS)
        # zoom suave (ken burns) sobre la imagen fija
        vf = f"scale=1296:2304,zoompan=z='min(1.0+0.00012*on,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS},format=yuv420p"
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-loop", "1", "-i", png, "-i", wav, "-vf", vf, "-t", f"{dur:.2f}",
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k", "-shortest", clip], check=True)
        clips.append(clip)
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for c in clips: f.write(f"file '{c}'\n")
    out = os.path.join(OUT, f"{slug}.mp4")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
    # texto de la publicación
    tags = "#" + " #".join(sorted({CATS.get(a['category'],'hogar').lower(), "guiadecompra", "amazon", "tendencias", "ofertas", "comprasinteligentes"}))
    caption = (f"{a['title']}\n\n" + "\n".join(f"{i}. {p['name']} · {p.get('badge','')}" for i, p in enumerate(a['products'][:5], 1)) +
               f"\n\nGuía completa y enlaces: https://rovik-ia.github.io/guias/{slug}/\n\n"
               "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.\n\n" + tags)
    with open(os.path.join(OUT, f"{slug}.txt"), "w") as f: f.write(caption)
    shutil.rmtree(tmp)
    return out, total

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    arts = json.load(open(DATA))
    want = set(sys.argv[1:])
    for a in arts:
        if want and a["slug"] not in want: continue
        out, dur = build(a)
        print(f"OK {os.path.basename(out)} {dur:.1f}s")
