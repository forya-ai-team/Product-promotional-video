import type { FC } from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { S02_LENS_RECT } from '../scenes/S02';

// portal-wipe, adapted from video-shotcraft
// demos/transition/shot-transitions/PortalWipeV2.tsx (pin 43bd349).
// The TikTok lens at the end of S02 becomes the window the config page opens
// from: the clip grows out of the lens rect while the page inside scales
// 0.42 -> 1 against it. The first 10 frames only darken the lens, so the lens
// itself does not need a duplicated face patch.
const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;

const GROW_FRAMES = 40;
const GROW_EASE = Easing.bezier(0.7, 0, 0.3, 1);
const DARKEN_FRAMES = 10;
const INNER_FROM = 0.42;
const EXIT_DIM = 0.28;
const EXIT_SCALE = 0.03;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type PortalWipeProps = Record<string, never>;

const PortalWipePresentation: FC<TransitionPresentationComponentProps<PortalWipeProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  presentationDurationInFrames,
}) => {
  const progress = clamp01(presentationProgress);
  const frame = progress * presentationDurationInFrames;
  const grow = GROW_EASE(clamp01(frame / GROW_FRAMES));

  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill
        style={{
          filter: `brightness(${1 - EXIT_DIM * grow})`,
          transform: `scale(${1 + EXIT_SCALE * grow})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  const insetLeft = S02_LENS_RECT.left * (1 - grow);
  const insetTop = S02_LENS_RECT.top * (1 - grow);
  const insetRight =
    (FRAME_WIDTH - S02_LENS_RECT.left - S02_LENS_RECT.width) * (1 - grow);
  const insetBottom =
    (FRAME_HEIGHT - S02_LENS_RECT.top - S02_LENS_RECT.height) * (1 - grow);
  const radius = S02_LENS_RECT.radius * (1 - grow);
  const inner = INNER_FROM + (1 - INNER_FROM) * grow;
  const opacity = clamp01(frame / DARKEN_FRAMES);

  return (
    <AbsoluteFill
      style={{
        opacity,
        clipPath: `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round ${radius}px)`,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${inner})`,
          transformOrigin: `${S02_LENS_RECT.left + S02_LENS_RECT.width / 2}px ${
            S02_LENS_RECT.top + S02_LENS_RECT.height / 2
          }px`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* The lens is black; keep the opening window dark and let it light up
          before the window is half-grown, instead of flipping to the app's
          white page on frame 1. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#111318',
          opacity: 0.9 * (1 - clamp01(grow / 0.55)),
        }}
      />
    </AbsoluteFill>
  );
};

export const portalWipe = (): TransitionPresentation<PortalWipeProps> => ({
  component: PortalWipePresentation,
  props: {},
});
