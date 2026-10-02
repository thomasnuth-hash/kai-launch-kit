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

## Concept animations

A third section in the panel, alongside Editorial and Announcements:
**Concept animation** — the cycle, the funnel, the collapse. Three scenes drawn
from the collateral rather than from a number you type:

| Scene | What it shows | Source |
|---|---|---|
| CTEM cycle | Seven phases; the five everyone defines recede, the two only Kai runs carry the emphasis and close the ring | The Cycle |
| Exposure funnel | 845.4K → 101K → 10.4K → 336, only the survivor in the accent | Exposure Management |
| Days to minutes | 20-30+ / 15-20 / 3-5 against One / One / None, both sides on screen at once | Autonomous Defense Cycle |

They are `reveal` values, so they inherit the layout, the legibility pass, the
timeline and all four exporters. The section and the **Data reveal** dropdown
write the same field and cannot disagree.

Every figure and label lives in `CONCEPTS` in `brand/design-language.json` —
edit it there and inject, like the rest of the design language.

## LinkedIn Planner

A third tab. Four posts a week, three weeks planned, each week carrying one post
per pillar — CTEM, CAASM, Threat Intelligence, Autonomous Remediation — with a
goal mix of roughly two reshare, one traffic, one follow.

Each concept has its own animation, an editable headline, editable LinkedIn and
X copy, and a CTA matched to its goal. **Load into tile** pushes it into the tile
controls and renders it, so PNG, GIF and SVG export through the same path as any
other tile. Copy edits are kept in the browser, not in the file.

The bank lives in `brand/linkedin-plan.json`:

    python3 tools/sync_plan.py inject    # json -> tool
    python3 tools/sync_plan.py check     # round trip

### Hand-off to Figma

**Open still in Figma** and **Open GIF in Figma** sit next to the downloads, and
every post in the planner has a **→ Figma** button.

Figma has no public write API for canvas content, so nothing here pushes a node
into a file. What these do is put the artwork on the clipboard and open the file,
so the trip is one paste instead of a download, a Finder window and a drag.

A still prefers **SVG**, because Figma turns that back into editable vectors, and
falls back to PNG. A **GIF has to be saved and dragged** — measured in Chrome,
`image/svg+xml` and `image/png` can go on the clipboard and `image/gif` cannot.
That is a browser limit, not a missing feature.

The file it opens is editable in the **Figma file to open** field and remembered
in the browser.

### Two things to know about the copy

**Nothing is sourced from material that needs third-party permission to
reproduce.** Licensed analyst research was used only as an education tool — to
understand topics, categories, buyer sentiment and the shape of available
solutions. No analyst text is quoted, paraphrased or attributed, and no analyst
figure, quadrant or radar appears. Every number is either one of the three
cross-checked metrics or already published on kai.security, and each post names
its source.

**Automated remediation delivery is claimable as available** — ruled 2 Oct 2026,
superseding Decision #1 and the battlecard line that said never to present it as
shipped.

The reshare posts still carry no product claim, but that is a programme decision
rather than caution: goal 1 is reshares through vendor-agnostic thought
leadership, and a post that names the product does not get reshared by people who
do not work here. Product claims belong in the traffic posts.

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

Both run the same assertions. Baseline is **3182/3182 clean** — treat any
failure as a regression you introduced.

The suite now sweeps all nine reveals rather than the one the base case
happened to set, which is what took it from 1054 cases to 3182.

To check the suite still bites, point it at a deliberately broken copy:
`rendertest.html?file=_broken.html`. Dropping `headMin` from 26 to 6 should
produce 7 failures naming the tiles and the measured sizes.

## Then rebuild the hosted copy

    python3 build-artifact.py
