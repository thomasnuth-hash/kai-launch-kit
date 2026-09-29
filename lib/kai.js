/* Kai launch kit — shared render engine.
   One motion system: enter / draw / pop. Nothing else.
   Every cut is a pure function of t (seconds), so export and scrub agree. */

/* The brand, not an approximation of it. Every value here comes from
   brand/design-language.json, which is lifted from the tile maker — the same
   palette and faces the tiles use. */
export const K = {
  ink:'#080943', ink2:'#0C1838', paper:'#FFFFFF', tint:'#F0F8FC',
  deep:'#027FA8', blue:'#00BFFF', cyan:'#11C4FD', mint:'#8AF0E6',
  seafoam:'#50C7AC', lime:'#BEFF78', acid:'#D6FF20',
  crimson:'#E11D48', grey:'#586470', line:'#CCD0DC',
  display:'Roboto, system-ui, sans-serif',
  body:'"Wix Madefor Text", system-ui, -apple-system, sans-serif',
};

export const W = 1080, H = 1920;

import { markPath, MARK_GRAD } from './mark.js';

/* ---------- timing ---------- */
export const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
export const lerp = (a,b,p) => a + (b-a)*p;
/* local progress of a segment starting at `start` lasting `dur` */
export const seg = (t,start,dur) => clamp01((t-start)/dur);

export const easeOut  = p => 1 - Math.pow(1-p, 3);
export const easeIn   = p => p*p*p;
export const easeBoth = p => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
/* the one overshoot in the system — used only by `pop` */
export const easePop  = p => { const c=1.70158+1; return 1 + c*Math.pow(p-1,3) + 1.70158*Math.pow(p-1,2); };

/* the three moves */
export const enter = (p, dist=60) => ({ o: easeOut(clamp01(p)), dy: (1-easeOut(clamp01(p)))*dist });
export const draw  = (p) => easeBoth(clamp01(p));
export const pop   = (p) => p<=0 ? 0 : p>=1 ? 1 : easePop(p);

/* ---------- canvas helpers ---------- */
export function roundRect(c,x,y,w,h,r){
  r = Math.min(r, Math.abs(w)/2, Math.abs(h)/2);
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);     c.arcTo(x,y,x+w,y,r);
  c.closePath();
}

export function grad(c,x0,y0,x1,y1,stops){
  const g = c.createLinearGradient(x0,y0,x1,y1);
  stops.forEach(([p,col]) => g.addColorStop(p,col));
  return g;
}

/* alpha-blended colour without touching globalAlpha */
export function fade(hex, a){
  const n = parseInt(hex.slice(1),16);
  return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;
}

/* ---------- text ---------- */
export function font(c,{size, weight=700, family=K.display}){
  c.font = `${weight} ${size}px ${family}`;
}

export function wrap(c, text, maxW){
  const words = String(text).split(/\s+/);
  const lines = []; let cur = '';
  for (const w of words){
    const test = cur ? cur+' '+w : w;
    if (c.measureText(test).width > maxW && cur){ lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* Draws wrapped text. `*word*` sets the emphasis colour.
   Returns the total block height. Never call with size < 24. */
export function textBlock(c, text, {
  x, y, maxW, size, weight=700, family=K.display, lh=1.14,
  color=K.ink, accent=K.cyan, align='left', alpha=1, reveal=1
}){
  if (size < 24) size = 24;                       // hard floor, per brief
  font(c,{size,weight,family});
  // tokenise into [text, isAccent] runs, keeping the plain string for wrapping
  const raw = String(text);
  const plain = raw.replace(/\*/g,'');
  const lines = wrap(c, plain, maxW);

  // map accent ranges from the marked-up source onto plain indices
  const acc = []; let i=0, on=false, start=0;
  for (const ch of raw){
    if (ch === '*'){ if(!on){ on=true; start=i; } else { on=false; acc.push([start,i]); } continue; }
    i++;
  }
  if (on) acc.push([start,i]);
  const isAcc = n => acc.some(([a,b]) => n>=a && n<b);

  const shown = Math.round(plain.replace(/\s+/g,' ').length * clamp01(reveal));
  let seen = 0, yy = y;
  c.textBaseline = 'alphabetic';
  for (const line of lines){
    let lw = c.measureText(line).width;
    let cx = align==='center' ? x - lw/2 : align==='right' ? x - lw : x;
    for (const ch of line){
      if (seen >= shown && reveal < 1) { seen++; continue; }
      c.fillStyle = fade(isAcc(seen) ? accent : color, alpha);
      c.fillText(ch, cx, yy);
      cx += c.measureText(ch).width;
      seen++;
    }
    seen++;                                        // the space the wrap consumed
    yy += size*lh;
  }
  return lines.length * size * lh;
}

/* small-caps eyebrow */
export function eyebrow(c, text, {x,y,size=26,color=K.cyan,align='left',alpha=1,track=3.2}){
  font(c,{size,weight:800,family:K.body});
  const s = String(text).toUpperCase();
  const w = c.measureText(s).width + track*(s.length-1);
  let cx = align==='center' ? x-w/2 : align==='right' ? x-w : x;
  c.fillStyle = fade(color,alpha); c.textBaseline='alphabetic';
  for (const ch of s){ c.fillText(ch,cx,y); cx += c.measureText(ch).width + track; }
  return w;
}

/* ---------- brand primitives ---------- */

/* The mark, traced from the supplied artwork rather than approximated.
   The ribbons are tapered filled shapes, so this is a fill, not a stroke —
   and the "draw" of the motion system becomes a wipe along the gradient axis,
   so the mark paints itself on in the direction its colour runs. */
/* The brand defines this gradient for the mark: bounding-box diagonal,
   #00BFFF → #11C4FD → #8AF0E6. MARK_GRAD comes straight from the artwork. */
const MARK_ANGLE = 45 * Math.PI / 180;

export function mark(c, x, y, size, p = 1, { alpha = 1, spin = 0 } = {}){
  if (p <= 0) return;
  c.save();
  c.translate(x, y); c.rotate(spin); c.scale(size, size);

  if (p < 1){                                     // wipe, low-t end first
    const q = easeBoth(clamp01(p));
    c.rotate(MARK_ANGLE);
    c.beginPath(); c.rect(-1, -0.78, 2, 1.56 * q); c.clip();
    c.rotate(-MARK_ANGLE);
  }

  const g = c.createLinearGradient(-0.5, -0.5, 0.5, 0.5);
  MARK_GRAD.forEach(([at, col]) => g.addColorStop(at, fade(col, alpha)));
  c.fillStyle = g;
  c.fill(markPath(), 'evenodd');
  c.restore();
}

/* the one-record rail: a thick navy line that draws left to right */
export function rail(c, x0, x1, y, p, {w=18, color=K.ink}={}){
  const e = x0 + (x1-x0)*draw(p); if (e <= x0) return;
  c.save(); c.strokeStyle = color; c.lineWidth = w; c.lineCap='round';
  c.beginPath(); c.moveTo(x0,y); c.lineTo(e,y); c.stroke(); c.restore();
}

/* "runs continuously" — an open cyan ring that pops onto the rail */
export function ringNode(c, x, y, r, p, {color=K.cyan, core=K.paper, w=9}={}){
  const s = pop(p); if (s <= 0) return;
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle = core; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.fill();
  c.strokeStyle = color; c.lineWidth = w;
  c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke(); c.restore();
}

/* a source you already run, curving into the rail */
export function feed(c, x0, y0, x1, y1, p, {color=K.line, w=4}={}){
  const q = draw(p); if (q <= 0) return;
  const mx = (x0+x1)/2;
  c.save(); c.strokeStyle=color; c.lineWidth=w; c.lineCap='round';
  const len = Math.hypot(x1-x0,y1-y0)*1.6;
  c.setLineDash([len,len]); c.lineDashOffset = len*(1-q);
  c.beginPath(); c.moveTo(x0,y0); c.bezierCurveTo(mx,y0,mx,y1,x1,y1); c.stroke();
  c.restore();
}

/* the handoff, coloured by the team that receives it */
export function arrow(c, x0, y0, x1, y1, p, {color=K.blue, w=14, head=26}={}){
  const q = draw(p); if (q <= 0) return;
  const x = lerp(x0,x1,q), y = lerp(y0,y1,q);
  c.save(); c.strokeStyle=color; c.fillStyle=color; c.lineWidth=w; c.lineCap='round';
  const my = y0 + (y1-y0)*.55;
  c.beginPath(); c.moveTo(x0,y0); c.bezierCurveTo(x0+(x1-x0)*.45,y0, x0+(x1-x0)*.5,my, x,y); c.stroke();
  if (q > .9){
    const a = Math.atan2(y1-y0, (x1-x0)*.25);
    c.translate(x1,y1); c.rotate(a);
    c.beginPath(); c.moveTo(head,0); c.lineTo(-head*.5,head*.62); c.lineTo(-head*.5,-head*.62);
    c.closePath(); c.fill();
  }
  c.restore();
}

/* navy outcome pill */
export function pill(c, x, y, w, h, p, {bg=K.ink, label='', color=K.paper, size=34}={}){
  const s = pop(p); if (s<=0) return;
  c.save(); c.translate(x+w/2, y+h/2); c.scale(s,s); c.translate(-w/2,-h/2);
  c.fillStyle = bg; roundRect(c,0,0,w,h,h/2); c.fill();
  if (label){
    font(c,{size,weight:700}); c.fillStyle=color; c.textBaseline='middle';
    const lines = wrap(c,label,w-52);
    lines.forEach((ln,i)=> c.fillText(ln, (w-c.measureText(ln).width)/2,
      h/2 + (i-(lines.length-1)/2)*size*1.15));
  }
  c.restore();
}

/* white card on tint, the shape used across the platform page */
export function card(c, x, y, w, h, p, {bg=K.paper, stroke=fade(K.line,.9), r=28}={}){
  const s = pop(p); if (s<=0) return;
  c.save(); c.translate(x+w/2,y+h/2); c.scale(s,s); c.translate(-(x+w/2),-(y+h/2));
  c.fillStyle=bg; roundRect(c,x,y,w,h,r); c.fill();
  if (stroke){ c.strokeStyle=stroke; c.lineWidth=2; c.stroke(); }
  c.restore(); return s;
}

/* a tapered Sankey ribbon: volume in on the left, less out on the right */
export function ribbon(c, x0,y0,h0, x1,y1,h1, p, {color=fade(K.cyan,.28)}={}){
  const q = easeOut(clamp01(p)); if (q<=0) return;
  const xe = lerp(x0,x1,q), he = lerp(h0,h1,q), ye = lerp(y0,y1,q);
  const cx = (x0+xe)/2;
  c.save(); c.fillStyle=color; c.beginPath();
  c.moveTo(x0,y0); c.bezierCurveTo(cx,y0,cx,ye,xe,ye);
  c.lineTo(xe,ye+he); c.bezierCurveTo(cx,ye+he,cx,y0+h0,x0,y0+h0);
  c.closePath(); c.fill(); c.restore();
}

/* isometric extruded block — the unit every skyline is built from */
const ISO = (x,y,z) => [ (x-y)*0.8660254, (x+y)*0.5 - z ];
export function isoBlock(c, ox, oy, u, bx, by, bw, bd, bh, p, {
  stroke=K.ink, w=5, fill=null, alpha=1
}={}){
  const q = draw(p); if (q<=0) return;
  const P = (x,y,z) => { const [a,b] = ISO(x,y,z); return [ox+a*u, oy+b*u]; };
  const x0=bx, x1=bx+bw, y0=by, y1=by+bd, z=bh*q;
  const top = [P(x0,y0,z),P(x1,y0,z),P(x1,y1,z),P(x0,y1,z)];
  const poly = pts => { c.beginPath(); c.moveTo(...pts[0]); pts.slice(1).forEach(pt=>c.lineTo(...pt)); c.closePath(); };
  c.save(); c.lineJoin='round'; c.lineCap='round';
  if (fill){ c.fillStyle=fill;
    poly([P(x0,y1,0),P(x1,y1,0),P(x1,y1,z),P(x0,y1,z)]); c.fill();
    poly([P(x1,y0,0),P(x1,y1,0),P(x1,y1,z),P(x1,y0,z)]); c.fill();
    poly(top); c.fill();
  }
  c.strokeStyle = fade(stroke,alpha); c.lineWidth = w;
  poly(top); c.stroke();
  [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].forEach(([vx,vy])=>{
    const a=P(vx,vy,0), b=P(vx,vy,z);
    c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke();
  });
  // only the two bottom edges that actually face the viewer
  c.beginPath(); c.moveTo(...P(x1,y0,0)); c.lineTo(...P(x1,y1,0)); c.lineTo(...P(x0,y1,0)); c.stroke();
  c.restore();
}

/* ---------- shared cut scaffolding ---------- */
export const DUR = 17;
export const TL = {                       // start, length
  signal:[0, 3.0], b1:[3.0, 3.8], b2:[6.8, 3.8], b3:[10.6, 3.8], end:[14.4, 2.6]
};
export const at = (t,k) => seg(t, TL[k][0], TL[k][1]);   // 0..1 within a phase

/* One or two background colours per cut, never more. */
export function ground(c, t, {light=K.paper, dark=K.ink}={}){
  const flip = seg(t, TL.end[0]-.35, .5);
  c.fillStyle = light; c.fillRect(0,0,W,H);
  if (flip > 0){
    const y = H * (1-easeBoth(flip));
    c.fillStyle = dark; c.fillRect(0, y, W, H-y);
  }
  return flip;
}

/* Beat 0 — mark drops in, wordmark types out, one-line descriptor. */
export function signal(c, t, descriptor){
  const p = at(t,'signal');
  const out = 1 - clamp01(seg(t, TL.signal[1]-.45, .4));
  if (out <= 0) return p;
  c.save(); c.globalAlpha = out;
  const drop = enter(seg(t,.15,.75), 90);
  mark(c, W/2, 700 + drop.dy, 320, seg(t,.25,1.15), {alpha:drop.o});

  const wm = enter(seg(t,1.0,.5), 26);
  font(c,{size:132, weight:900});
  const reveal = clamp01(seg(t,1.05,.7));
  const full = 'Kai', shown = full.slice(0, Math.ceil(full.length*reveal));
  if (shown){
    const w = c.measureText(full).width;
    c.fillStyle = fade(K.ink, wm.o); c.textBaseline='alphabetic';
    c.fillText(shown, W/2 - w/2, 1050 + wm.dy);
    if (reveal < 1){                                   // typing caret
      c.fillStyle = fade(K.cyan, wm.o);
      c.fillRect(W/2 - w/2 + c.measureText(shown).width + 8, 1050-96+wm.dy, 9, 100);
    }
  }
  const d = enter(seg(t,1.75,.6), 34);
  textBlock(c, descriptor, {
    x:W/2, y:1215 + d.dy, maxW:940, size:46, weight:600, family:K.body,
    color:K.grey, align:'center', alpha:d.o, lh:1.3
  });
  // hairline that draws under the lockup
  const hl = draw(seg(t,2.1,.6));
  if (hl>0){ c.strokeStyle=fade(K.cyan,.9); c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(W/2-110*hl, 1125); c.lineTo(W/2+110*hl, 1125); c.stroke(); }
  c.restore();
  return p;
}

/* Hold a scene between two absolute times, with an automatic tail fade.
   `fn(alpha)` draws; progress is the caller's business. */
export function scene(c, t, from, to, fn, {fadeIn=0, fadeOut=.35}={}){
  if (t < from || t > to + fadeOut) return;
  const a = (fadeIn ? easeOut(seg(t,from,fadeIn)) : 1) * clamp01(1 - seg(t, to, fadeOut));
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; fn(a); c.restore();
}

/* Beat caption, bottom-anchored. `*word*` takes the emphasis colour. */
export function caption(c, t, phase, text, {
  bottom=1780, size=68, accent=K.cyan, color=K.ink, weight=800
}={}){
  const p = at(t,phase); if (p<=0) return;
  const [st,dl] = TL[phase];
  const out = clamp01(1 - seg(t, st+dl-.3, .3));
  const e = enter(seg(t, st+.25, .55), 40);
  if (e.o*out <= 0) return;
  font(c,{size,weight});
  const lines = wrap(c, String(text).replace(/\*/g,''), W-148);
  const y = bottom - (lines.length-1)*size*1.12;
  textBlock(c, text, {
    x:74, y:y+e.dy, maxW:W-148, size, weight, color, accent,
    alpha:e.o*out, lh:1.12
  });
}

/* Beat 4 — dark ground, mark, wordmark, closing line. */
export function endCard(c, t, closing){
  const p = at(t,'end'); if (p<=0) return;

  const e = enter(seg(t, TL.end[0]+.15, .6), 44);
  mark(c, W/2, 880+e.dy, 250, 1, {alpha:e.o});

  const wm = enter(seg(t, TL.end[0]+.35, .55), 30);
  font(c,{size:104, weight:900});
  const kw = c.measureText('Kai').width;
  c.fillStyle = fade(K.paper, wm.o); c.textBaseline='alphabetic';
  c.fillText('Kai', W/2-kw/2, 1105+wm.dy);

  const s2 = enter(seg(t, TL.end[0]+.6, .6), 26);
  textBlock(c, 'kai.security', {
    x:W/2, y:1210, maxW:900, size:48, weight:700, family:K.body,
    color:K.cyan, align:'center', alpha:s2.o
  });

  const hl = draw(seg(t, TL.end[0]+.8, .5));
  if (hl>0){ c.strokeStyle=fade(K.cyan,.55); c.lineWidth=4; c.lineCap='round';
    c.beginPath(); c.moveTo(W/2-90*hl,1268); c.lineTo(W/2+90*hl,1268); c.stroke(); }

  const cl = enter(seg(t, TL.end[0]+.95, .6), 28);
  textBlock(c, closing, {
    x:W/2, y:1370, maxW:840, size:44, weight:500, family:K.body,
    color:K.paper, accent:K.mint, align:'center', alpha:cl.o*.82, lh:1.32
  });
}

import { COPY, DEFAULTS, set as setCopy, reset as resetCopy, isOverridden } from './copy.js';

/* ---------- runner ----------
   `render(ctx, t)` must be pure in t, so scrubbing, playback and export
   all agree frame for frame. */
export async function mount({ slug, title, render, duration = DUR }){
  document.title = `Kai — ${title}`;
  const cv = document.getElementById('stage');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  try { await document.fonts.ready; } catch {}

  let t = 0, playing = true, loop = true, last = performance.now();

  const paint = (time) => { c.save(); render(c, time); c.restore(); };

  const els = {
    play: document.querySelector('[data-a=play]'),
    loop: document.querySelector('[data-a=loop]'),
    rec:  document.querySelector('[data-a=rec]'),
    still:document.querySelector('[data-a=still]'),
    scrub:document.querySelector('[data-a=scrub]'),
    clock:document.querySelector('[data-a=clock]'),
  };
  els.scrub.max = duration; els.scrub.step = 1/60;

  function frame(now){
    const dt = Math.min((now-last)/1000, .05); last = now;
    if (playing){
      t += dt;
      if (t >= duration){ t = loop ? 0 : duration; if(!loop) setPlaying(false); }
    }
    paint(t);
    els.scrub.value = t;
    els.clock.textContent = `${t.toFixed(2)}s / ${duration}s`;
    requestAnimationFrame(frame);
  }
  function setPlaying(v){ playing = v; els.play.textContent = v ? 'Pause' : 'Play'; }

  els.play.onclick = () => { if (t >= duration) t = 0; setPlaying(!playing); };
  els.loop.onclick = () => { loop = !loop; els.loop.textContent = loop ? 'Loop: on' : 'Loop: off'; };
  els.scrub.oninput = e => { t = +e.target.value; setPlaying(false); };

  /* 2x still of the current frame */
  els.still.onclick = () => {
    const o = document.createElement('canvas');
    o.width = W*2; o.height = H*2;
    const oc = o.getContext('2d'); oc.scale(2,2); render(oc, t);
    const a = document.createElement('a');
    a.download = `kai-${slug}-${t.toFixed(1)}s@2x.png`;
    a.href = o.toDataURL('image/png'); a.click();
  };

  /* record one full pass */
  const MIMES = ['video/mp4;codecs=avc1.42E01E','video/mp4',
                 'video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  let recorder = null;
  els.rec.onclick = () => {
    if (recorder){ recorder.stop(); return; }
    const mime = MIMES.find(m => MediaRecorder.isTypeSupported(m));
    if (!mime){ alert('This browser cannot record the canvas.'); return; }
    const chunks = [];
    recorder = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: 12e6 });
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
      const a = document.createElement('a');
      a.download = `kai-${slug}.${ext}`;
      a.href = URL.createObjectURL(new Blob(chunks, {type:mime}));
      a.click();
      recorder = null;
      els.rec.dataset.on = '0'; els.rec.textContent = 'Record';
    };
    t = 0; setPlaying(true);
    els.rec.dataset.on = '1'; els.rec.textContent = 'Recording…';
    recorder.start();
    setTimeout(() => recorder && recorder.stop(), (duration + .25) * 1000);
  };

  /* copy that is still moving — edit here, every cut follows */
  const dEl = document.querySelector('[data-a=descriptor]');
  const dReset = document.querySelector('[data-a=descriptor-reset]');
  if (dEl){
    const sync = () => {
      dEl.value = COPY.descriptor;
      dReset.hidden = !isOverridden('descriptor');
    };
    sync();
    dEl.oninput = e => { setCopy('descriptor', e.target.value);
                         dReset.hidden = !isOverridden('descriptor'); };
    dReset.onclick = () => { resetCopy('descriptor'); sync(); };
    // another tab changed it
    addEventListener('storage', e => { if (e.key === 'kai-copy-v1'){
      Object.assign(COPY, { ...DEFAULTS, ...(JSON.parse(e.newValue || '{}')) }); sync(); } });
  }

  requestAnimationFrame(now => { last = now; frame(now); });
}

/* the control bar every cut page shares */
export function bar(){
  return `<div class="bar">
    <button data-a="play" class="pri">Pause</button>
    <button data-a="loop">Loop: on</button>
    <input data-a="scrub" type="range" min="0" value="0">
    <span data-a="clock" class="t">0.00s</span>
    <button data-a="rec" class="rec">Record</button>
    <button data-a="still">Still @2x</button>
    <a href="../index.html">All cuts</a>
    <a href="../kai-tile-generator.html">Tile generator</a>
  </div>
  <div class="bar">
    <label class="fld">Descriptor
      <input data-a="descriptor" type="text" spellcheck="false">
    </label>
    <button data-a="descriptor-reset" hidden>Reset</button>
    <span class="hintline">Applies to all seven cuts, and to anything you record or export.</span>
  </div>`;
}
