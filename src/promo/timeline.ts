export const FPS = 30;
export const sec = (seconds: number) => Math.round(seconds * FPS);

// Scene durations live here so the film timeline and the individual
// compositions cannot drift apart. Scene files import their own length back.
export const S01_DURATION = sec(14); // 420
export const S02_DURATION = sec(5.5); // 165
// S03's body is the approved 486f shot; the lead is the hold the portal-wipe
// lands on before the pointer starts moving (scene frame 0 == body frame -24).
export const S03_LEAD = sec(0.8); // 24
export const S03_DURATION = 486 + S03_LEAD; // 510
export const S04_DURATION = 464;
export const S05_DURATION = 540;
export const S06_SPOTLIGHT_DURATION = 172;
export const S06_REPLY_DURATION = 486;
export const S06_DURATION = S06_SPOTLIGHT_DURATION + S06_REPLY_DURATION; // 658
export const S07_DURATION = sec(3); // 90

export type TransitionKind =
  | 'cut'
  | 'dissolve'
  | 'flash-cut'
  | 'whip-pan'
  | 'portal-wipe'
  | 'fade'
  | 'wipe';

export type SceneSpec = {
  id: string;
  title: string;
  durationInFrames: number;
  transitionAfter?: { kind: TransitionKind; durationInFrames: number };
  cards: string[];
  styles?: string[];
  acceptanceFrames: number[];
};

export const SCENES: SceneSpec[] = [
  {
    id: 'S01',
    title: '冷开场 / 品牌',
    durationInFrames: S01_DURATION,
    transitionAfter: { kind: 'dissolve', durationInFrames: 16 },
    cards: ['orbit-ring-title-open', 'integration-hub-map'],
    acceptanceFrames: [sec(2), sec(7), sec(13)],
  },
  {
    id: 'S02',
    title: '选择社媒 / 主题色节拍',
    durationInFrames: S02_DURATION,
    transitionAfter: { kind: 'portal-wipe', durationInFrames: 48 },
    cards: ['beat-step-list-theme-cycle'],
    acceptanceFrames: [sec(0.6), sec(1), sec(1.6), sec(2.2), sec(2.8), sec(3.4), sec(5)],
  },
  {
    id: 'S03',
    title: '指纹浏览器配置',
    durationInFrames: S03_DURATION,
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['crane-rise-reveal'],
    // Body frame + S03_LEAD: 150f crane hold, 394f batch-launch click,
    // 458f ripple done, 485f settled.
    acceptanceFrames: [150 + S03_LEAD, 394 + S03_LEAD, 458 + S03_LEAD, S03_DURATION - 1],
  },
  {
    id: 'S04',
    title: '批量启动 / 连接页',
    durationInFrames: S04_DURATION,
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: [],
    acceptanceFrames: [sec(5), sec(10), 417, S04_DURATION - 1],
  },
  {
    id: 'S05',
    title: '消息请求爆量',
    durationInFrames: S05_DURATION,
    transitionAfter: { kind: 'fade', durationInFrames: 16 },
    cards: [],
    acceptanceFrames: [sec(2), sec(7), sec(11), sec(14), sec(17)],
  },
  {
    id: 'S06',
    title: '私信 → 工作流 → Lark 报告',
    durationInFrames: S06_DURATION,
    transitionAfter: { kind: 'dissolve', durationInFrames: 16 },
    cards: ['spotlight-hero-card'],
    acceptanceFrames: [S06_SPOTLIGHT_DURATION, 172 + 206, 172 + 372, S06_DURATION - 1],
  },
  {
    id: 'S07',
    title: '品牌尾卡',
    durationInFrames: S07_DURATION,
    cards: [],
    acceptanceFrames: [12, sec(2), S07_DURATION - 1],
  },
];

const overlapBefore = (index: number) =>
  SCENES.slice(0, index).reduce(
    (total, scene) => total + (scene.transitionAfter?.durationInFrames ?? 0),
    0,
  );

export const sceneStart = (index: number) =>
  SCENES.slice(0, index).reduce(
    (total, scene) => total + scene.durationInFrames,
    0,
  ) - overlapBefore(index);

// No extra safety tail: S07 holds the brand lockup for 2.5s, so the last frame
// of the composition is already a settled brand card.
export const TOTAL_FRAMES =
  SCENES.reduce((total, scene) => total + scene.durationInFrames, 0) -
  overlapBefore(SCENES.length);
