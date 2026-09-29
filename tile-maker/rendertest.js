/* Render suite for kai-social-tile-maker.html
   Runs every category x shape x variant through drawFrame against a recording
   canvas stub and asserts layout rules numerically. No browser needed.
   Usage:  node _rendertest.js [path-to-html]                                   */
/* Runs under Node, or in the browser via rendertest.html — the assertions
   below are identical either way. In the browser the page fetches the tool
   and leaves it on globalThis.__TESTHTML before loading this file. */
const IS_NODE = typeof process !== 'undefined' && !!(process.versions && process.versions.node);
const fs   = IS_NODE ? require('fs')   : null;
const path = IS_NODE ? require('path') : null;
const html = IS_NODE
  ? fs.readFileSync(process.argv[2] || path.join(__dirname, 'kai-social-tile-maker.html'), 'utf8')
  : globalThis.__TESTHTML;
if (!html) throw new Error('no tool HTML: open rendertest.html, or pass a path under Node');
if (!IS_NODE && typeof globalThis.global === 'undefined') globalThis.global = globalThis;
const m = html.match(/<script>([\s\S]*)<\/script>/)[1];
const grab = (a, b) => { const i = m.indexOf(a), j = m.indexOf(b); if (i < 0 || j < 0) throw new Error('marker ' + a.slice(0, 24)); return m.slice(i, j); };

/* ---------------- recording canvas ---------------- */
let ops = [];
function mkCtx(){
  const st = {font:'16px x', fillStyle:'', strokeStyle:'', globalAlpha:1, textAlign:'left', textBaseline:'top', lineWidth:1, lineCap:'butt', lineJoin:'miter',
              shadowColor:'', shadowBlur:0, shadowOffsetY:0, filter:'none', rect(){}, setLineDash(){}, translate(){}, rotate(){}, scale(){}};
  let path = [], hasArc = false;
  const bbox = () => { if (!path.length) return null;
    const xs = path.map(p => p[0]), ys = path.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys); return {x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y}; };
  return Object.assign(st, {
    save(){}, restore(){}, clearRect(){}, clip(){},
    stroke(){ for (let i = ops.length - 1; i >= 0 && ops[i].t === 'arc' && ops[i].pending; i--) { ops[i].lw = this.lineWidth; ops[i].pending = false; } },
    beginPath(){ path = []; hasArc = false; }, closePath(){},
    moveTo(x, y){ path.push([x, y]); }, lineTo(x, y){ path.push([x, y]); },
    arcTo(x1, y1, x2, y2){ path.push([x1, y1], [x2, y2]); },
    quadraticCurveTo(cx, cy, x, y){ path.push([cx, cy], [x, y]); },
    bezierCurveTo(a, b, c2, d, x, y){ path.push([a, b], [c2, d], [x, y]); },
    arc(x, y, r){ hasArc = true; path.push([x - r, y - r], [x + r, y + r]); ops.push({t:'arc', x, y, r, lw: this.lineWidth, pending: true}); },
    fill(){ const b = bbox(); if (b && b.w > 0 && b.h > 0) ops.push(Object.assign({t: hasArc ? 'disc' : 'rect', viaPath: true}, b)); },
    fillRect(x, y, w, h){ ops.push({t:'rect', x, y, w, h}); },
    strokeRect(){},
    drawImage(i, x, y, w, h){ ops.push({t:'img', x, y, w, h}); },
    measureText(t){ const q = /(\d+(?:\.\d+)?)px/.exec(this.font); const sz = q ? parseFloat(q[1]) : 16; return {width: t.length * sz * 0.52}; },
    fillText(t, x, y){
      const q = /(\d+(?:\.\d+)?)px/.exec(this.font); const sz = q ? parseFloat(q[1]) : 16;
      const w = t.length * sz * 0.52;
      const x0 = this.textAlign === 'center' ? x - w / 2 : (this.textAlign === 'right' ? x - w : x);
      const yTop = this.textBaseline === 'top' ? y : (this.textBaseline === 'middle' ? y - sz * 0.5 : y - sz * 0.78);
      ops.push({t:'text', s: t, x: x0, y: yTop, w, h: sz, size: sz, alpha: this.globalAlpha});
    },
    createLinearGradient(){ return {addColorStop(){}}; }, createRadialGradient(){ return {addColorStop(){}}; }
  });
}

/* ---------------- load the app's drawing code ---------------- */
const header = 'const imgCache=new Map();const img=k=>imgCache.get(k)||null;\n'
  + 'for (const k of ["logo:#080943","logo:#FFFFFF"]) imgCache.set(k,{width:244,height:102});\n'
  + 'for (const k of ["markOnly:#080943","markOnly:#FFFFFF"]) imgCache.set(k,{width:112,height:102});\n'
  + 'for (const k of ["mark:navy","mark:white"]) imgCache.set(k,{width:710,height:630});\n'
  + 'imgCache.set("partner",{width:300,height:120});\nfor (const k of ["logoGrad:#080943","logoGrad:#FFFFFF"]) imgCache.set(k,{width:244,height:102}); imgCache.set("markGrad",{width:112,height:102});\n'
  + 'for (const ik of ["shield","detection","detectionRule","shieldBroken","assets","cloud","integration","routing","connector","reports","execution","check","person"]) for (const col of ["#080943","#FFFFFF","#8AF0E6","#027FA8","#D6FF20","#D3FDD4","#E1FFB0","#11C4FD","#00BFFF","#BEFF78"]) imgCache.set("icon:"+ik+":"+col,{width:24,height:24});\n'
  + 'global.__setImg=(k,v)=>{ if(v) imgCache.set(k,v); else imgCache.delete(k); };\n';
const modSrc = header
  + grab('const REF_W', 'const PRESETS')
  + grab('const easeOutCubic', '/* ==================================================================== *\n * Timeline')
  + '\nmodule.exports={drawFrame,THEMES,WASHES,FORMATS,ICONS,imgCache};\n';
let _mod;
if (IS_NODE){
  const modPath = path.join(require('os').tmpdir(), 'rt_mod_' + process.pid + '.js');
  fs.writeFileSync(modPath, modSrc);
  _mod = require(modPath);
  fs.unlinkSync(modPath);
} else {
  const box = { exports: {} };
  new Function('global', 'module', 'exports', modSrc)(globalThis, box, box.exports);
  _mod = box.exports;
}
const {drawFrame, THEMES, FORMATS} = _mod;

/* ---------------- cases ---------------- */
const base = {type:'stat', theme:'blue', icon:'shield', iconPlace:'badge', prefix:'', suffix:'%', from:0, to:77, decimals:0, grouping:false,
  eyebrow:'Blog', head:'of CISOs say vulnerability management contributes to burnout.', emph:'That is a people problem, not a tooling problem.',
  numColor:'auto', emphMode:'line', emphStyle:'boldbig', details:'', eyeMotion:'fade', evWhen:'', imgTreat:'', activities:[], platform:'', wash:'default', pub:'',
  authors:[], hires:[], motif:'none', reveal:'ring', beforeLabel:'', collapsePct:12, ambient:2, dur:1.6, hold:4, fps:25, scale:1, loop:true,
  source:'Kai 2026 State of Autonomous Defense Report', scaleMax:100,
  cta:{label:'Read now', url:'https://kai.security/x', showUrl:false, pos:'right', fill:'auto'}};
const per = {
  blue:  {eyebrow:'Blog'},
  _pq: {eyebrow:'Blog', type:'headline', head:'What a security team does when the backlog is gone', quote:'It is up to us. The humans are in charge of the AI, not the other way around.', attrib:'Galina Antova, CEO, Kai', authors:[{name:'Galina Antova', title:'CEO', img:null, bio:''}]},
  _authored: {eyebrow:'Blog', type:'headline', head:'Gartner\u00ae Names Kai a Sample Vendor in Autonomous Exposure Remediation', authors:[{name:'Damiano Bolzani', title:'Co-Founder & CTO', img:{width:400,height:400}, bio:''},{name:'Galina Antova', title:'Chief Executive Officer', img:null, bio:''}]},
  press: {type:'headline', eyebrow:'Press', head:'Kai Does Something Amazing/Stat'},
  green: {type:'headline', eyebrow:'News', head:'Something you should know about/Stat'},
  report:{eyebrow:'Report', head:'of security leaders plan to consolidate tools this year.'},
  partnership:{type:'headline', eyebrow:'Partnership', head:'We are partnering to save the world', emph:"It's going to be a great future"},
  newhire:{type:'headline', eyebrow:'New hire', head:'Kai welcomes new members to the team!', hires:[{name:'Steve Jobs', title:'Chief Design Officer', img:null}]},
  launch:{type:'headline', eyebrow:'Launch', head:'The Best Product Tech', emph:"You're going to love it", details:'One\nTwo\nThree', cta:{label:'Demo Now', url:'', showUrl:false, pos:'below', fill:'auto'}},
  event: {type:'headline', eyebrow:'Event', head:'Event Name', emph:'Location', evWhen:'Date and time', details:'Booth 1042\nTue 2 p.m., Room 204\n#KaiAtFalCon'},
  speaker:{type:'headline', eyebrow:'Speaker', head:'Fully Connected 26', emph:'Moscone South · San Francisco, CA', evWhen:'September 29 – October 1, 2026',
           hires:[{name:'Bartley Richardson', title:'Chief of AI, Kai', img:null}], cta:{label:'Register', url:'', showUrl:false, pos:'below', fill:'auto'}},
  webinar:{type:'headline', eyebrow:'Web event', head:'We solved security. Seriously.', emph:'The AI stuff you must learn', evWhen:'October 30th, 2026', platform:'Join us live on LinkedIn',
           hires:[{name:'Adam Meyers', title:'SVP of Intelligence, Kai', img:null}, {name:'Kevin Benacci (Host)', title:'Sr. Director of Corporate Communications, Kai', img:null}],
           cta:{label:'Register Now', url:'', showUrl:false, pos:'right', fill:'#BEFF78'}}
};
const PEOPLE = [{name:'Bartley Richardson', title:'Chief of AI', company:'Kai', img:null},
                {name:'Devin Redmond', title:'Co-founder and Chief Executive Officer', company:'Theta Lake Incorporated', img:null, logo:{width:900, height:260}},
                {name:'Kevin Benacci (Host)', title:'Sr. Director, Corporate Communications', company:'Kai', img:null}];
const LONG = {
  head:'Kai is proud to partner with Acme Corporation to bring autonomous defence to the global enterprise market',
  emph:'A partnership built on shared conviction about machine-speed security operations',
  details:'Validates ten million findings in hours\nAuto-generates the fix and the pull request\nRoutes only what genuinely needs a human'
};
const TREAT = {launch:['frame', 'bleed', 'scrim'], event:['wash', 'split', 'lockup']};

let pass = 0, fail = 0;
const fails = [];
for (const [tk, tv] of Object.entries(THEMES)) {
  let variants = (tk === 'speaker') ? [1, 2, 3].flatMap(n => [{...per[tk], hires: PEOPLE.slice(0, n), _n: n}, {...per[tk], hires: PEOPLE.slice(0, n), _n: n, _pic: true}, {...per[tk], eyebrow: '', hires: PEOPLE.slice(0, n), _n: n, _pic: true, _tag: 'no eyebrow'}])
    : (tk === 'webinar') ? [1, 2, 3].map(n => ({...per[tk], hires: PEOPLE.slice(0, n), _n: n}))
    : (tk === 'newhire') ? [1, 2, 3].map(n => ({...per[tk], hires: [
        {name:'Steve Jobs', title:'Chief Design Officer', img:null},
        {name:'Alfredo Hickman', title:'Chief Information Security Officer', img:null},
        {name:'Karla Reyes', title:'VP People Operations', img:null}].slice(0, n), _n: n}))
    : (tk === 'press' || tk === 'green') ? [per[tk],
        {...per[tk], pub:'TechCrunch', _pub:'wide', _tag:'pub wide'}, {...per[tk], pub:'Forbes', _pub:'square', _tag:'pub square'}, {...per[tk], pub:'The Wall Street Journal', _tag:'pub name'},
        {...per[tk], type:'quote', head:'Kai lets our team validate ten million findings in hours instead of quarters.', emph:'Galina Antova, CEO, Kai — in TechCrunch', _tag:'quote'},
        {...per[tk], type:'quote', head:'The backlog is gone. What a security team does next is the question every CISO should be asking this year, and very few have an answer that survives contact with the board.', emph:'A very long attribution line, Chief Information Security Officer, A Very Large Global Enterprise Corporation, quoted in The Wall Street Journal', _tag:'quote long'}]
    : (tk==='blue') ? [per[tk], {...per._authored, _tag:'authors'}, {...per._authored, authors: per._authored.authors.slice(0,1), _tag:'author x1'}, {...per._pq, _tag:'pull quote'}, {...per._pq, type:'stat', head:'of CISOs say vulnerability management contributes to burnout.', _tag:'stat + pull quote'}, {...per[tk], logoStyle:'grad', _tag:'gradient logo'}]
    : [per[tk] || {}];
  // treatments x picture x button position (Launch, Event)
  if (TREAT[tk]) {
    const v0 = variants[0]; variants = [];
    for (const tr of TREAT[tk]) for (const pic of [false, true]) for (const pos of ['below', 'right']) for (const sq of (tk === 'event' && pic ? [false, true] : [false])) {
      const extra = tk === 'event' ? {activities:['Booth', 'Live demos', 'Executive briefings', 'Customer dinner', 'After party'], eyebrow: sq ? 'Customer event' : 'Event'} : {};
      variants.push(Object.assign({}, v0, extra, {imgTreat: tr, _pic: pic, _sq: sq, _tag: tr + (pic ? (sq ? '+crest' : '+img') : '') + ' ' + pos,
        cta: Object.assign({}, v0.cta || {label:'Meet us', url:'', showUrl:false, fill:'auto'}, {pos})}));
    }
  }
  // announcements: each light colour scheme, on the first variant
  if (tv.layout) {
    const washed = [];
    for (const w of ['sky', 'meadow', 'dawn']) washed.push(Object.assign({}, variants[0], {wash: w, _tag: ((variants[0]._tag || '') + ' wash:' + w).trim()}));
    variants = variants.concat(washed);
  }
  // long-copy twins
  variants = variants.concat(variants.slice(0, Math.min(variants.length, 12)).map(v => Object.assign({}, v, LONG, {_long: true})));

  const shapes = tv.shapes || ['wide', 'square', 'portrait'];
  const formats = FORMATS.filter(f => shapes.includes(f.shape));
  for (const v of variants) for (const f of formats) {
    const [W, H] = f.v.split('x').map(Number);
    const s = Object.assign({}, base, v, {W, H, theme: tk, icon: tv.icon || 'none'});
    if (tv.layout) { s.reveal = 'ring'; s.iconPlace = 'accent'; }      // poison: announcements must ignore these
    global.__setImg('shot', v._pic ? {width:1600, height:1000} : null);
    global.__setImg('city', v._pic ? {width:1600, height:1000} : null);
    global.__setImg('evlogo', v._pic ? (v._sq ? {width:300, height:330} : {width:600, height:220}) : null);
    global.__setImg('platformLogo', tk === 'webinar' ? {width:200, height:200} : null);
    global.__setImg('pubLogo', v._pub === 'wide' ? {width:900, height:200} : v._pub === 'square' ? {width:300, height:300} : null);
    const label = `${tv.label}${v._n ? ' x' + v._n : ''}${v._tag ? ' ' + v._tag : ''}${v._long ? ' [long]' : ''} @ ${f.v}`;
    const msgs = [];
    for (const p of [0.35, 1]) {                                        // mid-animation and settled
      ops = [];
      try { drawFrame(mkCtx(), W, H, s, p, 0.3); } catch (e) { msgs.push('threw: ' + e.message); break; }
      if (p !== 1) continue;
      const S = W / 1200;
      const texts = ops.filter(o => o.t === 'text' && o.alpha > 0.05);
      // 1. nothing off the tile
      texts.filter(o => o.y < 0 || o.y + o.h > H + 1 || o.x < -1 || o.x + o.w > W + 1)
           .forEach(o => msgs.push(`off-tile "${o.s.slice(0, 28)}" at y=${o.y.toFixed(0)} x=${o.x.toFixed(0)}`));
      // 1b. the brand strip is on every tile, and nothing is drawn over it
      const strip = ops.filter(o => o.t === 'rect' && !o.viaPath && o.x <= 0 && o.w >= W && o.h <= H * 0.02 && o.y + o.h >= H - 1);
      if (!strip.length) msgs.push('brand strip missing');
      else texts.filter(o => o.y + o.h * 0.85 > strip[0].y).forEach(o => msgs.push(`"${o.s.slice(0, 18)}" touches the brand strip`));
      // 2. exactly one Kai logo
      const logos = ops.filter(o => o.t === 'img' && Math.abs(o.w / o.h - 244 / 102) < 0.03);
      if (logos.length !== 1) msgs.push(`${logos.length} Kai logos drawn`);
      // 2b. the Kai logo never sits on a portrait ring or the photo of a person
      if (logos.length === 1) {
        const lg = logos[0];
        ops.filter(o => o.t === 'arc' && o.r > W * 0.03).forEach(r => {
          const cx = Math.max(lg.x, Math.min(r.x, lg.x + lg.w)), cy = Math.max(lg.y, Math.min(r.y, lg.y + lg.h));
          if (Math.hypot(cx - r.x, cy - r.y) < r.r + W * 0.01) msgs.push('Kai logo sits on a portrait ring');
        });
      }
      // 3. text keeps clear of logos and photos (icon badges are type-sized and exempt)
      for (const im of ops.filter(o => o.t === 'img' && Math.abs(o.w / o.h - 244 / 102) >= 0.03 && o.w < W * 0.6 && o.w > W * 0.05)) {
        const pad = W * 0.017;
        for (const o of texts) if (o.s.length > 2 && o.x < im.x + im.w + pad && o.x + o.w > im.x - pad && o.y < im.y + im.h + pad && o.y + o.h > im.y - pad) msgs.push(`"${o.s.slice(0, 22)}" sits on an image`);
      }
      // 4. announcements draw their own artwork only
      if (tv.layout) {
        const statRing = ops.filter(o => o.t === 'arc' && o.r > W * 0.09 && o.lw > 10 * S);
        const cells = ops.filter(o => o.t === 'rect' && o.w < W * 0.08 && o.h < H * 0.08 && o.w > W * 0.02);
        if (statRing.length) msgs.push('stat ring leaked into an announcement');
        if (cells.length > 40) msgs.push('tally grid leaked into an announcement');
        // the category icon rides beside the eyebrow
        if (tv.icon && (s.eyebrow || '').trim()) {
          const eyeTxt = (s.eyebrow || '').trim().toUpperCase();
          const eye = texts.find(o => o.s === eyeTxt[0] || o.s === eyeTxt);
          const badges = ops.filter(o => o.t === 'img' && Math.abs(o.w - o.h) < 1 && o.w < W * 0.05);
          if (!badges.length) msgs.push('no icon badge beside the eyebrow');
          else if (eye && !badges.some(b => Math.abs((b.y + b.h / 2) - (eye.y + eye.h / 2)) < eye.h)) msgs.push('icon badge is not on the eyebrow line');
        }
        // people are captioned under their own ring
        const rings = ops.filter(o => o.t === 'arc' && o.r > W * 0.03 && o.lw >= 2.5 * S && o.lw < 10 * S);
        if (tv.layout === 'speaker' || tv.layout === 'webinar') {
          const marks = (s.hires || []).filter(h => h.logo).length;
          const drawn = ops.filter(o => o.t === 'img' && Math.abs(o.w / o.h - 244 / 102) >= 0.03 && o.w < W * 0.4 && o.y > H * 0.3 && o.w >= W * 0.05).length;
          if (drawn < marks) msgs.push(`${marks - drawn} company mark(s) not drawn`);
          (s.hires || []).forEach(h => {
            const first = (h.name || '').split(' ')[0]; if (!first) return;
            const tx = texts.find(o => o.s.startsWith(first)); if (!tx) { msgs.push(`name "${first}" not drawn`); return; }
            const under = rings.find(r => Math.abs((tx.x + tx.w / 2) - r.x) < r.r * 0.6 && tx.y >= r.y + r.r - 2 && tx.y < r.y + r.r + H * 0.12);
            if (!under) msgs.push(`name "${first}" is not captioned under its portrait`);
          });
        }
        // text never sits on a portrait ring, rings never overlap
        texts.forEach(o => rings.forEach(r => {
          const cx = Math.max(r.x - r.r, Math.min(o.x + o.w / 2, r.x + r.r)), cy = Math.max(r.y - r.r, Math.min(o.y + o.h / 2, r.y + r.r));
          const inside = Math.hypot(cx - r.x, cy - r.y) < r.r - 2 && o.x + o.w > r.x - r.r && o.x < r.x + r.r && o.y + o.h > r.y - r.r && o.y < r.y + r.r
                      && Math.hypot((o.x + o.w / 2) - r.x, (o.y + o.h / 2) - r.y) < r.r;
          if (inside && o.s.length > 2) msgs.push(`"${o.s.slice(0, 18)}" sits on a portrait ring`);
        }));
        if (tv.layout !== 'lockup') for (let i = 0; i < rings.length; i++) for (let j = i + 1; j < rings.length; j++) {   // the partnership discs overlap by design
          const a = rings[i], b = rings[j];
          if (Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1) continue;               // the same ring, stroked twice
          if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.98) msgs.push('two portrait rings overlap');
        }
        // the 16:10 product frame is never stretched
        if (tv.layout === 'launch' && s.imgTreat === 'frame') {
          const frame = ops.filter(o => o.t === 'rect' && o.viaPath && o.w > W * 0.25 && o.h > H * 0.15).sort((a, b) => b.w * b.h - a.w * a.h)[0];
          if (frame && Math.abs(frame.w / frame.h - 1.6) > 0.03) msgs.push(`product frame ratio ${(frame.w / frame.h).toFixed(2)}, not 16:10`);
        }
      }
      // 5. the button: nothing else on it; it stays inside the tile
      if (s.cta && tv.layout !== 'portrait') {                 // a new-hire card strips its button by design
        const lab = texts.find(o => /→/.test(o.s));
        const pill = lab && ops.filter(o => o.t === 'rect' && o.viaPath && o.x <= lab.x && o.x + o.w >= lab.x + lab.w * 0.9 && o.y <= lab.y + 2 && o.y + o.h >= lab.y + lab.h - 2).sort((a, b) => a.w * a.h - b.w * b.h)[0];
        if (!lab) msgs.push('button label not drawn');
        if (pill) {
          if (pill.x < -1 || pill.x + pill.w > W + 1 || pill.y < -1 || pill.y + pill.h > H + 1) msgs.push('button runs off the tile');
          texts.forEach(o => {
            if (o === lab || /→/.test(o.s) || o.s === s.cta.label) return;
            const hit = o.x < pill.x + pill.w && o.x + o.w > pill.x && o.y < pill.y + pill.h && o.y + o.h > pill.y;
            if (hit) msgs.push(`"${o.s.slice(0, 22)}" sits under the button`);
          });
        }
      }
      // 6. the source line belongs to Report only
      const src = texts.find(o => o.s === base.source);
      if (src && tk !== 'report') msgs.push('source line drawn outside Report');
      // 7. legible sizes
      texts.filter(o => o.size < 10.5 * S && o.s.length > 2).forEach(o => msgs.push(`tiny text "${o.s.slice(0, 18)}" at ${o.size.toFixed(1)}px`));
      // 8. lines of copy never overprint each other (same-line runs excluded)
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        if (a.s.length < 2 || b.s.length < 2) continue;
        if (Math.abs(a.y - b.y) < 2) continue;                                                     // runs on one line
        const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h * 0.8, b.y + b.h * 0.8) - Math.max(a.y, b.y);
        if (ix > 6 * S && iy > Math.min(a.h, b.h) * 0.35) { msgs.push(`"${a.s.slice(0, 16)}" overprints "${b.s.slice(0, 16)}"`); }
      }
    }
    const uniq = [...new Set(msgs)];
    if (uniq.length) { fail++; fails.push([label, uniq]); } else pass++;
  }
}
const lines = [];
for (const [label, msgs] of fails) { lines.push('  FAIL ' + label); msgs.slice(0, 6).forEach(x => lines.push('        ' + x)); }
lines.push(`${pass}/${pass + fail} renders clean`);
lines.forEach(l => console.log(l));
if (IS_NODE) process.exit(fail ? 1 : 0);
else globalThis.__TESTRESULT = { pass, fail, total: pass + fail, fails, report: lines.join('\n') };
