"""Erzeugt die App-Symbole (PNG) für die vier Design-Konzepte: python scripts/make-icons.py
Ausgabe: icons/k<N>-{512,192,maskable-512,apple-180,fav-64}.png  (Rohdaten 96x96-Raster, Inhalt vollflächig)."""
from PIL import Image, ImageDraw, ImageChops
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
SS = 4  # Supersampling

def bez(p0, p1, p2, p3, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n; u = 1 - t
        pts.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return pts

def render(n, size, zoom):
    S = size * SS
    k = S / 96
    def P(x, y): return (S/2 + (x-48)*zoom*k, S/2 + (y-48)*zoom*k)
    def R(v): return v * zoom * k
    def box(x0, y0, x1, y1): return [*P(x0, y0), *P(x1, y1)]

    def canvas(bg, fill=None):
        im = Image.new('RGB', (S, S), bg)
        return im, ImageDraw.Draw(im)

    if n == 1:
        base = Image.new('RGB', (S, S), '#fff4e0')
        def layer(draw_fn):
            im = Image.new('RGB', (S, S), 'white'); draw_fn(ImageDraw.Draw(im)); return im
        base = ImageChops.multiply(base, layer(lambda d: d.ellipse(box(16, 18, 60, 62), fill='#ff5d7a')))
        base = ImageChops.multiply(base, layer(lambda d: d.rounded_rectangle(box(40, 38, 78, 76), R(6), fill='#ffc233')))
        base = ImageChops.multiply(base, layer(lambda d: d.polygon([P(20, 78), P(42, 44), P(64, 78)], fill='#1fb5a8')))
        im = base
    elif n == 2:
        im, d = canvas('#0e0e12')
        w = round(R(5))
        for pts in ([(24, 36), (24, 24), (36, 24)], [(60, 24), (72, 24), (72, 36)],
                    [(72, 60), (72, 72), (60, 72)], [(36, 72), (24, 72), (24, 60)]):
            q = [P(*p) for p in pts]
            d.line(q, fill='#f2b84b', width=w, joint='curve')
            for x, y in (q[0], q[-1]):
                d.ellipse([x-w/2, y-w/2, x+w/2, y+w/2], fill='#f2b84b')
        d.ellipse(box(39, 39, 57, 57), fill='#f2b84b')
    elif n == 3:
        im, d = canvas('#fafaf7')
        d.rectangle(box(20, 20, 76, 76), outline='#111111', width=max(2, round(R(3.5))))
        d.ellipse(box(52, 30, 68, 46), fill='#2b4cff')
    else:
        im, d = canvas('#f2ebdd')
        d.ellipse(box(22, 24, 74, 76), fill='#b5603a')
        d.rectangle(box(22, 50, 74, 78), fill='#b5603a')
        d.ellipse(box(39, 37, 57, 55), fill='#e9c9b4')
        hill = bez((14, 78), (28, 64), (40, 72), (48, 64)) + bez((48, 64), (56, 56), (70, 60), (82, 78))
        d.polygon([P(*p) for p in hill], fill='#6b7a3a')
    return im.resize((size, size), Image.LANCZOS)

for n in (1, 2, 3, 4):
    for name, size, zoom in (('512', 512, 1.0), ('192', 192, 1.0), ('maskable-512', 512, 0.8),
                             ('apple-180', 180, 0.95), ('fav-64', 64, 1.1)):
        render(n, size, zoom).save(os.path.join(OUT, f'k{n}-{name}.png'), optimize=True)
print('fertig')
