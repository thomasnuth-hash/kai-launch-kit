#!/usr/bin/env python3
"""Generates cuts/*.html from a shared shell.

To add a launch city: append to CITIES, rerun `python3 tools/build_cuts.py`,
then add the city to the ART list in tiles.html.
"""
import os, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kai — __TITLE__</title>
<link rel="stylesheet" href="../lib/kai.css">
</head>
<body class="stage">
  <div class="frame"><canvas id="stage"></canvas></div>
  <div id="bar"></div>
  <p class="note">__NOTE__</p>
<script type="module">
import * as Kai from '../lib/kai.js';
import * as S from '../lib/scenes.js';
import { COPY } from '../lib/copy.js';
const { K, W, H, TL, at, seg, clamp01, lerp, draw, pop, enter, easeOut, easeBoth,
        fade, font, grad, roundRect, textBlock, eyebrow, mark, rail, ringNode,
        feed, arrow, pill, card, ribbon, isoBlock, ground, signal, caption,
        endCard, scene, mount, bar } = Kai;

document.getElementById('bar').outerHTML = bar();

__BODY__

mount({ slug:'__SLUG__', title:'__TITLE__', render });
</script>
</body>
</html>
"""

# The descriptor is editable in the UI — the shipped default lives in
# lib/copy.js (DEFAULTS.descriptor). Cuts read COPY.descriptor at render time.
DESCRIPTOR = "The Kai Autonomous Defense Platform"

CITY_BODY = """
const CITY   = '__CITY__';
const BLOCKS = __BLOCKS__;
const GEO    = { ox: W/2 - 32 + __DX__, oy: 1050, u: 100 };
const PINS   = [1,3,5,8].map(i => BLOCKS[i]).map(b => [b[0]+b[2]/2, b[1]+b[3]/2, b[4]]);

function render(c, t){
  ground(c, t);
  signal(c, t, COPY.descriptor);

  // section eyebrow, held for the three beats
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const e = enter(seg(t, TL.b1[0]+0.15, 0.5), 18);
    eyebrow(c, 'Autonomous Exposure Remediation', { x: W/2, y: 330, size: 27, color: K.cyan,
      align: 'center', alpha: e.o });
  });

  // the estate: drawn in beat 1, held through beat 3
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    S.skyline(c, { p: at(t,'b1'), blocks: BLOCKS, landmark: S.__LANDMARK__, ...GEO });
  });

  // beat 2: the backlog sitting on top of it
  scene(c, t, TL.b2[0], TL.b2[0]+TL.b2[1]+0.25, () => {
    S.exposurePins(c, { p: at(t,'b2'), pts: PINS, ...GEO });
  }, { fadeOut: 0.55 });

  // beat 3: each one closed
  scene(c, t, TL.b3[0], TL.b3[0]+TL.b3[1], () => {
    S.resolvePins(c, { p: at(t,'b3'), pts: PINS, ...GEO });
  });

  caption(c, t, 'b1', 'Every enterprise has more findings than it can act on.', { size: 62 });
  caption(c, t, 'b2', '*Ranked* is not the same as closed.', { size: 78, accent: K.crimson });
  caption(c, t, 'b3', 'Now in *' + CITY + '*.', { size: 100 });

  endCard(c, t, 'Exposure proven. Exposure closed.');
}
"""

CITIES = [
    dict(slug="sydney", city="Sydney", landmark="operaHouse", dx=30,
         blocks=[[-2.6,-0.4,1,1,2.2],[-1.5,-1.1,1,1,3.4],[-0.4,-1.8,1,1,4.9],
                 [0.7,-1.1,1,1,3.0],[1.8,-0.4,1,1,2.4],[-2.0,0.7,1,1,1.6],
                 [-0.9,0.3,1,1,2.7],[0.2,-0.3,1,1,3.8],[1.3,0.3,1,1,2.0],
                 [2.4,0.9,1,1,1.4]]),
    dict(slug="san-diego", city="San Diego", landmark="surfboard", dx=40,
         blocks=[[-2.4,-0.3,1,1,1.8],[-1.3,-0.9,1,1,2.9],[-0.2,-1.6,1,1,4.2],
                 [0.9,-1.0,1,1,3.3],[2.0,-0.3,1,1,2.1],[-1.9,0.8,1,1,1.4],
                 [-0.8,0.4,1,1,2.2],[0.3,-0.2,1,1,3.1],[1.4,0.4,1,1,1.8],
                 [2.5,1.0,1,1,1.2]]),
    dict(slug="san-jose", city="San Jose", landmark="steppedTowers", dx=0,
         blocks=[[-2.5,-0.2,1,1,1.7],[-1.4,-0.8,1,1,2.6],[-0.3,-1.4,1,1,3.4],
                 [0.8,-0.8,1,1,2.8],[1.9,-0.2,1,1,2.0],[-2.0,0.9,1,1,1.3],
                 [-0.9,0.5,1,1,2.0],[0.2,-0.1,1,1,2.7],[1.3,0.5,1,1,1.7],
                 [2.4,1.1,1,1,1.1]]),
]

CUTS = []
for ct in CITIES:
    body = (CITY_BODY
            .replace("__CITY__", ct["city"])
            .replace("__BLOCKS__", json.dumps(ct["blocks"]))
            .replace("__LANDMARK__", ct["landmark"])
            .replace("__DX__", str(ct["dx"]))
            .replace("__DESCRIPTOR__", DESCRIPTOR))
    CUTS.append(dict(slug=ct["slug"], title="Now in " + ct["city"], body=body,
                     note="Launch city cut &middot; 9:16 &middot; 17s &middot; silent. "
                          "Skyline is an abstract wireframe, not a survey."))

# ---------------------------------------------------------------- product cuts

RANKED = """
const XA = 70, XB = 430, XC = 880, XD = 1012;

function flow(c, t){
  const p1 = at(t,'b1'), p2 = at(t,'b2'), p3 = at(t,'b3');

  // the whole queue arrives
  ribbon(c, XA, 560, 520, XB, 560, 520, p1, { color: fade(K.cyan,.18) });

  if (p2 > 0){
    // not reachable — the bulk of it, drifting away
    ribbon(c, XB, 560,  380, XC, 470, 230, p2, { color: fade(K.line,.62) });
    // what survives to be proven
    ribbon(c, XB, 940,   80, XC, 840,  58, p2, { color: fade(K.cyan,.9) });
    // no known exploit
    ribbon(c, XB, 1020,  60, XC, 1120, 80, p2, { color: fade(K.line,.45) });
  }
  if (p3 > 0) ribbon(c, XC, 840, 58, XD, 852, 28, p3, { color: K.cyan });
}

function render(c, t){
  ground(c, t);
  signal(c, t, COPY.descriptor);

  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => flow(c, t));

  // the queue keeps its number on screen for the whole cut
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    S.statBig(c, { p: seg(t, TL.b1[0]+0.2, 0.6), x: 74, y: 492, value: '845.4K',
                   label: 'IN THE QUEUE', size: 132 });
  });

  // what leaves, labelled where it leaves
  scene(c, t, TL.b2[0]+0.3, TL.b3[0]+TL.b3[1]-0.15, () => {
    const e1 = enter(seg(t, TL.b2[0]+0.45, 0.6), 22);
    textBlock(c, '744.4K not reachable', { x: 1006, y: 432, maxW: 420,
      size: 34, weight: 700, family: K.body, color: K.grey, align: 'right', alpha: e1.o });
    const e2 = enter(seg(t, TL.b2[0]+0.7, 0.6), 22);
    textBlock(c, '90.6K no known exploit', { x: 1006, y: 1262, maxW: 420,
      size: 34, weight: 700, family: K.body, color: K.grey, align: 'right', alpha: e2.o });
  });

  scene(c, t, TL.b3[0]+0.2, TL.b3[0]+TL.b3[1], () => {
    const p = at(t,'b3');
    pill(c, 120, 1330, 400, 132, clamp01((p-0.15)/0.45), { label: '336 chain-critical', size: 34 });
    pill(c, 560, 1330, 400, 132, clamp01((p-0.32)/0.45), { label: '129 chains broken',  size: 34, bg: K.blue });
  });

  caption(c, t, 'b1', 'The list gets better ordered every year.', { size: 64, bottom: 1810 });
  caption(c, t, 'b2', 'Over *90%* removed before anyone triages.', { size: 70, bottom: 1810 });
  caption(c, t, 'b3', '*Ranked* is not the same as closed.', { size: 80, bottom: 1810 });

  endCard(c, t, 'Exposure proven. Exposure closed.');
}
"""

RELAY = """
const RX = 330, RTOP = 540, RBOT = 1108;
const SRC   = [['TVM',60],['EDR',296],['CNAPP',532],['Threat Intel',768]];
const NODES = [[690,'Exposures'],[858,'Assets & Owners'],[1026,'Remediation Planning']];
const FORKS = [
  [1200, K.cyan, 'Detection & Threat Hunting'],
  [1332, K.blue, 'Manual Remediation'],
  [1464, K.seafoam, 'Auto Remediation'],
];

function render(c, t){
  ground(c, t);
  signal(c, t, COPY.descriptor);


  // section eyebrow, held for the three beats
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const e = enter(seg(t, TL.b1[0]+0.15, 0.5), 18);
    eyebrow(c, 'Security owns the workflow, end to end', { x: W/2, y: 306, size: 25, color: K.cyan,
      align: 'center', alpha: e.o });
  });

  // beat 1 — every source you already run, into one record
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const p = at(t,'b1');
    SRC.forEach(([label, x], i) => {
      const lp = clamp01((p - i*0.08)/0.42); if (lp <= 0) return;
      S.sourceChip(c, x, 372, 210, 74, label, lp);
      S.feedDown(c, x+105, 450, RX, RTOP-8, clamp01((lp-0.35)/0.65), { color: K.line, w: 5 });
    });
    const rp = clamp01((p - 0.32)/0.62);
    const yEnd = RTOP + (RBOT-RTOP)*draw(rp);
    if (yEnd > RTOP){
      c.save(); c.strokeStyle = K.ink; c.lineWidth = 22; c.lineCap = 'round';
      c.beginPath(); c.moveTo(RX, RTOP); c.lineTo(RX, yEnd); c.stroke(); c.restore();
    }
  });

  // beat 2 — the stages that never stop
  scene(c, t, TL.b2[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const p = at(t,'b2');
    NODES.forEach(([y,label], i) => {
      const lp = clamp01((p - i*0.13)/0.5);
      ringNode(c, RX, y, 38, lp, { w: 11 });
      const e = enter(lp, 20);
      textBlock(c, label, { x: 412, y: y+15, maxW: 600, size: 44, weight: 700,
        color: K.ink, alpha: e.o });
    });
  });

  // beat 3 — one handoff, coloured by who receives it
  scene(c, t, TL.b3[0], TL.b3[0]+TL.b3[1], () => {
    const p = at(t,'b3');
    FORKS.forEach(([y, col, label], i) => {
      const lp = clamp01((p - i*0.11)/0.55);
      arrow(c, RX, RBOT, 452, y, lp, { color: col, w: 14, head: 24 });
      pill(c, 480, y-58, 528, 116, clamp01((lp-0.4)/0.6),
           { bg: K.ink, label, size: 34 });
    });
  });

  caption(c, t, 'b1', 'Every scanner you already run, reconciled to *one record*.', { size: 58, bottom: 1840 });
  caption(c, t, 'b2', 'Triage and context, *continuous*.', { size: 72, bottom: 1830 });
  caption(c, t, 'b3', '*One* handoff, and it is only the change.', { size: 60, bottom: 1840 });

  endCard(c, t, 'One line, two owners.');
}
"""

DAYS = """
const WITHOUT = [['20-30+','humans involved'],['15-20','tools in the chain'],['3-5','cross-team handoffs']];
const WITH    = [['One','agentic platform'],['One','tool in the chain'],['None','cross-team handoffs']];

function render(c, t){
  ground(c, t);
  signal(c, t, COPY.descriptor);


  // section eyebrow, held for the three beats
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const e = enter(seg(t, TL.b1[0]+0.15, 0.5), 18);
    eyebrow(c, 'The Autonomous Defense Cycle', { x: W/2, y: 330, size: 27, color: K.cyan,
      align: 'center', alpha: e.o });
  });

  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    // the crimson side steps back once Kai is on screen
    const dim = 1 - 0.62*easeOut(seg(t, TL.b3[0], 0.55));
    c.save(); c.globalAlpha = dim;
    S.compareColumn(c, { p: at(t,'b1'), x: 74, w: 932, top: 400, rows: WITHOUT,
      accent: K.crimson, headline: 'Without Kai', sub: 'Days to weeks' });
    c.restore();
  });

  scene(c, t, TL.b2[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    S.compareColumn(c, { p: at(t,'b2'), x: 74, w: 932, top: 862, rows: WITH,
      accent: K.blue, headline: 'With Kai', sub: 'Minutes' });
  });

  scene(c, t, TL.b3[0]+0.25, TL.b3[0]+TL.b3[1], () => {
    const p = clamp01((at(t,'b3') - 0.15)/0.5);
    pill(c, 74, 1340, 932, 118, p,
      { bg: K.ink, label: 'Context resolves once, before the fork', size: 35 });
  });

  caption(c, t, 'b1', 'Two teams rebuild the same context, then reconcile.', { size: 56, bottom: 1810 });
  caption(c, t, 'b2', 'With Kai the context resolves *once*.', { size: 62, bottom: 1800 });
  caption(c, t, 'b3', 'From days to *minutes*.', { size: 86, bottom: 1790 });

  endCard(c, t, 'One record, shared by every team.');
}
"""

OWNER = """
function render(c, t){
  ground(c, t);
  signal(c, t, COPY.descriptor);


  // section eyebrow, held for the three beats
  scene(c, t, TL.b1[0], TL.b3[0]+TL.b3[1]-0.15, () => {
    const e = enter(seg(t, TL.b1[0]+0.15, 0.5), 18);
    eyebrow(c, 'Cyber Asset Attack Surface Management', { x: W/2, y: 330, size: 27, color: K.cyan,
      align: 'center', alpha: e.o });
  });

  // beat 1 — the estate as it arrives
  scene(c, t, TL.b1[0], TL.b2[0]+0.3, () => {
    S.assetRows(c, { p: at(t,'b1'), x: 110, y: 560, w: 860, n: 6, ownedFrom: 0 });
  }, { fadeOut: 0.5 });

  // beats 2-3 — rebuilt from evidence
  scene(c, t, TL.b2[0]+0.3, TL.b3[0]+TL.b3[1]-0.15, () => {
    const p = t < TL.b3[0] ? seg(t, TL.b2[0]+0.3, TL.b2[1]-0.3) : 1;
    S.ownerRing(c, { p, x: W/2, y: 830, r: 210, from: 0.04, to: 0.92 });
    const e = enter(seg(t, TL.b2[0]+0.5, 0.6), 22);
    eyebrow(c, 'accountable owner', { x: W/2, y: 1130, size: 26, color: K.grey,
      align: 'center', alpha: e.o*0.9 });
  });

  scene(c, t, TL.b3[0]+0.2, TL.b3[0]+TL.b3[1], () => {
    const p = at(t,'b3');
    card(c, 110, 1230, 410, 168, clamp01((p-0.1)/0.45), { bg: K.tint, stroke: null });
    card(c, 560, 1230, 410, 168, clamp01((p-0.25)/0.45), { bg: K.tint, stroke: null });
    const a = easeOut(clamp01((p-0.25)/0.45)), b = easeOut(clamp01((p-0.4)/0.45));
    textBlock(c, '250,000', { x: 315, y: 1320, maxW: 380, size: 58, weight: 900,
      color: K.blue, align: 'center', alpha: a });
    textBlock(c, 'assets in scope', { x: 315, y: 1364, maxW: 380, size: 27, weight: 500,
      family: K.body, color: K.grey, align: 'center', alpha: a });
    textBlock(c, 'Under 12 hrs', { x: 765, y: 1320, maxW: 380, size: 58, weight: 900,
      color: K.blue, align: 'center', alpha: b });
    textBlock(c, 'to resolve ownership', { x: 765, y: 1364, maxW: 380, size: 27, weight: 500,
      family: K.body, color: K.grey, align: 'center', alpha: b });
  });

  caption(c, t, 'b1', '*Four percent* of assets had an accountable owner.', { size: 60, accent: K.crimson });
  caption(c, t, 'b2', 'Rebuilt from evidence, not from the configuration record.', { size: 54, bottom: 1830 });
  caption(c, t, 'b3', '*92%*, in under twelve hours.', { size: 78, bottom: 1810 });

  endCard(c, t, 'Find out how much of your estate has a real owner.');
}
"""

for slug, title, body, note in [
    ("ranked-not-closed", "Ranked is not the same as closed", RANKED,
     "Product cut &middot; every figure is from your Exposure Management view."),
    ("one-line-two-owners", "One line, two owners", RELAY,
     "Product cut &middot; the Relay Track marketecture, vertical for 9:16."),
    ("days-to-minutes", "From days to minutes", DAYS,
     "Product cut &middot; counts from the Autonomous Defense Cycle."),
    ("estate-owner", "92% have an owner", OWNER,
     "Product cut &middot; ownership figures are from a Fortune 50 energy company."),
]:
    CUTS.append(dict(slug=slug, title=title,
                     body=body.replace("__DESCRIPTOR__", DESCRIPTOR), note=note))

out = ROOT / "cuts"
out.mkdir(exist_ok=True)
for cut in CUTS:
    html = (SHELL.replace("__TITLE__", cut["title"])
                 .replace("__SLUG__", cut["slug"])
                 .replace("__NOTE__", cut["note"])
                 .replace("__BODY__", cut["body"]))
    (out / (cut["slug"] + ".html")).write_text(html)
    print("wrote cuts/" + cut["slug"] + ".html")

(ROOT / "cuts" / "index.json").write_text(json.dumps(
    [{"slug": c["slug"], "title": c["title"]} for c in CUTS], indent=2))
