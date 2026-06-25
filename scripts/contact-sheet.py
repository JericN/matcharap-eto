#!/usr/bin/env python3
# Build one numbered contact sheet per drink from the staged candidates so the
# images can be visually validated in a single glance. Saves /tmp/sheets/<slug>.jpg
import json, os, glob
from PIL import Image, ImageDraw, ImageFont

STAGE = "/tmp/drinkstage"
OUT = "/tmp/sheets"
os.makedirs(OUT, exist_ok=True)
CELL = 230
COLS = 5
PAD = 8
LABEL = 26

# Derive drinks from the staged dirs (works even before the gather writes its manifest)
NAMES = {
    "basic-matcha-latte": "Basic Matcha Latte", "ichigo-matcha-latte": "Ichigo Matcha Latte",
    "seasalt-matcha-latte": "Seasalt Matcha Latte", "shoyu-matcha": "Shoyu Matcha",
    "pistachio-matcha-latte": "Pistachio Matcha Latte", "sakura-matcha-latte": "Sakura Matcha Latte",
    "calamansi-matcha": "Calamansi Matcha", "iced-lychee-matcha": "Iced Lychee Matcha",
    "horchata-matcha": "Horchata Matcha",
}
man = {slug: {"name": NAMES.get(slug, slug)} for slug in NAMES if os.path.isdir(f"{STAGE}/{slug}")}
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
except Exception:
    font = ImageFont.load_default()

for slug, info in man.items():
    files = sorted(glob.glob(f"{STAGE}/{slug}/*.jpg"), key=lambda p: int(os.path.splitext(os.path.basename(p))[0]))
    if not files:
        print(f"{slug}: 0 files"); continue
    rows = (len(files) + COLS - 1) // COLS
    W = COLS * (CELL + PAD) + PAD
    H = rows * (CELL + LABEL + PAD) + PAD + 30
    sheet = Image.new("RGB", (W, H), (240, 240, 235))
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 6), f"{info['name']}  ({len(files)} candidates)", fill=(20, 60, 30), font=font)
    for i, f in enumerate(files):
        n = int(os.path.splitext(os.path.basename(f))[0])
        r, c = divmod(i, COLS)
        x = PAD + c * (CELL + PAD)
        y = 30 + PAD + r * (CELL + LABEL + PAD)
        try:
            im = Image.open(f).convert("RGB")
        except Exception:
            continue
        im.thumbnail((CELL, CELL))
        ox = x + (CELL - im.width) // 2
        oy = y + LABEL + (CELL - im.height) // 2
        sheet.paste(im, (ox, oy))
        d.rectangle([x, y, x + CELL, y + LABEL - 2], fill=(30, 70, 40))
        d.text((x + 6, y + 3), f"#{n}", fill=(255, 255, 255), font=font)
    sheet.save(f"{OUT}/{slug}.jpg", quality=85)
    print(f"{slug}: sheet with {len(files)} imgs")
print("done")
