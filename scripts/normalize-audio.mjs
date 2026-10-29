// Normalize the final film's audio track without re-encoding the video.
// Usage:
//   node scripts/normalize-audio.mjs bgm <in.mp4> <out.mp4>
//     two-pass loudnorm to -14 LUFS / TP -1 dBTP; prints the applied gain.
//   node scripts/normalize-audio.mjs gain <in.mp4> <out.mp4> <gainDb>
//     applies a fixed gain (used by the no-BGM cut so its SFX keep the same
//     level as the main mix).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const FFMPEG = 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
const TARGET_I = Number(process.env.LOUD_I ?? -14);
const TARGET_TP = Number(process.env.LOUD_TP ?? -1);

const [mode, input, output, gainArg] = process.argv.slice(2);
if (!mode || !input || !output) {
  console.error('usage: node scripts/normalize-audio.mjs bgm|gain <in.mp4> <out.mp4> [gainDb]');
  process.exit(1);
}

const run = (args) => {
  const r = spawnSync(FFMPEG, ['-hide_banner', ...args], { encoding: 'utf8' });
  return { code: r.status ?? 1, out: r.stdout ?? '', err: r.stderr ?? '' };
};

const measure = (file) => {
  const r = run([
    '-i', file, '-vn', '-map', '0:a:0',
    '-af', `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:print_format=json`, '-f', 'null', '-',
  ]);
  const text = r.err ?? '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('loudnorm did not return JSON:\n' + text.slice(-800));
  return JSON.parse(match[0]);
};

const encodeAudio = (file, out, filter) => {
  const r = run([
    '-y', '-i', file, '-c:v', 'copy', '-af', filter,
    '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', out,
  ]);
  if (r.code !== 0) throw new Error('ffmpeg encode failed');
};

if (!existsSync(input)) {
  console.error('missing input', input);
  process.exit(1);
}

if (mode === 'bgm') {
  const first = measure(input);
  const args = [
    '-y', '-i', input, '-c:v', 'copy',
    '-af',
    [
      `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11`,
      `measured_I=${first.input_i}`,
      `measured_TP=${first.input_tp}`,
      `measured_LRA=${first.input_lra}`,
      `measured_thresh=${first.input_thresh}`,
      `offset=${first.target_offset}`,
      'linear=true',
    ].join(':'),
    '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', output,
  ];
  const r = run(args);
  if (r.code !== 0) process.exit(1);
  const applied = Math.round((TARGET_I - Number(first.input_i)) * 10) / 10;
  const after = measure(output);
  console.log(JSON.stringify({ input: first, appliedGainDb: applied, output: after }, null, 2));
} else if (mode === 'gain') {
  const gainDb = Number(gainArg);
  if (!Number.isFinite(gainDb)) {
    console.error('gain mode needs a numeric gainDb');
    process.exit(1);
  }
  encodeAudio(input, output, `volume=${gainDb}dB`);
  const after = measure(output);
  console.log(JSON.stringify({ gainDb, output: after }, null, 2));
} else {
  console.error('unknown mode', mode);
  process.exit(1);
}
