import type { FC, ReactNode } from 'react';
import type { ConfigRow } from './data';
import { CursorGlyph } from './glyphs';
import { MainArea, type RowMotion } from './MainArea';
import { RightRail } from './RightRail';
import { Sidebar, type CardFeedback } from './Sidebar';
import { TitleBar } from './TitleBar';
import { tol } from './tokens';

type TolinkDesktopProps = {
  cursor?: ReactNode;
  cardFeedback?: CardFeedback;
  rows?: ConfigRow[];
  rowReveal?: (index: number) => number;
  rowMotion?: (index: number) => RowMotion;
  rowBlur?: number;
  scrollOffset?: number;
  scrollProgress?: number;
  rowGlow?: number;
  scrollbarOpacity?: number;
  scrollbarThumbHeight?: number;
  count?: number;
  headerChecked?: boolean;
  elevation?: number;
  launchFeedback?: { glow: number; press: number };
};

export const TolinkDesktop: FC<TolinkDesktopProps> = ({
  cursor,
  cardFeedback,
  rows,
  rowReveal,
  rowMotion,
  rowBlur,
  scrollOffset,
  scrollProgress,
  rowGlow,
  scrollbarOpacity,
  scrollbarThumbHeight,
  count,
  headerChecked,
  elevation = 1,
  launchFeedback,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: tol.layout.stageTop,
      width: tol.layout.width,
      height: tol.layout.height,
      background: tol.color.windowBg,
      overflow: 'hidden',
      boxShadow: `0 ${30 * elevation}px ${100 * elevation}px rgba(0, 0, 0, ${0.62 * elevation})`,
    }}
  >
    <TitleBar />
    <Sidebar cardFeedback={cardFeedback} />
    <MainArea
      rows={rows}
      rowReveal={rowReveal}
      rowMotion={rowMotion}
      rowBlur={rowBlur}
      scrollOffset={scrollOffset}
      scrollProgress={scrollProgress}
      rowGlow={rowGlow}
      scrollbarOpacity={scrollbarOpacity}
      scrollbarThumbHeight={scrollbarThumbHeight}
      count={count}
      headerChecked={headerChecked}
      launchFeedback={launchFeedback}
    />
    <RightRail />
    {cursor ?? <CursorGlyph style={{ position: 'absolute', left: 751.5, top: 786 }} />}
  </div>
);
