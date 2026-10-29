export const FPS = 30;
export const sec = (seconds: number) => Math.round(seconds * FPS);

export type TransitionKind =
  | 'cut'
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
    durationInFrames: sec(14),
    transitionAfter: { kind: 'flash-cut', durationInFrames: 10 },
    cards: ['orbit-ring-title-open', 'integration-hub-map'],
    acceptanceFrames: [sec(2), sec(7), sec(13)],
  },
  {
    id: 'S02',
    title: '选择社媒 / 主题色节拍',
    durationInFrames: sec(5.5),
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['beat-step-list-theme-cycle'],
    acceptanceFrames: [sec(0.6), sec(1), sec(1.6), sec(2.2), sec(2.8), sec(3.4), sec(5)],
  },
  {
    id: 'S03',
    title: '核心功能 A',
    durationInFrames: sec(30),
    transitionAfter: { kind: 'whip-pan', durationInFrames: 48 },
    cards: ['spotlight-hero-card'],
    acceptanceFrames: [sec(5), sec(15), sec(29)],
  },
  {
    id: 'S04',
    title: '核心功能 B',
    durationInFrames: sec(30),
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['space-camera-moves'],
    styles: ['exploded-view'],
    acceptanceFrames: [sec(5), sec(15), sec(29)],
  },
  {
    id: 'S05',
    title: '核心功能 C',
    durationInFrames: sec(18),
    transitionAfter: { kind: 'portal-wipe', durationInFrames: 48 },
    cards: ['row-embed'],
    acceptanceFrames: [sec(2), sec(7), sec(11), sec(14), sec(17)],
  },
  {
    id: 'S06',
    title: '端到端工作流',
    durationInFrames: sec(30),
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['timeline-travel'],
    acceptanceFrames: [sec(5), sec(15), sec(29)],
  },
  {
    id: 'S07',
    title: '证据 / 指标',
    durationInFrames: sec(30),
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['chart-live-moves'],
    styles: ['axis-rescale-shock'],
    acceptanceFrames: [sec(4), sec(15), sec(29)],
  },
  {
    id: 'S08',
    title: '收尾 / CTA',
    durationInFrames: sec(25.5),
    cards: ['outro-group-photo-launch'],
    acceptanceFrames: [sec(3), sec(12), sec(24)],
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

export const TOTAL_FRAMES =
  SCENES.reduce((total, scene) => total + scene.durationInFrames, 0) -
  overlapBefore(SCENES.length) +
  sec(1);
