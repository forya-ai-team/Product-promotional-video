import type { FC, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { tol } from './tokens';

export const Stage: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      fontFamily: tol.fontFamily,
      background: 'radial-gradient(130% 100% at 50% 0%, #1A2440 0%, #0C1120 56%, #06080F 100%)'
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(52% 46% at 50% 46%, rgba(68, 162, 255, 0.10) 0%, rgba(6, 8, 15, 0) 72%)',
      }}
    />
    {children}
  </AbsoluteFill>
);
