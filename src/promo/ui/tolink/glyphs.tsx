import type { CSSProperties, FC } from 'react';
import { Img, staticFile } from 'remotion';

export const WindowIcon: FC = () => (
  <Img
    src={staticFile('textures/S03/win-icon@2x.png')}
    style={{ position: 'absolute', left: 1, top: 2, width: 17, height: 14 }}
  />
);

export const RefreshGlyph: FC = () => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <path
      d="M14.6 6.3A6 6 0 1 0 15.2 11"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15.1 2.6v3.9h-3.9"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusGlyph: FC<{ color?: string; size?: number }> = ({
  color = '#FFFFFF',
  size = 10,
}) => (
  <svg width={size} height={size} viewBox="0 0 10 10">
    <path d="M5 0.6 V9.4 M0.6 5 H9.4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const ImportGlyph: FC = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
    <rect x="1.6" y="2.4" width="11.8" height="10.2" rx="1.2" stroke="#FFFFFF" strokeWidth="1.2" />
    <path d="M1.9 5.6H13.1" stroke="#FFFFFF" strokeWidth="1.2" />
  </svg>
);

export const SendGlyph: FC = () => (
  <svg width={14} height={14} viewBox="0 0 14 14">
    <path
      d="M1.2 6.1 12.4 1.2 9.2 12.6 6.2 8.1Z"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path d="M6.3 8.1 12.4 1.2" stroke="#E8A33D" strokeWidth="0.9" />
  </svg>
);

export const CheckGlyph: FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12">
    <path
      d="M2.6 6.2 5 8.5 9.6 3.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CursorGlyph: FC<{ style?: CSSProperties }> = ({ style }) => (
  <svg width={12.5} height={19.5} viewBox="0 0 13 20" style={style}>
    <path
      d="M1 1.2 V17.4 L4.6 13.9 L7.1 19.2 L9.4 18.1 L7 12.6 L12.1 12.4 Z"
      fill="#FFFFFF"
      stroke="#1E1E1E"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);
