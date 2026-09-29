# Kai — design resources

Source files in `assets/`: `logo-kai.png`, `kai-marketecture-relay-track.png`.

`platform-page.pdf` and `ctem.pdf` are the design exports everything here was
sampled from. They are gitignored, so they exist in your local copy but are not
published — see `.gitignore` to change that.

## Mark
A woven / knotted orb — looping tapered ribbons crossing over an implied sphere, in a
cyan-to-mint gradient, set left of a heavy navy "Kai" wordmark.

Everything on screen uses the real artwork, not an approximation: `lib/mark.js`
is traced from `assets/logo-kai.png` by `tools/trace_mark.py` (potrace over the
alpha channel). Measured against the source it scores **0.983 IoU** — 247 extra
and 27 missing pixels out of 15,880, which is edge anti-aliasing.

The gradient is sampled from the artwork too: **120°**, running
`#03C0FE` → `#28CDF7` → `#46D8F2` → `#6CE5EB` → `#AEF0EB`, cyan at the upper
right to mint at the lower left.

Because the ribbons are filled shapes rather than strokes, the "draw" move is a
wipe along that same 120° axis — the mark paints itself on in the direction its
colour runs.

## Palette

The authored values, from `design-language.json`. Nothing here is sampled.

| Token | Hex | Role |
|---|---|---|
| ink | `#080943` | wordmark navy, dark ground |
| deep | `#027FA8` | gradient start |
| blue | `#00BFFF` | handoff, stat blue |
| cyan | `#11C4FD` | primary accent |
| mint | `#8AF0E6` | gradient end |
| seafoam | `#50C7AC` | auto-remediation handoff |
| lime | `#BEFF78` | news |
| acid | `#D6FF20` | far end of the brand strip |
| grey | `#586470` | body text |
| line | `#CCD0DC` | hairlines |

`#E11D48` is used for the "without Kai" side of the comparison cut. It is not
a brand token — it is the one colour on screen the brand does not define, and
it is there because that cut needs a negative. Say the word and it goes.

## Type

- Display and numerals — **Roboto**
- Body and labels — **Wix Madefor Text**

Both are what the tile maker uses. The earlier Figtree/Inter substitution is gone.

## Mark

The authored vector, taken from `LOGO_SVG` in the tile maker and written to
`brand/kai-mark.svg` and `lib/mark.js` by `tools/extract_brand_svg.py`. It is
not a trace. Its gradient is the brand's own: `#00BFFF` → `#11C4FD` at 0.55 →
`#8AF0E6`, along the bounding-box diagonal.

Because the ribbons are filled shapes rather than strokes, the "draw" move is
a wipe along that diagonal.

## Motifs to reuse
1. **The relay rail** — thick navy horizontal line; thin grey source feeds curving in from
   the left; arrowed fork to the right, each arrow coloured by the team receiving it.
2. **Cyan ring node** — open circle, cyan stroke, hollow core. Means "runs continuously".
3. **Rounded pill / card** — navy pills for outcomes, white cards on `paper-tint`.
4. **The seven-phase wheel** — navy ring, teal-to-cyan gradient arc for the two phases
   beyond CTEM.
5. **Sankey ribbons** — tapered flows narrowing left to right as volume is removed.
6. **Gradient frame** — teal → cyan → blue → periwinkle border around product screens.
7. **Stat block** — small-caps label, oversized cyan or blue figure, grey descriptor.

## Wordmark on screen
`kai.security`

## Verbatim copy available from the supplied files
Headlines:
- "Exposure proven. Exposure closed."
- "Ranked is not the same as closed"
- "One line, two owners."
- "From days to minutes"
- "Your stack, turned into outcomes."
- "Machine-speed defense and lower costs on the path to zero"
- "Rebuilding security from first principles"
- "Find out how much of your estate has a real owner."
- "And every number here is auditable"

Descriptor candidates:
- "The Kai Autonomous Defense Platform"
- "Autonomous Exposure Remediation"

Figures (all from the supplied pages):
- 92% of assets with an accountable owner, up from four percent
- Over 90% of findings removed on exploitability before anyone triages
- Under 12 hours to resolve ownership across a quarter of a million assets
- 10M infrastructure findings triaged and validated — 3.5 hours with Kai
- 4M validated vulnerabilities driven to remediation — days with Kai
- 3M+ analyst and engineering hours saved per year across 5K images
- Without Kai: 20-30+ humans, 15-20 tools, 3-5 handoffs. With Kai: one, one, none.
- SOC 2 Type II · ISO 27001
