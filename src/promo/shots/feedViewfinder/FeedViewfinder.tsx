import type { FC } from 'react';
import { Easing, interpolate } from 'remotion';

// reticle-lock-on adapted from video-shotcraft fui-hud-moves
// (pin 43bd349a136651865ecfa6ea1cf012f6e957d304,
// demos/effects/fui-hud-moves/ReticleLockOn.tsx): four L corners fly in from
// outside, lock with a back overshoot, bite once and name the target with a
// dark pill. The target here is the live proxy-toast window instead of a card,
// the fixed count follows gauge-readout-moves' tape-scroll-fixed-pointer idea,
// and the camera never moves — this is the whole point of D53.
//
// Window coordinates (ConnectionDesktop is 1920x932, content top 48). The toast
// feed sits at panel left 509 + sidebar 280 = window x 789, top 48 + 17 = 65;
// the frame pads the top three 342x46 slots by 16px.
export const VF_FRAME = { x: 773, y: 49, w: 374, h: 214 } as const;

const ARM = 28;
const THICK = 3;
const ACCENT = '#3A57DB';
const DONE = '#19D682';

const LOCK_START = 84;
const LOCK_END = 93;
const LABEL_START = 95;
const HIT = 210;
const RELEASE_START = 240;
const RELEASE_END = 270;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const pad3 = (value: number) =>
  String(Math.min(90, Math.max(0, Math.round(value)))).padStart(3, '0');

const CORNERS = [
  { ax: 0, ay: 0, fromX: -380, fromY: -140, sx: 1, sy: 1 },
  { ax: 1, ay: 0, fromX: 380, fromY: -140, sx: -1, sy: 1 },
  { ax: 0, ay: 1, fromX: -380, fromY: 140, sx: 1, sy: -1 },
  { ax: 1, ay: 1, fromX: 380, fromY: 140, sx: -1, sy: -1 },
] as const;

const L_PATH = `M0 ${ARM} V0 H${ARM}`;

type FeedViewfinderProps = {
  frame: number;
  count: number;
};

export const FeedViewfinder: FC<FeedViewfinderProps> = ({ frame, count }) => {
  if (frame < LOCK_START - 2 || frame > RELEASE_END) return null;

  const lock = interpolate(frame, [LOCK_START, LOCK_END], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2.4)),
  });
  const release = interpolate(frame, [RELEASE_START, RELEASE_END], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const bite = interpolate(frame, [HIT, HIT + 1, HIT + 5], [0, 1, 0], clamp);
  const entryOpacity = clamp01((frame - (LOCK_START - 2)) / 3) * (1 - release);
  const inset = 6 * bite;

  const labelT = interpolate(frame, [LABEL_START, LABEL_START + 10], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.8)),
  });
  const labelOpacity = clamp01((frame - LABEL_START) / 3) * (1 - release);
  const done = count >= 90;
  const hitPulse = interpolate(frame, [HIT, HIT + 4, HIT + 14], [0, 1, 0], clamp);
  const offset = 1 - lock + release;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        width={1920}
        height={932}
        viewBox="0 0 1920 932"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        {CORNERS.map((corner) => {
          const x =
            VF_FRAME.x +
            corner.ax * VF_FRAME.w +
            corner.fromX * offset +
            (corner.ax === 0 ? inset : -inset);
          const y =
            VF_FRAME.y +
            corner.ay * VF_FRAME.h +
            corner.fromY * offset +
            (corner.ay === 0 ? inset : -inset);
          return (
            <g
              key={`${corner.ax}-${corner.ay}`}
              transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${corner.sx} ${corner.sy})`}
              opacity={entryOpacity}
            >
              <path
                d={L_PATH}
                fill="none"
                stroke="rgba(255,255,255,0.94)"
                strokeWidth={THICK + 2.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={L_PATH}
                fill="none"
                stroke={ACCENT}
                strokeWidth={THICK}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 1163,
          top: 71,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px 0 12px',
          borderRadius: 17,
          background: 'linear-gradient(180deg, #23252c 0%, #17181d 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(0,0,0,0.25), 0 2px 4px rgba(16,18,24,0.18), 0 12px 26px -10px rgba(16,18,24,0.42)',
          transform: `translateX(${(12 * release).toFixed(2)}px) scale(${labelT.toFixed(4)})`,
          transformOrigin: 'left center',
          opacity: labelOpacity,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: done ? DONE : ACCENT,
            transform: `scale(${(1 + 0.5 * hitPulse).toFixed(3)})`,
            boxShadow: done
              ? `0 0 0 ${(3 + 9 * hitPulse).toFixed(1)}px rgba(25,214,130,${(0.18 * (1 - hitPulse) + 0.05).toFixed(3)})`
              : '0 0 0 3px rgba(58,87,219,0.18)',
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '0.01em',
          }}
        >
          代理IP
        </span>
        <span
          style={{
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 20,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.82)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.08em',
          }}
        >
          {pad3(count)}
        </span>
      </div>
    </div>
  );
};
