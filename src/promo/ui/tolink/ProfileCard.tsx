import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import type { LaunchedProfile } from './data';
import { tol } from './tokens';

const CLOSE_SIZE = 10;
const ROW_HEIGHT = 23.2;
const ROW_TOP = 72.4;
const ROW_LEFT = 11.5;
const LABEL_WIDTH = 35.5;

export const PROFILE_CARD_HEIGHT = 262;

const mixChannel = (from: number, to: number, p: number) => Math.round(from + (to - from) * p);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const CloseGlyph: FC = () => (
  <svg
    width={CLOSE_SIZE}
    height={CLOSE_SIZE}
    viewBox="0 0 10 10"
    style={{ position: 'absolute', right: 11, top: 10 }}
  >
    <path
      d="M1.2 1.2 8.8 8.8 M8.8 1.2 1.2 8.8"
      stroke="#B3B6BB"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);

type ProfileCardProps = {
  profile: LaunchedProfile;
  width: number;
  selectProgress?: number;
  hover?: number;
  statusGlow?: number;
  /** Transient landing pulse; 0 leaves the approved selected card untouched. */
  lift?: number;
};

export const ProfileCard: FC<ProfileCardProps> = ({
  profile,
  width,
  selectProgress = 0,
  hover = 0,
  statusGlow = 0,
  lift = 0,
}) => {
  const select = clamp01(selectProgress);
  const hoverP = clamp01(hover);
  const rows: Array<[string, string, boolean]> = [
    ['备注', profile.name, false],
    ['代理', '-', false],
    ['分组', '-', false],
    ['平台', 'Win32', false],
    ['地区', profile.region, false],
    ['IP', profile.ip, false],
    ['协议', 'SOCKS5', false],
    ['状态', '已连接', true],
  ];

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: PROFILE_CARD_HEIGHT,
        borderRadius: 8,
        background: `rgb(${mixChannel(255, 234, select)}, ${mixChannel(255, 238, select)}, ${mixChannel(255, 250, select)})`,
        boxShadow: [
          `inset 0 0 0 1px ${tol.color.cardBorder}`,
          select > 0.001 ? `inset 0 0 0 1.5px rgba(58, 87, 219, ${select})` : null,
          `0 2px 6px rgba(20, 30, 60, ${0.04 + 0.04 * select})`,
          select > 0.001 ? `0 4px 14px rgba(58, 87, 219, ${0.12 * select})` : null,
          hoverP > 0.001 ? `0 4px 16px rgba(58, 87, 219, ${0.16 * hoverP})` : null,
          lift > 0.001
            ? `0 ${(6 + 14 * lift).toFixed(2)}px ${(16 + 20 * lift).toFixed(2)}px rgba(58, 87, 219, ${(0.20 * lift).toFixed(3)})`
            : null,
        ]
          .filter(Boolean)
          .join(', '),
        filter: hoverP > 0.001 ? `brightness(${1 + 0.02 * hoverP})` : undefined,
      }}
    >
      <Img
        src={staticFile(profile.avatar)}
        style={{
          position: 'absolute',
          left: 12,
          top: 11.5,
          width: 41,
          height: 41,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 63.5,
          top: 15.5,
          fontSize: 12,
          lineHeight: '18px',
          color: tol.color.textMuted,
        }}
      >
        {profile.name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 63.5,
          top: 33,
          fontSize: 13,
          lineHeight: '20px',
          color: tol.color.textStrong,
        }}
      >
        {profile.name}
      </div>
      <CloseGlyph />

      {rows.map(([label, value, isStatus], index) => (
        <div
          key={label}
          style={{
            position: 'absolute',
            left: ROW_LEFT,
            top: ROW_TOP + index * ROW_HEIGHT,
            height: ROW_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            fontSize: 11.5,
          }}
        >
          <span style={{ width: LABEL_WIDTH, color: tol.color.textMuted }}>{label}</span>
          <span
            style={{
              color: isStatus ? tol.color.statusGreen : tol.color.textStrong,
              textShadow:
                isStatus && statusGlow > 0.001
                  ? `0 0 ${10 * statusGlow}px rgba(18, 214, 164, ${0.6 * statusGlow})`
                  : undefined,
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};
