import type { FC } from 'react';
import { Easing, random, useCurrentFrame } from 'remotion';
import { sec } from '../timeline';
import { EASE, Grain } from '../shots/spotlightHeroCard/polish';
import { ConnectionDesktop, type CardVisualState } from '../ui/tolink/ConnectionDesktop';
import { Stage } from '../ui/tolink/Stage';
import {
  MessageRequestsRow,
  REQUESTS_ROW_HEIGHT,
  REQUESTS_ROW_WIDTH,
  TikTokMessages,
} from '../ui/tolink/TikTokMessages';

// 0–29 read the untouched page; at 30 the Message requests row is lifted out of
// the list into a floating frosted-glass card (D51) while the page behind
// defocuses into the glass. The count then climbs 1 → 999 across eight seconds
// (120–360) and the burst fires on the very frame it lands (360).
const STATIC_HOLD = sec(1); // 30
const LAST_FRAME = 479;

const OVERSCAN = 40;
const LIFT_START = STATIC_HOLD; // 30
const LIFT_END = LIFT_START + sec(1); // 60
const GROWTH_START = LIFT_END + sec(2); // 120
const GROWTH_END = GROWTH_START + sec(8); // 360
const BURST_START = GROWTH_END; // 999 lands and bursts on the same frame

const select241 = (index: number): CardVisualState =>
  index === 0 ? { select: 1, hover: 0, press: 0 } : { select: 0, hover: 0, press: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

// ── the floating card ─────────────────────────────────────────────────────
const ROW_W = REQUESTS_ROW_WIDTH; // 401
const ROW_H = REQUESTS_ROW_HEIGHT; // 72
const ROW_ZOOM = 4;
const PAD_X = 44;
const PAD_Y = 54;
const CONTENT_W = ROW_W * ROW_ZOOM; // 1604
const CONTENT_H = ROW_H * ROW_ZOOM; // 288
const CARD_W = CONTENT_W + PAD_X * 2; // 1692
const CARD_H = CONTENT_H + PAD_Y * 2; // 396
const CARD_CX = 960;
const CARD_CY = 500;
const CARD_LEFT = CARD_CX - CARD_W / 2;
const CARD_TOP = CARD_CY - CARD_H / 2;
// Message requests row in stage coordinates: page 280 + panel 238.5 + 200.5,
// stageTop 74 + page 48 + panel 120.5 + row 122 + 36.
const ROW_CX = 719;
const ROW_CY = 400.5;
// 0.25 of the 4x content == 1x, so the card starts exactly on the page row.
const ENTRY_SCALE = ROW_W / CONTENT_W;
const TILT = -1.6;
// Centre of the count itself inside the card, relative to the card's centre:
// "You have " is ~63px at 14.5px and a three-digit number ~30px, so the
// number's centre sits at row x 85.5 + 63 + 15, row y 29 + 10. The burst fires
// from the number, not from the badge — the number is the story here.
const BURST_ANCHOR = {
  x: -(CARD_W / 2 - (PAD_X + (85.5 + 63 + 15) * ROW_ZOOM)),
  y: -(CARD_H / 2 - (PAD_Y + 39 * ROW_ZOOM)),
};

const TAU = Math.PI * 2;

// ── count: 1 → 999 across eight seconds, then hold the cap ───────────────
// "One second" was shorthand for "very fast"; the climb now spans 8s so the
// acceleration stays readable. 999 is the approved ceiling (header unread
// follows at 0.812 → 811).
const COUNT_FROM = 1;
const COUNT_TO = 999;
const GROWTH_EXP = 1.8;
const UNREAD_RATIO = 203 / 250;

const countAt = (f: number) => {
  if (f < GROWTH_START) return COUNT_FROM;
  if (f < GROWTH_END) {
    const p = clamp01((f - GROWTH_START) / (GROWTH_END - GROWTH_START));
    return COUNT_FROM + (COUNT_TO - COUNT_FROM) * Math.pow(p, GROWTH_EXP);
  }
  return COUNT_TO;
};

// ── burst FX (same particle design as the beat-cut version, re-anchored) ──
const SPARK_COLORS = ['#EE1357', '#FF3D6E', '#FF6E93', '#FFFFFF'];

type Particle = {
  angle: number;
  speed: number;
  delay: number;
  life: number;
  width: number;
  color: string;
};

const SPARKS: Particle[] = Array.from({ length: 72 }, (_, index) => ({
  angle: random(`s05g-spark-angle-${index}`) * Math.PI * 2,
  speed: 280 + random(`s05g-spark-speed-${index}`) * 760,
  delay: random(`s05g-spark-delay-${index}`) * 10,
  life: 46 + random(`s05g-spark-life-${index}`) * 32,
  width: 2 + random(`s05g-spark-width-${index}`) * 2,
  color: SPARK_COLORS[Math.floor(random(`s05g-spark-color-${index}`) * SPARK_COLORS.length)],
}));

const COMETS: Particle[] = Array.from({ length: 8 }, (_, index) => ({
  angle: random(`s05g-comet-angle-${index}`) * Math.PI * 2,
  speed: 900 + random(`s05g-comet-speed-${index}`) * 600,
  delay: random(`s05g-comet-delay-${index}`) * 2,
  life: 30 + random(`s05g-comet-life-${index}`) * 14,
  width: 4.5 + random(`s05g-comet-width-${index}`) * 2,
  color: index % 2 === 0 ? '#FFFFFF' : '#FF3D6E',
}));

const EMBERS: Particle[] = Array.from({ length: 12 }, (_, index) => ({
  angle: random(`s05g-ember-angle-${index}`) * Math.PI * 2,
  speed: 90 + random(`s05g-ember-speed-${index}`) * 120,
  delay: random(`s05g-ember-delay-${index}`) * 4,
  life: 80 + random(`s05g-ember-life-${index}`) * 25,
  width: 1.2 + random(`s05g-ember-width-${index}`) * 1,
  color: ['#EE1357', '#FF3D6E'][Math.floor(random(`s05g-ember-color-${index}`) * 2)],
}));

const BurstFx: FC<{ frame: number; originX: number; originY: number }> = ({
  frame,
  originX,
  originY,
}) => {
  const age = frame - BURST_START;
  if (age < 0 || age > 112) return null;

  const ring = (delay: number, radius: number, duration: number, opacity: number, width: number) => {
    const local = age - delay;
    if (local < 0 || local > duration) return null;
    const p = Easing.out(Easing.cubic)(local / duration);
    return (
      <circle
        cx={originX}
        cy={originY}
        r={12 + radius * p}
        fill="none"
        stroke="#EE1357"
        strokeWidth={Math.max(0.8, width * (1 - p))}
        opacity={opacity * Math.pow(1 - p, 0.9)}
      />
    );
  };

  const glowP = clamp01(age / 26);
  const glowR = 40 + 240 * Easing.out(Easing.cubic)(glowP);
  const glow = 0.8 * Math.pow(1 - glowP, 1.1);
  const washP = clamp01(age / 60);
  const washR = 80 + 540 * Easing.out(Easing.cubic)(washP);
  const wash = 0.34 * Math.pow(1 - washP, 1.4);
  const bloomP = clamp01(age / 22);
  const bloom = 0.4 * Math.pow(1 - bloomP, 1.5);
  const flash = age < 10 ? 0.22 * Math.pow(1 - age / 10, 1.6) : 0;

  const particles = (list: Particle[], gravity: number, halo: number) =>
    list.map((spark, index) => {
      const local = age - spark.delay;
      if (local < 0 || local >= spark.life) return null;
      const t = local / 30;
      const travel = (spark.speed * (1 - Math.exp(-2.4 * t))) / 2.4;
      const x = originX + Math.cos(spark.angle) * travel;
      const y = originY + Math.sin(spark.angle) * travel + gravity * t * t;
      const fade = Math.min(1, local / 1.6) * Math.pow(1 - local / spark.life, 1);
      const len = (14 + spark.speed * 0.05) * (1 - local / spark.life) + 4;
      const dx = Math.cos(spark.angle);
      const dy = Math.sin(spark.angle);
      return (
        <g key={`${spark.color}-${index}`} opacity={fade}>
          {halo > 0 ? (
            <line
              x1={x}
              y1={y}
              x2={x - dx * len}
              y2={y - dy * len}
              stroke={spark.color}
              strokeWidth={spark.width * halo}
              strokeOpacity={0.32}
              strokeLinecap="round"
            />
          ) : null}
          <line
            x1={x}
            y1={y}
            x2={x - dx * len}
            y2={y - dy * len}
            stroke={spark.color}
            strokeWidth={spark.width}
            strokeLinecap="round"
          />
          <circle cx={x} cy={y} r={spark.width * 0.9} fill={spark.color} />
        </g>
      );
    });

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}>
      {bloom > 0.003 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: bloom,
            background: `radial-gradient(circle at ${originX.toFixed(1)}px ${originY.toFixed(1)}px, rgba(238,19,87,0.6) 0%, rgba(238,19,87,0.26) 40%, rgba(238,19,87,0) 74%)`,
          }}
        />
      ) : null}
      {wash > 0.003 ? (
        <div
          style={{
            position: 'absolute',
            left: originX - washR,
            top: originY - washR,
            width: washR * 2,
            height: washR * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(238,19,87,${(wash * 0.55).toFixed(3)}) 0%, rgba(238,19,87,${(wash * 0.22).toFixed(3)}) 35%, rgba(238,19,87,${(wash * 0.06).toFixed(3)}) 62%, rgba(238,19,87,0) 82%)`,
          }}
        />
      ) : null}
      {glow > 0.003 ? (
        <div
          style={{
            position: 'absolute',
            left: originX - glowR,
            top: originY - glowR,
            width: glowR * 2,
            height: glowR * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${(glow * 0.55).toFixed(3)}) 0%, rgba(238,19,87,${glow.toFixed(3)}) 32%, rgba(238,19,87,0) 70%)`,
          }}
        />
      ) : null}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {age <= 9 ? (
          <circle
            cx={originX}
            cy={originY}
            r={10 + 26 * Easing.out(Easing.cubic)(age / 9)}
            fill="#FFFFFF"
            opacity={0.85 * (1 - age / 9)}
          />
        ) : null}
        {ring(0, 520, 60, 1, 7)}
        {ring(6, 760, 66, 0.6, 4)}
        {particles(SPARKS, 130, 3)}
        {particles(COMETS, 130, 2)}
        {particles(EMBERS, 70, 0)}
      </svg>
      {flash > 0.003 ? (
        <div style={{ position: 'absolute', inset: 0, background: '#FFE9F0', opacity: flash }} />
      ) : null}
    </div>
  );
};

export const S05: FC = () => {
  const frame = useCurrentFrame();
  const f = frame;
  const requests = Math.round(countAt(f));
  const unread = Math.round(requests * UNREAD_RATIO);

  const lift = EASE.smooth(clamp01((f - LIFT_START) / (LIFT_END - LIFT_START)));
  const veil = lift;
  const blurPx = 18 * lift;
  const bgScale = 1 + 0.05 * EASE.smooth(clamp01((f - LIFT_END) / 300));

  const ft = Math.max(0, f - LIFT_END);
  const floatGate = clamp01((f - LIFT_END) / 24);
  const bob = 6 * Math.sin((TAU * ft) / 96) * floatGate;
  const wobble = 0.35 * Math.sin((TAU * ft) / 150 + 0.8) * floatGate;
  const breath = 0.002 * Math.sin((TAU * ft) / 84) * floatGate;

  const p = clamp01((f - GROWTH_START) / (GROWTH_END - GROWTH_START));
  const countFraction = Math.pow(p, GROWTH_EXP);
  const climbing = f >= GROWTH_START && f < GROWTH_END;
  const floodJitter = climbing
    ? clamp01((f - GROWTH_START) / 60) * Math.pow(p, GROWTH_EXP - 1)
    : 0;
  const settle = f >= GROWTH_END ? Math.exp(-(f - GROWTH_END) / 7) : 0;
  const burstAge = f - BURST_START;
  const burstImpulse =
    f >= BURST_START ? Math.max(0, 1 - Easing.out(Easing.cubic)(clamp01(burstAge / 10))) : 0;
  const burstLinger = f >= BURST_START ? Math.exp(-burstAge / 14) : 0;

  const cardCx = mix(ROW_CX, CARD_CX, lift);
  const cardCy = mix(ROW_CY, CARD_CY, lift) + bob;
  const cardScale =
    mix(ENTRY_SCALE, 1, lift) * (1 + breath + 0.018 * settle + 0.03 * burstLinger);
  const cardRot =
    mix(0, TILT, lift) + wobble + 0.55 * floodJitter * Math.sin(f * 2.7 + 2) - 1.1 * burstLinger;
  const jx = 3.4 * floodJitter * Math.sin(f * 3.1 + 0.7) + 4 * burstImpulse * Math.sin(f * 2.3);
  const jy = 2.4 * floodJitter * Math.sin(f * 4.3 + 1.1) + 3 * burstImpulse * Math.sin(f * 2.9 + 1);
  const glassOpacity = clamp01((f - LIFT_START) / 8);
  const heat =
    0.1 + 0.42 * countFraction + 0.18 * clamp01((f - GROWTH_END) / 120) + 0.35 * burstImpulse;

  const rad = (cardRot * Math.PI) / 180;
  const originX =
    cardCx + jx + cardScale * (BURST_ANCHOR.x * Math.cos(rad) - BURST_ANCHOR.y * Math.sin(rad));
  const originY =
    cardCy + jy + cardScale * (BURST_ANCHOR.x * Math.sin(rad) + BURST_ANCHOR.y * Math.cos(rad));

  const shakeImpulse =
    f >= BURST_START ? Math.max(0, 1 - Easing.out(Easing.cubic)(clamp01(burstAge / 8))) : 0;
  const shakeAmp = 12 * shakeImpulse + (f >= BURST_START ? 1.5 : 0);
  const shakePhase =
    f <= BURST_START ? f * 0.9 : BURST_START * 0.9 + (f - BURST_START) * 0.22;
  const shakeX =
    shakeAmp * (0.62 * Math.sin(shakePhase + 0.9) + 0.38 * Math.sin(shakePhase * 1.37 + 2.2));
  const shakeY =
    shakeAmp * (0.6 * Math.sin(shakePhase * 1.17 + 2.6) + 0.4 * Math.sin(shakePhase * 1.59 + 0.4));
  const shakeRot = shakeAmp * 0.03 * Math.sin(shakePhase * 0.83 + 1.9);

  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: -OVERSCAN,
          overflow: 'hidden',
          transform: `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px) rotate(${shakeRot.toFixed(3)}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        <div style={{ position: 'absolute', left: OVERSCAN, top: OVERSCAN, width: 1920, height: 1080 }}>
          {/* the dark stage turns into a bright lightbox as the card lifts */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: veil,
              background:
                'linear-gradient(180deg, #E9EEF6 0%, #F4F7FC 46%, #E6ECF5 100%)',
            }}
          />

          {/* page, defocused behind the glass */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${bgScale})`,
              transformOrigin: '50% 50%',
              filter:
                blurPx > 0.05
                  ? `blur(${blurPx.toFixed(2)}px) saturate(1.02) brightness(1.02)`
                  : undefined,
            }}
          >
            <ConnectionDesktop
              mainPanel={<TikTokMessages requests={requests} unread={unread} />}
              cardState={select241}
              elevation={1 - 0.85 * lift}
            />
          </div>

          {veil > 0.001 ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: veil,
                  background:
                    'linear-gradient(180deg, rgba(245,248,253,0.44) 0%, rgba(238,243,250,0.26) 46%, rgba(231,237,247,0.36) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: veil,
                  background:
                    'radial-gradient(ellipse 62% 54% at 50% 45%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 72%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 1040 + Math.sin(f / 60) * 12,
                  top: 300 + Math.cos(f / 70) * 10,
                  width: 1080,
                  height: 1080,
                  borderRadius: '50%',
                  opacity: veil * (0.9 + 0.6 * burstImpulse),
                  background:
                    'radial-gradient(circle, rgba(238,19,87,0.14) 0%, rgba(238,19,87,0) 66%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 200 + Math.cos(f / 64) * 14,
                  top: 420 + Math.sin(f / 58) * 12,
                  width: 940,
                  height: 940,
                  borderRadius: '50%',
                  opacity: veil,
                  background:
                    'radial-gradient(circle, rgba(68,162,255,0.12) 0%, rgba(68,162,255,0) 68%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 620,
                  top: 210 + Math.sin(f / 66) * 8,
                  width: 720,
                  height: 720,
                  borderRadius: '50%',
                  opacity: veil,
                  background:
                    'radial-gradient(circle, rgba(255,226,204,0.20) 0%, rgba(255,226,204,0) 70%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: veil * 0.85,
                  background:
                    'radial-gradient(ellipse 80% 78% at 50% 48%, rgba(8,14,26,0) 55%, rgba(8,14,26,0.16) 100%)',
                }}
              />
            </>
          ) : null}

          {lift > 0.001 ? (
            <div
              style={{
                position: 'absolute',
                left: cardCx - CARD_W * 0.34 * cardScale,
                // The cast shadow stays on the ground while the card bobs.
                top: CARD_CY + (CARD_H / 2) * cardScale + 46,
                width: CARD_W * 0.68 * cardScale * (1 - bob / 160),
                height: 110,
                opacity: lift * 0.9 * (0.9 + 0.1 * (bob / 6)),
                background:
                  'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(16,24,40,0.34) 0%, rgba(16,24,40,0.12) 45%, rgba(16,24,40,0) 74%)',
                filter: 'blur(12px)',
              }}
            />
          ) : null}

          {f >= LIFT_START ? (
            <div
              style={{
                position: 'absolute',
                left: CARD_LEFT,
                top: CARD_TOP,
                width: CARD_W,
                height: CARD_H,
                transform: `translate(${(cardCx - CARD_CX + jx).toFixed(2)}px, ${(cardCy - CARD_CY + jy).toFixed(2)}px) rotate(${cardRot.toFixed(3)}deg) scale(${cardScale.toFixed(5)})`,
                transformOrigin: '50% 50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 30,
                  opacity: glassOpacity,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,254,251,0.36) 55%, rgba(249,246,242,0.42) 100%)',
                  backdropFilter: 'blur(30px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(30px) saturate(1.3)',
                  border: '1.5px solid rgba(255,255,255,0.92)',
                  boxShadow:
                    '0 0 0 1px rgba(18,28,48,0.05), inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -14px 30px rgba(108,122,146,0.09), 0 6px 16px rgba(16,24,40,0.08), 0 48px 90px -30px rgba(16,24,40,0.35)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '24%',
                  right: '24%',
                  top: 3,
                  height: 1.5,
                  opacity: glassOpacity,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95) 22%, rgba(255,255,255,0.7) 78%, rgba(255,255,255,0))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 300,
                  top: 100,
                  width: 780,
                  height: 200,
                  borderRadius: 100,
                  opacity: heat * 0.35,
                  filter: 'blur(6px)',
                  background:
                    'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(238,19,87,0.55) 0%, rgba(238,19,87,0) 72%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: PAD_X,
                  top: PAD_Y,
                  width: CONTENT_W,
                  height: CONTENT_H,
                  // Hold the lifted copy back for two frames: at LIFT_START it
                  // sits on the still-sharp page row, and a 4x-then-downscaled
                  // render does not match the page's 1x glyphs closely enough to
                  // hide the overlay.
                  opacity: clamp01((f - LIFT_START - 1) / 5),
                  fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: ROW_W,
                    height: ROW_H,
                    zoom: ROW_ZOOM,
                  }}
                >
                  <MessageRequestsRow requests={requests} />
                </div>
              </div>
            </div>
          ) : null}

          <BurstFx frame={f} originX={originX} originY={originY} />
        </div>
      </div>
      {veil > 0.01 ? <Grain opacity={0.035 * veil} blend="soft-light" /> : null}
    </Stage>
  );
};
