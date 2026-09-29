# Kai — launch kit

Seven 9:16 social cuts and a social tile generator, built from the brand you
supplied: `logo-kai.png`, the Relay Track marketecture, the platform page and
the CTEM page.

**Live:** <https://thomasnuth-hash.github.io/kai-launch-kit/>

**Locally:** double-click `preview.command`. It serves the folder and opens a
browser; close the window to stop.

**To change something:** edit, then double-click `build.command`, then commit
and push in GitHub Desktop. Full steps, including first-time setup and a table
of what to edit for what, are in [PUBLISHING.md](PUBLISHING.md).

## What is here

```
index.html        the hub: the tile maker, every cut, the design resources
tile-maker/       the Social Tile Maker — the main tool, see its own README
kai-tile-generator.html   the generator, self-contained — bookmark this one
tiles.html        the same generator, as modules against lib/
cuts/*.html       seven video cuts, one file each
lib/kai.js        the render engine: tokens, motion, primitives, the runner
lib/scenes.js     reusable scenes — skyline, landmark cues, relay, Sankey, rings
lib/tileart.js    the three art options a tile can use
lib/mark.js       the Kai mark, traced from the artwork (generated)
brand/            tokens.css and brand-notes.md
assets/           the files you sent, unchanged
tools/build_cuts.py       regenerates cuts/ from one shared shell
tools/build_standalone.py flattens the generator into the single file
tools/trace_mark.py       re-traces lib/mark.js from assets/logo-kai.png
build.command             double-click: runs both of the above
preview.command           double-click: serves the folder and opens a browser
PUBLISHING.md             how to publish and how to update it
```

## The cuts

| Cut | Closes on |
|---|---|
| Now in Sydney / San Diego / San Jose | Exposure proven. Exposure closed. |
| Ranked is not the same as closed | Exposure proven. Exposure closed. |
| One line, two owners | One line, two owners. |
| From days to minutes | One record, shared by every team. |
| 92% have an owner | Find out how much of your estate has a real owner. |

Every cut is 1080×1920, 17 seconds, silent, and runs the same structure:
signal (3s) → three beats (3.8s each) → end card (2.6s). The only moves are
**enter**, **draw** and **pop**. No text is under 24px, and no cut uses more
than two background colours.

Each page has **Pause / Loop / scrub / Record / Still @2x**. Record captures one
full pass and downloads it — MP4 where the browser supports it (Safari), WebM
otherwise (Chrome). Still @2x writes a 2160×3840 PNG of the current frame. Ask
and I will add a GIF export.

## The tile generator

> **Superseded.** `tile-maker/kai-social-tile-maker.html` is the tool to use —
> more capable, and it carries the real brand SVGs. What follows describes the
> earlier generator, kept because the seven video cuts share its render engine.

**`kai-tile-generator.html` is the one to keep.** Everything is inlined — styles,
engine, scenes, art — so it is a single file with no imports and no module
loading. Double-click it, or drop it anywhere and bookmark it; no server needed.
Keep it next to the `cuts/` folder if you want the video links at the bottom of
the panel to resolve.

`tiles.html` is the same tool built as ES modules against `lib/`. Edit that one
(or `lib/`), then run `python3 tools/build_standalone.py` to refresh the
single file.

Eight presets, one per headline. Formats 9:16, 4:5, 1:1, 16:9 and
1.91:1. Art options: city skyline (any of the three cities), relay rail, Sankey
flow. Toggles for overlay on/off and light/dark ground. Headline, subline and
corner tag are editable, and `*asterisks*` set a word in the emphasis colour.
Saved tiles live in the browser; Download PNG writes at full size.

## Adding a launch city

1. Append an entry to `CITIES` in `tools/build_cuts.py` (slug, city, landmark
   function, block grid).
2. If it needs a new landmark cue, add it to `lib/scenes.js` next to
   `operaHouse` and `surfboard`, using the shared `cue()` frame.
3. Add the city to `CITIES` in `lib/tileart.js` so it shows in the generator.
4. `python3 tools/build_cuts.py`, then add the card to `index.html`.

## Copy

Everything on screen is lifted from the files you supplied — the platform page,
the CTEM page and the marketecture. Nothing was written for these cuts. The
figures (845.4K, 744.4K, 90.6K, 336, 129, 92%, 250,000, under twelve hours,
20-30+ / 15-20 / 3-5 against one / one / none) all come from those pages, and
the ownership figures carry your own footnote: a Fortune 50 energy company.

No proof or social-proof cut was built.

## Copy that is still moving

The **descriptor** — the line under the mark on all seven cuts — is editable in
the interface. There is a field on the hub and on every cut page; set it in one
place and all seven follow, including anything you record or export.

That override lives in your browser only, so it costs nothing to try a wording
and it never shows up as a commit. It also means colleagues do not see it. When
a line is settled, change `DEFAULTS.descriptor` in `lib/copy.js` and commit —
that is the version everyone gets.

Adding another editable line is two lines in `lib/copy.js`.

## The brand

Palette, both typefaces and the mark all come from the tile maker, which is
brand-locked to the marketing site — so the cuts and the tiles draw from one
source.

- Ink `#080943`, and the gradient family `#027FA8 · #00BFFF · #11C4FD ·
  #8AF0E6 · #50C7AC · #BEFF78 · #D6FF20`
- **Roboto** for display and numerals, **Wix Madefor Text** for body
- The mark is the authored vector from `LOGO_SVG`, not a trace, with the
  brand's own gradient

`#E11D48` is the one colour on screen the brand doesn't define. It is used for
the "without Kai" side of the comparison cut, which needs a negative. Say the
word and it goes.

See `brand/README.md` for how the token files work.

## Assumption worth flagging

You asked to keep the city cuts but did not name the cities. I built Sydney and
San Diego — the two examples in your own brief — plus San Jose, from the address
in your footer. Swapping or adding cities is the four-step recipe above.
