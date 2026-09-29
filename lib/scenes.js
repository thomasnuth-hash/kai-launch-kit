/* Kai launch kit — reusable scenes.
   Everything here is geometric: no photography, no generated imagery. */
import {
  K, W, H, clamp01, lerp, seg, draw, pop, enter, easeOut, easeBoth,
  fade, font, grad, roundRect, textBlock, eyebrow, wrap,
  mark, rail, ringNode, feed, arrow, pill, card, ribbon, isoBlock
} from './kai.js';

/* ---------- isometric city ---------- */
/* blocks: [gx, gy, w, d, h] on a small grid. Drawn back to front. */
export function skyline(c, {p, blocks, ox=W/2, oy=1050, u=100, alpha=1, landmark, dark=false}){
  const stroke = dark ? K.paper : K.ink;
  const fill   = dark ? fade('#0E1550',.92) : fade(K.paper,.94);
  const order = [...blocks].sort((a,b) => (a[0]+a[1]) - (b[0]+b[1]));
  order.forEach((b,i) => {
    const lp = clamp01((p - i*0.045) / 0.55);
    isoBlock(c, ox, oy, u, b[0], b[1], b[2], b[3], b[4], lp,
      { stroke, w:5, alpha:alpha*0.92, fill });
  });
  if (landmark) landmark(c, clamp01((p-0.42)/0.58), {ox, oy, u, alpha, dark});
}

/* Landmark cues sit in front of the estate, to its lower left, at a constant
   stroke weight whatever `u` is. Each cue is drawn twice: once fat in the
   ground colour, so it carries its own clear space through the wireframe
   without a knockout panel clipping whole blocks, then once in colour. */
const CUE = { dx: -305, dy: 330 };
function cue(c, {ox, oy, u, dark=false}, fn){
  const k = u/62, ground = dark ? K.ink : K.paper;
  c.save();
  c.translate(ox + CUE.dx*(u/100), oy + CUE.dy*(u/100));
  c.scale(k,k);
  c.lineCap = 'round'; c.lineJoin = 'round';
  fn(k, 0, ground);
  fn(k, 1, ground);
  c.restore();
}

/* Sydney — the Opera House shells */
export function operaHouse(c, p, {ox, oy, u, alpha=1, dark=false}){
  if (p<=0) return;
  const q = draw(p);
  cue(c, {ox,oy,u,dark}, (k, pass, ground) => {
    c.strokeStyle = pass ? fade(K.cyan, alpha) : ground;
    c.lineWidth = (pass ? 8 : 27)/k;
    // three leaning sails, tallest in the middle
    [[-6,0,.74],[40,0,1.0],[92,0,.82]].forEach(([dx,dy,sc],i) => {
      const lp = clamp01((q - i*.16)/.52); if (lp<=0) return;
      const R = 88*sc, len = R*3.2;
      c.setLineDash([len,len]); c.lineDashOffset = len*(1-lp);
      c.beginPath(); c.moveTo(dx-R*.58, dy);
      c.quadraticCurveTo(dx-R*.26, dy-R*2.05, dx+R*.60, dy-R*.02);
      c.stroke();
    });
    c.setLineDash([]);
    // the podium the shells sit on
    const bp = clamp01((q-.45)/.5);
    if (bp>0){
      c.strokeStyle = pass ? fade(K.mint, alpha) : ground;
      c.lineWidth = (pass ? 5 : 24)/k;
      c.beginPath(); c.moveTo(-66, 7); c.lineTo(-66+232*bp, 7); c.stroke();
    }
  });
}

/* San Diego — a surfboard, planted in front of the estate */
export function surfboard(c, p, {ox, oy, u, alpha=1, dark=false}){
  if (p<=0) return;
  const q = draw(p);
  cue(c, {ox,oy,u,dark}, (k, pass, ground) => {
    c.strokeStyle = pass ? fade(K.cyan, alpha) : ground;
    c.lineWidth = (pass ? 8 : 27)/k;
    const L = 580; c.setLineDash([L,L]); c.lineDashOffset = L*(1-q);
    c.beginPath();
    c.moveTo(0, 26);
    c.bezierCurveTo(-36,-62, -18,-196, 32,-256);
    c.bezierCurveTo(82,-196, 100,-62, 64, 26);
    c.bezierCurveTo(48, 52, 16, 52, 0, 26);
    c.stroke(); c.setLineDash([]);
    const st = clamp01((q-.5)/.5);
    if (st>0){
      c.strokeStyle = pass ? fade(K.mint, alpha) : ground;
      c.lineWidth = (pass ? 5 : 22)/k;
      c.setLineDash([290,290]); c.lineDashOffset = 290*(1-st);
      c.beginPath(); c.moveTo(32,-248); c.lineTo(32,30); c.stroke(); c.setLineDash([]);
    }
  });
}

/* San Jose — three stepped towers, the cue in the estate's own accent */
export function steppedTowers(c, p, {ox, oy, u, alpha=1, dark=false}){
  if (p<=0) return;
  const u2 = u*0.50;
  const OX = ox + CUE.dx*(u/100) + u2*0.9, OY = oy + CUE.dy*(u/100);
  [[-1,-0.6,1,1,3.1],[0.1,-1.0,1,1,4.3],[1.2,-0.5,1,1,2.5]].forEach((b,i) => {
    const lp = clamp01((p - i*.16)/.6);
    isoBlock(c, OX, OY, u2, b[0], b[1], b[2], b[3], b[4], lp,
      { stroke:K.cyan, w:6, alpha, fill: dark ? fade('#0E1550',.94) : fade(K.tint,.96) });
  });
}

/* ---------- overlays ---------- */
/* the problem: exposures stacking over the estate */
export function exposurePins(c, {p, pts, ox, oy, u, color=K.crimson}){
  pts.forEach(([gx,gy,gz], i) => {
    const lp = pop(clamp01((p - i*.07)/.4)); if (lp<=0) return;
    const X = ox + (gx-gy)*0.8660254*u, Y = oy + ((gx+gy)*0.5 - gz)*u;
    c.save(); c.translate(X, Y - 46*lp); c.scale(lp,lp);
    c.fillStyle = color;
    c.beginPath(); c.moveTo(0,34); c.lineTo(-22,-10); c.lineTo(22,-10); c.closePath(); c.fill();
    c.beginPath(); c.arc(0,-28,26,0,Math.PI*2); c.fill();
    c.fillStyle = K.paper; font(c,{size:34,weight:900,family:K.body});
    c.textBaseline='middle'; c.fillText('!', -4.5, -27);
    c.restore();
  });
}

/* the solution: each pin resolves to a closed cyan ring */
export function resolvePins(c, {p, pts, ox, oy, u}){
  pts.forEach(([gx,gy,gz], i) => {
    const lp = clamp01((p - i*.06)/.42); if (lp<=0) return;
    const X = ox + (gx-gy)*0.8660254*u, Y = oy + ((gx+gy)*0.5 - gz)*u;
    ringNode(c, X, Y-52, 25, lp, {w:8});
    if (lp > .75){
      const t2 = clamp01((lp-.75)/.25);
      c.save(); c.strokeStyle=fade(K.cyan,1-t2); c.lineWidth=4;
      c.beginPath(); c.arc(X, Y-52, 25 + 42*t2, 0, Math.PI*2); c.stroke(); c.restore();
    }
  });
}

/* ---------- data shapes ---------- */
export function statBig(c, {x, y, value, label, sub, p, color=K.cyan, align='left', size=132}){
  const e = enter(p, 34); if (e.o<=0) return;
  if (label) eyebrow(c, label, {x, y:y-size-18+e.dy, size:24, color:K.grey, align, alpha:e.o*.9});
  textBlock(c, value, {x, y:y+e.dy, maxW:W, size, weight:900, color, align, alpha:e.o});
  if (sub) textBlock(c, sub, {x, y:y+46+e.dy, maxW:420, size:30, weight:500,
    family:K.body, color:K.grey, align, alpha:e.o*.95, lh:1.3});
}

/* the relay: sources you already run, curving into one record */
export function sources(c, {p, labels, x=150, y0=560, gap=96, railX=470, railY}){
  labels.forEach((L,i) => {
    const lp = clamp01((p - i*.1)/.5); if (lp<=0) return;
    const y = y0 + i*gap;
    feed(c, x+130, y, railX, railY, lp, {color:K.line, w:4});
    const e = enter(lp, 22);
    textBlock(c, L, {x:x+112, y:y+11, maxW:300, size:34, weight:600,
      family:K.body, color:K.grey, align:'right', alpha:e.o});
  });
}

/* a tapered volume that loses most of itself on the way across */
export function funnel(c, {p, x0, x1, yc, h0, h1, color=fade(K.cyan,.30)}){
  ribbon(c, x0, yc-h0/2, h0, x1, yc-h1/2, h1, p, {color});
}

/* the "without / with" comparison block — three counts across, as on the
   Autonomous Defense Cycle slide */
export const CMP_H = 404;
export function compareColumn(c, {p, x, w, top, rows, accent, headline, sub}){
  const s = card(c, x, top, w, CMP_H, p,
    { bg: accent===K.crimson ? '#FDF1F4' : K.tint, stroke:null, r:34 });
  if (!s) return;
  const a0 = easeOut(clamp01(p/.45));
  eyebrow(c, headline, {x:x+44, y:top+60, size:25, color:accent, alpha:a0});
  if (sub) textBlock(c, sub, {x:x+44, y:top+128, maxW:w-88, size:56, weight:900,
    color:accent, alpha:a0});

  const colW = (w - 88) / rows.length;
  rows.forEach(([big, small], i) => {
    const lp = clamp01((p - .3 - i*.13)/.5); if (lp<=0) return;
    const e = enter(lp, 20), cx = x + 44 + i*colW;
    c.save(); c.strokeStyle = fade(accent, .28*e.o); c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx, top+196+e.dy); c.lineTo(cx+colW-34, top+196+e.dy); c.stroke();
    c.restore();
    textBlock(c, big, {x:cx, y:top+276+e.dy, maxW:colW-30, size:60, weight:900,
      color:accent, alpha:e.o});
    textBlock(c, small, {x:cx, y:top+322+e.dy, maxW:colW-34, size:27, weight:500,
      family:K.body, color:K.grey, alpha:e.o*.95, lh:1.26});
  });
}

/* ownership ring — four percent to ninety-two */
export function ownerRing(c, {p, x, y, r, from=0.04, to=0.92, showTo=true}){
  const s = pop(clamp01(p/.35)); if (s<=0) return;
  const val = lerp(from, to, easeBoth(clamp01((p-.2)/.7)));
  c.save(); c.translate(x,y); c.scale(s,s);
  c.strokeStyle = fade(K.line,.8); c.lineWidth = 34;
  c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke();
  c.strokeStyle = grad(c,-r,-r,r,r,[[0,K.mint],[1,K.cyan]]);
  c.lineWidth = 34; c.lineCap='round';
  c.beginPath(); c.arc(0,0,r,-Math.PI/2, -Math.PI/2 + Math.PI*2*val); c.stroke();
  if (showTo){
    font(c,{size:r*.56, weight:900}); c.fillStyle = K.ink; c.textBaseline='middle';
    const s2 = Math.round(val*100) + '%';
    c.fillText(s2, -c.measureText(s2).width/2, 4);
  }
  c.restore();
}

/* asset rows, the CAASM table abstracted */
export function assetRows(c, {p, x, y, w, n=6, ownedFrom=0, rowH=74}){
  for (let i=0;i<n;i++){
    const lp = clamp01((p - i*.07)/.4); if (lp<=0) continue;
    const e = enter(lp, 26), yy = y + i*rowH;
    c.save(); c.globalAlpha = e.o;
    c.fillStyle = K.paper; roundRect(c, x, yy+e.dy, w, rowH-14, 14); c.fill();
    c.strokeStyle = fade(K.line,.9); c.lineWidth=2; c.stroke();
    c.fillStyle = fade(K.ink,.55);
    roundRect(c, x+26, yy+e.dy+22, 210, 16, 8); c.fill();
    c.fillStyle = fade(K.line,1);
    roundRect(c, x+266, yy+e.dy+22, 150, 16, 8); c.fill();
    const owned = i < ownedFrom;
    c.fillStyle = owned ? K.cyan : fade(K.line,.75);
    roundRect(c, x+w-236, yy+e.dy+18, owned ? 200 : 96, 24, 12); c.fill();
    c.restore();
  }
}

/* a source dropping into the head of the line */
export function feedDown(c, x0, y0, x1, y1, p, {color=K.line, w=4}={}){
  const q = draw(p); if (q<=0) return;
  c.save(); c.strokeStyle=color; c.lineWidth=w; c.lineCap='round';
  const len = (Math.abs(y1-y0) + Math.abs(x1-x0))*1.5;
  c.setLineDash([len,len]); c.lineDashOffset = len*(1-q);
  c.beginPath(); c.moveTo(x0,y0);
  c.bezierCurveTo(x0, y0+(y1-y0)*.55, x1, y1-(y1-y0)*.55, x1, y1);
  c.stroke(); c.restore();
}

/* small outlined source chip */
export function sourceChip(c, x, y, w, h, label, p){
  const s = pop(p); if (s<=0) return;
  c.save(); c.translate(x+w/2,y+h/2); c.scale(s,s); c.translate(-(x+w/2),-(y+h/2));
  roundRect(c,x,y,w,h,h/2);
  c.fillStyle = K.paper; c.fill();
  c.strokeStyle = fade(K.line,1); c.lineWidth = 3; c.stroke();
  font(c,{size:32,weight:600,family:K.body}); c.fillStyle = K.grey; c.textBaseline='middle';
  c.fillText(label, x + (w - c.measureText(label).width)/2, y+h/2+1);
  c.restore();
}

/* ---------- fitting ---------- */
/* Isometric bounding box of a block set, in grid units, including the room the
   landmark cue needs. Lets a skyline be fitted to any tile format. */
export function skylineBox(blocks){
  let minX=1e9, maxX=-1e9, minY=1e9, maxY=-1e9;
  const put = (x,y,z) => {
    const X = (x-y)*0.8660254, Y = (x+y)*0.5 - z;
    if (X<minX) minX=X; if (X>maxX) maxX=X;
    if (Y<minY) minY=Y; if (Y>maxY) maxY=Y;
  };
  blocks.forEach(([bx,by,bw,bd,bh]) => {
    for (const x of [bx,bx+bw]) for (const y of [by,by+bd]) for (const z of [0,bh]) put(x,y,z);
  });
  // the cue sits at (-2.72u, +3.30u) from the origin and is about 2.5u tall
  // the landmark cue, anchored at (-2.85u, +3.30u) and drawn at u/62
  minX = Math.min(minX, -4.05); maxX = Math.max(maxX, -1.10);
  minY = Math.min(minY, -1.25); maxY = Math.max(maxY,  4.20);
  return { minX, maxX, minY, maxY, w: maxX-minX, h: maxY-minY };
}

export function fitSkyline(blocks, box, pad=0.94){
  const b = skylineBox(blocks);
  const u = Math.min(box.w/b.w, box.h/b.h) * pad;
  return { u,
    ox: box.x + box.w/2 - (b.minX+b.maxX)/2 * u,
    oy: box.y + box.h/2 - (b.minY+b.maxY)/2 * u };
}
