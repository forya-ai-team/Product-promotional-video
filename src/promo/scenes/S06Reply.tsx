import type { FC } from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { PageCam, type CamKey2D } from '../shots/spotlightHeroCard/PageCam';
import { Dust, EASE, Grain, alpha, ramp } from '../shots/spotlightHeroCard/polish';
import { ReplyChatThread } from '../shots/workflow/ReplyChatThread';
import { WorkflowPanel } from '../shots/workflow/WorkflowPanel';
import { LarkReportCard, REPORT_H, REPORT_W } from '../shots/workflow/LarkReportCard';
import { CARD_AT, DURATION, LEAD_START, NOTIFY_AT, PANEL } from '../shots/workflow/plan';
import { S06Spotlight } from './S06Spotlight';
import { S06Desktop } from '../ui/tolink/S06Desktop';

// Second half of S06: frame 0 here == S06Spotlight's last frame.
const PAGE_W = 2600;
const PAGE_H = 1600;
const CARD_W = 881;
const CARD_H = 884;
const CARD_RADIUS = 16;
const CARD = { x: 140, y: 122 };
const GOLD = '#E4C58A';

const FINAL: CamKey2D = { frame: 0, cx: 960, cy: 540, zoom: 1.0, rotX: 2, rotY: -6, rotZ: -1, persp: 1200 };
const CAM: CamKey2D[] = [FINAL, { ...FINAL, frame: DURATION }];

const NOTE_LINE_1 = 'TikTok 私信';
const NOTE_LINE_2 = 'AI 自动应答';

export const S06Reply: FC = () => {
  const f = useCurrentFrame();

  // Continues the spotlight's breathing phase (its frame 172 == this frame 0 + 30).
  const holdBreath = 1 + 0.012 * Math.sin((f + 30) / 14);
  const open = ramp(f, 6, 20, EASE.out);
  const content = ramp(f, 14, 18, EASE.out);
  const noteFade = 1 - ramp(f, 2, 12, EASE.out);
  const veil = ramp(f, CARD_AT - 4, 16, EASE.smooth);
  // The report grows out of the notify node: the camera centres that node, so
  // scaling about the panel centre keeps the origin on it.
  const cardT = interpolate(f, [CARD_AT, CARD_AT + 30], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.2, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardScale = 0.05 + 0.95 * cardT;
  const cardOpacity = Math.min(1, Math.max(0, (f - CARD_AT) / 4));

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 95% at 50% 0%, #141C2C 0%, #0A0F18 55%, #05070C 100%)' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(42% 38% at 78% 6%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0) 70%)',
        }}
      />

      <PageCam keys={CAM} pageW={PAGE_W} pageH={PAGE_H} ease={EASE.smooth}>
        <S06Desktop hideChat />

        <svg
          width={PAGE_W}
          height={PAGE_H}
          style={{ position: 'absolute', left: 0, top: 0, transform: 'translateZ(1px)', pointerEvents: 'none' }}
        >
          <defs>
            <filter id="s06r-tight" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="20" />
            </filter>
            <filter id="s06r-wide" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="48" />
            </filter>
            <mask id="s06r-hole" maskUnits="userSpaceOnUse" x={0} y={0} width={PAGE_W} height={PAGE_H}>
              <rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="white" />
              <rect
                x={CARD.x - 56}
                y={CARD.y - 46}
                width={CARD_W + 112}
                height={CARD_H + 92}
                rx={64}
                fill="#0A0A0A"
                filter="url(#s06r-wide)"
              />
              <rect
                x={CARD.x - 12}
                y={CARD.y - 12}
                width={CARD_W + 24}
                height={CARD_H + 24}
                rx={CARD_RADIUS + 12}
                fill="black"
                filter="url(#s06r-tight)"
              />
            </mask>
          </defs>
          <rect
            x={0}
            y={0}
            width={PAGE_W}
            height={PAGE_H}
            fill="rgb(10,9,8)"
            fillOpacity={Math.min(0.955, 0.93 * holdBreath)}
            mask="url(#s06r-hole)"
          />
        </svg>

        <div style={{ transformStyle: 'preserve-3d' }}>
          <div
            style={{
              position: 'absolute',
              left: CARD.x,
              top: CARD.y,
              width: CARD_W,
              height: CARD_H,
              transform: 'translateZ(2px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
              <ReplyChatThread frame={f} width={CARD_W} height={CARD_H} radius={CARD_RADIUS} />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: CARD_RADIUS,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.24), 0 0 0 1.5px rgba(255,236,205,0.7), 0 0 44px rgba(255,214,160,0.16)`,
                pointerEvents: 'none',
              }}
            />
          </div>

          <WorkflowPanel frame={f} open={open} content={content} />

          {veil > 0.001 ? (
            <div
              style={{
                position: 'absolute',
                left: PANEL.x,
                top: PANEL.y,
                width: PANEL.w,
                height: PANEL.h,
                borderRadius: PANEL.r,
                background: 'rgba(3,4,7,0.55)',
                opacity: veil,
                transform: 'translateZ(3px)',
              }}
            />
          ) : null}

          <Spark frame={f} />

          {noteFade > 0.01 ? (
            <div style={{ transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 1076,
                  top: 420,
                  width: 380,
                  height: 300,
                  transform: 'translateZ(3px)',
                  background:
                    'radial-gradient(ellipse 50% 50% at 52% 50%, rgba(16,14,12,0.97) 0%, rgba(16,14,12,0.9) 60%, rgba(16,14,12,0) 100%)',
                  filter: 'blur(6px)',
                  opacity: noteFade,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 1110,
                  top: 470,
                  width: 'max-content',
                  whiteSpace: 'nowrap',
                  transform: 'translateZ(4px)',
                  opacity: noteFade,
                  fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.12,
                }}
              >
                <div style={{ fontSize: 56, fontWeight: 700, color: '#F6F3EC', textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}>
                  {NOTE_LINE_1}
                </div>
                <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: -8,
                      top: '8%',
                      bottom: '2%',
                      width: 'calc(100% + 16px)',
                      background: GOLD,
                      borderRadius: 5,
                    }}
                  />
                  <div style={{ position: 'relative', fontSize: 56, fontWeight: 700, color: '#14110C' }}>
                    {NOTE_LINE_2}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </PageCam>

      {/* Static cone carried over from the spotlight's final frame */}
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          opacity: 0.55 * (1 - 0.62 * ramp(f, 0, 40, EASE.smooth)),
        }}
      >
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(28px)' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(893px -720px, 945px -720px, 778px 540px, 220px 540px)',
              background:
                'linear-gradient(18.4deg, rgba(255,238,212,0.13) 0%, rgba(255,238,212,0.06) 60%, rgba(255,238,212,0.025) 100%)',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: 'polygon(893px -720px, 945px -720px, 778px 540px, 220px 540px)',
          }}
        >
          <Dust count={36} seed={4} drift={0.3} opacity={0.35} color="#fff1dc" />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 78% 78% at 50% 46%, rgba(2,3,6,0) 45%, rgba(2,3,6,0.38) 100%)',
        }}
      />

      {f >= CARD_AT - 1 ? (
        <div
          style={{
            position: 'absolute',
            left: PANEL.x + PANEL.w / 2,
            top: PANEL.y + PANEL.h / 2,
            width: REPORT_W,
            height: REPORT_H,
            transform: `translate(-50%, -50%) scale(${cardScale.toFixed(4)})`,
            transformOrigin: '50% 50%',
            opacity: cardOpacity,
          }}
        >
          <LarkReportCard />
        </div>
      ) : null}

      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};

const sparkPoint = (t: number) => {
  // Leaves the UID bubble's right edge and arcs over the chat into the panel.
  const a = { x: 300, y: 868 };
  const c = { x: 780, y: 470 };
  const b = { x: 1465, y: 564 };
  const mt = 1 - t;
  return {
    x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x,
    y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y,
  };
};

const Spark: FC<{ frame: number }> = ({ frame }) => {
  const t = ramp(frame, LEAD_START - 8, 10, EASE.linear);
  if (t <= 0 || t >= 1) return null;
  const p = sparkPoint(t);
  const tail = sparkPoint(Math.max(0, t - 0.12));
  const op = Math.min(1, Math.sin(t * Math.PI) * 2.4);
  return (
    <svg
      width={PAGE_W}
      height={PAGE_H}
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', transform: 'translateZ(5px)' }}
    >
      <line x1={tail.x} y1={tail.y} x2={p.x} y2={p.y} stroke={alpha(GOLD, 0.55 * op)} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={p.x} cy={p.y} r={16} fill={alpha(GOLD, 0.18 * op)} />
      <circle cx={p.x} cy={p.y} r={6.5} fill={GOLD} />
      <circle cx={p.x} cy={p.y} r={3} fill="#FFF8EA" />
    </svg>
  );
};

// Full S06: spotlight (172f) hands over to the UID → Lark shot (420f).
export const S06ReplyFull: FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={172}>
      <S06Spotlight />
    </Sequence>
    <Sequence from={172} durationInFrames={DURATION}>
      <S06Reply />
    </Sequence>
  </AbsoluteFill>
);

export const S06_REPLY_TOTAL = 172 + DURATION;
