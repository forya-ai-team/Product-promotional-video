import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { DmexWordmark } from '../ui/brand/DmexWordmark';
import { PlatformMark, type PlatformId } from '../ui/brand/PlatformIcons';
import { S02_DURATION } from '../timeline';
import { BigCursor } from '../ui/tolink/BigCursor';

// Adaptation of video-shotcraft beat-step-list-theme-cycle: the source card
// steps a word list under a fixed pill on 18f beats. A picker cannot step past
// its last real platform, so the list stays put and the lens (the selected
// row's fill + clipped copy of the same row) hops down one row per beat, while
// the field tint, counter and swatches cross-mix on the exact same clock.
// The beat is 15f (the score's 120 BPM downbeat grid) instead of the card's 18f,
// so the four picker clicks land on the kick; the glide and ripple shrink with
// it and every beat keeps genuine still time.
const W = 1920;
const H = 1080;

const LIST_X = 520;
const LIST_W = 880;
const LIST_TOP = 318;
const ROW_H = 106;
const ROW_GAP = 18;
const PITCH = ROW_H + ROW_GAP;
const ROW_RADIUS = 32;
const CHIP = 74;
const CHIP_INSET = 26;
const LABEL_X = 124;
const RADIO = 30;
const RADIO_INSET = 30;

const HEADING_Y = 196;
const CAPTION_Y = 830;
const SWATCH_Y = 906;
const MARGIN = 120;

const FONT = '"Microsoft YaHei", "Segoe UI", system-ui, sans-serif';
const LABEL_FONT = '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif';
const DIGIT_FONT = '"Consolas", "Cascadia Code", monospace';
const INK = '#16233C';

const CHIP_CENTER_X = LIST_X + CHIP_INSET + CHIP / 2;
const rowTop = (index: number) => LIST_TOP + index * PITCH;
const rowCenter = (index: number) => rowTop(index) + ROW_H / 2;

const CAM_END = 1.025;
// Screen rect of the settled TikTok lens (row 3) under the final camera zoom;
// the portal-wipe grows S03's window out of it.
export const S02_LENS_RECT = {
  left: 960 + (LIST_X - 960) * CAM_END,
  top: 560 + (rowTop(3) - 560) * CAM_END,
  width: LIST_W * CAM_END,
  height: ROW_H * CAM_END,
  radius: ROW_RADIUS * CAM_END,
};

type PlatformTheme = {
  id: PlatformId;
  label: string;
  field: string;
  pill: string;
  ink: string;
  wash1: string;
  wash2: string;
};

// Each platform gets a pale field tint, a saturated pill and the ink that rides
// on that pill. TikTok's field drains to neutral grey and its wash splits into
// the cyan/red duotone so the last beat reads as a brand takeover.
const PLATFORMS: PlatformTheme[] = [
  {
    id: 'telegram',
    label: 'TELEGRAM',
    field: '#D9EEFA',
    pill: '#229ED9',
    ink: '#FFFFFF',
    wash1: '#229ED9',
    wash2: '#229ED9',
  },
  {
    id: 'whatsapp',
    label: 'WHATSAPP',
    field: '#D9F5E4',
    pill: '#25D366',
    ink: '#06301B',
    wash1: '#25D366',
    wash2: '#25D366',
  },
  {
    id: 'facebook',
    label: 'FACEBOOK',
    field: '#D9E7FC',
    pill: '#1877F2',
    ink: '#FFFFFF',
    wash1: '#1877F2',
    wash2: '#1877F2',
  },
  {
    id: 'tiktok',
    label: 'TIKTOK',
    field: '#EDEDF1',
    pill: '#111318',
    ink: '#FFFFFF',
    wash1: '#25F4EE',
    wash2: '#FE2C55',
  },
];

const NEUTRAL = { field: '#F7F9FD', wash1: '#2E68FF', wash2: '#2E68FF' };
const FIELD_STATES = [
  NEUTRAL,
  ...PLATFORMS.map((platform) => ({
    field: platform.field,
    wash1: platform.wash1,
    wash2: platform.wash2,
  })),
];

const BEAT_LEN = 15;
const FIRST_BEAT = 42;
const SNAP = 6;
const GLIDE = 11;
const RIPPLE_LIFE = 22;
const CLICKS = PLATFORMS.map((_, index) => FIRST_BEAT + index * BEAT_LEN);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const ENTER = Easing.bezier(0, 0, 0.2, 1);
const TRAVEL = Easing.bezier(0.3, 0, 0.25, 1);
const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const ramp = (
  frame: number,
  start: number,
  duration: number,
  easing = ENTER,
) => easing(clamp01((frame - start) / duration));

// The card's 6f jump: a steep ease-out that finishes inside the beat head and
// leaves the rest of the beat genuinely still.
const snap = (value: number) => 1 - Math.pow(1 - clamp01(value), 3.2);

const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixRgb = (a: string, b: string, t: number) => {
  const from = hexRgb(a);
  const to = hexRgb(b);
  return from.map((value, index) => Math.round(value + (to[index] - value) * t));
};
const cssRgb = (rgb: number[], alpha = 1) =>
  alpha >= 1
    ? `rgb(${rgb.join(',')})`
    : `rgba(${rgb.join(',')},${alpha.toFixed(3)})`;
const lighten = (rgb: number[], k: number) =>
  rgb.map((value) => Math.round(value + (255 - value) * k));
const darken = (rgb: number[], k: number) =>
  rgb.map((value) => Math.round(value * (1 - k)));

const clockAt = (frame: number) => {
  if (frame < FIRST_BEAT) {
    return { beat: 0, t: 0, step: 0, sinceBeat: 999 };
  }
  const beat = Math.min(
    PLATFORMS.length,
    Math.floor((frame - FIRST_BEAT) / BEAT_LEN) + 1,
  );
  const start = FIRST_BEAT + (beat - 1) * BEAT_LEN;
  const t = snap((frame - start) / SNAP);
  return { beat, t, step: beat - 1 + t, sinceBeat: frame - start };
};

const cursorAnchor = (index: number) => ({
  x: CHIP_CENTER_X + 22,
  y: rowCenter(index) + 12,
});

const cursorAt = (frame: number) => {
  let index = 0;
  CLICKS.forEach((click, i) => {
    if (frame >= click) index = i;
  });
  const next = Math.min(CLICKS.length - 1, index + 1);
  const nextClick = CLICKS[next];
  let from = index;
  let to = index;
  let p = 1;
  if (next !== index && frame >= nextClick - GLIDE && frame < nextClick) {
    from = index;
    to = next;
    p = TRAVEL(clamp01((frame - (nextClick - GLIDE)) / (GLIDE - 3)));
  }
  const a = cursorAnchor(from);
  const b = cursorAnchor(to);
  const click = CLICKS[index];
  const down = Easing.out(Easing.cubic)(clamp01((frame - (click - 3)) / 3));
  const up = Easing.inOut(Easing.sin)(clamp01((frame - (click + 1)) / 5));
  const press = frame < FIRST_BEAT ? 0 : down * (1 - up);
  return { x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), press };
};

const hoverAt = (frame: number, index: number) => {
  const click = CLICKS[index];
  const rise = Easing.out(Easing.cubic)(clamp01((frame - (click - GLIDE)) / (GLIDE - 4)));
  const fall = 1 - clamp01((frame - click) / 5);
  return rise * fall;
};

const CheckGlyph: FC<{ color: string }> = ({ color }) => (
  <svg width={15} height={15} viewBox="0 0 15 15" aria-hidden="true">
    <path
      d="M2.4 7.8 6 11.3 12.7 3.9"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RowContent: FC<{
  index: number;
  active: boolean;
  hover: number;
}> = ({ index, active, hover }) => {
  const platform = PLATFORMS[index];
  const chipScale = active ? 1 : 1 + 0.035 * hover;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: CHIP_INSET,
          top: (ROW_H - CHIP) / 2,
          width: CHIP,
          height: CHIP,
          boxSizing: 'border-box',
          borderRadius: 22,
          background: '#FFFFFF',
          border: '1px solid rgba(20,35,60,0.06)',
          boxShadow: active
            ? '0 12px 26px -14px rgba(8,18,38,0.40)'
            : '0 8px 18px -14px rgba(8,18,38,0.30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${chipScale.toFixed(4)})`,
        }}
      >
        <PlatformMark id={platform.id} size={44} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: LABEL_X,
          top: 0,
          height: ROW_H,
          display: 'flex',
          alignItems: 'center',
          fontFamily: LABEL_FONT,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          color: active
            ? platform.ink
            : `rgba(27,36,54,${(0.52 + 0.2 * hover).toFixed(3)})`,
        }}
      >
        {platform.label}
      </div>

      <div
        style={{
          position: 'absolute',
          right: RADIO_INSET,
          top: (ROW_H - RADIO) / 2,
          width: RADIO,
          height: RADIO,
          boxSizing: 'border-box',
          borderRadius: RADIO / 2,
          border: active ? 'none' : '2px solid rgba(27,36,54,0.16)',
          background: active ? platform.ink : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {active ? <CheckGlyph color={platform.pill} /> : null}
      </div>
    </>
  );
};

const ClickFx: FC<{ index: number; frame: number }> = ({ index, frame }) => {
  const age = frame - CLICKS[index];
  if (age < 0 || age >= RIPPLE_LIFE) return null;
  const platform = PLATFORMS[index];
  const cx = CHIP_CENTER_X;
  const cy = rowCenter(index);
  const rings = [0, 6].map((delay) => {
    const p = clamp01((age - delay) / RIPPLE_LIFE);
    const fade = Math.pow(1 - p, 1.3);
    return {
      delay,
      visible: age >= delay,
      radius: 28 + 64 * p,
      color: delay === 0 ? cssRgb(hexRgb(platform.pill), 0.5 * fade) : `rgba(255,255,255,${(0.8 * fade).toFixed(3)})`,
      width: delay === 0 ? 3 : 2,
      shadow: delay === 0 ? undefined : `0 0 12px ${cssRgb(hexRgb(platform.pill), 0.45 * fade)}`,
    };
  });

  return (
    <>
      {rings.map((ring) =>
        !ring.visible ? null : (
          <div
            key={ring.delay}
            style={{
              position: 'absolute',
              left: cx - ring.radius,
              top: cy - ring.radius,
              width: ring.radius * 2,
              height: ring.radius * 2,
              borderRadius: '50%',
              border: `${ring.width}px solid ${ring.color}`,
              boxShadow: ring.shadow,
            }}
          />
        ),
      )}
    </>
  );
};

export const S02: FC = () => {
  const frame = useCurrentFrame();
  const { beat, t, step, sinceBeat } = clockAt(frame);

  const prevField = FIELD_STATES[Math.max(0, beat - 1)];
  const nowField = FIELD_STATES[beat];
  const mixT = beat === 0 ? 0 : t;
  const field = mixRgb(prevField.field, nowField.field, mixT);
  const wash1 = mixRgb(prevField.wash1, nowField.wash1, mixT);
  const wash2 = mixRgb(prevField.wash2, nowField.wash2, mixT);

  const current = beat > 0 ? PLATFORMS[beat - 1] : null;
  const previous = beat > 1 ? PLATFORMS[beat - 2] : null;
  const pillRgb = current
    ? mixRgb(previous?.pill ?? current.pill, current.pill, beat === 1 ? 0 : t)
    : null;

  const pillTop = beat === 0 ? 0 : beat === 1 ? rowTop(0) : rowTop(beat - 2) + t * PITCH;
  const washY = beat === 0 ? 540 : beat === 1 ? rowCenter(0) : mix(rowCenter(beat - 2), rowCenter(beat - 1), t);

  const squashY = beat === 0 ? 1 : interpolate(t, [0, 0.6, 1], [1.14, 0.96, 1], CLAMP);
  const squashX = beat === 0 ? 1 : interpolate(t, [0, 0.6, 1], [0.97, 1.01, 1], CLAMP);
  const openX = beat === 1 ? mix(0.55, 1, t) : 1;
  const pillOpacity = beat === 0 ? 0 : beat === 1 ? clamp01(t * 4) : 1;
  const hit = beat === 0 ? 0 : Math.exp(-sinceBeat / 3.2);
  // Mid-hop the lens covers the gap between rows; a short vertical blur makes
  // those 2–3 frames read as motion (the card's SpeedBlur) instead of a bar.
  const slideBlur = beat >= 2 ? 5 * Math.sin(Math.PI * t) : 0;

  const cam = mix(1, CAM_END, ramp(frame, 0, S02_DURATION, Easing.inOut(Easing.sin)));
  const chromeIn = ramp(frame, 0, 12);
  const headingIn = ramp(frame, 3, 16);
  const swatchIn = ramp(frame, 20, 14, Easing.out(Easing.cubic));
  const cursorIn = ramp(frame, 20, 12);
  const captionIn = ramp(frame, FIRST_BEAT + 4 * BEAT_LEN - 2, 14);

  const cursor = cursorAt(frame);
  const cursorOpacity =
    cursorIn * (1 - ramp(frame, CLICKS[CLICKS.length - 1] + 6, 12));

  const roll = beat === 0 ? 0 : beat - 1 + t;
  const fieldCss = cssRgb(field);
  const washYPct = ((washY / H) * 100).toFixed(1);

  return (
    <AbsoluteFill style={{ background: fieldCss, overflow: 'hidden', fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(56% 52% at 50% ${washYPct}%, ${cssRgb(wash1, 0.14 + 0.05 * hit)} 0%, ${cssRgb(wash1, 0.055)} 46%, ${cssRgb(wash1, 0)} 74%)`,
            `radial-gradient(44% 40% at 76% 66%, ${cssRgb(wash2, 0.09)} 0%, ${cssRgb(wash2, 0)} 72%)`,
            'radial-gradient(50% 46% at 22% 6%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          ].join(', '),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(74, 104, 160, 0.30) 1px, transparent 1.1px)',
          backgroundSize: '46px 46px',
          backgroundPosition: `0 ${(step * 15).toFixed(2)}px`,
          maskImage:
            'radial-gradient(ellipse 70% 66% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 52%, #000 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 66% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 52%, #000 100%)',
          opacity: 0.5,
        }}
      />

      <AbsoluteFill style={{ transform: `scale(${cam.toFixed(5)})`, transformOrigin: '960px 560px' }}>
        <div
          style={{
            position: 'absolute',
            left: MARGIN,
            top: 76,
            opacity: chromeIn,
            transform: `translateY(${(1 - chromeIn) * 8}px)`,
          }}
        >
          <DmexWordmark width={208} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 84,
            right: MARGIN,
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
            opacity: chromeIn,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: 'rgba(22,35,60,0.44)',
            }}
          >
            CHANNEL
          </span>
          <span
            style={{
              display: 'inline-block',
              height: 44,
              overflow: 'hidden',
              fontFamily: DIGIT_FONT,
              fontSize: 34,
              fontWeight: 600,
              color: INK,
            }}
          >
            <span
              style={{
                display: 'block',
                transform: `translateY(${(-roll * 44).toFixed(2)}px)`,
              }}
            >
              {['00', '01', '02', '03', '04'].map((digit) => (
                <span key={digit} style={{ display: 'block', height: 44, lineHeight: '44px' }}>
                  {digit}
                </span>
              ))}
            </span>
          </span>
          <span style={{ fontFamily: DIGIT_FONT, fontSize: 30, color: 'rgba(22,35,60,0.38)' }}>
            / 04
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: HEADING_Y,
            left: 0,
            width: W,
            textAlign: 'center',
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: 2.5,
            color: INK,
            opacity: headingIn * 0.94,
            transform: `translateY(${(1 - headingIn) * 14}px)`,
          }}
        >
          选择要连接的社媒
        </div>

        {PLATFORMS.map((platform, index) => {
          const enter = ramp(frame, 4 + index * 5, 12);
          const hover = hoverAt(frame, index);
          return (
            <div
              key={platform.id}
              style={{
                position: 'absolute',
                left: LIST_X,
                top: rowTop(index) + (1 - enter) * 22,
                width: LIST_W,
                height: ROW_H,
                boxSizing: 'border-box',
                borderRadius: ROW_RADIUS,
                background: `rgba(255,255,255,${(0.78 + 0.12 * hover).toFixed(3)})`,
                border: `1px solid rgba(255,255,255,${(0.75 + 0.25 * hover).toFixed(3)})`,
                boxShadow: `0 18px 40px -34px rgba(20,40,80,0.55)${
                  hover > 0.01
                    ? `, 0 14px 34px -22px ${cssRgb(hexRgb(platform.pill), 0.5 * hover)}`
                    : ''
                }`,
                opacity: enter,
              }}
            >
              <RowContent index={index} active={false} hover={hover} />
            </div>
          );
        })}

        {current && pillRgb ? (
          <div
            style={{
              position: 'absolute',
              left: LIST_X,
              top: pillTop,
              width: LIST_W,
              height: ROW_H,
              borderRadius: ROW_RADIUS,
              overflow: 'hidden',
              background: `linear-gradient(180deg, ${cssRgb(lighten(pillRgb, 0.14))} 0%, ${cssRgb(pillRgb)} 52%, ${cssRgb(darken(pillRgb, 0.08))} 100%)`,
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.28)',
                `0 30px 60px -30px ${cssRgb(pillRgb, 0.55)}`,
                `0 0 ${(30 + 60 * hit).toFixed(1)}px ${cssRgb(pillRgb, 0.2 + 0.22 * hit)}`,
              ].join(', '),
              transform: `scale(${(squashX * openX).toFixed(4)}, ${squashY.toFixed(4)})`,
              transformOrigin: '50% 50%',
              opacity: pillOpacity,
              filter: slideBlur > 0.05 ? `blur(${slideBlur.toFixed(2)}px)` : undefined,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: LIST_TOP - pillTop,
                width: LIST_W,
              }}
            >
              {PLATFORMS.map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: index * PITCH,
                    width: LIST_W,
                    height: ROW_H,
                  }}
                >
                  <RowContent index={index} active hover={0} />
                </div>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 46%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : null}

        {CLICKS.map((_, index) => (
          <ClickFx key={index} index={index} frame={frame} />
        ))}

        <div style={{ opacity: cursorOpacity }}>
          <BigCursor x={cursor.x} y={cursor.y} scale={1.2 * (1 - 0.14 * cursor.press)} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: CAPTION_Y,
            left: 0,
            width: W,
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: 2,
            color: 'rgba(22,35,60,0.6)',
            opacity: captionIn,
            transform: `translateY(${(1 - captionIn) * 10}px)`,
          }}
        >
          已选择 TIKTOK
        </div>

        <div
          style={{
            position: 'absolute',
            left: MARGIN,
            top: SWATCH_Y,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: swatchIn,
          }}
        >
          {PLATFORMS.map((platform, index) => {
            const selected = beat === index + 1;
            const leaving = beat === index + 2;
            const pop = selected
              ? interpolate(t, [0, 0.6, 1], [0.7, 1.12, 1], CLAMP)
              : 1;
            const scale = selected ? pop : leaving ? mix(1, 0.72, t) : 0.72;
            const opacity = selected ? 1 : leaving ? mix(1, 0.42, t) : 0.42;
            return (
              <div
                key={platform.id}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: platform.pill,
                  border: '1px solid rgba(22,35,60,0.12)',
                  boxShadow: selected
                    ? `0 0 0 5px ${fieldCss}, 0 0 0 7px rgba(22,35,60,0.55), 0 0 26px ${cssRgb(hexRgb(platform.pill), 0.5)}`
                    : 'inset 0 1px 0 rgba(255,255,255,0.35)',
                  transform: `scale(${scale.toFixed(4)})`,
                  opacity,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
