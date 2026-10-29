import type { FC } from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { PageCam, type CamKey2D } from '../shots/spotlightHeroCard/PageCam';
import { Dust, EASE, Grain, alpha, ramp } from '../shots/spotlightHeroCard/polish';
import { ReplyChatThread } from '../shots/workflow/ReplyChatThread';
import { WorkflowPanel } from '../shots/workflow/WorkflowPanel';
import { LarkReportCard, REPORT_H, REPORT_W } from '../shots/workflow/LarkReportCard';
import { CARD_AT, DURATION, LEAD_START, NOTIFY_AT, PANEL, QUICK_NODE, nodeScreen } from '../shots/workflow/plan';
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
const CYAN = '#8FD8FF';

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

          <Beams frame={f} />

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

// One ordinary exchange: the message lights a beam to the workflow, and the
// answer comes back on its own beam just before the reply bubble lands.
// `from` is the incoming bubble's right edge, measured off the still.
const EXCHANGES = [
  { at: 16, from: 453, reply: 54 },
  { at: 72, from: 482, reply: 110 },
  { at: 128, from: 428, reply: 166 },
];

type Beam = { a: { x: number; y: number }; c: { x: number; y: number }; b: { x: number; y: number }; start: number; dur: number; tone: string; head: number };

const ANSWER = { x: 990, y: 866 };

// The outbound beam always lands on the Webhook node as the camera has it at
// that frame; the UID's gold beam follows the same route.
const beamSpecs = (): Beam[] => {
  const list: Beam[] = [];
  for (const e of EXCHANGES) {
    list.push({ a: { x: e.from, y: 868 }, c: { x: 780, y: 470 }, b: nodeScreen('Webhook', e.at + 18), start: e.at + 8, dur: 10, tone: CYAN, head: 7 });
    list.push({ a: nodeScreen(QUICK_NODE, e.reply - 10), c: { x: 1450, y: 640 }, b: ANSWER, start: e.reply - 10, dur: 10, tone: CYAN, head: 6.6 });
  }
  list.push({ a: { x: 337, y: 868 }, c: { x: 780, y: 470 }, b: nodeScreen('Webhook', LEAD_START), start: LEAD_START - 12, dur: 12, tone: GOLD, head: 9 });
  return list;
};

const qbez = (s: Beam, t: number) => {
  const mt = 1 - t;
  return {
    x: mt * mt * s.a.x + 2 * mt * t * s.c.x + t * t * s.b.x,
    y: mt * mt * s.a.y + 2 * mt * t * s.c.y + t * t * s.b.y,
  };
};

const trail = (s: Beam, t: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const p = qbez(s, (t * i) / 20);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(' ');
};

const Beams: FC<{ frame: number }> = ({ frame }) => {
  const items = beamSpecs()
    .map((s) => {
      const t = ramp(frame, s.start, s.dur, EASE.linear);
      const end = s.start + s.dur;
      return { s, t, src: ramp(frame, s.start - 6, 8, EASE.out) * (1 - ramp(frame, end + 1, 7, EASE.linear)), since: frame - (s.start - 6), fade: 1 - Math.max(0, frame - end) / 8 };
    })
    .filter(({ since, fade }) => since >= 0 && fade > 0.005);
  if (items.length === 0) return null;
  return (
    <svg
      width={PAGE_W}
      height={PAGE_H}
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', transform: 'translateZ(5px)' }}
    >
      {items.map(({ s, t, src, fade }) => {
        const flying = t > 0 && t < 1;
        const head = qbez(s, Math.min(1, Math.max(0, t)));
        const tail = qbez(s, Math.max(0, Math.min(1, t) - 0.16));
        const op = flying ? Math.min(1, Math.sin(t * Math.PI) * 2.4) : 0;
        const line = flying ? 0.2 * op : 0.22 * fade;
        return (
          <g key={`${s.tone}-${s.start}`}>
            {line > 0.005 ? (
              <polyline
                points={trail(s, Math.min(1, Math.max(0, t)))}
                fill="none"
                stroke={alpha(s.tone, line)}
                strokeWidth={s.head * 0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {flying ? (
              <>
                <line x1={tail.x} y1={tail.y} x2={head.x} y2={head.y} stroke={alpha(s.tone, 0.55 * op)} strokeWidth={s.head * 0.45} strokeLinecap="round" />
                <circle cx={head.x} cy={head.y} r={s.head * 3} fill={alpha(s.tone, 0.16 * op)} />
                <circle cx={head.x} cy={head.y} r={s.head} fill={s.tone} />
                <circle cx={head.x} cy={head.y} r={s.head * 0.46} fill="#FFF8EA" />
              </>
            ) : null}
            {src > 0.01 ? (
              <>
                <circle cx={s.a.x} cy={s.a.y} r={s.head * (1.4 + 2.2 * (1 - src))} fill={alpha(s.tone, 0.26 * src)} />
                <circle cx={s.a.x} cy={s.a.y} r={s.head * 0.75} fill={alpha(s.tone, 0.8 * src)} />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

// Full S06: spotlight (172f) hands over to the chat → workflow → Lark shot (486f).
export const S06ReplyFull: FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={172}>
      <S06Spotlight />
    </Sequence>
    <Sequence from={138} durationInFrames={DURATION}>
      <S06Reply />
    </Sequence>
  </AbsoluteFill>
);

export const S06_REPLY_TOTAL = 172 + DURATION;
