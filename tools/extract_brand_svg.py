#!/usr/bin/env python3
"""Pulls the real brand vectors out of the tile maker and regenerates lib/mark.js.

The tile maker carries the authored logo as SVG. That beats tracing the PNG, so
the cuts use the same geometry and the same gradient the tiles do.

    python3 tools/extract_brand_svg.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOL = ROOT / "tile-maker" / "kai-social-tile-maker.html"

def js_string(src, name):
    m = re.search(r"\bconst\s+" + name + r"\s*=\s*", src)
    if not m: raise SystemExit(f"{name}: not found")
    i = m.end(); q = src[i]
    if q not in "`'\"": raise SystemExit(f"{name}: not a plain string")
    j = i + 1
    while j < len(src):
        if src[j] == "\\": j += 2; continue
        if src[j] == q: break
        j += 1
    return src[i + 1:j]

src  = TOOL.read_text(encoding="utf-8")
logo = js_string(src, "LOGO_SVG")

(ROOT / "brand" / "kai-logo.svg").write_text(
    logo.replace('fill="COLOR"', 'fill="#080943"') + "\n", encoding="utf-8")

paths = re.findall(r"<path[^>]*/>", logo)
if not paths: raise SystemExit("no <path> in LOGO_SVG")
mark_el = paths[-1]                     # the mark is the last path of the lockup
d = re.search(r'\sd="([^"]+)"', mark_el).group(1)

def path_bbox(d, steps=48):
    """True bbox by walking the path. Bezier control points sit outside the
    curve, so taking the extremes of the raw numbers overstates it — that
    misplaces and shrinks the mark once it is normalised."""
    toks = re.findall(r"[MLHVCZmlhvcz]|-?\d*\.?\d+(?:e-?\d+)?", d)
    xs, ys, i = [], [], 0
    cx = cy = sx = sy = 0.0
    cmd = None
    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v
    while i < len(toks):
        if re.fullmatch(r"[A-Za-z]", toks[i]): cmd = toks[i]; i += 1
        if cmd in ("M", "m"):
            x, y = num(), num()
            if cmd == "m": x, y = cx + x, cy + y
            cx, cy = sx, sy = x, y; xs.append(cx); ys.append(cy); cmd = "L" if cmd == "M" else "l"
        elif cmd in ("L", "l"):
            x, y = num(), num()
            if cmd == "l": x, y = cx + x, cy + y
            cx, cy = x, y; xs.append(cx); ys.append(cy)
        elif cmd in ("H", "h"):
            x = num(); cx = cx + x if cmd == "h" else x; xs.append(cx); ys.append(cy)
        elif cmd in ("V", "v"):
            y = num(); cy = cy + y if cmd == "v" else y; xs.append(cx); ys.append(cy)
        elif cmd in ("C", "c"):
            x1, y1, x2, y2, x, y = (num() for _ in range(6))
            if cmd == "c":
                x1, y1, x2, y2, x, y = cx+x1, cy+y1, cx+x2, cy+y2, cx+x, cy+y
            for k in range(steps + 1):                      # flatten, don't guess
                t = k / steps; u = 1 - t
                xs.append(u*u*u*cx + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x)
                ys.append(u*u*u*cy + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y)
            cx, cy = x, y
        elif cmd in ("Z", "z"):
            cx, cy = sx, sy
        else:
            raise SystemExit(f"unhandled path command {cmd!r}")
    return min(xs), max(xs), min(ys), max(ys)

minx, maxx, miny, maxy = path_bbox(d)
side = max(maxx - minx, maxy - miny)
cx, cy = (minx + maxx) / 2, (miny + maxy) / 2

# the gradient the brand defines for the mark, from MARK_GRAD_SVG
grad = re.search(r'id="kg2"(.*?)</linearGradient>', src, re.S)
stops = re.findall(r'offset="([\d.]+)"\s+stop-color="([^"]+)"', grad.group(1)) if grad else []
if not stops: raise SystemExit("could not read the kg2 gradient")

(ROOT / "brand" / "kai-mark.svg").write_text(
    f'<svg viewBox="{minx:.3f} {miny:.3f} {maxx-minx:.3f} {maxy-miny:.3f}" '
    f'xmlns="http://www.w3.org/2000/svg">\n'
    f'  <defs><linearGradient id="kg2" x1="0" y1="0" x2="1" y2="1">\n'
    + "".join(f'    <stop offset="{o}" stop-color="{c}"/>\n' for o, c in stops)
    + '  </linearGradient></defs>\n'
    + f'  <path fill="url(#kg2)" d="{d}"/>\n</svg>\n', encoding="utf-8")

(ROOT / "lib" / "mark.js").write_text(
 "/* The Kai mark — the authored vector, lifted from the tile maker's LOGO_SVG\n"
 "   by tools/extract_brand_svg.py. Not a trace of the PNG.\n"
 "   Normalised: centred on (0,0), longest side 1.0, so drawing at `size`\n"
 "   means scaling by `size`. MARK_GRAD is the gradient the brand defines for\n"
 "   it, along the bounding-box diagonal. */\n"
 f"export const MARK_VIEWBOX = {json.dumps([minx, miny, maxx, maxy])};\n"
 f"export const MARK_GRAD = {json.dumps([[float(o), c] for o, c in stops])};\n"
 f"export const MARK_D = {json.dumps(d)};\n"
 f"const N = {side!r}, CX = {cx!r}, CY = {cy!r};\n\n"
 "let _p = null;\n"
 "export function markPath(){\n"
 "  if (!_p){\n"
 "    const m = new DOMMatrix().scale(1 / N, 1 / N).translate(-CX, -CY);\n"
 "    _p = new Path2D(); _p.addPath(new Path2D(MARK_D), m);\n"
 "  }\n"
 "  return _p;\n"
 "}\n")

print(f"  brand/kai-logo.svg   {len(logo)} chars, {len(paths)} paths")
print(f"  brand/kai-mark.svg   bbox {minx:.1f},{miny:.1f} → {maxx:.1f},{maxy:.1f}  side {side:.1f}")
print(f"  lib/mark.js          gradient {' → '.join(c for _, c in stops)}")
