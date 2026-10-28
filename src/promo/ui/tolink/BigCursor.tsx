import type { FC, CSSProperties } from 'react';

export const BigCursor: FC<{ x: number; y: number; scale: number; style?: CSSProperties }> = ({
  x,
  y,
  scale,
  style,
}) => (
  <svg
    width={46}
    height={72}
    viewBox="0 0 23 36"
    style={{
      position: 'absolute',
      left: x - 1.2 * scale,
      top: y - 1.2 * scale,
      transform: `scale(${scale})`,
      transformOrigin: '0 0',
      filter: 'drop-shadow(0 5px 8px rgba(0, 0, 0, 0.32))',
      overflow: 'visible',
      zIndex: 60,
      ...style,
    }}
  >
    <path
      d="M1.2 1.2 V31 L8 24.6 L12.4 34.4 L17 32.3 L12.8 23 L22 22.6 Z"
      fill="#FFFFFF"
      stroke="#1B1B1B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
