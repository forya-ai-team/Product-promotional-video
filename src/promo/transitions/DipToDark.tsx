import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

// A true dip: the outgoing scene is gone by the midpoint and the incoming one
// only starts after it, so the dark TransitionSeries background is what carries
// the cut (lights out -> spotlight on). A simultaneous crossfade would show
// both apps at once.
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type DipToDarkProps = Record<string, never>;

const DipToDarkPresentation: FC<TransitionPresentationComponentProps<DipToDarkProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const progress = clamp01(presentationProgress);
  const opacity =
    presentationDirection === 'entering'
      ? clamp01(progress * 2 - 1)
      : clamp01(1 - progress * 2);

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const dipToDark = (): TransitionPresentation<DipToDarkProps> => ({
  component: DipToDarkPresentation,
  props: {},
});
