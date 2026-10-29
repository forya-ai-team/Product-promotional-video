import type { FC } from 'react';
import { ExpandedProfileCard } from './ExpandedProfileCard';
import { RightRailDocked } from './RightRailDocked';
import { S06_PROFILES } from './s06Data';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';
import { TikTokMessagesDark } from './TikTokMessagesDark';
import { TKScriptPanel } from './TKScriptPanel';
import { tol } from './tokens';

const CARD_LEFT = 72;
const CARD_W = 184;
const CARD_TOP = 294;
const CARD_GAP = 12;
const CARD_PITCH = 292 + CARD_GAP;

type S06DesktopProps = {
  height?: number;
  hideChat?: boolean;
};

export const S06Desktop: FC<S06DesktopProps> = ({ height = 932, hideChat = false }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: tol.layout.stageTop,
      width: tol.layout.width,
      height,
      background: tol.color.windowBg,
      overflow: 'hidden',
      boxShadow: '0 30px 100px rgba(0, 0, 0, 0.62)',
    }}
  >
    <TitleBar />
    <Sidebar cardLeft={CARD_LEFT} cardWidth={CARD_W} showScrollbar scrollbarThumbHeight={396}>
      <div
        style={{
          position: 'absolute',
          left: CARD_LEFT - 8,
          top: CARD_TOP,
          width: CARD_W + 16,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {S06_PROFILES.map((profile, index) => (
          <div
            key={`${profile.name}-${index}`}
            style={{
              position: 'absolute',
              left: 8,
              top: index * CARD_PITCH,
              width: CARD_W,
            }}
          >
            <ExpandedProfileCard profile={profile} />
          </div>
        ))}
      </div>
    </Sidebar>
    <TikTokMessagesDark height={height - 48} hideChat={hideChat} />
    <RightRailDocked height={height - 48} />
    <TKScriptPanel height={height - 48} />
  </div>
);
