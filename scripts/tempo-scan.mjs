import fs from 'node:fs';

// Fine tempo scan: for every BPM in a range, find the best phase and report how
// much of the onset energy lands on the grid. A real four-on-the-floor track
// shows a sharp peak; a pad-like or free-groove track stays flat.
//   node scripts/tempo-scan.mjs <mono-pcm16.wav> [bpmLo] [bpmHi]

const [file, loArg, hiArg] = process.argv.slice(2);
const lo = Number(loArg ?? 100);
const hi = Number(hiArg ?? 140);
const SR = 48000;

const buf = fs.readFileSync(file);
let off = 12;
let dataStart = 0;
let dataLen = 0;
while (off + 8 <= buf.length) {
  const id = buf.toString('ascii', off, off + 4);
  const size = buf.readUInt32LE(off + 4);
  if (id === 'data') {
    dataStart = off + 8;
    dataLen = size;
    break;
  }
  off += 8 + size + (size % 2);
}
const n = Math.floor(dataLen / 2);
const x = new Float64Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(dataStart + i * 2) / 32768;

const HOP = Math.round(SR / 200); // 5 ms
const frames = Math.floor(n / HOP);
const env = new Float64Array(frames);
const bands = [160, 1200, 6000].map((fc) => ({ a: 1 - Math.exp((-2 * Math.PI * fc) / SR), y: 0, prev: 0 }));
for (let f = 0; f < frames; f++) {
  let flux = 0;
  for (const b of bands) {
    let acc = 0;
    for (let i = 0; i < HOP; i++) {
      const s = x[f * HOP + i] ?? 0;
      b.y += b.a * (s - b.y);
      acc += b.y * b.y;
    }
    const e = Math.log(1 + acc / HOP);
    flux += Math.max(0, e - b.prev);
    b.prev = e;
  }
  env[f] = flux;
}

const total = env.reduce((s, v) => s + v, 0);
const rows = [];
for (let bpm = lo; bpm <= hi; bpm += 0.05) {
  const period = (60 / bpm) * 200;
  if (period < 4) continue;
  let bestPhase = 0;
  let bestScore = -1;
  const steps = Math.round(period);
  for (let p = 0; p < steps; p++) {
    let s = 0;
    for (let k = 0; k * period + p < frames; k++) {
      const i = Math.round(k * period + p);
      s += env[i];
      if (i + 1 < frames) s += env[i + 1] * 0.5;
    }
    if (s > bestScore) {
      bestScore = s;
      bestPhase = p;
    }
  }
  rows.push({ bpm: +bpm.toFixed(2), lock: bestScore / total, phase: bestPhase / 200 });
}
rows.sort((a, b) => b.lock - a.lock);
const flat = [...rows].sort((a, b) => a.bpm - b.bpm);
console.log(`onset frames ${frames} @5ms, total flux ${total.toFixed(1)}`);
console.log('top grid fits (lock = share of onset energy on the beat):');
for (const r of rows.slice(0, 10)) {
  console.log(`  ${String(r.bpm).padStart(6)} BPM   lock ${(r.lock * 100).toFixed(1)}%   phase ${r.phase.toFixed(3)}s   beat ${Math.round((60 / r.bpm) * 30)}f`);
}
const mean = flat.reduce((s, r) => s + r.lock, 0) / flat.length;
console.log(`across ${lo}-${hi} BPM: mean ${(mean * 100).toFixed(1)}%, best ${(rows[0].lock * 100).toFixed(1)}%, ratio ${(rows[0].lock / mean).toFixed(2)}x  (sharp pulse > 1.6x, weak < 1.3x)`);
