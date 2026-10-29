import fs from 'node:fs';

// Stretch a track by replaying one section, with equal-power crossfades at both
// splices, then gain-stage it to sit where the previous BGM stem sat.
//   node scripts/bgm-loop.mjs <in.wav> <out.wav> <jumpFromSec> <jumpToSec> <gainDb> <targetSec>
// Plays [0..jumpTo] + [jumpFrom..jumpTo] + [jumpTo..end]; jumpTo - jumpFrom is
// the amount of extra time needed.

const [inp, outp, fromArg, toArg, gainArg, targetArg] = process.argv.slice(2);
const JUMP_FROM = Number(fromArg);
const JUMP_TO = Number(toArg);
const GAIN_DB = Number(gainArg);
const TARGET = Number(targetArg);
if (![JUMP_FROM, JUMP_TO, GAIN_DB, TARGET].every(Number.isFinite)) {
  console.error('usage: node scripts/bgm-loop.mjs <in.wav> <out.wav> <jumpFromSec> <jumpToSec> <gainDb> <targetSec>');
  process.exit(1);
}

const buf = fs.readFileSync(inp);
let p = 12;
let ch = 2;
let sr = 48000;
let ds = 0;
let dl = 0;
while (p + 8 <= buf.length) {
  const id = buf.toString('ascii', p, p + 4);
  const size = buf.readUInt32LE(p + 4);
  if (id === 'fmt ') {
    ch = buf.readUInt16LE(p + 10);
    sr = buf.readUInt32LE(p + 12);
  }
  if (id === 'data') {
    ds = p + 8;
    dl = size;
    break;
  }
  p += 8 + size + (size % 2);
}
const frames = Math.floor(dl / (2 * ch));
const x = [Float64Array.from({ length: frames }, (_, i) => buf.readInt16LE(ds + i * 2 * ch) / 32768)];
for (let c = 1; c < ch; c++) {
  x.push(Float64Array.from({ length: frames }, (_, i) => buf.readInt16LE(ds + (i * 2 + 1) * ch) / 32768));
}
const at = (sec) => Math.round(sec * sr);
const X = at(0.025);
const gain = Math.pow(10, GAIN_DB / 20);

const segs = [
  [0, at(JUMP_TO)],
  [at(JUMP_FROM), at(JUMP_TO)],
  [at(JUMP_TO), frames],
];

const out = x.map(() => []);
let written = 0;
segs.forEach(([a, b], si) => {
  let from = a;
  if (si > 0) {
    // equal-power crossfade the previous tail into this head
    for (let k = 0; k < X; k++) {
      const t = (k + 1) / (X + 1);
      const gi = Math.sqrt(1 - t);
      const go = Math.sqrt(t);
      for (let c = 0; c < ch; c++) {
        const row = out[c];
        row[row.length - X + k] = row[row.length - X + k] * gi + x[c][from + k] * go;
      }
    }
    from += X;
  }
  for (let i = from; i < b; i++) for (let c = 0; c < ch; c++) out[c].push(x[c][i]);
  written += b - from;
});

const want = Math.round(TARGET * sr);
const fade = Math.round(1.2 * sr);
const finalRows = [];
for (let c = 0; c < ch; c++) {
  const src = out[c];
  const g = new Float64Array(want);
  const len = Math.min(want, src.length);
  for (let i = 0; i < len; i++) g[i] = src[i] * gain;
  // fade the last 1.2 s so the stretch ends as gently as the source outro
  for (let i = 0; i < fade; i++) g[want - fade + i] *= (i / fade) ** 2;
  finalRows.push(g);
}

const dataBytes = want * ch * 2;
const head = Buffer.alloc(44);
head.write('RIFF', 0);
head.writeUInt32LE(36 + dataBytes, 4);
head.write('WAVE', 8);
head.write('fmt ', 12);
head.writeUInt32LE(16, 16);
head.writeUInt16LE(1, 20);
head.writeUInt16LE(ch, 22);
head.writeUInt32LE(sr, 24);
head.writeUInt32LE(sr * ch * 2, 28);
head.writeUInt16LE(ch * 2, 32);
head.writeUInt16LE(16, 34);
head.write('data', 36);
head.writeUInt32LE(dataBytes, 40);
const data = Buffer.alloc(dataBytes);
for (let i = 0; i < want; i++) {
  for (let c = 0; c < ch; c++) {
    let v = Math.max(-1, Math.min(1, finalRows[c][i]));
    data.writeInt16LE(Math.round(v * 32767), i * ch * 2 + c * 2);
  }
}
fs.writeFileSync(outp, Buffer.concat([head, data]));
console.log(
  `wrote ${outp}  ${(want / sr).toFixed(3)}s (${Math.round((want / sr) * 30)}f @30fps)  ch=${ch} sr=${sr}  gain ${GAIN_DB.toFixed(2)}dB  loop ${JUMP_FROM.toFixed(3)}..${JUMP_TO.toFixed(3)} (+${(JUMP_TO - JUMP_FROM).toFixed(3)}s)  xfade 25ms`,
);
