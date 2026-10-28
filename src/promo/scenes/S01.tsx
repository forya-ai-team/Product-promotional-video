import type { FC } from 'react';
import { useId } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { PLATFORM_META, PlatformMark, type PlatformId } from '../ui/brand/PlatformIcons';
import { DmexWordmark } from '../ui/brand/DmexWordmark';

export const S01_DURATION = 420;

const W = 1920;
const H = 1080;
const CENTER = { x: 960, y: 500 };
const HUB_RADIUS = 270;
const NODE_RADIUS = 70;
const WORDMARK_WIDTH = 560;
const WORDMARK_HEIGHT = (WORDMARK_WIDTH * 71) / 250;
const TAGLINE = '四个社媒，双向互通';

const FONT = '"Microsoft YaHei", "Segoe UI", system-ui, sans-serif';
const LABEL_FONT = '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif';

const TEXT_MUTED = '#6B7893';
const OUT_COLOR = '#1E76FF';
const IN_COLOR = '#7B4BFF';

const CHANNEL_WIDTH = 34;
const LANE_OFFSET = 8.5;
const DIGIT_ADVANCE = 18;
const BINARY_UNIT = '01101001011100100101101011001001';
const BINARY_TEXT = BINARY_UNIT.repeat(3);
const BINARY_PERIOD = BINARY_UNIT.length * DIGIT_ADVANCE;
const BINARY_TEXT_LENGTH = BINARY_TEXT.length * DIGIT_ADVANCE;
const FLOW_SPEED = 1.2;
const DIGIT_FONT = '"Consolas", "Cascadia Code", monospace';

const NODES: { id: PlatformId; x: number; y: number }[] = [
  { id: 'telegram', x: 355, y: 292 },
  { id: 'whatsapp', x: 1565, y: 292 },
  { id: 'tiktok', x: 355, y: 812 },
  { id: 'facebook', x: 1565, y: 812 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ENTER = Easing.bezier(0, 0, 0.2, 1);
const SEND_EASE = Easing.inOut(Easing.quad);

const segment = (frame: number, start: number, duration: number, easing = ENTER) =>
  easing(clamp01((frame - start) / duration));

const withAlpha = (hex: string, alpha: number) => {
  const a = Math.round(clamp01(alpha) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
};

const decay = (frame: number, at: number, duration = 18) => {
  if (frame < at) return 0;
  const p = (frame - at) / duration;
  return p >= 1 ? 0 : Math.pow(1 - p, 2);
};

const NODE_START = [70, 80, 90, 100];
const LINK_START = [138, 146, 154, 162];
const LINK_DRAW = 22;
const PAIR_START = [196, 226, 256, 286];
const SEND_DURATION = 14;
const COMET_GAP = 5;
const RETURN_OFFSET = 21;
const FINALE_SEND = 332;
const FINALE_RETURN = 352;

type Direction = 'out' | 'in';
type PacketEvent = {
  link: number;
  dir: Direction;
  start: number;
  end: number;
};

const EVENTS: PacketEvent[] = [
  ...NODES.flatMap((_, i) => [
    {
      link: i,
      dir: 'out' as Direction,
      start: PAIR_START[i],
      end: PAIR_START[i] + SEND_DURATION,
    },
    {
      link: i,
      dir: 'out' as Direction,
      start: PAIR_START[i] + COMET_GAP,
      end: PAIR_START[i] + COMET_GAP + SEND_DURATION,
    },
    {
      link: i,
      dir: 'in' as Direction,
      start: PAIR_START[i] + RETURN_OFFSET,
      end: PAIR_START[i] + RETURN_OFFSET + SEND_DURATION,
    },
    {
      link: i,
      dir: 'in' as Direction,
      start: PAIR_START[i] + RETURN_OFFSET + COMET_GAP,
      end: PAIR_START[i] + RETURN_OFFSET + COMET_GAP + SEND_DURATION,
    },
  ]),
  ...NODES.flatMap((_, i) => [
    {
      link: i,
      dir: 'out' as Direction,
      start: FINALE_SEND,
      end: FINALE_SEND + SEND_DURATION,
    },
    {
      link: i,
      dir: 'out' as Direction,
      start: FINALE_SEND + COMET_GAP,
      end: FINALE_SEND + COMET_GAP + SEND_DURATION,
    },
    {
      link: i,
      dir: 'in' as Direction,
      start: FINALE_RETURN,
      end: FINALE_RETURN + SEND_DURATION,
    },
    {
      link: i,
      dir: 'in' as Direction,
      start: FINALE_RETURN + COMET_GAP,
      end: FINALE_RETURN + COMET_GAP + SEND_DURATION,
    },
  ]),
];

const GEOMETRY = NODES.map((node) => {
  const dx = node.x - CENTER.x;
  const dy = node.y - CENTER.y;
  const distance = Math.hypot(dx, dy);
  const ux = dx / distance;
  const uy = dy / distance;
  const hub = { x: CENTER.x + ux * HUB_RADIUS, y: CENTER.y + uy * HUB_RADIUS };
  const port = {
    x: node.x - ux * (NODE_RADIUS + 9),
    y: node.y - uy * (NODE_RADIUS + 9),
  };
  return {
    hub,
    port,
    ux,
    uy,
    length: Math.hypot(port.x - hub.x, port.y - hub.y),
  };
});

const linkActivity = (frame: number, link: number) =>
  EVENTS.filter((e) => e.link === link).reduce((value, e) => {
    if (frame < e.start - 5 || frame > e.end + 20) return value;
    const rise = segment(frame, e.start - 5, 10);
    const fall = 1 - clamp01((frame - (e.end + 6)) / 14);
    return Math.max(value, Math.min(rise, fall));
  }, 0);

type Geometry = (typeof GEOMETRY)[number];

const along = (
  point: { x: number; y: number },
  geo: Geometry,
  perpendicular: number,
  forward = 0,
) => ({
  x: point.x + geo.ux * forward - geo.uy * perpendicular,
  y: point.y + geo.uy * forward + geo.ux * perpendicular,
});

const DataChannel: FC<{
  uid: string;
  index: number;
  geo: Geometry;
  draw: number;
  activity: number;
  frame: number;
}> = ({ uid, index, geo, draw, activity, frame }) => {
  const band = `M${geo.hub.x} ${geo.hub.y}L${geo.port.x} ${geo.port.y}`;
  const edge = (d: number) => {
    const a = along(geo.hub, geo, d);
    const b = along(geo.port, geo, d);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };
  const lane = (d: number) => {
    const a = along(geo.hub, geo, d, 6);
    const b = along(geo.port, geo, d, -6);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };

  const cycle = (frame * FLOW_SPEED + index * 37) % BINARY_PERIOD;
  // 文本 startOffset 变大使字形向节点移动，变小则向中枢移动。
  const outOffset =
    -BINARY_PERIOD + ((cycle + BINARY_PERIOD * 0.25) % BINARY_PERIOD);
  const inOffset = -cycle;

  const edgeColor = `rgba(35,72,150,${(0.18 + 0.1 * activity).toFixed(3)})`;
  const bandColor = `rgba(46,104,255,${(0.06 + 0.035 * activity).toFixed(3)})`;
  const outColor = `rgba(46,107,255,${(0.6 + 0.28 * activity).toFixed(3)})`;
  const inColour = `rgba(123,75,255,${(0.54 + 0.28 * activity).toFixed(3)})`;
  const outId = `${uid}-out-${index}`;
  const inId = `${uid}-in-${index}`;

  return (
    <g opacity={draw}>
      <path
        d={band}
        fill="none"
        stroke={bandColor}
        strokeWidth={CHANNEL_WIDTH}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d={edge(CHANNEL_WIDTH / 2 - 1)}
        fill="none"
        stroke={edgeColor}
        strokeWidth={1}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d={edge(-(CHANNEL_WIDTH / 2 - 1))}
        fill="none"
        stroke={edgeColor}
        strokeWidth={1}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <defs>
        <path id={outId} d={lane(LANE_OFFSET)} />
        <path id={inId} d={lane(-LANE_OFFSET)} />
      </defs>
      <text
        fontFamily={DIGIT_FONT}
        fontSize={14}
        fontWeight={600}
        fill={outColor}
        dominantBaseline="central"
      >
        <textPath
          href={`#${outId}`}
          startOffset={outOffset}
          textLength={BINARY_TEXT_LENGTH}
          lengthAdjust="spacing"
        >
          {BINARY_TEXT}
        </textPath>
      </text>
      <text
        fontFamily={DIGIT_FONT}
        fontSize={14}
        fontWeight={600}
        fill={inColour}
        dominantBaseline="central"
      >
        <textPath
          href={`#${inId}`}
          startOffset={inOffset}
          textLength={BINARY_TEXT_LENGTH}
          lengthAdjust="spacing"
        >
          {BINARY_TEXT}
        </textPath>
      </text>
    </g>
  );
};

const Packet: FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  length: number;
  progress: number;
  color: string;
}> = ({ from, to, length, progress, color }) => {
  const head = {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
  const envelope = Math.pow(
    Math.min(1, progress / 0.16, (1 - progress) / 0.16),
    0.8,
  );
  const travelled = progress * length;
  const tailStart = Math.max(0, travelled - 90);
  const tailLength = travelled - tailStart;
  const shortStart = Math.max(tailStart, travelled - 36);
  const shortLength = travelled - shortStart;
  const path = `M${from.x} ${from.y}L${to.x} ${to.y}`;

  return (
    <g opacity={envelope}>
      {tailLength > 0.5 ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeDasharray={`${tailLength} ${length + 100}`}
          strokeDashoffset={-tailStart}
          opacity={0.26}
        />
      ) : null}
      {shortLength > 0.5 ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeDasharray={`${shortLength} ${length + 100}`}
          strokeDashoffset={-shortStart}
          opacity={0.55}
        />
      ) : null}
      <circle cx={head.x} cy={head.y} r={20} fill={color} opacity={0.18} />
      <circle cx={head.x} cy={head.y} r={7.2} fill={color} />
      <circle cx={head.x} cy={head.y} r={2.8} fill="#FFFFFF" opacity={0.92} />
    </g>
  );
};

const HubPort: FC<{
  x: number;
  y: number;
  flash: number;
  base: number;
  color: string;
}> = ({ x, y, flash, base, color }) => (
  <g>
    <circle cx={x} cy={y} r={4} fill={color} opacity={0.5 * base} />
    {flash > 0 ? (
      <>
        <circle
          cx={x}
          cy={y}
          r={8 + 22 * (1 - flash)}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          opacity={0.55 * flash}
        />
        <circle cx={x} cy={y} r={4.2 + 2.6 * flash} fill={color} opacity={0.9 * flash} />
      </>
    ) : null}
  </g>
);

export const S01: FC = () => {
  const frame = useCurrentFrame();
  const linkIds = useId().replace(/[:]/g, '');

  const bgIn = segment(frame, 0, 30);
  const ringDraw = segment(frame, 4, 36);
  const wordIn = segment(frame, 20, 40);
  const taglineIn = segment(frame, 350, 22);

  const nodeArrival = NODES.map((_, i) =>
    EVENTS.filter((e) => e.link === i && e.dir === 'out').reduce(
      (v, e) => Math.max(v, decay(frame, e.end)),
      0,
    ),
  );
  const hubArrivalFor = (i: number) =>
    EVENTS.filter((e) => e.link === i && e.dir === 'in').reduce(
      (v, e) => Math.max(v, decay(frame, e.end)),
      0,
    );
  const hubArrival = NODES.reduce((v, _, i) => Math.max(v, hubArrivalFor(i)), 0);

  return (
    <AbsoluteFill style={{ background: '#F7F9FD', fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          opacity: bgIn,
          background:
            'radial-gradient(52% 46% at 50% 44%, #FFFFFF 0%, #F5F8FE 58%, #EDF2FA 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55 * bgIn,
          backgroundImage:
            'radial-gradient(circle, rgba(129, 150, 190, 0.38) 1px, transparent 1.1px)',
          backgroundSize: '46px 46px',
          maskImage:
            'radial-gradient(ellipse 66% 62% at 50% 48%, transparent 0%, rgba(0,0,0,0.35) 46%, #000 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 66% 62% at 50% 48%, transparent 0%, rgba(0,0,0,0.35) 46%, #000 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(46% 38% at 50% 46%, rgba(46, 104, 255, 0.07) 0%, rgba(46, 104, 255, 0) 70%)',
          opacity: bgIn,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - 430,
          top: CENTER.y - 190,
          width: 860,
          height: 380,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(46, 104, 255, 0.12) 0%, rgba(46, 104, 255, 0) 72%)',
          opacity: 0.22 + 0.55 * hubArrival,
        }}
      />

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <g transform={`translate(${CENTER.x} ${CENTER.y})`}>
          <circle
            r={HUB_RADIUS}
            fill="none"
            stroke="#DCE6F6"
            strokeWidth={1.4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ringDraw}
          />
          <circle
            r={430}
            fill="none"
            stroke="rgba(201, 214, 238, 0.55)"
            strokeWidth={1}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - segment(frame, 10, 40)}
          />
        </g>

        {GEOMETRY.map((geo, i) => (
          <DataChannel
            key={NODES[i].id}
            uid={linkIds}
            index={i}
            geo={geo}
            draw={segment(frame, LINK_START[i], LINK_DRAW)}
            activity={linkActivity(frame, i)}
            frame={frame}
          />
        ))}

        {GEOMETRY.map((geo, i) => (
          <HubPort
            key={NODES[i].id}
            x={geo.hub.x}
            y={geo.hub.y}
            flash={hubArrivalFor(i)}
            base={segment(frame, LINK_START[i], LINK_DRAW)}
            color={IN_COLOR}
          />
        ))}

        {EVENTS.map((event) => {
          const progress = SEND_EASE(
            clamp01((frame - event.start) / (event.end - event.start)),
          );
          if (progress <= 0 || progress >= 1) return null;
          const geo = GEOMETRY[event.link];
          const from = event.dir === 'out' ? geo.hub : geo.port;
          const to = event.dir === 'out' ? geo.port : geo.hub;
          return (
            <Packet
              key={`${event.link}-${event.dir}-${event.start}`}
              from={from}
              to={to}
              length={geo.length}
              progress={progress}
              color={event.dir === 'out' ? OUT_COLOR : IN_COLOR}
            />
          );
        })}

        {GEOMETRY.map((geo, i) => {
          const arrival = nodeArrival[i];
          const draw = segment(frame, LINK_START[i], LINK_DRAW);
          const color = PLATFORM_META[NODES[i].id].color;
          return (
            <g key={NODES[i].id} opacity={draw}>
              <circle
                cx={geo.port.x}
                cy={geo.port.y}
                r={4 + 1.6 * arrival}
                fill={color}
                opacity={0.55 + 0.35 * arrival}
              />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - WORDMARK_WIDTH / 2,
          top: CENTER.y - WORDMARK_HEIGHT / 2,
          width: WORDMARK_WIDTH,
          height: WORDMARK_HEIGHT,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: `translateY(${(1 - wordIn) * 30}px) scale(${1.02 - 0.02 * wordIn})`,
            transformOrigin: '50% 60%',
            opacity: Math.min(1, wordIn * 2.2),
          }}
        >
          <DmexWordmark width={WORDMARK_WIDTH} />
        </div>
      </div>

      {NODES.map((node, i) => {
        const enter = segment(frame, NODE_START[i], 26);
        if (enter <= 0) return null;
        const meta = PLATFORM_META[node.id];
        const arrival = nodeArrival[i];
        const activity = linkActivity(frame, i);
        const labelIn = segment(frame, NODE_START[i] + 12, 18);
        const glow = Math.max(arrival, activity * 0.45);

        return (
          <div key={node.id}>
            {arrival > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: node.x - (NODE_RADIUS + 24),
                  top: node.y - (NODE_RADIUS + 24),
                  width: (NODE_RADIUS + 24) * 2,
                  height: (NODE_RADIUS + 24) * 2,
                  borderRadius: '50%',
                  border: `2px solid ${withAlpha(meta.color, 0.5 * arrival)}`,
                  opacity: arrival,
                  transform: `scale(${0.9 + 0.22 * (1 - arrival)})`,
                }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                left: node.x - 100,
                top: node.y - 100,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${withAlpha(meta.color, 0.2)} 0%, ${withAlpha(meta.color, 0)} 66%)`,
                opacity: enter * (0.25 + 0.75 * glow),
                transform: `scale(${0.86 + 0.14 * enter + 0.06 * glow})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: node.x - NODE_RADIUS,
                top: node.y - NODE_RADIUS,
                width: NODE_RADIUS * 2,
                height: NODE_RADIUS * 2,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: `1px solid ${withAlpha(meta.color, 0.1 + 0.25 * glow)}`,
                boxShadow: [
                  'inset 0 1px 0 rgba(255,255,255,0.9)',
                  `0 24px 48px -20px ${withAlpha(meta.color, 0.28 + 0.2 * glow)}`,
                  '0 2px 6px rgba(23, 45, 92, 0.05)',
                ].join(', '),
                opacity: enter,
                transform: `translateY(${(1 - enter) * 18}px) scale(${0.94 + 0.06 * enter + 0.02 * glow})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ transform: `scale(${1 + 0.06 * glow})` }}>
                <PlatformMark id={node.id} size={meta.glyphSize} />
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: node.x - 130,
                top: node.y + NODE_RADIUS + 26,
                width: 260,
                textAlign: 'center',
                fontFamily: LABEL_FONT,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '2.2px',
                color: glow > 0.2 ? '#4A5670' : TEXT_MUTED,
                opacity: labelIn,
                transform: `translateY(${(1 - labelIn) * 8}px)`,
              }}
            >
              {meta.label}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 640,
          width: W,
          textAlign: 'center',
          fontSize: 38,
          fontWeight: 500,
          letterSpacing: '4px',
          color: '#566279',
          opacity: taglineIn,
          transform: `translateY(${(1 - taglineIn) * 14}px)`,
        }}
      >
        {TAGLINE}
      </div>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - 80,
          top: 708,
          width: 160,
          height: 2,
          borderRadius: 1,
          background:
            'linear-gradient(90deg, rgba(46,104,255,0) 0%, rgba(46,104,255,0.55) 50%, rgba(123,75,255,0) 100%)',
          opacity: taglineIn * 0.9,
          transform: `scaleX(${taglineIn})`,
        }}
      />
    </AbsoluteFill>
  );
};
