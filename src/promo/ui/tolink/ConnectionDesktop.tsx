import type { FC, ReactNode } from 'react';
import { ConnectionPanel } from './ConnectionPanel';
import { LAUNCHED_PROFILES, type LaunchedProfile } from './data';
import { PROFILE_CARD_HEIGHT, ProfileCard } from './ProfileCard';
import { RightRail } from './RightRail';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';
import { tol } from './tokens';

const CARD_LEFT = 72;
const CARD_WIDTH = 184;
const CARD_PITCH = 268;
const LIST_TOP = 298;

// The reference frame captured card 3 hovered; only S04Static reproduces it (D21).
const REFERENCE_HOVER_INDEX = 2;

export const FIRST_PROFILE_CENTER = {
  x: CARD_LEFT + CARD_WIDTH / 2,
  y: LIST_TOP + PROFILE_CARD_HEIGHT / 2,
} as const;

const alwaysOne = () => 1;
const alwaysZero = () => 0;

export type CardVisualState = {
  select: number;
  hover: number;
  press: number;
};

const referenceCardState = (index: number): CardVisualState => ({
  select: index === REFERENCE_HOVER_INDEX ? 1 : 0,
  hover: 0,
  press: 0,
});

type ConnectionDesktopProps = {
  profiles?: LaunchedProfile[];
  toastLayer?: ReactNode;
  mainPanel?: ReactNode;
  cardState?: (index: number) => CardVisualState;
  cardReveal?: (index: number) => number;
  statusGlow?: (index: number) => number;
  textReveal?: number;
  spinnerAngle?: number;
  elevation?: number;
  overlay?: ReactNode;
};

export const ConnectionDesktop: FC<ConnectionDesktopProps> = ({
  profiles = LAUNCHED_PROFILES,
  toastLayer,
  mainPanel,
  cardState = referenceCardState,
  cardReveal = alwaysOne,
  statusGlow = alwaysZero,
  textReveal = 1,
  spinnerAngle = 0,
  elevation = 1,
  overlay,
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
    <Sidebar cardLeft={CARD_LEFT} cardWidth={CARD_WIDTH} showScrollbar>
      <div
        style={{
          position: 'absolute',
          left: CARD_LEFT - 6,
          top: LIST_TOP,
          width: CARD_WIDTH + 12,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {profiles.map((profile, index) => {
          const reveal = cardReveal(index);
          const state = cardState(index);
          return (
            <div
              key={profile.name}
              style={{
                position: 'absolute',
                left: 6,
                top: index * CARD_PITCH,
                width: CARD_WIDTH,
                opacity: reveal,
                transform: `translateY(${(1 - reveal) * -16}px) scale(${1 - 0.008 * state.press})`,
              }}
            >
              <ProfileCard
                profile={profile}
                width={CARD_WIDTH}
                selectProgress={state.select}
                hover={state.hover}
                statusGlow={statusGlow(index)}
              />
            </div>
          );
        })}
      </div>
    </Sidebar>
    {mainPanel ?? (
      <ConnectionPanel textReveal={textReveal} spinnerAngle={spinnerAngle}>
        {toastLayer}
      </ConnectionPanel>
    )}
    <RightRail />
    {overlay ? (
      <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: 'none' }}>
        {overlay}
      </div>
    ) : null}
  </div>
);
