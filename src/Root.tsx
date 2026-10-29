import type { FC } from 'react';
import { Composition } from 'remotion';
import { ProductPromo } from './promo/Main';
import { S01, S01_DURATION } from './promo/scenes/S01';
import { S02, S02_DURATION } from './promo/scenes/S02';
import { S03, S03_DURATION } from './promo/scenes/S03';
import { S03Static } from './promo/scenes/S03Static';
import { S04, S04_DURATION } from './promo/scenes/S04';
import { S04Static } from './promo/scenes/S04Static';
import { S05, S05_DURATION } from './promo/scenes/S05';
import { S05Static } from './promo/scenes/S05Static';
import { S06Spotlight, S06_SPOTLIGHT_DURATION } from './promo/scenes/S06Spotlight';
import { S06ReplyFull, S06_REPLY_TOTAL } from './promo/scenes/S06Reply';
import { S06Static } from './promo/scenes/S06Static';
import { FPS, TOTAL_FRAMES } from './promo/timeline';
import { ThreeProbe } from './promo/three/ThreeProbe';

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="S01"
        component={S01}
        durationInFrames={S01_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S02"
        component={S02}
        durationInFrames={S02_DURATION}
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
      <Composition
        id="S04Static"
        component={S04Static}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S04"
        component={S04}
        durationInFrames={S04_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S05Static"
        component={S05Static}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S05"
        component={S05}
        durationInFrames={S05_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S06Static"
        component={S06Static}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S06Spotlight"
        component={S06Spotlight}
        durationInFrames={S06_SPOTLIGHT_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S06Reply"
        component={S06ReplyFull}
        durationInFrames={S06_REPLY_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
