import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const compositorByPlatform = {
  win32: ['@remotion/compositor-win32-x64-msvc/ffprobe.exe'],
  darwin: [
    '@remotion/compositor-darwin-arm64/ffprobe',
    '@remotion/compositor-darwin-x64/ffprobe',
  ],
  linux: [
    '@remotion/compositor-linux-x64-gnu/ffprobe',
    '@remotion/compositor-linux-x64-musl/ffprobe',
  ],
};

const ffprobePath = (compositorByPlatform[process.platform] ?? [])
  .map((relative) => join(root, 'node_modules', relative))
  .find((candidate) => existsSync(candidate));

if (!ffprobePath) {
  console.error('ffprobe not found in @remotion/compositor-*; run npm install first.');
  process.exit(1);
}

const file = process.argv[2] ?? 'out/final/promo-bgm.mp4';
if (!existsSync(file)) {
  console.error(`media not found: ${file}`);
  process.exit(1);
}

const output = execFileSync(
  ffprobePath,
  [
    '-v',
    'error',
    '-show_entries',
    'format=duration,size',
    '-show_entries',
    'stream=codec_name,width,height,r_frame_rate,sample_rate',
    '-of',
    'json',
    file,
  ],
  { encoding: 'utf8' },
);

console.log(output);
