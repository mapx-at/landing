#!/usr/bin/env python3 -I
"""Erzeugt die Hero-Illustration (stilisierte Höhenlinien, Parzellen, Straßen, Fluss) als SVG.
Rein generativ, keine fremden Daten. Aufruf: python3 -I gen-hero.py > hero-map.svg"""
import math, random
W, H = 1600, 900
random.seed(7)
peaks = [(1180, 330, 300, 1.0), (560, 250, 210, .75), (1420, 700, 230, .8), (300, 760, 200, .6)]

def ring(cx, cy, r, k, ph):
    pts = []
    n = 120
    for i in range(n + 1):
        a = 2 * math.pi * i / n
        m = 1 + .10 * math.sin(3 * a + ph + k * .35) + .06 * math.sin(5 * a + ph * 2) + .04 * math.sin(9 * a + k)
        pts.append((cx + r * m * 1.25 * math.cos(a), cy + r * m * .8 * math.sin(a)))
    return "M" + " L".join("%.1f,%.1f" % p for p in pts) + "Z"

out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid slice">' % (W, H),
       '<defs><radialGradient id="g" cx="70%" cy="35%" r="80%"><stop offset="0" stop-color="#1b2a5c"/><stop offset="1" stop-color="#0a0f20"/></radialGradient></defs>',
       '<rect width="%d" height="%d" fill="url(#g)"/>' % (W, H)]
# Parzellen (unten links): verzerrtes Gitter
out.append('<g fill="none" stroke="#7d93ff" stroke-opacity=".22" stroke-width="1">')
for i in range(14):
    y0 = 520 + i * 28
    pts = [(x, y0 + 14 * math.sin(x / 140 + i * .7) + (x * .06)) for x in range(-20, 760, 40)]
    out.append('<path d="M%s"/>' % " L".join("%.0f,%.0f" % p for p in pts))
for j in range(22):
    x0 = -20 + j * 36
    pts = [(x0 + (y - 500) * .12 + 10 * math.sin(y / 90 + j), y) for y in range(500, 920, 30)]
    out.append('<path d="M%s"/>' % " L".join("%.0f,%.0f" % p for p in pts))
out.append('</g>')
# Höhenlinien
for (cx, cy, r0, s) in peaks:
    ph = cx * .01
    for k in range(1, 15):
        r = r0 * k / 14 * s + 10
        major = k % 5 == 0
        out.append('<path d="%s" fill="none" stroke="#5eead4" stroke-opacity="%s" stroke-width="%s"/>' % (ring(cx, cy, r, k, ph), ".55" if major else ".22", "1.6" if major else "1"))
# Fluss
out.append('<path d="M-20,640 C260,560 420,700 700,600 S1100,520 1250,610 S1500,760 1640,700" fill="none" stroke="#3b82f6" stroke-opacity=".75" stroke-width="7" stroke-linecap="round"/>')
# Straßen
out.append('<g fill="none" stroke-linecap="round">')
for d, w, o in [("M-20,300 C200,340 380,420 640,470 S1000,560 1640,430", 3.5, .55), ("M300,-20 C340,200 460,380 520,560 S640,820 700,920", 2.5, .4), ("M900,-20 C960,180 1040,300 1100,480 S1180,780 1260,920", 2.5, .4), ("M-20,820 C300,760 600,800 900,740 S1400,860 1640,820", 2, .35)]:
    out.append('<path d="%s" stroke="#f5d9a0" stroke-opacity="%s" stroke-width="%s"/>' % (d, o, w))
out.append('</g>')
# Orte
for (x, y, r) in [(640, 470, 6), (1100, 480, 5), (520, 560, 4), (1250, 610, 4), (300, 300, 4)]:
    out.append('<circle cx="%d" cy="%d" r="%d" fill="#0a0f20" stroke="#eceef2" stroke-width="2"/>' % (x, y, r))
# Marker
out.append('<g transform="translate(1180 330)"><circle r="26" fill="#2346d8" fill-opacity=".25"/><circle r="9" fill="#7d93ff" stroke="#fff" stroke-width="3"/></g>')
out.append('</svg>')
print("\n".join(out))
