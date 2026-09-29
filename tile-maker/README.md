# Social Tile Maker

Blog thumbnails, stat tiles, announcements and carousels — brand-locked.
Single self-contained page: open `kai-social-tile-maker.html`.

## The design language lives outside the tool

`brand/design-language.json` is the source of truth for themes, washes, ramps,
formats, motifs, icons, announcement categories and presets — 13 blocks, all
pure data. The tool is *generated* from it:

    python3 tools/design_language.py extract   # tool -> json
    python3 tools/design_language.py inject    # json -> tool
    python3 tools/design_language.py check     # round trip, changes nothing

Edit the JSON, inject, run the suite. The tool stays one self-contained file,
so it still works offline and can be handed to anyone — it just isn't where
the design language is authored any more.

`tools/jsliteral.py` refuses to move anything containing a function, an arrow
or a `${}` interpolation into the token file. If a block stops being pure
data, extraction fails loudly rather than silently dropping behaviour.

## Files

```
kai-social-tile-maker.html   the tool — generated design language, hand-written render code
artifact-build.html          hosted build, generated
build-artifact.py            regenerates artifact-build.html
rendertest.js                the render suite (Node or browser)
rendertest.html              browser runner for the suite
kai-stat-tile-maker.html     the earlier, smaller stat-only tool
spec/                        the prompts it was written against
```

## Before you change anything, run the suite

It pushes every category × shape × variant through `drawFrame` against a
recording canvas and asserts the layout numerically — nothing overprints,
nothing runs off the tile, no text below the legibility floor, the button
stays clean, the source line only appears on Report.

**In the browser** (no installs):

    python3 -m http.server 4340
    open http://localhost:4340/tile-maker/rendertest.html

**Under Node**, if you have it:

    node rendertest.js

Both run the same assertions. Baseline is **1054/1054 clean** — treat any
failure as a regression you introduced.

To check the suite still bites, point it at a deliberately broken copy:
`rendertest.html?file=_broken.html`. Dropping `headMin` from 26 to 6 should
produce 7 failures naming the tiles and the measured sizes.

## Then rebuild the hosted copy

    python3 build-artifact.py
