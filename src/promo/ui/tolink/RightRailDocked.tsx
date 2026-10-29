import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { RAIL_ITEMS } from './data';
import { tol } from './tokens';

const RAIL_LEFT = 1552;
const RAIL_W = 58;
const ACTIVE_LABEL = 'TK脚本';

const TikTokMark: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      fill="#2F6BFF"
      transform="translate(-0.9 0)"
      opacity={0.55}
    />
    <path
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      fill="#FE2C55"
      transform="translate(0.9 0)"
      opacity={0.45}
    />
    <path
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      fill="#2F6BFF"
    />
  </svg>
);

type RightRailDockedProps = {
  height?: number;
};

export const RightRailDocked: FC<RightRailDockedProps> = ({ height = 884 }) => (
  <div
    style={{
      position: 'absolute',
      left: RAIL_LEFT,
      top: 48,
      width: RAIL_W,
      height,
      background: '#FBFBFB',
      borderLeft: '1.5px solid #F2F2F2',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    {RAIL_ITEMS.map((item) => {
      const active = item.label === ACTIVE_LABEL;
      return (
        <div key={item.label}>
          {active ? (
            <div
              style={{
                position: 'absolute',
                left: 2.5,
                top: item.iconTop - 10,
                width: RAIL_W - 5,
                height: 64,
                borderRadius: 10,
                background: '#EAF1FF',
              }}
            />
          ) : null}
          {active ? (
            <div style={{ position: 'absolute', left: (RAIL_W - 26) / 2, top: item.iconTop + 3 }}>
              <TikTokMark size={26} />
            </div>
          ) : (
            <Img
              src={staticFile(`textures/S03/${item.icon}@2x.png`)}
              style={{
                position: 'absolute',
                left: item.iconLeft - 4.5,
                top: item.iconTop,
                width: item.iconWidth,
                height: item.iconHeight,
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: item.labelTop,
              width: RAIL_W,
              textAlign: 'center',
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: active ? 500 : 400,
              color: active ? '#2F6BFF' : tol.color.navText,
            }}
          >
            {item.label}
          </div>
        </div>
      );
    })}
  </div>
);
