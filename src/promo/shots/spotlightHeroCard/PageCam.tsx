import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// Adapted from vendor/video-shotcraft demos/_fixtures/PageCam2D.tsx (pin 43bd349).
// The demo feeds a page screenshot through `src`; this project rebuilds the UI in
// DOM, so the camera takes children instead and keeps the same coordinate math.
export type CamKey2D = {
  frame: number;
  cx: number;
  cy: number;
  zoom: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  persp?: number;
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const camAt = (
  frame: number,
  keys: CamKey2D[],
  ease: (t: number) => number = Easing.bezier(0.35, 0, 0.2, 1),
) => {
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i].frame && frame <= keys[i + 1].frame) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const t =
    a.frame === b.frame
      ? 1
      : interpolate(frame, [a.frame, b.frame], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });
  const m = (x?: number, y?: number) => lerp(x ?? 0, y ?? 0, t);
  return {
    cx: m(a.cx, b.cx),
    cy: m(a.cy, b.cy),
    zoom: m(a.zoom, b.zoom),
    rotX: m(a.rotX, b.rotX),
    rotY: m(a.rotY, b.rotY),
    rotZ: m(a.rotZ, b.rotZ),
    persp: m(a.persp ?? 1200, b.persp ?? 1200),
  };
};

type PageCamProps = {
  keys: CamKey2D[];
  pageW?: number;
  pageH?: number;
  ease?: (t: number) => number;
  bg?: string;
  children: ReactNode;
};

export const PageCam: FC<PageCamProps> = ({
  keys,
  pageW = 2600,
  pageH = 1600,
  ease = Easing.bezier(0.35, 0, 0.2, 1),
  bg = 'transparent',
  children,
}) => {
  const frame = useCurrentFrame();
  const c = camAt(frame, keys, ease);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: bg, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: `${c.persp * c.zoom}px`,
          perspectiveOrigin: '960px 540px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: pageW,
            height: pageH,
            zoom: c.zoom,
            transformOrigin: `${c.cx}px ${c.cy}px`,
            transformStyle: 'preserve-3d',
            transform: `translate(${960 / c.zoom - c.cx}px, ${540 / c.zoom - c.cy}px) rotateY(${c.rotY}deg) rotateX(${c.rotX}deg) rotateZ(${c.rotZ}deg)`,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
