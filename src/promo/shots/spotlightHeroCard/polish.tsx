import type { CSSProperties, FC } from 'react';
import { useCurrentFrame } from 'remotion';

// Minimal deterministic helpers copied from vendor/video-shotcraft demos/_fixtures
// (Polish.tsx / Look.tsx, pin 43bd349): bezier easing, ramp, dust, grain.

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === y1 && x2 === y2) return (t: number) => clamp01(t);
  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  const solve = (x: number) => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - x;
      if (Math.abs(err) < 1e-7) return u;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : sy(solve(t)));
};

export const EASE = {
  snappy: bezier(0.16, 1, 0.3, 1),
  out: bezier(0.22, 1, 0.36, 1),
  smooth: bezier(0.65, 0, 0.35, 1),
  swift: bezier(0.4, 0, 0.2, 1),
  linear: (t: number) => clamp01(t),
};

export const ramp = (
  frame: number,
  start: number,
  dur: number,
  ease: (t: number) => number = EASE.snappy,
) => ease(clamp01((frame - start) / Math.max(1e-6, dur)));

export const rgbOf = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
export const alpha = (hex: string, a: number) => `rgba(${rgbOf(hex)},${a})`;

const hash = (n: number) => {
  const x = Math.sin(n * 91.345 + 47.853) * 43758.5453;
  return x - Math.floor(x);
};

export const Dust: FC<{
  count?: number;
  seed?: number;
  drift?: number;
  opacity?: number;
  color?: string;
}> = ({ count = 36, seed = 4, drift = 0.3, opacity = 0.6, color = '#fff1dc' }) => {
  const frame = useCurrentFrame();
  const rgb = rgbOf(color);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const z = hash(seed * 31 + i * 7.1);
        const size = 2 + z * z * 16;
        const x = (((hash(seed * 13 + i * 3.7) * 2120 + frame * drift * (0.4 + z)) % 2120) + 2120) % 2120 - 100;
        const y = hash(seed * 17 + i * 5.3) * 1080 - frame * drift * 0.3 * (0.5 + z);
        const tw = 0.5 + 0.5 * Math.sin(frame / (14 + z * 20) + i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: ((y % 1180) + 1180) % 1180 - 50,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${rgb},0.9) 0%, rgba(${rgb},0) 70%)`,
              opacity: (0.25 + 0.75 * tw) * (0.3 + z * 0.7),
              filter: z > 0.7 ? `blur(${((z - 0.7) * 10).toFixed(1)}px)` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

const grainHash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const grainCache = new Map<string, string>();
const grainTile = (variant: number, tile: number, freq: number) => {
  const key = `${variant}|${tile}|${freq}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${variant * 17 + 3}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='linear' slope='2.4' intercept='-0.7'/><feFuncG type='linear' slope='2.4' intercept='-0.7'/><feFuncB type='linear' slope='2.4' intercept='-0.7'/></feComponentTransfer></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  grainCache.set(key, url);
  return url;
};

export const Grain: FC<{
  opacity?: number;
  step?: number;
  scale?: number;
  freq?: number;
  blend?: CSSProperties['mixBlendMode'];
}> = ({ opacity = 0.06, step = 2, scale = 1, freq = 0.85, blend = 'soft-light' }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / Math.max(1, step));
  const tile = 256;
  const ox = Math.floor(grainHash(k * 3 + 1) * tile);
  const oy = Math.floor(grainHash(k * 7 + 2) * tile);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blend,
        backgroundImage: grainTile(k % 6, tile, freq),
        backgroundSize: `${tile * scale}px ${tile * scale}px`,
        backgroundPosition: `${ox}px ${oy}px`,
      }}
    />
  );
};
