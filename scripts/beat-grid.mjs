import fs from 'node:fs';

// Beat-grid probe for a candidate BGM file (no deps; replaces the librosa path
// when librosa is unavailable).
//   node scripts/beat-grid.mjs <mono-pcm16.wav> [fps]
// Prints tempo candidates, the first-beat phase, how tightly the grid locks to
// onsets, and the head/tail silence so an edit point can be chosen.

const [file, fpsArg] = process.argv.slice(2);
const FPS = Number(fpsArg ?? 30);
if (!file) {
  console.error('usage: node scripts/beat-grid.mjs <mono-pcm16.wav> [fps]');
  process.exit(1);
}

const buf = fs.readFileSync(file);
let off = 12;
let sr = 48000;
let dataStart = 0;
let dataLen = 0;
while (off + 8 <= buf.length) {
  const id = buf.toString('ascii', off, off + 4);
  const size = buf.readUInt32LE(off + 4);
  if (id === 'fmt ') sr = buf.readUInt32LE(off + 12);
  if (id === 'data') {
    dataStart = off + 8;
    dataLen = size;
    break;
  }
  off += 8 + size + (size % 2);
}
if (!dataLen) throw new Error('no data chunk');

const n = Math.floor(dataLen / 2);
const x = new Float64Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(dataStart + i * 2) / 32768;

const HOP = Math.round(sr / 100); // 10 ms
const frames = Math.floor(n / HOP);
const low = new Float64Array(frames);
const a = 1 - Math.exp((-2 * Math.PI * 150) / sr);
let y = 0;
for (let f = 0; f < frames; f++) {
  let acc = 0;
  for (let i = 0; i < HOP; i++) {
    y += a * (x[f * HOP + i] - y);
    acc += Math.abs(y);
  }
  low[f] = acc / HOP;
}

const onset = new Float64Array(frames);
for (let f = 1; f < frames; f++) onset[f] = Math.max(0, low[f] - low[f - 1]);
const mean = onset.reduce((s, v) => s + v, 0) / frames;

const lagOf = (bpm) => Math.round((60 / bpm) * 100);
const score = (lag) => {
  let s = 0;
  for (let f = lag; f < frames; f++) s += onset[f] * onset[f - lag];
  return s / (frames - lag) / (mean * mean || 1e-12);
};

const cands = [];
for (let lag = lagOf(200); lag <= lagOf(58); lag++) cands.push({ lag, bpm: 6000 / lag, s: score(lag) });
cands.sort((p, q) => q.s - p.s);
const top = cands.filter((c, i) => cands.slice(0, 8).every((o) => o.lag !== c.lag) || i < 8).slice(0, 6);

const best = top[0];
let phase = 0;
let phaseScore = -1;
for (let p = 0; p < best.lag; p++) {
  let s = 0;
  for (let f = p; f < frames; f += best.lag) s += onset[f];
  if (s > phaseScore) {
    phaseScore = s;
    phase = p;
  }
}
const beats = Math.floor((frames - phase) / best.lag);
let onGrid = 0;
let offGrid = 0;
for (let f = 0; f < frames; f++) {
  const d = Math.abs(((f - phase) % best.lag + best.lag) % best.lag);
  if (d <= 2 || d >= best.lag - 2) onGrid += onset[f];
  else offGrid += onset[f];
}
const lock = onGrid / (onGrid + offGrid || 1);

const rmsAt = (sec) => {
  const s = Math.max(0, Math.min(n - HOP, Math.floor(sec * sr)));
  let acc = 0;
  for (let i = 0; i < HOP; i++) acc += x[s + i] * x[s + i];
  return Math.sqrt(acc / HOP);
};
let head = 0;
while (head < frames && rmsAt(head / 100) < 0.004) head++;
let tailSec = (n / sr).toFixed(3);
for (let t = n / sr; t > 0; t -= 0.25) {
  if (rmsAt(Math.max(0, t - 0.2)) > 0.01) {
    tailSec = t.toFixed(3);
    break;
  }
}

const dur = n / sr;
console.log(`duration      ${dur.toFixed(3)}s = ${Math.round(dur * FPS)}f @${FPS}fps  (sr ${sr}, ${x.length ? 'mono pcm16' : ''})`);
console.log(`head sound    ${(head / 100).toFixed(2)}s   tail sound    ${tailSec}s`);
console.log(`tempo         ${best.bpm.toFixed(2)} BPM  (period ${best.lag}0ms, beat ${Math.round((60 / best.bpm) * FPS)}f)`);
console.log(`first beat    ${(phase / 100).toFixed(3)}s   beats counted  ${beats}`);
console.log(`grid lock     ${(lock * 100).toFixed(1)}% of onset energy on the grid (random ≈ ${(100 * (5 / best.lag)).toFixed(1)}%)`);
console.log('candidates    ' + top.slice(0, 5).map((c) => `${c.bpm.toFixed(1)}:${c.s.toFixed(2)}`).join('  '));
console.log('energy /4s    ' + Array.from({ length: Math.ceil(dur / 4) }, (_, i) => Math.round(rmsAt(i * 4 + 2) * 400)).join(' '));
