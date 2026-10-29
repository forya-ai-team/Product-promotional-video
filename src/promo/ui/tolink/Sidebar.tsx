import type { FC, ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import { PlusGlyph, RefreshGlyph } from './glyphs';
import { tol } from './tokens';

const RAIL_ICONS = [
  { file: 'rail-icon-1', left: 7, top: 171, width: 49, height: 48.5 },
  { file: 'rail-icon-2', left: 7, top: 236, width: 49, height: 49 },
  { file: 'rail-icon-3', left: 7, top: 301, width: 49, height: 49.5 },
  { file: 'rail-icon-4', left: 10, top: 366.5, width: 42, height: 49 },
  { file: 'rail-icon-5', left: 10.5, top: 434.5, width: 42.5, height: 42.5 },
];

export type CardFeedback = {
  glow: number;
  press: number;
};

const SidebarScrollbar: FC<{ thumbHeight: number }> = ({ thumbHeight }) => (
  <div style={{ position: 'absolute', left: 259, top: 164, width: 10, bottom: 0 }}>
    <div
      style={{
        position: 'absolute',
        left: 1.5,
        top: 8,
        width: 8,
        height: 5.5,
        background: tol.color.scrollbar,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0.5,
        top: 21,
        width: 9,
        height: thumbHeight,
        borderRadius: 4.5,
        background: tol.color.scrollbar,
      }}
    />
  </div>
);

type SidebarProps = {
  cardFeedback?: CardFeedback;
  cardLeft?: number;
  cardWidth?: number;
  showScrollbar?: boolean;
  scrollbarThumbHeight?: number;
  children?: ReactNode;
};

export const Sidebar: FC<SidebarProps> = ({
  cardFeedback,
  cardLeft = 73.5,
  cardWidth = 198,
  showScrollbar = false,
  scrollbarThumbHeight = 747,
  children,
}) => {
  const glow = cardFeedback?.glow ?? 0;
  const press = cardFeedback?.press ?? 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: tol.layout.sidebarWidth, height: tol.layout.height }}>
      <div
        style={{
          position: 'absolute',
          left: 19.5,
          top: 59,
          width: 44,
          height: 30,
          borderRadius: 7,
          background: tol.color.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RefreshGlyph />
      </div>

      <Img
        src={staticFile('textures/S03/tolink-logo@2x.png')}
        style={{ position: 'absolute', left: 80, top: 52, width: 120, height: 42 }}
      />

      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 109.5,
          width: 263,
          height: 45,
          borderRadius: 8,
          background: tol.color.brandBlue,
          boxShadow: '0 2px 3px rgba(50, 84, 220, 0.18)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          fontSize: 13,
        }}
      >
        <PlusGlyph size={12} />
        <span>新建配置</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1,
          top: 164,
          width: 272,
          height: 1,
          background: '#E4E4E4',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: tol.layout.iconRailTop,
          width: tol.layout.iconRailWidth,
          height: tol.layout.height - tol.layout.iconRailTop,
          background: tol.color.railBg,
        }}
      />

      {RAIL_ICONS.map((icon) => (
        <Img
          key={icon.file}
          src={staticFile(`textures/S03/${icon.file}@2x.png`)}
          style={{
            position: 'absolute',
            left: icon.left,
            top: icon.top,
            width: icon.width,
            height: icon.height,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: cardLeft,
          top: 181,
          width: cardWidth,
          height: 109,
          borderRadius: 8,
          background: tol.color.brandCard,
          boxShadow: `0 3px 6px rgba(39, 67, 177, 0.22), 0 10px 30px rgba(39, 67, 177, ${0.3 * glow})`,
          filter: glow > 0.001 ? `brightness(${1 + 0.04 * glow})` : undefined,
          transform: press > 0.001 ? `scale(${1 - 0.012 * press})` : undefined,
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            background: `rgba(255, 255, 255, ${0.03 * glow})`,
          }}
        />
        <div style={{ position: 'absolute', left: 0, top: 36, width: '100%', fontSize: 15.5, lineHeight: '22px', fontWeight: 600 }}>
          TK浏览器配置
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 61.5,
            width: '100%',
            fontSize: 12,
            lineHeight: '16px',
            color: 'rgba(199, 211, 255, 0.78)',
          }}
        >
          点击管理配置
        </div>
      </div>

      {children}
      {showScrollbar ? <SidebarScrollbar thumbHeight={scrollbarThumbHeight} /> : null}
    </div>
  );
};
