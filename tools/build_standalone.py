#!/usr/bin/env python3
"""Flattens the tile generator into one self-contained file.

kai-tile-generator.html has no imports, no stylesheet link and no module
loading, so it runs straight off the file system — double-click it, or drop it
anywhere and bookmark it. Rerun this after editing lib/ or tiles.html.
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ("https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900"
         "&family=Inter:wght@400;500;600;700&display=swap")

def strip_module(src):
    src = re.sub(r"import\s+[\s\S]*?from\s+'[^']+';\n?", "", src)
    src = re.sub(r"^export\s+", "", src, flags=re.M)
    return src.strip()

HEADER = r"""/* Kai — social tile generator. Self-contained: no imports, no server.

   Built by tools/build_standalone.py from lib/kai.js, lib/scenes.js,
   lib/tileart.js and tiles.html. If you still have that folder, edit the
   source and rebuild — this file gets overwritten.

   If this file is all you have, editing it directly is fine. Search for:
     const K = {          the palette. One line, every colour.
     const RIBBONS        the mark's four ribbons
     CITIES = {           launch cities and their block grids. Add one here,
                          then add a landmark cue next to operaHouse.
     const FORMATS        tile sizes
     const PRESETS        the eight presets, one per headline
     const CUTS           links to the video cuts
     function drawTile    layout: where the art, tag, headline and subline go
*/"""

# kai.js imports copy.js with aliases; flattening drops them, so restore
# the names it expects.
ALIASES = "\nconst setCopy = set, resetCopy = reset;\n"

js = "\n\n".join(strip_module((ROOT / f).read_text())
                 for f in ("lib/copy.js", "lib/mark.js", "lib/kai.js", "lib/scenes.js", "lib/tileart.js"))

# Everything lands in one scope, so a top-level name declared twice is a
# SyntaxError at load. Catch it here rather than in the browser.
def collisions(*sources):
    seen, dupes = {}, []
    for name, src in sources:
        for m in re.finditer(r"^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)", src, re.M):
            n = m.group(1)
            if n in seen and seen[n] != name:
                dupes.append(f"{n} (in {seen[n]} and {name})")
            seen[n] = name
    return dupes

tiles = (ROOT / "tiles.html").read_text()
page_css   = re.search(r"<style>([\s\S]*?)</style>", tiles).group(1)
page_js    = strip_module(re.search(r'<script type="module">([\s\S]*?)</script>', tiles).group(1))

dupes = collisions(("lib/", js), ("tiles.html", page_js))
if dupes:
    raise SystemExit("Name collision — rename one of these before building:\n  "
                     + "\n  ".join(dupes))
body       = re.search(r"<body>([\s\S]*?)<script", tiles).group(1).strip()

shared_css = (ROOT / "lib/kai.css").read_text()
shared_css = re.sub(r"^@import[^\n]*\n?", "", shared_css, flags=re.M)   # hoisted above

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kai — social tile generator</title>
<style>
@import url('{FONTS}');
{shared_css}
{page_css}
</style>
</head>
<body>
{body}
<script>
{HEADER}
(function(){{
"use strict";
{js}
{ALIASES}
{page_js}
}})();
</script>
</body>
</html>
"""
out = ROOT / "kai-tile-generator.html"
out.write_text(html)
print(f"wrote {out.name}  ({out.stat().st_size/1024:.0f} KB)")
