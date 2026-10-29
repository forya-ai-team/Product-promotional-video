import fs from 'node:fs';

// Find a seamless jump point that stretches a track by `need` seconds:
// play [0..j], jump back to i=j-L and replay [i..j] r-1 more times, then
// continue from j. The splice is invisible when the audio leading into i and
// into j are the same, so score = NCC(env[i-W..i], env[j-W..j]).
//   node scripts/bgm-loop-search.mjs <mono-pcm16.wav> <needSeconds>

const [file, needArg] = process.argv.slice(2);
const NEED = Number(needArg);
const SR = 48000;
if (!file || !Number.isFinite(NEED)) {
  console.error('usage: node scripts/bgm-loop-search.mjs <mono-pcm16.wav> <needSeconds>');
  process.exit(1);
}

const buf = fs.readFileSync(file);
let off = 12;
let ds = 0;
let dl = 0;
while (off + 8 <= buf.length) {
  const id = buf.toString('ascii', off, off + 4);
  const size = buf.readUInt32LE(off + 4);
  if (id === 'data') {
    ds = off + 8;
    dl = size;
    break;
  }
  off += 8 + size + (size % 2);
}
const n = Math.floor(dl / 2);
const x = new Float64Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(ds + i * 2) / 32768;
const dur = n / SR;

const STEP = 0.05;
const H = Math.round(SR * STEP);
const F = Math.floor(n / H);
const env = new Float64Array(F);
for (let f = 0; f < F; f++) {
  let a = 0;
  for (let i = 0; i < H; i++) {
    const v = x[f * H + i];
    a += v * v;
  }
  env[f] = Math.sqrt(a / H);
}

const ncc = (p, q, len) => {
  let sa = 0;
  let sb = 0;
  let saa = 0;
  let sbb = 0;
  let sab = 0;
  for (let k = 0; k < len; k++) {
    const a = env[p + k];
    const b = env[q + k];
    sa += a;
    sb += b;
    saa += a * a;
    sbb += b * b;
    sab += a * b;
  }
  const ma = sa / len;
  const mb = sb / len;
  const num = sab - len * ma * mb;
  const den = Math.sqrt((saa - len * ma * ma) * (sbb - len * mb * mb));
  return den > 1e-12 ? num / den : -1;
};

const W = Math.round(1.6 / STEP);
const GUARD = Math.round(4 / STEP);
console.log(`track ${dur.toFixed(3)}s  need +${NEED.toFixed(3)}s`);
const winners = [];
for (let r = 1; r <= 7; r++) {
  const L = NEED / r;
  const Ls = Math.round(L / STEP);
  if (Ls < 8) continue;
  let best = null;
  for (let i = GUARD; i + Ls + W < F - GUARD; i++) {
    const s = ncc(i - W, i + Ls - W, W);
    if (!best || s > best.s) best = { i, s };
  }
  if (!best) continue;
  const a = best.i * STEP;
  const b = a + L;
  // refine at 1 ms by waveform NCC around the envelope optimum
  let wb = { s: best.s, a, b };
  for (let da = -40; da <= 40; da += 2) {
    for (const db of [da]) {
      const A = a + da / 1000;
      const B = b + db / 1000;
      if (A < 2 || B + 1 > dur - 2) continue;
      const s = waveNcc(A, B);
      if (s > wb.s) wb = { s, a: A, b: B };
    }
  }
  winners.push({ r, L, ...wb });
  console.log(
    `  r=${r}  loop ${L.toFixed(3)}s  jump ${wb.b.toFixed(3)}s -> ${wb.a.toFixed(3)}s  score ${wb.s.toFixed(3)}`,
  );
}

function waveNcc(aSec, bSec) {
  const WLEN = Math.round(1.6 * SR);
  const pa = Math.round(aSec * SR) - WLEN;
  const pb = Math.round(bSec * SR) - WLEN;
  if (pa < 0 || pb + WLEN > n) return -1;
  let sa = 0;
  let sb = 0;
  let saa = 0;
  let sbb = 0;
  let sab = 0;
  for (let k = 0; k < WLEN; k += 4) {
    const a = x[pa + k];
    const b = x[pb + k];
    sa += a;
    sb += b;
    saa += a * a;
    sbb += b * b;
    sab += a * b;
  }
  const m = WLEN / 4;
  const num = sab - m * (sa / m) * (sb / m);
  const den = Math.sqrt((saa - m * (sa / m) ** 2) * (sbb - m * (sb / m) ** 2));
  return den > 1e-12 ? num / den : -1;
}

winners.sort((p, q) => q.s - p.s);
console.log('best:', winners[0] ? `r=${winners[0].r} jump ${winners[0].b.toFixed(3)} -> ${winners[0].a.toFixed(3)} score ${winners[0].s.toFixed(3)}` : 'none');
