import type { FC } from 'react';
import { EASE, alpha } from '../spotlightHeroCard/polish';
import { EDGES, NODES, WORLD } from './workflowData';
import { FAN_B, LEAD_END, LEAD_START, NOTIFY_AT, NOTIFY_NODE, PANEL, cameraAt, nodeTop, pointOn, stateAt, worldToPanel } from './plan';

const GREEN = '#20A97A';
const ORANGE = '#F08A28';
const GOLD = '#E4C58A';
const GOLD_INK = '#BE8F3D';
const CYAN = '#2E9CCB';
const LABEL = '#48515E';
const DOT = '#D2D9E2';

const ramp = (f: number, from: number, len: number) => EASE.out(Math.min(1, Math.max(0, (f - from) / len)));

// Node glyph colors were picked against dark tiles; darken them for the light-blue card.
const ink = (hex: string, k = 0.74) => {
  const v = parseInt(hex.slice(1), 16);
  return `#${[16, 8, 0].map((s) => Math.round(((v >> s) & 255) * k).toString(16).padStart(2, '0')).join('')}`;
};

type Callout = { from: number; to: number; text: string; node?: string; panel?: { x: number; y: number }; dy?: number };

const CALLOUTS: Callout[] = [
  { from: LEAD_START + 2, to: LEAD_START + 32, panel: { x: 22, y: 78 }, text: '收到 UID 消息' },
  { from: LEAD_START + 38, to: LEAD_START + 68, panel: { x: 22, y: 78 }, text: '识别到 UID' },
  { from: LEAD_START + 74, to: FAN_B, panel: { x: 22, y: 78 }, text: '6 路分支并行' },
  { from: FAN_B + 5, to: LEAD_END - 3, node: '分析卡片发送', dy: -70, text: '推送 Lark 机器人' },
];

// A few dense spots collide once the label type grows (same-row neighbours sit
// as close as 128 world units, and deepseek's label runs into the card below);
// these labels step aside instead of shrinking the type.
const LABEL_SHIFT: Record<string, number> = {
  '意图解析 (Code)': -9,
  '会话阶段处理': 9,
  '记录会话运行日志': -12,
  '计算用户连续重复发消息数量': 12,
  'Check if a user is registered': -14,
  'Format Query Results': 14,
  'deepseek-v4-flash7': 90,
};

type Props = { frame: number; open: number; content: number };

export const WorkflowPanel: FC<Props> = ({ frame, open, content }) => {
  const cam = cameraAt(frame);
  const st = stateAt(frame);
  const z = cam.zoom;
  const running = (frame >= LEAD_START && frame < LEAD_END) || st.quickRunning;
  const chip = running ? '运行中' : frame >= NOTIFY_AT ? '已推送 Lark 通知' : '待机';

  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL.x + (1 - open) * (1920 - PANEL.x),
        top: PANEL.y,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: PANEL.r,
        overflow: 'hidden',
        background: 'radial-gradient(78% 62% at 56% 42%, #FFFFFF 0%, #F7F9FC 58%, #EDF2F7 100%)',
        border: '1px solid rgba(15,23,42,0.12)',
        boxShadow: '-30px 46px 110px rgba(0,0,0,0.55), 0 0 0 1px rgba(228,197,138,0.10)',
        transform: 'translateZ(2px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: content,
          transform: `translate(${(PANEL.w / 2 - cam.cx * z).toFixed(2)}px, ${(
            PANEL.h / 2 -
            cam.cy * z
          ).toFixed(2)}px) scale(${z.toFixed(4)})`,
          transformOrigin: '0 0',
        }}
      >
        <svg width={WORLD.w} height={WORLD.h} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <pattern id="wf-dots" width={16} height={16} patternUnits="userSpaceOnUse">
              <circle cx={0.9} cy={0.9} r={1.9} fill={DOT} />
            </pattern>
          </defs>
          <rect x={0} y={0} width={WORLD.w} height={WORLD.h} fill="url(#wf-dots)" />
          {st.flow.size > 0
            ? [...st.flow.values()].map(({ s }) => {
                const key = `${s.e.s}|${s.e.t}|${s.e.kind}|${s.e.out}`;
                return (
                  <path
                    key={`halo-${key}`}
                    d={pathOf(s.e.p)}
                    fill="none"
                    stroke={alpha(GREEN, 0.16)}
                    strokeWidth={9 / z}
                  />
                );
              })
            : null}
          {EDGES.map((e) => {
            const key = `${e.s}|${e.t}|${e.kind}|${e.out}`;
            const flowing = st.flow.has(key) || st.quickFlow.has(key);
            const glow = st.afterglow.get(key) ?? 0;
            const visited = st.visited.has(key);
            const ai = e.kind !== 'main';
            const color = flowing ? GREEN : glow > 0 ? alpha(GREEN, 0.35 + 0.45 * glow) : visited ? '#35A57F' : ai ? '#CBD2DB' : '#AFBAC7';
            return (
              <path
                key={key}
                d={pathOf(e.p)}
                fill="none"
                stroke={color}
                strokeWidth={(flowing ? 2.8 : glow > 0 ? 2.1 : ai ? 1.0 : 1.3) / z}
                strokeDasharray={
                  flowing ? `${7 / z} ${5 / z}` : ai ? `${3 / z} ${3.5 / z}` : undefined
                }
                strokeDashoffset={flowing ? -((frame * 1.6) % (12 / z)) : undefined}
                strokeLinecap="round"
              />
            );
          })}
          {[...st.flow.values()].map(({ s, progress }) => {
            const pt = pointOn(s.e.p, progress);
            const tone = s.tone === 'lead' ? ORANGE : GOLD_INK;
            const r = (s.e.kind === 'main' ? 7.4 : 5.6) / z;
            const prev = pointOn(s.e.p, Math.max(0, progress - 0.07));
            return (
              <g key={`pkt-${s.e.s}|${s.e.t}|${s.e.kind}|${s.e.out}|${s.a}`}>
                <line
                  x1={prev.x}
                  y1={prev.y}
                  x2={pt.x}
                  y2={pt.y}
                  stroke={alpha(tone, 0.4)}
                  strokeWidth={r * 1.1}
                  strokeLinecap="round"
                />
                <circle cx={pt.x} cy={pt.y} r={r * 3.1} fill={alpha(tone, 0.2)} />
                <circle cx={pt.x} cy={pt.y} r={r} fill={tone} stroke="rgba(255,255,255,0.92)" strokeWidth={1.5 / z} />
              </g>
            );
          })}
          {[...st.quickFlow.values()].map(({ s, progress }) => {
            const pt = pointOn(s.e.p, progress);
            const prev = pointOn(s.e.p, Math.max(0, progress - 0.09));
            const r = 6 / z;
            return (
              <g key={`quick-${s.e.s}|${s.e.t}|${s.a}`}>
                <line x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y} stroke={alpha(CYAN, 0.45)} strokeWidth={r * 1.1} strokeLinecap="round" />
                <circle cx={pt.x} cy={pt.y} r={r * 3} fill={alpha(CYAN, 0.22)} />
                <circle cx={pt.x} cy={pt.y} r={r} fill={CYAN} stroke="rgba(255,255,255,0.95)" strokeWidth={1.5 / z} />
              </g>
            );
          })}
        </svg>

        {NODES.map((n) => (
          <div
            key={`label-${n.name}`}
            style={{
              position: 'absolute',
              left: n.x + n.w / 2 + (LABEL_SHIFT[n.name] ?? 0),
              top: n.y + n.h + 7,
              transform: 'translateX(-50%)',
              width: 230,
              textAlign: 'center',
              fontSize: 20.5,
              lineHeight: '24px',
              color: LABEL,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: 0.92,
            }}
          >
            {n.name}
          </div>
        ))}

        {NODES.map((n) => {
          const active = st.activeNodes.has(n.name);
          const visited = st.visitedNodes.has(n.name);
          const pulse = n.name === 'Webhook' ? st.webhookPulse : 0;
          const radius = n.kind === 'webhook' ? 30 : n.kind === 'support' ? '50%' : 8;
          return (
            <div
              key={n.name}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: n.w,
                height: n.h,
                borderRadius: radius,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: active ? '#D5E9FF' : '#E7F1FD',
                border: `${(active ? 2.2 : 1.6) / z}px solid ${
                  active ? GREEN : visited ? '#35A57F' : '#A9C4E4'
                }`,
                boxShadow: active
                  ? `0 0 0 ${(7 + pulse * 6) / z}px ${alpha(GREEN, 0.12)}, 0 0 ${(26 + pulse * 18) / z}px ${alpha(GREEN, 0.34)}`
                  : `0 ${7 / z}px ${16 / z}px rgba(23,48,84,0.14)`,
                opacity: n.disabled ? 0.45 : 1,
              }}
            >
              <span
                style={{
                  fontSize: n.kind === 'agent' ? 24 : 27,
                  lineHeight: 1,
                  color: active ? '#0F4A33' : ink(n.color),
                  fontWeight: 600,
                }}
              >
                {n.glyph}
              </span>
              {n.kind === 'agent' ? (
                <span
                  style={{
                    fontSize: 20,
                    lineHeight: 1.25,
                    color: active ? '#0F4A33' : '#3D4C63',
                    maxWidth: 150,
                  }}
                >
                  {n.name}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 80% at 50% 45%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.07) 100%)',
        }}
      />

      {CALLOUTS.map((c) => {
        const vis = Math.min(ramp(frame, c.from, 8), 1 - ramp(frame, c.to - 6, 8));
        if (vis <= 0.01) return null;
        const p = c.panel ?? worldToPanel(nodeTop(c.node!).x, nodeTop(c.node!).y + (c.dy ?? 0), cam);
        const transform = c.panel ? 'none' : 'translate(-50%, -100%)';
        return (
          <div
            key={c.text}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              transform,
              opacity: vis,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 15px',
              borderRadius: 10,
              background: 'rgba(10,9,8,0.78)',
              border: `1px solid ${alpha(GOLD, 0.3)}`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, background: GOLD }} />
            <span style={{ fontSize: 32, lineHeight: '34px', fontWeight: 600, color: '#F7F0E2' }}>
              {c.text}
            </span>
          </div>
        );
      })}

      <svg
        width={PANEL.w}
        height={PANEL.h}
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      >
        {[0, 5].map((delay, i) => {
          const age = frame - NOTIFY_AT - delay;
          if (age < 0 || age > 18) return null;
          const p = worldToPanel(NOTIFY_NODE.x, NOTIFY_NODE.y, cam);
          const r = 16 + (age / 18) * 96;
          return (
            <circle
              key={`ring-${i}`}
              cx={p.x}
              cy={p.y}
              r={r}
              fill="none"
              stroke={alpha(GOLD_INK, 0.85 * (1 - age / 18))}
              strokeWidth={2.4}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          padding: 7,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(15,23,42,0.12)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.16)',
        }}
      >
        <svg width={190} height={72}>
          <clipPath id="wf-mini">
            <rect width={190} height={72} rx={4} />
          </clipPath>
          <g clipPath="url(#wf-mini)">
            <rect width={190} height={72} fill="rgba(15,23,42,0.04)" />
            {NODES.map((n) => (
              <circle
                key={`mini-${n.name}`}
                cx={(n.x + n.w / 2) * (190 / WORLD.w)}
                cy={(n.y + n.h / 2) * (190 / WORLD.w)}
                r={1.1}
                fill="#7A8494"
              />
            ))}
            <rect
              x={(cam.cx - PANEL.w / 2 / cam.zoom) * (190 / WORLD.w)}
              y={(cam.cy - PANEL.h / 2 / cam.zoom) * (190 / WORLD.w)}
              width={(PANEL.w / cam.zoom) * (190 / WORLD.w)}
              height={(PANEL.h / cam.zoom) * (190 / WORLD.w)}
              fill="none"
              stroke={alpha(GOLD_INK, 0.8)}
              strokeWidth={1}
            />
          </g>
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          padding: '7px 13px',
          borderRadius: 9,
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(15,23,42,0.1)',
          fontSize: 18,
          fontWeight: 500,
          color: '#6E7887',
          letterSpacing: '0.02em',
        }}
      >
        161 节点 · 210 连线
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          background: 'linear-gradient(rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 62%, rgba(255,255,255,0) 100%)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: running ? GREEN : frame >= NOTIFY_AT ? GOLD : '#6B7280',
            boxShadow: running ? `0 0 12px ${GREEN}` : undefined,
          }}
        />
        <span style={{ fontSize: 21, fontWeight: 600, color: '#27303B', letterSpacing: '0.01em' }}>
          自动应答 · 工作流
        </span>
        <span
          style={{
            marginLeft: 'auto',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: 18,
            color: frame >= NOTIFY_AT ? '#8A6524' : '#6E7887',
            background: frame >= NOTIFY_AT ? 'rgba(228,197,138,0.3)' : 'rgba(15,23,42,0.05)',
            border: `1px solid ${frame >= NOTIFY_AT ? 'rgba(190,143,61,0.55)' : 'rgba(15,23,42,0.12)'}`,
          }}
        >
          {chip}
        </span>
      </div>
    </div>
  );
};

const pathOf = (p: readonly number[]) =>
  `M${p[0]},${p[1]} C${p[2]},${p[3]} ${p[4]},${p[5]} ${p[6]},${p[7]}`;
