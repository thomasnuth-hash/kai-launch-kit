/* Kai launch kit — the three art options a tile can use.
   Each returns the anchor points the crimson overlay pins hang off, so
   "overlay on" means the same thing whatever art is selected. */
import { K, fade, clamp01, roundRect, grad, ringNode, ribbon, isoBlock, font } from './kai.js';
import { skyline, operaHouse, surfboard, steppedTowers, fitSkyline } from './scenes.js';

export const CITIES = {
  'Sydney':    { landmark: operaHouse, blocks:
    [[-2.6,-0.4,1,1,2.2],[-1.5,-1.1,1,1,3.4],[-0.4,-1.8,1,1,4.9],[0.7,-1.1,1,1,3.0],
     [1.8,-0.4,1,1,2.4],[-2.0,0.7,1,1,1.6],[-0.9,0.3,1,1,2.7],[0.2,-0.3,1,1,3.8],
     [1.3,0.3,1,1,2.0],[2.4,0.9,1,1,1.4]] },
  'San Diego': { landmark: surfboard, blocks:
    [[-2.4,-0.3,1,1,1.8],[-1.3,-0.9,1,1,2.9],[-0.2,-1.6,1,1,4.2],[0.9,-1.0,1,1,3.3],
     [2.0,-0.3,1,1,2.1],[-1.9,0.8,1,1,1.4],[-0.8,0.4,1,1,2.2],[0.3,-0.2,1,1,3.1],
     [1.4,0.4,1,1,1.8],[2.5,1.0,1,1,1.2]] },
  'San Jose':  { landmark: steppedTowers, blocks:
    [[-2.5,-0.2,1,1,1.7],[-1.4,-0.8,1,1,2.6],[-0.3,-1.4,1,1,3.4],[0.8,-0.8,1,1,2.8],
     [1.9,-0.2,1,1,2.0],[-2.0,0.9,1,1,1.3],[-0.9,0.5,1,1,2.0],[0.2,-0.1,1,1,2.7],
     [1.3,0.5,1,1,1.7],[2.4,1.1,1,1,1.1]] },
};

/* --- city skyline --- */
export function artSkyline(c, box, { city='Sydney', dark=false }={}){
  const spec = CITIES[city] || CITIES['Sydney'];
  const { ox, oy, u } = fitSkyline(spec.blocks, box, 0.94);
  skyline(c, { p:1, blocks:spec.blocks, ox, oy, u, landmark:spec.landmark, dark });
  return spec.blocks.filter((_,i)=>[1,3,5,8].includes(i)).map(b => {
    const gx=b[0]+b[2]/2, gy=b[1]+b[3]/2, gz=b[4];
    return [ ox + (gx-gy)*0.8660254*u, oy + ((gx+gy)*0.5-gz)*u ];
  });
}

/* --- the relay rail --- */
export function artRelay(c, box, { dark=false }={}){
  const ink = dark ? K.paper : K.ink;
  const x0 = box.x + box.w*0.10, x1 = box.x + box.w*0.72;
  const y  = box.y + box.h*0.50;
  const w  = Math.max(8, box.h*0.030);
  c.save();
  // sources feeding in
  c.strokeStyle = fade(dark ? '#4C5A8C' : K.line, 1);
  c.lineWidth = Math.max(2, w*0.28); c.lineCap='round';
  for (let i=0;i<4;i++){
    const sy = y + (i-1.5)*box.h*0.13, sx = box.x + box.w*0.015;
    c.beginPath(); c.moveTo(sx, sy);
    c.bezierCurveTo(x0-box.w*0.05, sy, x0-box.w*0.05, y, x0, y);
    c.stroke();
  }
  // the one record
  c.strokeStyle = ink; c.lineWidth = w;
  c.beginPath(); c.moveTo(x0,y); c.lineTo(x1,y); c.stroke();
  // the fork, coloured by the team that receives it
  [[-1,K.cyan],[0,K.blue],[1,K.seafoam]].forEach(([d,col]) => {
    const ey = y + d*box.h*0.20, ex = box.x + box.w*0.96;
    c.strokeStyle = col; c.lineWidth = w*0.74; c.lineCap='round';
    c.beginPath(); c.moveTo(x1,y);
    c.bezierCurveTo(x1+box.w*0.09, y, x1+box.w*0.10, ey, ex-box.w*0.035, ey);
    c.stroke();
    const hs = w*1.15;
    c.fillStyle = col; c.beginPath();
    c.moveTo(ex, ey); c.lineTo(ex-hs*1.5, ey-hs*0.85); c.lineTo(ex-hs*1.5, ey+hs*0.85);
    c.closePath(); c.fill();
  });
  const nodes = [0.30, 0.52, 0.74].map(f => x0 + (x1-x0)*f);
  nodes.forEach(nx => ringNode(c, nx, y, w*1.9, 1,
    { w: w*0.52, core: dark ? K.ink : K.paper }));
  c.restore();
  return nodes.map(nx => [nx, y]);
}

/* --- the Sankey flow --- */
export function artFlow(c, box, { dark=false }={}){
  const xa = box.x + box.w*0.04, xb = box.x + box.w*0.40,
        xc = box.x + box.w*0.82, xd = box.x + box.w*0.99;
  const top = box.y + box.h*0.10, H = box.h*0.80;
  const grey = dark ? 'rgba(255,255,255,.17)' : fade(K.line,.60);
  c.save();
  ribbon(c, xa, top, H, xb, top, H, 1, { color: dark ? 'rgba(0,188,252,.22)' : fade(K.cyan,.18) });
  ribbon(c, xb, top,          H*0.72, xc, top-H*0.10, H*0.44, 1, { color: grey });
  ribbon(c, xb, top+H*0.74,   H*0.15, xc, top+H*0.56, H*0.11, 1, { color: fade(K.cyan,.90) });
  ribbon(c, xb, top+H*0.90,   H*0.10, xc, top+H*0.86, H*0.14, 1,
         { color: dark ? 'rgba(255,255,255,.12)' : fade(K.line,.42) });
  ribbon(c, xc, top+H*0.56, H*0.11, xd, top+H*0.58, H*0.05, 1, { color: K.cyan });
  c.restore();
  return [[xb, top+H*0.30],[xb+(xc-xb)*0.5, top+H*0.10],[xc, top+H*0.62]];
}

/* --- the overlay every art option shares --- */
export function overlayPins(c, pts, scale=1){
  pts.forEach(([x,y]) => {
    c.save(); c.translate(x, y-30*scale); c.scale(scale,scale);
    c.fillStyle = K.crimson;
    c.beginPath(); c.moveTo(0,32); c.lineTo(-21,-10); c.lineTo(21,-10); c.closePath(); c.fill();
    c.beginPath(); c.arc(0,-27,25,0,Math.PI*2); c.fill();
    c.fillStyle = K.paper; font(c,{size:33,weight:900,family:K.body});
    c.textBaseline='middle'; c.fillText('!', -4.5, -26);
    c.restore();
  });
}

export const ART = {
  'City skyline': artSkyline,
  'Relay rail':   artRelay,
  'Sankey flow':  artFlow,
};
