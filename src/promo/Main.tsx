import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { FC, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { S01 } from './scenes/S01';
import { S02 } from './scenes/S02';
import { S03 } from './scenes/S03';
import { S04 } from './scenes/S04';
import { S05 } from './scenes/S05';
import { S06ReplyFull } from './scenes/S06Reply';
import { S07EndCard } from './scenes/S07EndCard';
import { Soundtrack } from './Soundtrack';
import { tokens } from './theme/tokens';
import { SCENES, type SceneSpec } from './timeline';
import { dipToDark } from './transitions/DipToDark';
import { portalWipe } from './transitions/PortalWipe';

const SCENE_COMPONENTS: Record<string, FC> = {
  S01,
  S02,
  S03,
  S04,
  S05,
  S06: S06ReplyFull,
  S07: S07EndCard,
};

const transitionFor = (scene: SceneSpec): ReactNode | null => {
  const transition = scene.transitionAfter;
  if (!transition || transition.kind === 'cut' || transition.durationInFrames <= 0) {
    return null;
  }

  const timing = linearTiming({ durationInFrames: transition.durationInFrames });
  const key = `${scene.id}-transition`;

  switch (transition.kind) {
    case 'dissolve':
      // Entering-only fade: the outgoing scene stays opaque, so the shared
      // light field of S01/S02 dissolves its content instead of dipping to black.
      return (
        <TransitionSeries.Transition key={key} presentation={fade()} timing={timing} />
      );
    case 'portal-wipe':
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={portalWipe()}
          timing={timing}
        />
      );
    case 'fade':
      return (
        <TransitionSeries.Transition
          key={key}
          presentation={dipToDark()}
          timing={timing}
        />
      );
    default:
      throw new Error(`Transition "${transition.kind}" is not wired in Main.tsx`);
  }
};

export const ProductPromo: FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  const children: ReactNode[] = [];

  SCENES.forEach((scene) => {
    const Scene = SCENE_COMPONENTS[scene.id];
    if (!Scene) {
      throw new Error(`No component registered for scene ${scene.id}`);
    }

    children.push(
      <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
        <Scene />
      </TransitionSeries.Sequence>,
    );

    const transition = transitionFor(scene);
    if (transition) {
      children.push(transition);
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: tokens.color.background }}>
      <Soundtrack bgm={bgm} />
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
