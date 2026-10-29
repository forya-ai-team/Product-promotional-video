import { DEMO_EDGES, EDGES, NODES, type WorkflowEdge } from './workflowData';

export const PANEL = { x: 1046, y: 122, w: 838, h: 884, r: 18 } as const;
export const DURATION = 480;

// The reference demo spends 20s on one pass; the promo keeps the front chain
// and the six-way split, then leaves the demo route for the report branch
// (Merge1 -> 格式化报告 -> 分析卡片发送) that feeds the Lark bot.
export const LEAD_START = 192;
export const FAN_A = LEAD_START + 55;
export const FAN_B = FAN_A + 60;
export const LEAD_END = FAN_B + 38;

const SPLIT_T = 10750;
const MERGE_T = 13750;

export const FAN_CENTER = { x: 7400, y: 1870 } as const;
export const REPORT_CENTER = { x: 8418, y: 1712 } as const;
const WEBHOOK_CENTER = { x: 178, y: 1008 } as const;

export const NOTIFY_AT = LEAD_END;
export const CARD_AT = NOTIFY_AT + 3;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mapLead = (ms: number) => {
  if (ms <= SPLIT_T) return LEAD_START + (ms / SPLIT_T) * (FAN_A - LEAD_START);
  return FAN_A + ((ms - SPLIT_T) / (MERGE_T - SPLIT_T)) * (FAN_B - FAN_A);
};

const edgeKey = (s: string, t: string, kind: string, out: number) => `${s}|${t}|${kind}|${out}`;
const edgeMap = new Map(EDGES.map((e) => [edgeKey(e.s, e.t, e.kind, e.out), e]));

export type ScheduledEdge = { e: WorkflowEdge; a: number; b: number; tone: 'lead' | 'report' };

const scheduled = (e: WorkflowEdge, a: number, b: number, tone: 'lead' | 'report'): ScheduledEdge => ({ e, a, b, tone });

export const LEAD_SCHEDULE: ScheduledEdge[] = DEMO_EDGES.filter((d) => d.start < MERGE_T).map((d) => {
  const e = edgeMap.get(edgeKey(d.s, d.t, d.kind, d.out));
  if (!e) throw new Error(`missing edge ${d.s}->${d.t}`);
  return scheduled(e, mapLead(d.start), mapLead(d.end), 'lead');
});

// The three branch outputs that converge into the report merge, then the
// report chain itself. Same graph, different exit than the demo's reply route.
const CONVERGE: [string, string][] = [
  ['response_ai_agent_huizhuanfenxi', 'Merge1'],
  ['用户信息调取', 'Merge1'],
  ['更新最终的状态-后续中止会话', 'Merge1'],
];

const reportEdge = (s: string, t: string) => {
  const e = edgeMap.get(edgeKey(s, t, 'main', 0)) ?? EDGES.find((v) => v.s === s && v.t === t);
  if (!e) throw new Error(`missing edge ${s}->${t}`);
  return e;
};

export const REPORT_SCHEDULE: ScheduledEdge[] = [
  ...CONVERGE.map(([s, t], i) => scheduled(reportEdge(s, t), FAN_B + i * 2.5, FAN_B + 8 + i * 2.5, 'report')),
  scheduled(reportEdge('Merge1', '格式化报告'), FAN_B + 14, FAN_B + 26, 'report'),
  scheduled(reportEdge('格式化报告', '分析卡片发送'), FAN_B + 26, LEAD_END, 'report'),
];

export const ALL_SCHEDULE = [...LEAD_SCHEDULE, ...REPORT_SCHEDULE];

export const pointOn = (p: WorkflowEdge['p'], t: number) => {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return { x: a * p[0] + b * p[2] + c * p[4] + d * p[6], y: a * p[1] + b * p[3] + c * p[5] + d * p[7] };
};

const cursorAt = (frame: number) => {
  const active = LEAD_SCHEDULE.find((s) => frame >= s.a && frame < s.b);
  if (active) return pointOn(active.e.p, (frame - active.a) / (active.b - active.a));
  const done = LEAD_SCHEDULE.filter((s) => s.b <= frame).sort((a, b) => b.b - a.b)[0];
  if (done) {
    const n = NODES.find((v) => v.name === done.e.t)!;
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
  }
  return WEBHOOK_CENTER;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => t * t * (3 - 2 * t);

const zoomAt = (frame: number) => {
  const frames = [0, 46, LEAD_START - 92, LEAD_START - 46, LEAD_START, FAN_A, FAN_A + 14, FAN_B - 6, FAN_B, CARD_AT - 16, CARD_AT, DURATION];
  const values = [0.68, 0.66, 0.58, 0.54, 0.5, 0.5, 0.46, 0.47, 0.5, 0.64, 0.7, 0.7];
  for (let i = 0; i < frames.length - 1; i++) {
    if (frame <= frames[i + 1]) {
      const t = easeInOut(clamp01((frame - frames[i]) / (frames[i + 1] - frames[i])));
      return lerp(values[i], values[i + 1], t);
    }
  }
  return values[values.length - 1];
};

// Symmetric moving average keeps the follow-cam from jerking at every 1.6f
// station without trailing behind: the chain covers ~120 world units per frame
// at the end, so a backward-only window put the head off the right edge.
const followCenter = (frame: number) => {
  let x = 0;
  let y = 0;
  const R = 4;
  for (let k = -R; k <= R; k++) {
    const p = cursorAt(Math.max(0, frame + k));
    x += p.x;
    y += p.y;
  }
  return { x: x / (2 * R + 1), y: y / (2 * R + 1) };
};

export const cameraAt = (frame: number) => {
  let c = followCenter(frame);
  const fanW = clamp01((frame - (FAN_A - 6)) / 10) * (1 - clamp01((frame - (FAN_B - 10)) / 12));
  c = { x: lerp(c.x, FAN_CENTER.x, fanW * 0.92), y: lerp(c.y, FAN_CENTER.y, fanW * 0.92) };
  const reportW = clamp01((frame - (FAN_B - 6)) / 26);
  c = { x: lerp(c.x, REPORT_CENTER.x, reportW), y: lerp(c.y, REPORT_CENTER.y, reportW) };
  return { cx: c.x, cy: c.y, zoom: zoomAt(frame) };
};

export type FrameState = {
  flow: Map<string, { s: ScheduledEdge; progress: number }>;
  afterglow: Map<string, number>;
  visited: Set<string>;
  activeNodes: Set<string>;
  visitedNodes: Set<string>;
  webhookPulse: number;
};

export const stateAt = (frame: number): FrameState => {
  const flow = new Map<string, { s: ScheduledEdge; progress: number }>();
  const afterglow = new Map<string, number>();
  const visited = new Set<string>();
  const activeNodes = new Set<string>();
  const visitedNodes = new Set<string>();
  for (const s of ALL_SCHEDULE) {
    const k = edgeKey(s.e.s, s.e.t, s.e.kind, s.e.out);
    if (frame >= s.b) {
      visited.add(k);
      visitedNodes.add(s.e.s);
      visitedNodes.add(s.e.t);
    }
    if (frame >= s.a && frame < s.b) {
      flow.set(k, { s, progress: (frame - s.a) / (s.b - s.a) });
      activeNodes.add(s.e.s);
      activeNodes.add(s.e.t);
    } else if (frame >= s.b && frame < s.b + 10) {
      afterglow.set(k, 1 - (frame - s.b) / 10);
    }
  }
  const sinceStart = frame - LEAD_START;
  const webhookPulse = sinceStart >= 0 && sinceStart < 18 ? Math.sin((sinceStart / 18) * Math.PI) : 0;
  return { flow, afterglow, visited, activeNodes, visitedNodes, webhookPulse };
};

export const worldToPanel = (x: number, y: number, cam: { cx: number; cy: number; zoom: number }) => ({
  x: PANEL.w / 2 + (x - cam.cx) * cam.zoom,
  y: PANEL.h / 2 + (y - cam.cy) * cam.zoom,
});

export const NOTIFY_NODE = { x: 8418, y: 1712 } as const;

export const nodeTop = (name: string) => {
  const n = NODES.find((v) => v.name === name);
  if (!n) throw new Error(`missing node ${name}`);
  return { x: n.x + n.w / 2, y: n.y - 10 };
};
