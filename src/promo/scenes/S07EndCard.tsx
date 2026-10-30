import type { FC } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BrandField, BrandTagline, CENTER } from '../ui/brand/BrandField';
import { DmexWordmark, DmexXMark } from '../ui/brand/DmexWordmark';

// ui-to-brand-morph · A icon-flip-bloom —— 标题栏那颗 Dmex X 图标翻身变成品牌字标。
// vendor/video-shotcraft commit 43bd349 · demos/outro/ui-to-brand-morph/IconFlipBloomLogo.tsx
const FONT = '"Microsoft YaHei", "Segoe UI", system-ui, sans-serif';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const EASE = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  sinInOut: Easing.inOut(Easing.sin),
};
const ramp = (f: number, from: number, len: number, easing = EASE.out) =>
  easing(clamp01((f - from) / len));

// 字标盒由 DmexWordmark 的 viewBox 104 131 250 71 定义；实测墨迹范围 x 106–352、y 132.8–198，
// 所以墨迹水平中心 = 盒中心，垂直中心 = 盒高的 34.4/71 处。翻扁与撑开都绕这个墨迹中心做，
// 交换瞬间的竖笔才既同高又同位。
const FINAL_W = 560; // = S01 的字标宽度，让位后与开场逐像素对齐
const FINAL_H = (FINAL_W * 71) / 250;
const BLOOM_W = FINAL_W * 2;
const BLOOM_H = (BLOOM_W * 71) / 250;
const FINAL_S = FINAL_W / BLOOM_W;
const INK_CENTER_F = (165.4 - 131) / 71;
const INK_H = ((198 - 132.8) / 71) * BLOOM_H;
const INK_W_FRAC = (352 - 106) / 250;
const ICON_W = (INK_H * 68) / 54; // 图标墨迹高 = 撑开起始那根竖笔的墨迹高
const ICON_H = INK_H;
const THIN = 0.04;
const MARK_THIN = (THIN * ICON_W) / (INK_W_FRAC * BLOOM_W); // 竖笔宽度连续
const ANCHOR_Y = CENTER.y;
const SETTLED_ANCHOR_Y = CENTER.y - FINAL_H / 2 + INK_CENTER_F * BLOOM_H * FINAL_S;

const FIELD_FRAME = 400; // S01 的品牌场末帧：轨道、四条数据线、节点、连线全部落定
const FLIP_START = 34;
const FLIP_MID = 46;
const CUT_START = FLIP_MID + 7;
const SHIFT_START = FLIP_MID + 18;
const SHIFT_END = SHIFT_START + 20;
const FIELD_START = 90;
const TAGLINE_START = 105;
const TAGLINE_LEN = 24;

export const S07EndCard: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  // The S065 dissolve overlaps frames 0–15: the icon is already on stage, dim
  // and small, and rises with the incoming light instead of popping after the
  // seam. Opacity hits 1 mid-dissolve; the spring still carries the settle.
  const iconScale = 0.58 + 0.42 * enter;
  const iconAlpha = clamp01(0.4 + 0.8 * enter);
  const wobble = interpolate(frame, [12, 18, 24, 30, FLIP_START], [0, -12, 14, -18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.sinInOut,
  });
  const flipIn = interpolate(frame, [FLIP_START, FLIP_MID], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.in,
  });
  const iconScaleX = interpolate(flipIn, [0, 1], [1, THIN]);
  const bloom =
    frame < FLIP_MID
      ? 0
      : spring({ frame: frame - FLIP_MID, fps, config: { damping: 11, stiffness: 130, mass: 0.9 } });
  const markSx = interpolate(bloom, [0, 1], [MARK_THIN, 1]);
  const cut =
    frame < CUT_START
      ? 0
      : spring({ frame: frame - CUT_START, fps, config: { damping: 16, stiffness: 170 } });

  const shift = interpolate(frame, [SHIFT_START, SHIFT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.out,
  });
  const sy = mix(1, FINAL_S, shift);
  const sx = markSx * sy;
  const anchorY = mix(ANCHOR_Y, SETTLED_ANCHOR_Y, shift);

  const fieldOpacity = ramp(frame, FIELD_START, 22);
  const taglineEnter = ramp(frame, TAGLINE_START, TAGLINE_LEN);

  const showIcon = frame < FLIP_MID;
  const settled = shift >= 1;
  const ghosts = frame >= FLIP_START && frame < FLIP_MID ? [0.12, 0.24] : [];
  const shadowLife = 1 - ramp(frame, FLIP_MID, 14);
  const shadowScale = showIcon ? iconScaleX : MARK_THIN;
  const shadowWidth = ICON_W * shadowScale;

  // 拖影必须挂在没有 transform 的外层：filter 会随元素的 scale 一起被缩放，
  // 挂在压到 1.3% 宽的那一层上等于没有。交换帧两侧同为 ~15px 的竖笔，
  // 5px 模糊把 DME 的细笔画糊成一根实心线，实体交换才不穿帮。
  const iconBlur = flipIn > 0.3 ? flipIn * 5 : 0;
  const bloomBlur =
    frame >= FLIP_MID && frame < FLIP_MID + 6 ? 5 * (1 - (frame - FLIP_MID) / 6) : 0;

  return (
    <AbsoluteFill style={{ background: '#F7F9FD', fontFamily: FONT }}>
      <BrandField frame={FIELD_FRAME} fieldOpacity={fieldOpacity} />

      {shadowLife > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: CENTER.x - shadowWidth / 2 + wobble * 2.2,
            top: CENTER.y + ICON_H / 2 - 6,
            width: shadowWidth,
            height: 26,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(20,22,28,0.22) 0%, rgba(20,22,28,0) 70%)',
            opacity: iconAlpha * shadowLife,
          }}
        />
      ) : null}

      {showIcon ? (
        <div
          style={{
            position: 'absolute',
            left: CENTER.x - ICON_W / 2,
            top: CENTER.y - ICON_H / 2,
            width: ICON_W,
            height: ICON_H,
          }}
        >
          {ghosts.map((lag, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scaleX(${Math.min(1, iconScaleX + lag)})`,
                opacity: 0.22 - i * 0.08,
                filter: 'blur(6px)',
              }}
            >
              <DmexXMark width={ICON_W} solid />
            </div>
          ))}
          <div style={{ filter: iconBlur > 0.05 ? `blur(${iconBlur}px)` : undefined }}>
            <div
              style={{
                transform: `scale(${iconScale.toFixed(4)}) rotate(${wobble}deg) scaleX(${iconScaleX})`,
                transformOrigin: 'center 78%',
                opacity: iconAlpha,
              }}
            >
              <DmexXMark width={ICON_W} solid />
            </div>
          </div>
        </div>
      ) : settled ? (
        <div
          style={{
            position: 'absolute',
            left: CENTER.x - FINAL_W / 2,
            top: CENTER.y - FINAL_H / 2,
            width: FINAL_W,
            height: FINAL_H,
            overflow: 'hidden',
          }}
        >
          <div style={{ transform: 'translateY(0px) scale(1)', transformOrigin: '50% 60%' }}>
            <DmexWordmark width={FINAL_W} />
          </div>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            left: CENTER.x - BLOOM_W / 2,
            top: anchorY - INK_CENTER_F * BLOOM_H,
            width: BLOOM_W,
            height: BLOOM_H,
            filter: bloomBlur > 0.05 ? `blur(${bloomBlur}px)` : undefined,
          }}
        >
          <div
            style={{
              width: BLOOM_W,
              height: BLOOM_H,
              transform: `scale(${sx}, ${sy})`,
              transformOrigin: `${BLOOM_W / 2}px ${INK_CENTER_F * BLOOM_H}px`,
            }}
          >
            <DmexWordmark width={BLOOM_W} reveal={cut} />
          </div>
        </div>
      )}

      <BrandTagline enter={taglineEnter} />
    </AbsoluteFill>
  );
};
