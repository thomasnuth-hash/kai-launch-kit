# Kai — design resources

Source files in `assets/`: `logo-kai.png`, `kai-marketecture-relay-track.png`.

`platform-page.pdf` and `ctem.pdf` are the design exports everything here was
sampled from. They are gitignored, so they exist in your local copy but are not
published — see `.gitignore` to change that.

## Mark
A woven / knotted orb — four looping ribbons crossing over an implied sphere, drawn in a
teal-to-cyan gradient, set left of a heavy navy "Kai" wordmark.

## Palette
Sampled from the native PNG exports (see `tokens.css`).

| Token | Hex | Role |
|---|---|---|
| ink | `#080844` | wordmark navy, the one-record rail, dark ground |
| ink-2 | `#0C1838` | secondary dark |
| paper | `#FFFFFF` | |
| paper-tint | `#F0F8FC` | pale section ground |
| cyan | `#00BCFC` | primary accent — "runs continuously" |
| teal | `#74E8E8` | far end of the mark gradient |
| blue | `#1C58D8` | stat blue, manual-remediation handoff |
| periwinkle | `#8098FC` | auto-remediation handoff |
| crimson | `#E11D48` | emphasis / "without Kai" |
| grey | `#586470` | body text |
| line | `#CCD0DC` | hairlines, source feeds |

**Crimson is approximated.** The red in `ctem.pdf` rasterises to `#C43E64`, which is a
colour-managed render rather than the source value. Give me the real hex and it is a
one-token swap.

## Type
The licensed faces were not supplied. Substituted:
- Display — **Figtree** (geometric grotesk, double-storey `a`, rounded terminals; the
  closest free match to the headline face in both PDFs). Fallbacks: Gilroy, Hanken Grotesk.
- Body — **Inter**.

Name the real faces and both are one-line swaps.

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
