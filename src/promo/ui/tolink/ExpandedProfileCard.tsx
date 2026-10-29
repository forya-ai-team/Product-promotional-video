import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import type { S06Profile } from './s06Data';
import { tol } from './tokens';

export const EXPANDED_CARD_W = 184;
export const EXPANDED_CARD_H = 292;
const ROW_H = 23.2;
const ROW_TOP = 83;

const CloseGlyph: FC = () => (
  <svg width={10} height={10} viewBox="0 0 10 10" style={{ position: 'absolute', right: 14, top: 16 }}>
    <path
      d="M1.2 1.2 8.8 8.8 M8.8 1.2 1.2 8.8"
      stroke="#B3B6BB"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mixChannel = (from: number, to: number, p: number) => Math.round(from + (to - from) * p);

type ExpandedProfileCardProps = {
  profile: S06Profile;
  selectProgress?: number;
  width?: number;
};

export const ExpandedProfileCard: FC<ExpandedProfileCardProps> = ({
  profile,
  selectProgress = profile.selected ? 1 : 0,
  width = EXPANDED_CARD_W,
}) => {
  const select = clamp01(selectProgress);
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: EXPANDED_CARD_H,
        borderRadius: 8,
        background: `rgb(${mixChannel(255, 234, select)}, ${mixChannel(255, 238, select)}, ${mixChannel(255, 250, select)})`,
        boxShadow: [
          `inset 0 0 0 1px ${tol.color.cardBorder}`,
          select > 0.001 ? `inset 0 0 0 1.5px rgba(58, 87, 219, ${select})` : null,
          `0 2px 6px rgba(20, 30, 60, ${0.04 + 0.04 * select})`,
          select > 0.001 ? `0 4px 14px rgba(58, 87, 219, ${0.12 * select})` : null,
        ]
          .filter(Boolean)
          .join(', '),
      }}
    >
      <Img
        src={staticFile(profile.avatar)}
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          width: 45,
          height: 45,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 9,
          height: 15,
          padding: '0 5px',
          borderRadius: 7.5,
          background: '#FF2D55',
          color: '#FFFFFF',
          fontSize: 9.5,
          lineHeight: '15px',
          fontWeight: 600,
          boxSizing: 'border-box',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {profile.badge}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 63.5,
          top: 22,
          fontSize: 11.5,
          lineHeight: '16px',
          color: tol.color.textMuted,
        }}
      >
        {profile.name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 63.5,
          top: 39,
          fontSize: 13.5,
          lineHeight: '18px',
          color: tol.color.textStrong,
        }}
      >
        {profile.handle}
      </div>
      <CloseGlyph />

      {profile.rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            position: 'absolute',
            left: 11.5,
            top: ROW_TOP + index * ROW_H,
            height: ROW_H,
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            fontSize: 11.5,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: tol.color.textMuted }}>{row.label}</span>
          <span style={{ color: row.green ? tol.color.statusGreen : tol.color.textStrong }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
};
