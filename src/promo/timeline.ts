export const FPS = 30;
export const sec = (seconds: number) => Math.round(seconds * FPS);

// Scene durations live here so the film timeline and the individual
// compositions cannot drift apart. Scene files import their own length back.
// S01 is choreographed at 14s (BrandField's constants are shared with the
// settled field S07 freezes), so the 10s cut plays it at 1.4x instead of
// retiming every beat.
const S01_AUTHORED_DURATION = sec(14); // 420
export const S01_DURATION = sec(10); // 300
export const S01_SPEED = S01_AUTHORED_DURATION / S01_DURATION; // 1.4
export const S02_DURATION = sec(5.5); // 165
// S03's body is 409f: D55's 456f, minus the 17f saved by the 1.25x pointer
// (D56), minus a hard 30f tail cut (D57). The lead is the hold the
// portal-wipe lands on before the pointer starts moving (scene frame 0 ==
// body frame -24).
export const S03_LEAD = sec(0.8); // 24
export const S03_DURATION = 409 + S03_LEAD; // 433
// S04's pointer leg runs 1.25x faster (66f -> 53f), which pulls the select,
// rebound and handoff 13f earlier (D58).
export const S04_DURATION = 451;
// S05: growth starts mid-lift (45) and bursts at 285; the 119f ember tail is
// unchanged, so the shot is 405f instead of 480f (D59).
export const S05_DURATION = 405;
export const S05BEATCUT_DURATION = 540;
// 180f = exactly 3 bars at 120 BPM, so the workflow groove keeps its grid.
export const S055_DURATION = sec(6);
export const S06_SPOTLIGHT_DURATION = 172;
export const S06_REPLY_DURATION = 486;
export const S06_DURATION = S06_SPOTLIGHT_DURATION + S06_REPLY_DURATION; // 658
export const S065_DURATION = 312;
// icon-flip-bloom: flip 46, bloom 52, settle-into-size 84, brand field 90,
// tagline 105–129, then a 33f hold.
export const S07_DURATION = 162;

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
    // Authored beats (60 / 180 / 340 / 372) mapped through S01_SPEED.
    acceptanceFrames: [43, 129, 243, 266, S01_DURATION - 1],
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
    // Body frame + S03_LEAD: 69f first row embed, 105f last row, 143f row
    // wash, 239f brake overshoot, 377f batch-launch click, 400f ripple mid;
    // the hard cut (D57) lands at body 408, mid-ripple, into S04's loading page.
    acceptanceFrames: [
      69 + S03_LEAD,
      105 + S03_LEAD,
      143 + S03_LEAD,
      239 + S03_LEAD,
      377 + S03_LEAD,
      400 + S03_LEAD,
      S03_DURATION - 1,
    ],
  },
  {
    id: 'S04',
    title: '批量启动 / 代理接入巡视',
    durationInFrames: S04_DURATION,
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    // reticle-lock-on + the fixed readout grammar; the camera stays at 1x (D53).
    cards: ['fui-hud-moves', 'gauge-readout-moves'],
    // 93f viewfinder locked / 110f mid-stream 009 / 215f 090 + green dot /
    // 250f release / 404f select begins / 417f rebound peak / 443f cursor gone
    acceptanceFrames: [sec(5), 93, 110, 215, 250, 404, 417, 443, S04_DURATION - 1],
  },
  {
    id: 'S05',
    title: '消息请求 8 秒涨到 999',
    durationInFrames: S05_DURATION,
    // D60: the push-in ends on the card's white face, then a 12f enter-only
    // dissolve (no black dip, no flash) hands over to S055's light field.
    transitionAfter: { kind: 'dissolve', durationInFrames: 12 },
    // Only the frosted-glass material is borrowed from this card; the lift,
    // float and 8s climb are bespoke (D51).
    cards: ['glass-pill-dictation-typing'],
    // read / lift mid (growth starts) / landed / early climb / mid climb /
    // late climb / 999 + burst / push peak / last
    acceptanceFrames: [15, 45, 60, 100, 165, 225, 285, 392, S05_DURATION - 1],
  },
  {
    id: 'S055',
    title: '矩阵聚合 / 全天候托管',
    durationInFrames: S055_DURATION,
    // The card settles at 156f and holds a full 24f; cutting into S06's
    // lights-off stage keeps that hold instead of dissolving text over it.
    transitionAfter: { kind: 'cut', durationInFrames: 0 },
    cards: ['aurora-bloom-bg-flip'],
    // A settled in the rise / A blur-out / press-down mid / empty dark beat /
    // B first phrase / B settled (colour done at 156) / last frame
    acceptanceFrames: [40, 90, 108, 118, 132, 162, S055_DURATION - 1],
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
    id: 'S065',
    title: '报告瀑布流',
    durationInFrames: S065_DURATION,
    transitionAfter: { kind: 'dissolve', durationInFrames: 16 },
    cards: [],
    // seam hold / mid-flight 3D toss / wall bloomed / pull-back begins /
    // ghost LOD swapped / settled wall
    acceptanceFrames: [8, 34, 96, 150, 230, S065_DURATION - 1],
  },
  {
    id: 'S07',
    title: '品牌尾卡',
    durationInFrames: S07_DURATION,
    cards: ['ui-to-brand-morph'],
    styles: ['icon-flip-bloom'],
    // wobble peak / thinnest frame / first frame after the swap / bloom overshoot
    // / mid shrink / brand field rising / tagline rising / final frame
    acceptanceFrames: [22, 45, 46, 58, 74, 96, 118, S07_DURATION - 1],
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

// No extra safety tail: S07 settles the wordmark at 84f and the tagline at 129f,
// so the final 33f already hold a settled brand card and the last frame is that card.
export const TOTAL_FRAMES =
  SCENES.reduce((total, scene) => total + scene.durationInFrames, 0) -
  overlapBefore(SCENES.length);
