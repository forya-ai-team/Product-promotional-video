import type { FC } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { DmexWordmark } from '../ui/brand/DmexWordmark';
import { BrandField, BrandTagline, CENTER } from '../ui/brand/BrandField';
import { S01_SPEED } from '../timeline';

const WORDMARK_WIDTH = 560;
const WORDMARK_HEIGHT = (WORDMARK_WIDTH * 71) / 250;

const FONT = '"Microsoft YaHei", "Segoe UI", system-ui, sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ENTER = Easing.bezier(0, 0, 0.2, 1);

const segment = (frame: number, start: number, duration: number, easing = ENTER) =>
  easing(clamp01((frame - start) / duration));

export const S01: FC = () => {
  const frame = useCurrentFrame() * S01_SPEED;
  const wordIn = segment(frame, 20, 40);

  return (
    <AbsoluteFill style={{ background: '#F7F9FD', fontFamily: FONT }}>
      <BrandField frame={frame} />

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - WORDMARK_WIDTH / 2,
          top: CENTER.y - WORDMARK_HEIGHT / 2,
          width: WORDMARK_WIDTH,
          height: WORDMARK_HEIGHT,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: `translateY(${(1 - wordIn) * 30}px) scale(${1.02 - 0.02 * wordIn})`,
            transformOrigin: '50% 60%',
            opacity: Math.min(1, wordIn * 2.2),
          }}
        >
          <DmexWordmark width={WORDMARK_WIDTH} />
        </div>
      </div>

      <BrandTagline enter={segment(frame, 350, 22)} />
    </AbsoluteFill>
  );
};
