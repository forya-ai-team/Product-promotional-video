import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { EASE, Grain, bezier, rgbOf } from '../shots/spotlightHeroCard/polish';
import { S055_DURATION } from '../timeline';

// aurora-bloom-bg-flip — vendor/video-shotcraft commit 43bd349
// demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip.tsx
// Timing follows the reference: rise 0.04→0.56, an 11f press-down (the card's
// 0.36s "flip"), A blurs out, one empty beat, then B blurs in and settles from
// accent to white. The light trio (main / transition / core) and B's text colour
// are swapped as one group to the brand-gold family so the afterglow hands off to S06.

const FONT = '"Microsoft YaHei", "Segoe UI", system-ui, sans-serif';
const GOLD_RGB = [211, 146, 60]; // tokens.color.accent — settles to white
const WHITE = [245, 245, 250];
const LIGHT = [236, 236, 236];
const DARK = [10, 11, 18];
const INK = '#16171C';

const DURATION = S055_DURATION; // 180f = 3 bars @120 BPM (reference 5.2s stretched 15%)
const RISE_FROM = 7;
const RISE_TO = 101;
const FLIP_FROM = 103;
const FLIP_TO = 114;
const SQUASH_TO = 125;
const A_OUT = 72;
const A_STAGGER = 6;
const A_LEN = 15;
const B_IN = 122;
const B_STAGGER = 6;
const B_LEN = 16;
const COLOR_LAG = 8;
const COLOR_LEN = 14;
const PUSH_TO = 105;

const CARD_A = Array.from('矩阵聚合');
// Chinese has no word gaps: split by phrase so the stagger still reads as
// "the sentence arriving", not as letter-by-letter karaoke.
const CARD_B = ['全天候托管', '与', '转化全链路执行'];

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const seg = (frame: number, from: number, to: number, ease = EASE.swift) =>
  ease(clamp01((frame - from) / (to - from)));
const mixRgb = (from: number[], to: number[], p: number) =>
  `rgb(${Math.round(mix(from[0], to[0], p))},${Math.round(mix(from[1], to[1], p))},${Math.round(
    mix(from[2], to[2], p),
  )})`;

const overshoot = bezier(0.34, 1.45, 0.64, 1);

// Blobs live in a 480×270 stage scaled 4× (the reference's design coordinates),
// so Chromium rasterises the 60px blur once instead of blurring full-frame layers.
const blob = (style: CSSProperties, color: string, stop = 68): CSSProperties => ({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  background: `radial-gradient(circle,${color} 0%,${color.replace(/[\d.]+\)$/, '0)')} ${stop}%)`,
  ...style,
});

const Vignette: FC<{ strength: number }> = ({ strength }) => {
  const c = rgbOf('#0c0c16');
  const inner = 0.45;
  const mid = inner + (1 - inner) * 0.55;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          `radial-gradient(ellipse 72% 72% at 50% 48%, rgba(${c},0) ${inner * 100}%, ` +
          `rgba(${c},${(strength * 0.32).toFixed(3)}) ${(mid * 100).toFixed(1)}%, rgba(${c},${strength.toFixed(3)}) 100%), ` +
          `radial-gradient(ellipse 100% 100% at 50% 48%, rgba(${c},0) 60%, rgba(${c},${(strength * 0.6).toFixed(3)}) 100%)`,
      }}
    />
  );
};

export const S055: FC = () => {
  const frame = useCurrentFrame();
  const t = frame / DURATION;

  const rise = seg(frame, RISE_FROM, RISE_TO, Easing.out(Easing.cubic));
  const flip = seg(frame, FLIP_FROM, FLIP_TO, Easing.inOut(Easing.quad));
  const squash = seg(frame, FLIP_FROM, SQUASH_TO, overshoot);
  const push = seg(frame, 0, PUSH_TO, EASE.swift);

  // The two warm layers drift at different frequencies so the bloom flows
  // inside instead of reading as one sliding ball.
  const drift = Math.sin(t * Math.PI * 2.2);
  const drift2 = Math.sin(t * Math.PI * 1.6 + 1.1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: mixRgb(LIGHT, DARK, flip),
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 1 - flip,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 8%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: flip,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(70,72,120,0.22) 0%, rgba(70,72,120,0) 70%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 480,
          height: 270,
          transform: 'scale(4)',
          transformOrigin: '0 0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            transform: `translateY(${mix(32, -6, rise)}%) scale(${(
              mix(1, 1.25, rise) *
              (1 - 0.06 * squash)
            ).toFixed(5)})`,
            opacity: mix(1, 0.4, flip),
          }}
        >
          <div
            style={blob(
              { left: '8%', bottom: '-45%', width: '90%', height: '85%' },
              'rgba(198,121,43,.9)',
            )}
          />
          <div
            style={blob(
              {
                left: '22%',
                bottom: '-36%',
                width: '60%',
                height: '58%',
                transform: `translateX(${drift2 * 6}%)`,
              },
              'rgba(205,84,95,.6)',
              64,
            )}
          />
          <div
            style={blob(
              {
                left: '32%',
                bottom: '-18%',
                width: '44%',
                height: '46%',
                transform: `translateX(${drift * 8}%)`,
              },
              'rgba(236,132,60,.94)',
              66,
            )}
          />
          <div
            style={{
              ...blob(
                { left: '-12%', bottom: '-40%', width: '64%', height: '60%' },
                'rgba(255,255,255,.8)',
                62,
              ),
              opacity: 1 - flip,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 104,
          letterSpacing: '-0.022em',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ position: 'absolute', transform: `scale(${mix(1, 1.035, push).toFixed(5)})` }}>
          {CARD_A.map((char, index) => {
            const start = A_OUT + index * A_STAGGER;
            const out = seg(frame, start, start + A_LEN, Easing.in(Easing.quad));
            return (
              <span
                key={char + index}
                style={{
                  display: 'inline-block',
                  color: INK,
                  opacity: 1 - out,
                  filter: out > 0.005 ? `blur(${(out * 32).toFixed(2)}px)` : undefined,
                  transform: `translateY(${(-out * 20).toFixed(2)}px)`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div style={{ position: 'absolute' }}>
          {CARD_B.map((chunk, index) => {
            const start = B_IN + index * B_STAGGER;
            // EASE.out is easeOutQuint, matching the reference's outQuint.
            const enter = seg(frame, start, start + B_LEN, EASE.out);
            const settle = seg(frame, start + COLOR_LAG, start + COLOR_LEN, Easing.out(Easing.quad));
            return (
              <span
                key={chunk}
                style={{
                  display: 'inline-block',
                  opacity: enter,
                  filter: enter < 0.995 ? `blur(${((1 - enter) * 32).toFixed(2)}px)` : undefined,
                  transform: `translateY(${((1 - enter) * 24).toFixed(2)}px)`,
                  color: mixRgb(GOLD_RGB, WHITE, settle),
                  textShadow: `0 0 ${(40 * (1 - settle)).toFixed(1)}px rgba(211,146,60,${(
                    0.45 *
                    enter *
                    (1 - settle)
                  ).toFixed(3)})`,
                }}
              >
                {chunk}
              </span>
            );
          })}
        </div>
      </div>

      <Vignette strength={mix(0.07, 0.55, flip)} />
      <Grain opacity={mix(0.05, 0.09, flip)} blend="soft-light" scale={0.25} />
    </AbsoluteFill>
  );
};
