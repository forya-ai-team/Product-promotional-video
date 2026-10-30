import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Dust, EASE, Grain, alpha, ramp } from '../shots/spotlightHeroCard/polish';
import { LarkReportCard, SectionPanel } from '../shots/workflow/LarkReportCard';
import {
  CARD_W,
  HERO_FULL,
  PANEL_W,
  reportHeight,
  sectionBoxes,
  sectionPanelHeight,
} from '../shots/workflow/reportData';
import { REPORT_POSE_SCALE } from '../shots/workflow/plan';
import { S06Reply } from './S06Reply';
import { S06_REPLY_DURATION } from '../timeline';

// S066 — the complete report leaves the workflow panel, tilts into a 3D
// document on the left over frosted glass, and every section is scanned,
// lifted off the card and re-set large on the right. The stage underneath is
// S06's last frame frozen, so the cut into this scene is invisible.

const CARD_H = reportHeight(HERO_FULL);
const POSE = REPORT_POSE_SCALE;

const ARRIVE = { x: 1465, y: 564 };
const LEFT = { x: 400, y: 540 };
const PANEL_X = 1060;
const PANEL_CX = PANEL_X + PANEL_W / 2;

const GOLD = '#E4C58A';
const CYAN = '#8FD8FF';

const MOVE_IN = [10, 46] as const;
// Must land before the 16f dissolve starts (S065 f0 == local 476); otherwise
// S065's already-centred card fades in while this one is still sliding in.
const BACK = [438, 472] as const;

// Scan start / panel out. Overlaps are deliberate: the next sweep begins as the
// previous panel leaves, so the shot never sits still between sections.
const SEC = [
  { at: 62, out: 134 },
  { at: 140, out: 240 },
  { at: 246, out: 312 },
  { at: 318, out: 434 },
];

const BOXES = sectionBoxes(HERO_FULL);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const poseAt = (f: number) => {
  const into = ramp(f, MOVE_IN[0], MOVE_IN[1] - MOVE_IN[0], EASE.out);
  const back = ramp(f, BACK[0], BACK[1] - BACK[0], EASE.smooth);
  const float = into * (1 - back);
  return {
    x: lerp(lerp(ARRIVE.x, LEFT.x, into), ARRIVE.x, back),
    y: lerp(lerp(ARRIVE.y, LEFT.y, into), ARRIVE.y, back) + Math.sin(f / 21) * 2.2 * float,
    scale: lerp(1, POSE, into),
    ry: lerp(lerp(0, -18, into), 0, back) + Math.sin(f / 17) * 0.35 * float,
    rx: lerp(lerp(0, 1.8, into), 0, back),
    rz: lerp(lerp(0, -1.2, into), 0, back),
  };
};

const sectionScreenY = (box: { top: number; height: number }) =>
  540 + (box.top + box.height / 2 - CARD_H / 2) * POSE;

const ScanOverlay: FC<{ f: number }> = ({ f }) => {
  const active = SEC.map((s, i) => {
    const box = BOXES[i];
    const hl = ramp(f, s.at - 2, 8, EASE.out) * (1 - ramp(f, s.out + 2, 10, EASE.smooth));
    return { box, hl, scan: ramp(f, s.at, 12, EASE.linear), on: hl > 0.003 };
  }).filter((s) => s.on);
  if (!active.length) return null;

  // Two sections briefly share the stage during a hand-off, so the dim is cut
  // from the union of their boxes; stacking two veils would flash darker.
  const holes = active
    .map((a) => [a.box.top, a.box.top + a.box.height] as const)
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const h of holes) {
    const last = merged[merged.length - 1];
    if (last && h[0] <= last[1]) last[1] = Math.max(last[1], h[1]);
    else merged.push([h[0], h[1]]);
  }
  const dim = Math.max(...active.map((a) => a.hl)) * 0.52;
  const bands: [number, number][] = [];
  let y = 0;
  for (const [a, b] of merged) {
    if (a > y) bands.push([y, a]);
    y = Math.max(y, b);
  }
  if (y < CARD_H) bands.push([y, CARD_H]);

  return (
    <>
      {bands.map(([a, b], i) => (
        <div key={`d${i}`} style={{ position: 'absolute', left: 0, right: 0, top: a, height: b - a, background: `rgba(8,12,20,${dim.toFixed(3)})` }} />
      ))}
      {active.map(({ box, hl, scan }, idx) => (
        <div key={`h${idx}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: box.top,
              height: box.height,
              opacity: hl,
              background: `linear-gradient(180deg, ${alpha(GOLD, 0.16)} 0%, ${alpha(GOLD, 0.05)} 100%)`,
              boxShadow: `inset 0 0 0 2px ${alpha(GOLD, 0.85)}, inset 4px 0 0 ${GOLD}, 0 0 46px ${alpha(GOLD, 0.22)}`,
            }}
          />
          {scan > 0 && scan < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: -8,
                right: -8,
                top: box.top + box.height * scan - 1.5,
                height: 3,
                opacity: hl,
                background: `linear-gradient(90deg, ${alpha(GOLD, 0)} 0%, ${GOLD} 16%, #FFF7E6 50%, ${GOLD} 84%, ${alpha(GOLD, 0)} 100%)`,
                boxShadow: `0 0 26px 6px ${alpha(GOLD, 0.5)}`,
              }}
            />
          ) : null}
        </div>
      ))}
    </>
  );
};

const Lift: FC<{ f: number }> = ({ f }) => {
  const items = SEC.map((s, i) => {
    const enter = ramp(f, s.at + 8, 18, EASE.out);
    const exit = ramp(f, s.out, 12, EASE.smooth);
    const box = BOXES[i];
    const h = sectionPanelHeight(HERO_FULL, box);
    return { s, i, enter, exit, box, h };
  });
  return (
    <>
      {items.map(({ s, i, enter, exit, box, h }) => {
        if (enter <= 0 || exit >= 1) return null;
        const px = (1 - enter) * (LEFT.x - PANEL_CX) * 0.55 + exit * 110;
        const py = (1 - enter) * (sectionScreenY(box) - 540) * 0.55 - exit * 26;
        return (
          <div key={i}>
            {/* the beam that carries the section out of the card */}
            <svg
              width={1920}
              height={1080}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: Math.min(enter, 1 - exit) }}
            >
              <defs>
                <linearGradient id={`s066-beam-${i}`} x1={0} x2={1} y1={0} y2={0}>
                  <stop offset="0%" stopColor={alpha(GOLD, 0.7)} />
                  <stop offset="55%" stopColor={alpha(GOLD, 1)} />
                  <stop offset="100%" stopColor={alpha(CYAN, 0.85)} />
                </linearGradient>
              </defs>
              {(() => {
                const bx = LEFT.x + (CARD_W * POSE) / 2 - 40;
                const by = sectionScreenY(box);
                const ex = PANEL_X + 8;
                const ey = 540;
                const dx = ex - bx;
                const dy = ey - by;
                const len = Math.hypot(dx, dy);
                const nx = -dy / len;
                const ny = dx / len;
                const fan = (w0: number, w1: number) =>
                  [
                    `${bx + nx * w0},${by + ny * w0}`,
                    `${ex + nx * w1},${ey + ny * w1}`,
                    `${ex - nx * w1},${ey - ny * w1}`,
                    `${bx - nx * w0},${by - ny * w0}`,
                  ].join(' ');
                return (
                  <>
                    <polygon points={fan(12, 62)} fill={`url(#s066-beam-${i})`} opacity={0.2} style={{ filter: 'blur(16px)' }} />
                    <polygon points={fan(6, 36)} fill={`url(#s066-beam-${i})`} opacity={0.5} style={{ filter: 'blur(6px)' }} />
                    <polygon points={fan(2.2, 18)} fill={`url(#s066-beam-${i})`} opacity={0.95} />
                    <polygon points={fan(0.8, 7)} fill="#FFF7E6" opacity={0.85} style={{ filter: 'blur(1px)' }} />
                  </>
                );
              })()}
              <circle cx={lerp(LEFT.x + 260, PANEL_X, enter)} cy={lerp(sectionScreenY(box), 540, enter)} r={5} fill={GOLD} opacity={1} />
              <circle cx={lerp(LEFT.x + 260, PANEL_X, enter)} cy={lerp(sectionScreenY(box), 540, enter)} r={13} fill={alpha(GOLD, 0.3)} />
            </svg>

            <div
              style={{
                position: 'absolute',
                left: PANEL_X,
                top: 540 - h / 2,
                width: PANEL_W,
                height: h,
                perspective: 2200,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  transformOrigin: '50% 50%',
                  transform: `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotateY(${((1 - enter) * 26 - exit * 12).toFixed(2)}deg) scale(${(0.62 + 0.38 * enter).toFixed(4)})`,
                  opacity: Math.min(enter * 1.35, 1) * (1 - exit),
                }}
              >
                <SectionPanel report={HERO_FULL} section={box} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const S066Report: FC = () => {
  const f = useCurrentFrame();
  const p = poseAt(f);
  const frost = ramp(f, 6, 28, EASE.smooth);

  return (
    <AbsoluteFill style={{ background: '#05070C' }}>
      <div
        style={{
          position: 'absolute',
          inset: -28 * frost,
          filter:
            frost > 0.001
              ? `blur(${(frost * 11).toFixed(2)}px) brightness(${(1 - 0.5 * frost).toFixed(3)}) saturate(${(1 - 0.25 * frost).toFixed(3)})`
              : undefined,
          transform: `scale(${(1 + 0.03 * frost).toFixed(4)})`,
        }}
      >
        <S06Reply atFrame={S06_REPLY_DURATION - 1} hideCard />
      </div>

      {/* frosted-glass material over the retired stage */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: frost, background: 'rgba(5,8,13,0.34)' }} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: frost,
          background: `linear-gradient(148deg, rgba(203,219,240,0.11) 0%, rgba(138,160,190,0.05) 42%, rgba(255,230,198,0.045) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: frost,
          background: 'radial-gradient(46% 40% at 20% 14%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      {/* Below the card, exactly as S06 stacks its own vignette: the cut has to
          land on the same pixels before the card starts moving. */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: frost,
          background: 'radial-gradient(ellipse 74% 74% at 50% 48%, rgba(2,3,6,0) 46%, rgba(2,3,6,0.42) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: LEFT.x,
          top: LEFT.y,
          width: 0,
          height: 0,
          perspective: 2400,
          opacity: 0.55 * frost,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -420,
            top: -520,
            width: 840,
            height: 1040,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(255,214,160,0.16) 0%, rgba(255,214,160,0) 100%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      <div style={{ position: 'absolute', left: p.x, top: p.y, width: 0, height: 0, perspective: 2400 }}>
        <div
          style={{
            position: 'absolute',
            left: -CARD_W / 2,
            top: -CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
            transform: `rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) rotateZ(${p.rz.toFixed(2)}deg) scale(${p.scale.toFixed(4)})`,
            transformOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: 40,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 20,
              background: 'rgba(0,0,0,0.62)',
              filter: 'blur(52px)',
              opacity: frost,
            }}
          />
          <div style={{ position: 'relative', width: CARD_W, height: CARD_H }}>
            <LarkReportCard report={HERO_FULL} height={CARD_H} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden' }}>
              <ScanOverlay f={f} />
            </div>
          </div>
        </div>
      </div>

      <Lift f={f} />

      <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.4 * frost }}>
        <Dust count={26} seed={7} drift={0.26} opacity={0.3} color="#ffe6c2" />
      </AbsoluteFill>
      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};
