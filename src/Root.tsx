import type { FC } from 'react';
import { Composition } from 'remotion';
import { ProductPromo } from './promo/Main';
import { S01, S01_DURATION } from './promo/scenes/S01';
import { S03, S03_DURATION } from './promo/scenes/S03';
import { S03Static } from './promo/scenes/S03Static';
import { FPS, TOTAL_FRAMES } from './promo/timeline';
import { ThreeProbe } from './promo/three/ThreeProbe';

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="ProductPromo"
        component={ProductPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S01"
        component={S01}
        durationInFrames={S01_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S03Static"
        component={S03Static}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S03"
        component={S03}
        durationInFrames={S03_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
