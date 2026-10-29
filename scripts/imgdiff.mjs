import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Generic two-frame pixel diff for seam / regression checks.
//   node scripts/imgdiff.mjs <a.png> <b.png> [out-diff.png]
const [a, b, out = 'out/qa/imgdiff.png'] = process.argv.slice(2);
if (!a || !b) {
  console.error('usage: node scripts/imgdiff.mjs <a.png> <b.png> [out-diff.png]');
  process.exit(1);
}

const A = PNG.sync.read(fs.readFileSync(a));
const B = PNG.sync.read(fs.readFileSync(b));
if (A.width !== B.width || A.height !== B.height) {
  console.error(`size mismatch: ${A.width}x${A.height} vs ${B.width}x${B.height}`);
  process.exit(1);
}

let max = 0;
let sum = 0;
let changed = 0;
for (let i = 0; i < A.data.length; i += 4) {
  const d = Math.max(
    Math.abs(A.data[i] - B.data[i]),
    Math.abs(A.data[i + 1] - B.data[i + 1]),
    Math.abs(A.data[i + 2] - B.data[i + 2]),
  );
  if (d === 0) continue;
  changed += 1;
  sum += d;
  if (d > max) max = d;
}

const diff = new PNG({ width: A.width, height: A.height });
const mismatch = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.1 });
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, PNG.sync.write(diff));

const total = A.width * A.height;
console.log(`identical: ${changed === 0}`);
console.log(`anyDelta: ${changed} px (${((100 * changed) / total).toFixed(3)}%)  maxChannelDelta: ${max}  meanDelta: ${(sum / Math.max(1, changed)).toFixed(2)}`);
console.log(`pixelmatch@0.1: ${mismatch} px (${((100 * mismatch) / total).toFixed(3)}%)  -> ${out}`);
