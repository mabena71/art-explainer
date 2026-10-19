"""Erzeugt die App-Symbole (Bogen mit Goldsonne auf Espresso): python scripts/make-icons.py"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
SS = 4
BG, TERRA, GOLD = '#16110d', '#d98558', '#f0c874'

def render(size, zoom):
    S = size * SS; k = S / 96
    P = lambda x, y: (S/2 + (x-48)*zoom*k, S/2 + (y-48)*zoom*k)
    box = lambda x0, y0, x1, y1: [*P(x0, y0), *P(x1, y1)]
    im = Image.new('RGB', (S, S), BG); d = ImageDraw.Draw(im)
    d.ellipse(box(26, 28, 70, 72), fill=TERRA)
    d.rectangle(box(26, 50, 70, 74), fill=TERRA)
    d.ellipse(box(40, 40, 56, 56), fill=GOLD)
    w = zoom * k * 4
    d.line([P(18, 74), P(78, 74)], fill=GOLD, width=round(w))
    for x in (18, 78):
        cx, cy = P(x, 74); d.ellipse([cx-w/2, cy-w/2, cx+w/2, cy+w/2], fill=GOLD)
    return im.resize((size, size), Image.LANCZOS)

for name, size, zoom in (('icon-512', 512, 1.0), ('icon-192', 192, 1.0), ('icon-maskable-512', 512, 0.8),
                         ('apple-touch-icon', 180, 0.95), ('favicon', 64, 1.1)):
    render(size, zoom).save(os.path.join(OUT, name + '.png'), optimize=True)
print('fertig')
