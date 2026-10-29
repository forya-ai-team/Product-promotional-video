// Tiles stills pulled from a rendered MP4 into one contact sheet.
// Usage: node scripts/contact-sheet.mjs <video> <out.png> <frame,frame,...> [cols]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PNG } from 'pngjs';

const [video, out, framesArg, colsArg] = process.argv.slice(2);
if (!video || !out || !framesArg) {
  console.error('usage: node scripts/contact-sheet.mjs <video> <out.png> <frame,frame,...> [cols]');
  process.exit(1);
}
const frames = framesArg.split(',').map((v) => Number(v.trim()));
const cols = Number(colsArg ?? 3);
const rows = Math.ceil(frames.length / cols);
const CELL_W = 960;
const CELL_H = 540;
const GAP = 8;

const bin = resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const dir = mkdtempSync(join(tmpdir(), 'sheet-'));
const shots = [];

try {
  for (const n of frames) {
    const p = join(dir, `${n}.png`);
    // Output seeking: the trimmed compositor build rejects `select=eq(...)`.
    // +1ms lands inside frame n; the very last frames are only reachable tail-seeked.
    const seek = ['-i', video, '-ss', (n / 30 + 0.001).toFixed(4), '-frames:v', '1', '-vf', `scale=${CELL_W}:${CELL_H}`, p];
    execFileSync(bin, ['-y', '-loglevel', 'error', ...seek]);
    if (!existsSync(p)) {
      execFileSync(bin, ['-y', '-loglevel', 'error', '-sseof', '-0.04', '-i', video, '-frames:v', '1', '-vf', `scale=${CELL_W}:${CELL_H}`, p]);
    }
    shots.push({ n, png: PNG.sync.read(readFileSync(p)) });
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const sheet = new PNG({ width: cols * CELL_W + (cols - 1) * GAP, height: rows * CELL_H + (rows - 1) * GAP });
sheet.data.fill(12);
for (const [i, shot] of shots.entries()) {
  PNG.bitblt(shot.png, sheet, 0, 0, CELL_W, CELL_H, (i % cols) * (CELL_W + GAP), Math.floor(i / cols) * (CELL_H + GAP));
}

writeFileSync(out, PNG.sync.write(sheet));
console.log(`${out}  ${frames.join(' / ')}`);
