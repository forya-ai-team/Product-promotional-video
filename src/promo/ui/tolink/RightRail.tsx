import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { RAIL_ITEMS } from './data';
import { tol } from './tokens';

export const RightRail: FC = () => (
  <div
    style={{
      position: 'absolute',
      left: tol.layout.rightRailX,
      top: tol.layout.contentTop,
      width: tol.layout.width - tol.layout.rightRailX,
      height: tol.layout.height - tol.layout.contentTop,
    }}
  >
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1.5, background: tol.color.navLine }} />

    {RAIL_ITEMS.map((item) => (
      <div key={item.label}>
        <Img
          src={staticFile(`textures/S03/${item.icon}@2x.png`)}
          style={{
            position: 'absolute',
            left: item.iconLeft,
            top: item.iconTop,
            width: item.iconWidth,
            height: item.iconHeight,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 2.5,
            top: item.labelTop,
            width: 63,
            textAlign: 'center',
            fontSize: 12,
            lineHeight: '16px',
            color: tol.color.navText,
          }}
        >
          {item.label}
        </div>
      </div>
    ))}

    <Img
      src={staticFile('textures/S03/nav-chevron@2x.png')}
      style={{ position: 'absolute', left: 42, top: 480, width: 18, height: 26 }}
    />
  </div>
);
