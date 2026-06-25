#!/usr/bin/env python3
"""Contact sheet for competitor logo QA: each logo shown full (contain) + circle-cropped
(object-cover, as the card renders it) on a cream background. Numbered for review."""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

RAW = sys.argv[1] if len(sys.argv) > 1 else "/private/tmp/claude-501/-Users-jeric-Documents-GitHub-Matcha/8647f9a3-ce83-417a-bf7e-0e2d26f3198e/scratchpad/logos/raw"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/private/tmp/claude-501/-Users-jeric-Documents-GitHub-Matcha/8647f9a3-ce83-417a-bf7e-0e2d26f3198e/scratchpad/logos/contact.png"

CREAM = (247, 241, 225)
FOREST = (47, 74, 47)
BG = (235, 230, 218)
files = sorted(f for f in os.listdir(RAW) if not f.startswith("."))

COLS = 5
CELL_W, CELL_H = 230, 210
FULL, CIRC = 150, 96
rows = (len(files) + COLS - 1) // COLS
W, H = COLS * CELL_W, rows * CELL_H
sheet = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
    fontb = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
except Exception:
    font = fontb = ImageFont.load_default()

def on_cream(im):
    bg = Image.new("RGBA", im.size, CREAM + (255,))
    return Image.alpha_composite(bg, im)

def circle_cover(im, dia):
    # object-cover: scale to cover, center-crop square, circular mask
    w, h = im.size
    s = dia / min(w, h)
    im2 = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    w2, h2 = im2.size
    left, top = (w2 - dia) // 2, (h2 - dia) // 2
    sq = im2.crop((left, top, left + dia, top + dia)).convert("RGBA")
    mask = Image.new("L", (dia, dia), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, dia - 1, dia - 1), fill=255)
    out = Image.new("RGBA", (dia, dia), (0, 0, 0, 0))
    out.paste(sq, (0, 0), mask)
    return out

for i, f in enumerate(files):
    r, c = divmod(i, COLS)
    x0, y0 = c * CELL_W, r * CELL_H
    slug = os.path.splitext(f)[0]
    try:
        im = Image.open(os.path.join(RAW, f)).convert("RGBA")
        ow, oh = im.size
        flat = on_cream(im)
        # full (contain)
        fim = flat.convert("RGB").copy()
        fim.thumbnail((FULL, FULL), Image.LANCZOS)
        fx = x0 + 10 + (FULL - fim.width) // 2
        fy = y0 + 28 + (FULL - fim.height) // 2
        d.rectangle((x0 + 10, y0 + 28, x0 + 10 + FULL, y0 + 28 + FULL), fill=BG)
        sheet.paste(fim, (fx, fy))
        # circle cover
        circ = circle_cover(flat, CIRC)
        cx, cy = x0 + 10 + FULL + 14, y0 + 28 + (FULL - CIRC) // 2
        ring = Image.new("RGBA", (CIRC + 6, CIRC + 6), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, CIRC + 5, CIRC + 5), fill=FOREST + (255,))
        sheet.paste(ring, (cx - 3, cy - 3), ring)
        sheet.paste(circ, (cx, cy), circ)
        d.text((x0 + 10, y0 + 8), f"{i+1}. {slug}", fill=(20, 20, 20), font=fontb)
        d.text((x0 + 10, y0 + 28 + FULL + 4), f"{ow}x{oh}", fill=(110, 110, 110), font=font)
    except Exception as e:
        d.text((x0 + 10, y0 + 8), f"{i+1}. {slug}", fill=(200, 0, 0), font=fontb)
        d.text((x0 + 10, y0 + 30), str(e)[:30], fill=(200, 0, 0), font=font)

sheet.save(OUT)
print("wrote", OUT, sheet.size, "files:", len(files))
