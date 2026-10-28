import type { FC } from 'react';
import { ConnectionDesktop, type CardVisualState } from '../ui/tolink/ConnectionDesktop';
import { Stage } from '../ui/tolink/Stage';
import { TikTokMessages } from '../ui/tolink/TikTokMessages';

const select241 = (index: number): CardVisualState =>
  index === 0
    ? { select: 1, hover: 0, press: 0 }
    : { select: 0, hover: 0, press: 0 };

export const S05Static: FC = () => (
  <Stage>
    <ConnectionDesktop mainPanel={<TikTokMessages />} cardState={select241} />
  </Stage>
);
