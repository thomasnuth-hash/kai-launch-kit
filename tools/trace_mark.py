#!/usr/bin/env python3
"""Traces the Kai mark out of assets/logo-kai.png into vector paths.

The mark's ribbons are tapered filled shapes, not uniform strokes, so an
ellipse approximation can never match it. This runs potrace over the alpha
channel and writes lib/mark.js.

Rerun only if the logo artwork changes:  python3 tools/trace_mark.py
"""
import pathlib, json
import numpy as np
import potrace
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "assets" / "logo-kai.png"
OUT  = ROOT / "lib" / "mark.js"
UP   = 4        # supersample so potrace sees clean, anti-alias-free edges

im   = Image.open(SRC).convert("RGBA")
mark = im.crop((0, 0, 204, im.height))
mark = mark.crop(mark.getchannel("A").getbbox())
W0, H0 = mark.size

big  = mark.resize((W0 * UP, H0 * UP), Image.LANCZOS)
# potracer treats zero as foreground, so the mark has to be the zeros
mask = np.array(big.getchannel("A")) < 128

bmp   = potrace.Bitmap(mask)
plist = bmp.trace(turdsize=2 * UP * UP, alphamax=1.0,
                  opticurve=True, opttolerance=0.2)

# normalise: centre on the origin, longest side 1.0
side = max(W0, H0) * UP
cx, cy = (W0 * UP) / 2, (H0 * UP) / 2
def N(p): return ((p.x - cx) / side, (p.y - cy) / side)

paths, pts = [], 0
for curve in plist:
    d = []
    sx, sy = N(curve.start_point)
    d.append(f"M{sx:.4f} {sy:.4f}")
    for seg in curve:
        ex, ey = N(seg.end_point)
        if seg.is_corner:
            cx1, cy1 = N(seg.c)
            d.append(f"L{cx1:.4f} {cy1:.4f}L{ex:.4f} {ey:.4f}")
            pts += 2
        else:
            a1, b1 = N(seg.c1); a2, b2 = N(seg.c2)
            d.append(f"C{a1:.4f} {b1:.4f} {a2:.4f} {b2:.4f} {ex:.4f} {ey:.4f}")
            pts += 1
    paths.append("".join(d) + "Z")

OUT.write_text(
 "/* The Kai mark, traced from assets/logo-kai.png by tools/trace_mark.py.\n"
 "   Coordinates are normalised: centred on (0,0), longest side 1.0, so\n"
 f"   drawing at `size` means scaling by `size`. {len(paths)} contours, {pts} segments.\n"
 "   Filled with the even-odd rule so the enclosed gaps stay open. */\n"
 f"export const MARK_PATHS = {json.dumps(paths, indent=0)};\n\n"
 "let _p = null;\n"
 "export function markPath(){\n"
 "  if (!_p){ _p = new Path2D(); for (const d of MARK_PATHS) _p.addPath(new Path2D(d)); }\n"
 "  return _p;\n"
 "}\n"
)
print(f"contours: {len(paths)}  segments: {pts}  source: {W0}x{H0}")
print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size/1024:.1f} KB)")
