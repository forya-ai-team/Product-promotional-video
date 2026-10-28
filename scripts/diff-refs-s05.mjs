import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PNG } from 'pngjs';

const REF = 'out/qa/S05-ref-window.png';
const SHOT = process.argv[2] ?? 'out/qa/S05-static-f0.png';
const OUT_DIR = 'out/qa/diff';
const WINDOW_TOP = 74;
const W = 1920;
const H = 932;

const maskRects = [
  // live proxy endpoints replaced with TEST-NET data (D7)
  { x: 108, y: 486, w: 125, h: 22 },
  { x: 108, y: 753, w: 125, h: 22 },
  // profile cards now use stock social avatars (D25); reference shows the default silhouette
  ...Array.from({ length: 3 }, (_, i) => ({ x: 82, y: 307 + i * 268, w: 45, h: 45 })),
  // brand asset swapped for the user's Dmex lockup (D14); reference still shows Tolink
  { x: 65, y: 45, w: 150, h: 60 },
  // user-directed "Message requests" row (D26) is absent from the reference and
  // pushes the whole conversation list one 72px row down; the panel header above
  // stays scored. Avatars inside this block are the D24 stock portraits.
  { x: 519, y: 284, w: 401, h: 648 },
  { x: 1748, y: 64, w: 36, h: 36 },
  // 2px capture border at the top
  { x: 0, y: 0, w: W, h: 2 },
];

const readPng = (path) => PNG.sync.read(readFileSync(path));

const ref = readPng(REF);
const shotFull = readPng(SHOT);

if (ref.width !== W || ref.height !== H) {
  throw new Error(`Unexpected reference size ${ref.width}x${ref.height}`);
}

const shot = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const src = ((y + WINDOW_TOP) * shotFull.width + x) << 2;
    const dst = (y * W + x) << 2;
    shot.data[dst] = shotFull.data[src];
    shot.data[dst + 1] = shotFull.data[src + 1];
    shot.data[dst + 2] = shotFull.data[src + 2];
    shot.data[dst + 3] = 255;
  }
}

const srgbToLinear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const rgbToLab = (r, g, b) => {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = (0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl) / 0.95047;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl;
  const z = (0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

const deltaE2000 = (lab1, lab2) => {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp1 = Cp1 === 0 ? 0 : (Math.atan2(b1, ap1) * 180) / Math.PI + (Math.atan2(b1, ap1) < 0 ? 360 : 0);
  const hp2 = Cp2 === 0 ? 0 : (Math.atan2(b2, ap2) * 180) / Math.PI + (Math.atan2(b2, ap2) < 0 ? 360 : 0);
  const dLp = L2 - L1;
  const dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1;
    if (dhp > 180) dhp -= 360;
    if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * Math.PI) / 360);
  const Lbar = (L1 + L2) / 2;
  const Cpbar = (Cp1 + Cp2) / 2;
  let hpbar = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp1 - hp2) > 180) hpbar += hp1 + hp2 < 360 ? 360 : -360;
    hpbar /= 2;
  }
  const T =
    1 -
    0.17 * Math.cos(((hpbar - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * hpbar * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hpbar + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * hpbar - 63) * Math.PI) / 180);
  const dTheta = 30 * Math.exp(-((((hpbar - 275) / 25) ** 2)));
  const Rc = 2 * Math.sqrt(Cpbar ** 7 / (Cpbar ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const Sc = 1 + 0.045 * Cpbar;
  const Sh = 1 + 0.015 * Cpbar * T;
  const Rt = -Math.sin((2 * dTheta * Math.PI) / 180) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
};

const masked = new Uint8Array(W * H);
for (const r of maskRects) {
  for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(H, Math.ceil(r.y + r.h)); y++) {
    for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(W, Math.ceil(r.x + r.w)); x++) {
      masked[y * W + x] = 1;
    }
  }
}

const labCache = new Map();
const labFor = (r, g, b) => {
  const key = (r << 16) | (g << 8) | b;
  let lab = labCache.get(key);
  if (!lab) {
    lab = rgbToLab(r, g, b);
    labCache.set(key, lab);
  }
  return lab;
};

const heat = new PNG({ width: W, height: H });
const side = new PNG({ width: W * 2 + 16, height: H });
let total = 0;
let over5 = 0;
let over5EdgeTolerant = 0;
let edgeFreePixels = 0;
let sum = 0;
let max = 0;
const region = {
  sidebar: { pixels: 0, over5: 0 },
  main: { pixels: 0, over5: 0 },
  rail: { pixels: 0, over5: 0 },
};

const lumOf = (png) => {
  const out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const idx = i << 2;
    out[i] = 0.299 * png.data[idx] + 0.587 * png.data[idx + 1] + 0.114 * png.data[idx + 2];
  }
  return out;
};
const gradient = (lum) => {
  const g = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (x > 0) g[i] = Math.max(g[i], Math.abs(lum[i] - lum[i - 1]));
      if (y > 0) g[i] = Math.max(g[i], Math.abs(lum[i] - lum[i - W]));
    }
  }
  return g;
};
const refLum = lumOf(ref);
const shotLum = lumOf(shot);
const refGrad = gradient(refLum);
const shotGrad = gradient(shotLum);
const edge = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (refGrad[i] > 18 || shotGrad[i] > 18) edge[i] = 1;
  }
}
const edgeNear = new Uint8Array(W * H);
const radius = 2;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!edge[y * W + x]) continue;
    for (let dy = -radius; dy <= radius; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= W) continue;
        edgeNear[yy * W + xx] = 1;
      }
    }
  }
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const idx = i << 2;
    const lab1 = labFor(ref.data[idx], ref.data[idx + 1], ref.data[idx + 2]);
    const lab2 = labFor(shot.data[idx], shot.data[idx + 1], shot.data[idx + 2]);
    const dE = deltaE2000(lab1, lab2);
    total++;
    sum += dE;
    if (dE > max) max = dE;
    const isMasked = masked[i] === 1;
    if (!isMasked && dE > 5) over5++;
    if (!isMasked && edgeNear[i] === 0) {
      edgeFreePixels++;
      if (dE > 5) over5EdgeTolerant++;
    }
    const bucket = x < 280 ? region.sidebar : x < 1857 ? region.main : region.rail;
    if (!isMasked) {
      bucket.pixels++;
      if (dE > 5) bucket.over5++;
    }
    const t = dE > 5 && edgeNear[i] === 0 ? Math.min(1, (dE - 5) / 25) : 0;
    heat.data[idx] = Math.round(shot.data[idx] * (1 - t) + 255 * t);
    heat.data[idx + 1] = Math.round(shot.data[idx + 1] * (1 - t * 0.85));
    heat.data[idx + 2] = Math.round(shot.data[idx + 2] * (1 - t * 0.85));
    heat.data[idx + 3] = 255;

    const refIdx = (y * side.width + x) * 4;
    const rIdx = (y * side.width + (x + W + 16)) * 4;
    const maskedValue = isMasked ? 205 : null;
    side.data[refIdx] = maskedValue ?? ref.data[idx];
    side.data[refIdx + 1] = maskedValue ?? ref.data[idx + 1];
    side.data[refIdx + 2] = maskedValue ?? ref.data[idx + 2];
    side.data[refIdx + 3] = 255;
    side.data[rIdx] = shot.data[idx];
    side.data[rIdx + 1] = shot.data[idx + 1];
    side.data[rIdx + 2] = shot.data[idx + 2];
    side.data[rIdx + 3] = 255;
  }
}

const scored = Object.values(region).reduce((acc, r) => acc + r.pixels, 0);
const stats = {
  scoredPixels: scored,
  over5,
  over5Pct: +((over5 / scored) * 100).toFixed(3),
  edgeTolerant: {
    pixels: edgeFreePixels,
    over5: over5EdgeTolerant,
    over5Pct: +((over5EdgeTolerant / edgeFreePixels) * 100).toFixed(3),
  },
  meanDeltaE: +(sum / total).toFixed(3),
  maxDeltaE: +max.toFixed(2),
  regions: Object.fromEntries(
    Object.entries(region).map(([k, v]) => [
      k,
      { over5Pct: +((v.over5 / v.pixels) * 100).toFixed(3), over5: v.over5 },
    ]),
  ),
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/S05-ref-window.png`, PNG.sync.write(ref));
writeFileSync(`${OUT_DIR}/S05-shot-window.png`, PNG.sync.write(shot));
writeFileSync(`${OUT_DIR}/S05-side-by-side.png`, PNG.sync.write(side));
writeFileSync(`${OUT_DIR}/S05-heat-structural.png`, PNG.sync.write(heat));
console.log(JSON.stringify(stats, null, 2));
