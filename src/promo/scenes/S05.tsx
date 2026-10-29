import type { FC } from 'react';
import { Easing, random, useCurrentFrame } from 'remotion';
import { sec } from '../timeline';
import { ConnectionDesktop, type CardVisualState } from '../ui/tolink/ConnectionDesktop';
import { Stage } from '../ui/tolink/Stage';
import { TikTokMessages } from '../ui/tolink/TikTokMessages';

// The untouched messages page holds for 3s so the viewer can read it before the
// camera starts pushing; every animation constant below is relative to the end
// of that hold.
const STATIC_HOLD = sec(3);
const ANIMATION_SPAN = 450;

const OVERSCAN = 40;

const select241 = (index: number): CardVisualState =>
  index === 0 ? { select: 1, hover: 0, press: 0 } : { select: 0, hover: 0, press: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

// Slow push from the full desktop into the requests row, then a creep that
// never settles while the counters run.
const PUSH_START = 4;
const PUSH_END = 120;
const SCALE_FROM = 1;
const SCALE_PUSH = 2.75;
const SCALE_CREEP = 3;
const FOCUS_FROM = { x: 960, y: 540 };
const FOCUS_PUSH = { x: 660, y: 310 };
const FOCUS_CREEP = { x: 660, y: 318 };

const COUNT_START = 24;
// The last rendered shot frame is ANIMATION_SPAN - 1; ending the ramp there is
// what puts REQUESTS_TO on screen instead of one increment short of it.
const COUNT_END = ANIMATION_SPAN - 1;
const REQUESTS_FROM = 1;
const REQUESTS_TO = 999;
const UNREAD_RATIO = 203 / 250;
const RATE_FROM = 0.2;
const COUNT_SPAN = COUNT_END - COUNT_START;
// The rate climbs from one increment every five frames to ~8.8 per frame;
// integrating the cubic rate lands the final value on REQUESTS_TO.
const RATE_TO = (4 * (REQUESTS_TO - REQUESTS_FROM)) / COUNT_SPAN - 3 * RATE_FROM;

const pushEase = Easing.inOut(Easing.sin);
const creepEase = Easing.in(Easing.quad);

// Burst sits just before the S05 -> S06 portal-wipe window (last 48f). The
// camera drops into slow motion on the burst so the blast blooms while the
// shake dies down.
const BURST_START = 330;
const SLOWMO_RAMP = 8;
const SLOWMO_AMP = 0.12;
const SLOWMO_PHASE = 0.22;
const BURST_ORIGIN = { x: 871.5, y: 394 };
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
  angle: random(`s05-spark-angle-${index}`) * Math.PI * 2,
  speed: 280 + random(`s05-spark-speed-${index}`) * 760,
  delay: random(`s05-spark-delay-${index}`) * 10,
  life: 46 + random(`s05-spark-life-${index}`) * 32,
  width: 2 + random(`s05-spark-width-${index}`) * 2,
  color: SPARK_COLORS[Math.floor(random(`s05-spark-color-${index}`) * SPARK_COLORS.length)],
}));

// Heavy comets carry the burst across the frame so the blast reads wide.
const COMETS: Particle[] = Array.from({ length: 8 }, (_, index) => ({
  angle: random(`s05-comet-angle-${index}`) * Math.PI * 2,
  speed: 900 + random(`s05-comet-speed-${index}`) * 600,
  delay: random(`s05-comet-delay-${index}`) * 2,
  life: 30 + random(`s05-comet-life-${index}`) * 14,
  width: 4.5 + random(`s05-comet-width-${index}`) * 2,
  color: index % 2 === 0 ? '#FFFFFF' : '#FF3D6E',
}));

// Slow embers keep a few sparks alive past the burst so the heat carries into
// the portal-wipe instead of ending on a clean row.
const EMBERS: Particle[] = Array.from({ length: 12 }, (_, index) => ({
  angle: random(`s05-ember-angle-${index}`) * Math.PI * 2,
  speed: 90 + random(`s05-ember-speed-${index}`) * 120,
  delay: random(`s05-ember-delay-${index}`) * 4,
  life: 80 + random(`s05-ember-life-${index}`) * 25,
  width: 1.2 + random(`s05-ember-width-${index}`) * 1,
  color: ['#EE1357', '#FF3D6E'][Math.floor(random(`s05-ember-color-${index}`) * 2)],
}));

const requestsAt = (frame: number) => {
  const p = clamp01((frame - COUNT_START) / COUNT_SPAN);
  return (
    REQUESTS_FROM +
    RATE_FROM * COUNT_SPAN * p +
    ((RATE_TO - RATE_FROM) * COUNT_SPAN * p ** 4) / 4
  );
};

const rateAt = (frame: number) => requestsAt(frame) - requestsAt(frame - 1);

// The buzz is meant to peak on the blast, not at the end of the count: after
// the burst the slow motion owns the motion, so anything the counter gains
// beyond this point is already damped away.
const SHAKE_RATE_REF = rateAt(BURST_START);

const cameraAt = (frame: number) => {
  const push = pushEase(clamp01((frame - PUSH_START) / (PUSH_END - PUSH_START)));
  const creep = creepEase(clamp01((frame - PUSH_END) / (COUNT_END - PUSH_END)));
  const scale = frame < PUSH_END ? mix(SCALE_FROM, SCALE_PUSH, push) : mix(SCALE_PUSH, SCALE_CREEP, creep);
  const focusX = mix(FOCUS_FROM.x, FOCUS_PUSH.x, push);
  const focusY =
    frame < PUSH_END ? mix(FOCUS_FROM.y, FOCUS_PUSH.y, push) : mix(FOCUS_PUSH.y, FOCUS_CREEP.y, creep);
  // CSS zoom multiplies the layer's own offsets, so left/top are solved in
  // layout px against the overscanned shake wrapper.
  return {
    scale,
    left: (960 + OVERSCAN) / scale - focusX,
    top: (540 + OVERSCAN) / scale - focusY,
  };
};

const shakeAt = (frame: number) => {
  const intensity = Math.pow(clamp01(rateAt(frame) / SHAKE_RATE_REF), 0.75);
  // Counting starts while the camera is still pushing, so the frame already
  // carries a faint buzz before the growth is fast enough to drive it.
  const gate = clamp01((frame - COUNT_START) / 18);
  // On the blast the camera drops into slow motion: the amplitude collapses and
  // the chirp clock crawls, leaving the slow-blooming sparks to own the motion.
  const slow = Easing.out(Easing.cubic)(clamp01((frame - BURST_START) / SLOWMO_RAMP));
  const damp = mix(1, SLOWMO_AMP, slow);
  const amp = gate * (2 + 11 * Math.pow(intensity, 1.25)) * damp;
  // Quadratic chirp: the buzz speeds up with the counter as growth accelerates.
  const warp = frame <= BURST_START ? frame : BURST_START + (frame - BURST_START) * SLOWMO_PHASE;
  const phase = 0.7 * warp + 0.0026 * warp * warp;
  return {
    x: amp * (0.62 * Math.sin(phase + 0.9) + 0.38 * Math.sin(phase * 1.37 + 2.2)),
    y: amp * (0.6 * Math.sin(phase * 1.17 + 2.6) + 0.4 * Math.sin(phase * 1.59 + 0.4)),
    rot:
      gate *
      (0.05 + 0.4 * Math.pow(intensity, 1.2)) *
      damp *
      Math.sin(phase * 0.83 + 1.9),
  };
};

const BurstFx: FC<{ frame: number; camera: ReturnType<typeof cameraAt> }> = ({ frame, camera }) => {
  const age = frame - BURST_START;
  if (age < 0 || age > 112) return null;

  const screenX = (x: number) => (camera.left + x) * camera.scale - OVERSCAN;
  const screenY = (y: number) => (camera.top + y) * camera.scale - OVERSCAN;
  const originX = screenX(BURST_ORIGIN.x);
  const originY = screenY(BURST_ORIGIN.y);

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
    <div style={{ position: 'absolute', left: OVERSCAN, top: OVERSCAN, width: 1920, height: 1080 }}>
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
        <div style={{ position: 'absolute', inset: -OVERSCAN, background: '#FFE9F0', opacity: flash }} />
      ) : null}
    </div>
  );
};

export const S05: FC = () => {
  const frame = useCurrentFrame();
  const shot = frame - STATIC_HOLD;
  const camera = cameraAt(shot);
  const shake = shakeAt(shot);
  const requests = Math.round(requestsAt(shot));
  const unread = Math.round(requests * UNREAD_RATIO);
  const kick =
    shot < BURST_START
      ? 0
      : 0.018 *
        Math.pow(
          1 - Easing.out(Easing.cubic)(clamp01((shot - BURST_START) / SLOWMO_RAMP)),
          2,
        );

  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: -OVERSCAN,
          overflow: 'hidden',
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg) scale(${1 + kick})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: camera.left,
            top: camera.top,
            width: 1920,
            height: 1080,
            zoom: camera.scale,
          }}
        >
          <ConnectionDesktop
            mainPanel={<TikTokMessages requests={requests} unread={unread} />}
            cardState={select241}
          />
        </div>
        <BurstFx frame={shot} camera={camera} />
      </div>
    </Stage>
  );
};
