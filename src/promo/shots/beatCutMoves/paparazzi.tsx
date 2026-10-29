import type { FC } from 'react';

// Adapted from video-shotcraft demos/rhythm/beat-cut-moves/PaparazziFlash.tsx
// (pin 43bd349a136651865ecfa6ea1cf012f6e957d304): only the crop-projection
// helpers and the AF bracket path. The demo's viewfinder HUD (RAW / ISO / shot
// counter) and its dark poster grade are not carried over — this film has no
// camera-viewfinder language; the flash timing lives in S05 because it is
// pinned to that scene's count curve.
export type CropView = { scale: number; cx: number; cy: number };

export const projectRect = (
  rect: { x: number; y: number; w: number; h: number },
  view: CropView,
) => ({
  x: (rect.x - view.cx) * view.scale + 960,
  y: (rect.y - view.cy) * view.scale + 540,
  w: rect.w * view.scale,
  h: rect.h * view.scale,
});


export const FocusBrackets: FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  arm?: number;
  width?: number;
  opacity?: number;
}> = ({ x, y, w, h, color, arm = 60, width = 3, opacity = 1 }) => {
  const a = Math.min(arm, w / 3, h / 3);
  const d = `M${x} ${y + a}V${y}H${x + a} M${x + w - a} ${y}H${x + w}V${y + a} M${x + w} ${y + h - a}V${y + h}H${x + w - a} M${x + a} ${y + h}H${x}V${y + h - a}`;
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={width}
      fill="none"
      opacity={opacity}
      strokeLinecap="square"
    />
  );
};
