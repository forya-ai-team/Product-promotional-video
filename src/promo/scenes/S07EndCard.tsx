import type { FC } from 'react';
import { AbsoluteFill, Freeze } from 'remotion';
import { S01 } from './S01';

// End card: the S01 lockup (wordmark + tagline + four platform nodes) held
// still, so the film lands on the brand instead of the report card.
// Frame 400 is the settled S01 frame, after the tagline and the last handshake.
export const S07EndCard: FC = () => (
  <AbsoluteFill>
    <Freeze frame={400}>
      <S01 />
    </Freeze>
  </AbsoluteFill>
);
