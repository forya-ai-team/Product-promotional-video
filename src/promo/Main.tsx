import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { PlaceholderScene } from './scenes/PlaceholderScene';
import { S01 } from './scenes/S01';
import { tokens } from './theme/tokens';
import { SCENES, type SceneSpec } from './timeline';

const transitionFor = (scene: SceneSpec): ReactNode | null => {
  const transition = scene.transitionAfter;
  if (!transition || transition.kind === 'cut' || transition.durationInFrames <= 0) {
    return null;
  }

  return (
    <TransitionSeries.Transition
      key={`${scene.id}-transition`}
      // Scaffold: signature transitions render as fades until their components land.
      presentation={fade()}
      timing={linearTiming({ durationInFrames: transition.durationInFrames })}
    />
  );
};

export const ProductPromo = () => {
  const children: ReactNode[] = [];

  SCENES.forEach((scene, index) => {
    children.push(
      <TransitionSeries.Sequence
        key={scene.id}
        durationInFrames={scene.durationInFrames}
      >
        {scene.id === 'S01' ? (
          <S01 />
        ) : (
          <PlaceholderScene scene={scene} index={index} />
        )}
      </TransitionSeries.Sequence>,
    );

    const transition = transitionFor(scene);
    if (transition) {
      children.push(transition);
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: tokens.color.background }}>
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
