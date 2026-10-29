import type { FC, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Dust, EASE, Grain, ramp } from '../shots/spotlightHeroCard/polish';
import { LarkReportCard } from '../shots/workflow/LarkReportCard';
import {
  CARD_W,
  HERO_EXISTING,
  HERO_NEW,
  TONE,
  genReport,
  reportHeight,
  type Report,
} from '../shots/workflow/reportData';

// S06.5 — the report card from S06 is tossed through the air into a feed wall,
// then the camera pulls back while the wall accelerates: four lanes become
// ten. Same stage as the S06 reply (radial, warm key, dust, grain) so the
// dissolve seam only melts the foreground.

const TILE_W = 430;
const S = TILE_W / CARD_W;
const COL_PITCH = 456;
const GAP = 26;
const COL_FROM = -6;
const COL_TO = 6;
const ROWS = 30;
const HERO_H = 748 * S;

const FLY = [14, 56] as const;
const BLOOM_AT = 40;
const BLOOM_SPAN = 56;
const BLOOM_REF = 1500;
const TILE_LIFE = 16;
const SC0 = 92;
const SC1 = 262;
const SC2 = 282;
const TRAVEL = 6000;
const ZOOM_END = 0.42;
const TILT = 7;

const TILE_SHADOW = '0 10px 30px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.07)';
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const tileH = (r: Report) => (r === HERO_EXISTING ? 748 : reportHeight(r)) * S;

type Box = { report: Report; x: number; y: number; h: number; col: number };

const buildWall = (): Box[] => {
  const boxes: Box[] = [];
  for (let c = COL_FROM; c <= COL_TO; c++) {
    const forced = c === 0 ? HERO_EXISTING : c === 1 ? HERO_NEW : null;
    const list: Report[] = [];
    for (let i = 0; i < ROWS; i++) {
      list.push(i === 2 && forced ? forced : genReport((c - COL_FROM) * 100 + i + 1));
    }
    const hs = list.map(tileH);
    // Row 2 is the band the arriving card lands in, so every column is keyed
    // off the same line and only then jittered.
    let y = -(hs[0] + GAP + hs[1] + GAP) - (forced ? 0 : ((c * 173) % 7) * 38 + 40);
    list.forEach((report, i) => {
      boxes.push({ report, x: c * COL_PITCH, y, h: hs[i], col: c });
      y += hs[i] + GAP;
    });
  }
  return boxes;
};

const WALL = buildWall();
const HERO = WALL.find((b) => b.report === HERO_EXISTING)!;
const HERO_CX = HERO.x + TILE_W / 2;
const HERO_CY = HERO.y + HERO.h / 2;
// Camera rest target: puts the hero slot at screen (732, 540) at zoom 1.
const CAM_CX = HERO_CX + 228;
const CAM_CY = HERO_CY;

const scrollAt = (f: number) => {
  if (f <= SC0) return 0;
  if (f < SC1) return TRAVEL * 0.8 * Math.pow((f - SC0) / (SC1 - SC0), 1.8);
  if (f < SC2) {
    const t = (f - SC1) / (SC2 - SC1);
    return TRAVEL * (0.8 + 0.2 * (1 - Math.pow(1 - t, 2.2)));
  }
  return TRAVEL;
};

const zoomAt = (f: number) => {
  if (f <= SC0) return 1;
  const t = clamp01((f - SC0) / (SC1 - SC0));
  return 1 + (ZOOM_END - 1) * Math.pow(t, 1.25);
};

// Shadow carries the card from "alone on the stage" to "one of the tiles".
const shadowAt = (k: number) =>
  `0 ${(44 - 34 * k).toFixed(1)}px ${(130 - 100 * k).toFixed(1)}px rgba(0,0,0,${(0.62 - 0.04 * k).toFixed(3)}), 0 0 0 ${k.toFixed(2)}px rgba(255,255,255,${(0.07 * k).toFixed(3)})`;

const Ghost: FC<{ report: Report; h: number }> = ({ report, h }) => {
  const tone = TONE[report.tone];
  const bars = 'repeating-linear-gradient(to bottom,#E7E9ED 0 16px,rgba(0,0,0,0) 16px 40px)';
  const dots = 'repeating-linear-gradient(to bottom,#CDD2DA 0 16px,rgba(0,0,0,0) 16px 40px)';
  return (
    <div style={{ position: 'relative', width: CARD_W, height: h, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
      <div style={{ height: 89, background: tone.headBg, borderBottom: `1px solid ${tone.headLine}` }}>
        <div style={{ width: 30, height: 30, margin: '29px 0 0 30px', borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', left: 78, top: 33, width: 430, height: 22, borderRadius: 11, background: tone.title, opacity: 0.68 }} />
      </div>
      <div style={{ position: 'absolute', left: 78, top: 118, width: 500, height: h - 130, backgroundImage: bars }} />
      <div style={{ position: 'absolute', left: 34, top: 118, width: 26, height: h - 130, backgroundImage: dots }} />
    </div>
  );
};

const FeedCam: FC<{ cy: number; zoom: number; rotX: number; children: ReactNode }> = ({ cy, zoom, rotX, children }) => (
  <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        perspective: `${1500 * zoom}px`,
        perspectiveOrigin: '960px 540px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zoom,
          transformOrigin: `${CAM_CX}px ${cy}px`,
          transformStyle: 'preserve-3d',
          transform: `translate(${(960 / zoom - CAM_CX).toFixed(2)}px, ${(540 / zoom - cy).toFixed(2)}px) rotateX(${rotX}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  </AbsoluteFill>
);

export const S065Feed: FC = () => {
  const f = useCurrentFrame();
  const scroll = scrollAt(f);
  const zoom = zoomAt(f);
  const cy = CAM_CY + scroll;
  const rotX = TILT * clamp01((1 - zoom) / (1 - ZOOM_END));
  const pull = clamp01((1 - zoom) / (1 - ZOOM_END));
  // Swap to the ghost version only once the 30px body text is under ~9px on
  // screen; the window is deliberately narrow so the cross-fade hides inside
  // the fastest part of the pull-back.
  const detail = clamp01((S * zoom - 0.26) / 0.035);

  // Beat 1: the card is thrown in — lifts toward the camera, turns over, then
  // dives into its slot. Starts and ends flat, so frame 0 is S06's frame 657.
  const fly = ramp(f, FLY[0], FLY[1] - FLY[0], EASE.swift);
  const spin = Math.sin(fly * Math.PI);
  const heroDx = 733 * (1 - fly);
  const heroDy = 24 * (1 - fly);
  const heroDz = 340 * spin;
  const heroScale = 1 + (S - 1) * fly;
  // Drawn in screen space, above the vignette: S06 paints its card there, so
  // the seam frame has to match. The camera is still flat for the whole flight.
  const heroX = 960 + (HERO_CX + heroDx - CAM_CX) * zoom;
  const heroY = 540 + (heroDy - scroll) * zoom;
  const heroZ = heroDz * zoom;
  const heroScreenScale = heroScale * zoom;

  const onScreen = (b: Box) => {
    const sy = 540 + (b.y + b.h / 2 - cy) * zoom;
    if (sy + b.h * zoom < -240 || sy - b.h * zoom > 1320) return false;
    const sx = 960 + (b.x + TILE_W / 2 - CAM_CX) * zoom;
    return sx + TILE_W * zoom > -240 && sx - TILE_W * zoom < 2160;
  };

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 95% at 50% 0%, #141C2C 0%, #0A0F18 55%, #05070C 100%)' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(42% 38% at 78% 6%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0) 70%)',
        }}
      />

      <FeedCam cy={cy} zoom={zoom} rotX={rotX}>
        {WALL.map((b) => {
          if (b === HERO || !onScreen(b)) return null;
          const d = Math.hypot(b.x + TILE_W / 2 - HERO_CX, b.y + b.h / 2 - HERO_CY);
          const born = ramp(f, BLOOM_AT + BLOOM_SPAN * Math.min(1, d / BLOOM_REF), TILE_LIFE, EASE.out);
          if (born < 0.004) return null;
          const raw = b.h / S;
          return (
            <div
              key={b.report.key}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y,
                width: TILE_W,
                height: b.h,
                borderRadius: 16 * S,
                boxShadow: TILE_SHADOW,
                opacity: born,
                transform: `translateY(${((1 - born) * 22).toFixed(2)}px)`,
              }}
            >
              <div style={{ position: 'relative', transform: `scale(${S})`, transformOrigin: '0 0' }}>
                {detail < 0.999 ? <Ghost report={b.report} h={raw} /> : null}
                {detail > 0.02 ? (
                  <div style={{ position: 'absolute', left: 0, top: 0, opacity: detail }}>
                    <LarkReportCard report={b.report} height={raw} shadow="none" />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

      </FeedCam>

      <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.5 }}>
        <Dust count={18} seed={11} drift={0.22} opacity={0.28} color="#dfe9ff" />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.72 * pull,
          background:
            'radial-gradient(ellipse 62% 70% at 50% 48%, rgba(5,7,12,0) 0%, rgba(5,7,12,0.26) 58%, rgba(5,7,12,0.7) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 78% 78% at 50% 46%, rgba(2,3,6,0) 45%, rgba(2,3,6,0.38) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: heroX,
          top: heroY,
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `perspective(${(1500 * zoom).toFixed(0)}px) translate3d(0px, 0px, ${heroZ.toFixed(2)}px) rotateY(${(-40 * spin).toFixed(2)}deg) rotateZ(${(-12 * spin).toFixed(2)}deg) scale(${heroScreenScale.toFixed(4)})`,
        }}
      >
        <div style={{ position: 'absolute', left: -CARD_W / 2, top: -374, width: CARD_W, height: 748 }}>
          <LarkReportCard report={HERO_EXISTING} height={748} shadow={shadowAt(fly)} />
        </div>
      </div>

      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};
