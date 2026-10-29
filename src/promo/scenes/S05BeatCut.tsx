import type { FC } from 'react';
import { AbsoluteFill, Easing, random, useCurrentFrame } from 'remotion';
import { sec } from '../timeline';
import { FocusBrackets, projectRect, type CropView } from '../shots/beatCutMoves/paparazzi';
import { EASE, Grain } from '../shots/spotlightHeroCard/polish';
import { ConnectionDesktop, type CardVisualState } from '../ui/tolink/ConnectionDesktop';
import { Stage } from '../ui/tolink/Stage';
import { TikTokMessages } from '../ui/tolink/TikTokMessages';

// Backup of the beat-cut-moves S05 (D48 / D49), kept as its own composition for
// A/B review. The film's S05 is now the floating glass card (D51).
//
// The untouched messages page holds for 3s so the viewer can read it before the
// camera starts shooting; every animation constant below is relative to the end
// of that hold.
const STATIC_HOLD = sec(3);
const ANIMATION_SPAN = 450;
const LAST_SHOT = ANIMATION_SPAN - 1;

const OVERSCAN = 40;

const select241 = (index: number): CardVisualState =>
  index === 0 ? { select: 1, hover: 0, press: 0 } : { select: 0, hover: 0, press: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

// ── beat-cut-moves A 式（paparazzi flash） ─────────────────────────────────
// Three white-flash hard cuts on the 120 BPM grid (film 1616 / 1646 / 1661).
// The crops converge on the same inbox row: whole window → request row →
// counter close-up. The close-up is where the count is enlarged and the whole
// growth arc plays, so the cut串 is the entry into the surge instead of a
// one-off accent. Intervals tighten 30f → 15f.
const FLASHES = [31, 61, 76];
const SETTLE = 6;
const DECAY = 4;
const BLOOM = 7;
// The AF leads tighten with the cuts (9f → 8f → 6f): the row view only lasts
// 15f, so its prep has to leave the still readable before the flash.
const AF_LEADS = [9, 8, 6];
const LIVE_SCALE = 1.08;

const VIEW_WIDE: CropView = { scale: 2.2, cx: 719, cy: 375 };
const VIEW_ROW: CropView = { scale: 3.2, cx: 719, cy: 395 };
const VIEW_CLOSE: CropView = { scale: 5, cx: 716, cy: 400 };

// Message requests row in stage coordinates: desktop stageTop 74 + page 48 +
// panel 120.5 + row 122; left is page 280 + panel 238.5. The AF always locks
// the count line + badge, not the next viewport: over a dense UI the "where the
// next crop lands" frame reads as a UI selection, while a box on the number
// reads as a camera focusing on its subject.
const FOCUS_TARGET = { x: 590, y: 355.5, w: 315, h: 72 };
const VIGNETTE = [0.18, 0.24, 0.3];

const COUNT_START = 24;
// The last rendered shot frame is ANIMATION_SPAN - 1; ending the ramp there is
// what puts REQUESTS_TO on screen instead of one increment short of it.
const COUNT_END = LAST_SHOT;
const REQUESTS_FROM = 1;
const REQUESTS_TO = 999;
const UNREAD_RATIO = 203 / 250;
const RATE_FROM = 0.2;
const COUNT_SPAN = COUNT_END - COUNT_START;
// The rate climbs from one increment every five frames to ~8.8 per frame;
// integrating the cubic rate lands the final value on REQUESTS_TO.
const RATE_TO = (4 * (REQUESTS_TO - REQUESTS_FROM)) / COUNT_SPAN - 3 * RATE_FROM;

// Burst sits just before the S05 -> S06 dip window. The camera drops into slow
// motion on the burst so the blast blooms while the shake dies down.
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
// the dip instead of ending on a clean row.
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

// First frame the badge reads 99+; the macro leans in on it so the 5.3s stretch
// between the last flash and the burst is not one unbroken camera hold.
const FLIP_SHOT = (() => {
  for (let f = COUNT_START; f <= LAST_SHOT; f += 1) {
    if (Math.round(requestsAt(f)) > 99) return f;
  }
  return LAST_SHOT;
})();

const hash = (n: number) => {
  const x = Math.sin(n * 127.3 + 11.7) * 43758.5453;
  return x - Math.floor(x);
};

// Base crop before the hold creep; the AF projects into this frame because it
// is gone before the creep matters.
const viewAt = (shot: number): CropView => {
  if (shot < FLASHES[0]) {
    const live = Easing.inOut(Easing.quad)(clamp01(shot / FLASHES[0]));
    return { scale: mix(1, LIVE_SCALE, live), cx: 960, cy: 540 };
  }
  if (shot < FLASHES[1]) return VIEW_WIDE;
  if (shot < FLASHES[2]) return VIEW_ROW;
  return VIEW_CLOSE;
};

const cameraAt = (shot: number) => {
  const view = viewAt(shot);
  // The card holds after the last flash with a 1→1.015 creep. Here the creep is
  // stretched over the rest of the scene so the count stays enlarged without
  // reintroducing the old slow push.
  const hold =
    1 +
    0.018 *
      Easing.inOut(Easing.sin)(clamp01((shot - FLASHES[2]) / (LAST_SHOT - FLASHES[2]))) +
    0.02 * Easing.out(Easing.cubic)(clamp01((shot - FLIP_SHOT) / 12));

  const scale = view.scale * hold;
  // CSS zoom multiplies the layer's own offsets, so left/top are solved in
  // layout px against the overscanned shake wrapper.
  return {
    scale,
    left: (960 + OVERSCAN) / scale - view.cx,
    top: (540 + OVERSCAN) / scale - view.cy,
  };
};

const shootAt = (shot: number) => {
  let seg = -1;
  for (let i = 0; i < FLASHES.length; i += 1) if (shot >= FLASHES[i]) seg = i;

  const since = seg >= 0 ? shot - FLASHES[seg] : 0;
  const settle = seg >= 0 ? 1 - Easing.out(Easing.cubic)(clamp01(since / SETTLE)) : 0;
  const bloom = seg >= 0 ? 1 - Easing.out(Easing.cubic)(clamp01(since / BLOOM)) : 0;

  let flash = 0;
  for (const f of FLASHES) {
    if (shot >= f && shot <= f + DECAY) {
      flash = Math.max(flash, 0.95 * (1 - Easing.out(Easing.quad)(clamp01((shot - f) / DECAY))));
    }
  }
  const inFlash = FLASHES.some((f) => shot >= f && shot < f + DECAY);

  return {
    seg,
    settle,
    bloom,
    flash,
    jx: inFlash ? 2 * (hash(shot * 7 + 1) * 2 - 1) : 0,
    jy: inFlash ? 2 * (hash(shot * 13 + 5) * 2 - 1) : 0,
  };
};

const afAt = (shot: number) => {
  let seg = -1;
  for (let i = 0; i < FLASHES.length; i += 1) if (shot >= FLASHES[i]) seg = i;

  const next = seg + 1;
  if (next >= FLASHES.length) return null;

  const start = FLASHES[next] - AF_LEADS[next];
  if (shot < start || shot >= FLASHES[next]) return null;

  const rect = projectRect(FOCUS_TARGET, viewAt(shot));
  const p = EASE.snappy(clamp01((shot - start) / 6));
  const k = mix(1.3, 1, p);
  const locked = shot >= FLASHES[next] - 3;

  return {
    x: rect.x + rect.w / 2 - (rect.w * k) / 2,
    y: rect.y + rect.h / 2 - (rect.h * k) / 2,
    w: rect.w * k,
    h: rect.h * k,
    locked,
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

export const S05BeatCut: FC = () => {
  const frame = useCurrentFrame();
  const shot = frame - STATIC_HOLD;
  const camera = cameraAt(shot);
  const shake = shakeAt(shot);
  const shoot = shootAt(shot);
  const af = afAt(shot);
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
  const grade =
    shoot.seg >= 0
      ? `brightness(${(1 + 0.16 * shoot.bloom).toFixed(3)}) contrast(${(1.05 - 0.1 * shoot.bloom).toFixed(3)}) saturate(${(0.9 - 0.14 * shoot.bloom).toFixed(3)})`
      : undefined;
  const vignette = shoot.seg >= 0 ? VIGNETTE[shoot.seg] : 0;

  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: -OVERSCAN,
          overflow: 'hidden',
          transform: `translate(${(shake.x + shoot.jx).toFixed(2)}px, ${(shake.y + shoot.jy - 16 * shoot.settle).toFixed(2)}px) rotate(${shake.rot}deg) scale(${((1 + kick) * (1 + 0.03 * shoot.settle)).toFixed(5)})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, filter: grade }}>
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
        </div>
        <BurstFx frame={shot} camera={camera} />
      </div>
      {af ? (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <FocusBrackets
            x={af.x}
            y={af.y}
            w={af.w}
            h={af.h}
            color={af.locked ? '#EE1357' : 'rgba(22,24,35,0.5)'}
            width={af.locked ? 3 : 2}
            opacity={af.locked ? 0.9 : 0.85}
            arm={44}
          />
        </svg>
      ) : null}
      {vignette > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse 72% 72% at 50% 48%, rgba(6,8,15,0) 46%, rgba(6,8,15,${(vignette * 0.32).toFixed(3)}) 74%, rgba(6,8,15,${vignette.toFixed(3)}) 100%), radial-gradient(ellipse 100% 100% at 50% 48%, rgba(6,8,15,0) 60%, rgba(6,8,15,${(vignette * 0.6).toFixed(3)}) 100%)`,
          }}
        />
      ) : null}
      {shoot.seg >= 0 ? <Grain opacity={0.05} blend="soft-light" /> : null}
      {shoot.flash > 0.004 ? (
        <AbsoluteFill
          style={{
            opacity: shoot.flash,
            background: 'radial-gradient(ellipse 80% 90% at 50% 45%, #ffffff 0%, #ffffff 45%, rgba(250,250,255,0.86) 100%)',
          }}
        />
      ) : null}
    </Stage>
  );
};
