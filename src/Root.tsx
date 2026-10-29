import type { FC } from 'react';
import { Composition } from 'remotion';
import { ProductPromo } from './promo/Main';
import { S01 } from './promo/scenes/S01';
import { S02 } from './promo/scenes/S02';
import { S03 } from './promo/scenes/S03';
import { S03Static } from './promo/scenes/S03Static';
import { S04 } from './promo/scenes/S04';
import { S04Static } from './promo/scenes/S04Static';
import { S05 } from './promo/scenes/S05';
import { S055 } from './promo/scenes/S055';
import { S05BeatCut } from './promo/scenes/S05BeatCut';
import { S05Static } from './promo/scenes/S05Static';
import { S06ReplyFull } from './promo/scenes/S06Reply';
import { S06Spotlight } from './promo/scenes/S06Spotlight';
import { S06Static } from './promo/scenes/S06Static';
import { S065Feed } from './promo/scenes/S065Feed';
import { S07EndCard } from './promo/scenes/S07EndCard';
import {
  FPS,
  S01_DURATION,
  S02_DURATION,
  S03_DURATION,
  S04_DURATION,
  S05_DURATION,
  S05BEATCUT_DURATION,
  S055_DURATION,
  S06_DURATION,
  S06_SPOTLIGHT_DURATION,
  S065_DURATION,
  S07_DURATION,
  TOTAL_FRAMES,
} from './promo/timeline';

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
        defaultProps={{ bgm: true }}
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
        id="S05BeatCut"
        component={S05BeatCut}
        durationInFrames={S05BEATCUT_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S055"
        component={S055}
        durationInFrames={S055_DURATION}
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
        id="S06Reply"
        component={S06ReplyFull}
        durationInFrames={S06_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S065Feed"
        component={S065Feed}
        durationInFrames={S065_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="S07EndCard"
        component={S07EndCard}
        durationInFrames={S07_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
