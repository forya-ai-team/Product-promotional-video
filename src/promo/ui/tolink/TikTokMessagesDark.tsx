import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { ChatPanel, PAGE_FONT } from './ChatPanel';
import { S06_CHAT_ROWS, type S06Avatar, type S06MessageRow } from './s06Data';

export const PAGE_LEFT = 280;
export const PAGE_TOP = 48;

export const RAIL_W = 68;
export const LIST_W = 323;
export const CHAT_LEFT = RAIL_W + LIST_W;
export const LIST_HEADER_H = 68;
export const ROW_H = 72;
export const ROW_LEFT = 11;
export const ROW_W = 303;
const ROW_AVATAR = 48;
const ROW_TEXT_LEFT = 72;

const INK = '#F4F4F4';
const MUTED = '#9A9A9A';
const DIM = '#8C8C8C';
const ROW_ON = '#212121';
const ACCENT = '#FF2D55';
const AVATAR_RING = '#25F4EE';

const UnionJack: FC<{ size: number }> = ({ size }) => {
  const id = `s06-flag-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <clipPath id={id}>
          <circle cx="24" cy="24" r="24" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" fill="#1B3A8C" />
        <path d="M0 0 48 48M48 0 0 48" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M0 0 48 48M48 0 0 48" stroke="#D2143A" strokeWidth="4" />
        <path d="M24 0v48M0 24h48" stroke="#FFFFFF" strokeWidth="14" />
        <path d="M24 0v48M0 24h48" stroke="#D2143A" strokeWidth="8" />
      </g>
    </svg>
  );
};

const Silhouette: FC<{ size: number; bg: string; fg: string }> = ({ size, bg, fg }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: bg,
      overflow: 'hidden',
    }}
  >
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }}>
      <circle cx="24" cy="17" r="8.4" fill={fg} />
      <ellipse cx="24" cy="42" rx="15.5" ry="12" fill={fg} />
    </svg>
  </div>
);

const AvatarView: FC<{ avatar: S06Avatar; size: number }> = ({ avatar, size }) => {
  const style = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
  };

  if (avatar.kind === 'photo') {
    return <Img src={staticFile(avatar.src)} style={{ ...style, objectFit: 'cover' }} />;
  }
  if (avatar.kind === 'letter') {
    return (
      <div
        style={{
          ...style,
          background: avatar.bg,
          color: avatar.color ?? '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.46,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {avatar.text}
      </div>
    );
  }
  if (avatar.kind === 'silhouette') {
    return (
      <div style={style}>
        <Silhouette size={size} bg={avatar.bg} fg={avatar.fg} />
      </div>
    );
  }
  if (avatar.kind === 'flag') {
    return (
      <div style={style}>
        <UnionJack size={size} />
      </div>
    );
  }
  return <div style={{ ...style, background: avatar.bg }} />;
};

const VerifiedGlyph: FC = () => (
  <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginLeft: 4, flex: '0 0 auto' }}>
    <path
      d="M2.4 8.4 6.4 12 13.6 3.6"
      fill="none"
      stroke="#F4F4F4"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2.2 2.2 3 3.4 4.2 4.2 3 5 2.2 6.2 1.4 5 0.2 4.2 1.4 3.4Z" fill="#F4F4F4" />
  </svg>
);

const EllipsisGlyph: FC = () => (
  <div style={{ position: 'absolute', right: 10, top: 32, display: 'flex', gap: 3.5 }}>
    {[0, 1, 2].map((dot) => (
      <div key={dot} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#DADADA' }} />
    ))}
  </div>
);

const MessageRowView: FC<{ row: S06MessageRow; top: number }> = ({ row, top }) => {
  const lit = row.hovered || row.selected;
  return (
    <div
      style={{
        position: 'absolute',
        left: RAIL_W + ROW_LEFT,
        top,
        width: ROW_W,
        height: ROW_H,
        borderRadius: 8,
        background: lit ? ROW_ON : undefined,
      }}
    >
      <div style={{ position: 'absolute', left: 10, top: 12, width: ROW_AVATAR, height: ROW_AVATAR }}>
        <AvatarView avatar={row.avatar} size={ROW_AVATAR} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: ROW_TEXT_LEFT,
          top: 11,
          width: 182,
          display: 'flex',
          alignItems: 'center',
          fontSize: 15.5,
          lineHeight: '20px',
          fontWeight: 600,
          color: INK,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
        {row.verified ? <VerifiedGlyph /> : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: ROW_TEXT_LEFT,
          top: 29,
          width: 138,
          fontSize: 14,
          lineHeight: '20px',
          color: MUTED,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {row.preview}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 54,
          top: 29,
          width: 34,
          textAlign: 'right',
          fontSize: 13,
          lineHeight: '20px',
          color: DIM,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.time}
      </div>
      {row.unread ? (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 17,
            minWidth: 20,
            height: 20,
            padding: '0 4px',
            borderRadius: 10,
            background: ACCENT,
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 600,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {row.unread}
        </div>
      ) : null}
      {row.hovered ? <EllipsisGlyph /> : null}
    </div>
  );
};

export const HandCursor: FC<{ left: number; top: number; scale?: number }> = ({
  left,
  top,
  scale = 1,
}) => (
  <svg
    width={22}
    height={28}
    viewBox="0 0 22 28"
    style={{ position: 'absolute', left, top, transform: `scale(${scale})`, transformOrigin: '0 0' }}
  >
    <path
      d="M8.4 1.5c1.05 0 1.9.86 1.9 1.92v8.5l1.3-.52c.9-.36 1.86-.5 2.82-.42 1.28.09 2.46.56 3.4 1.3l.78.66c.58.5.9 1.22.9 1.98v3.35c0 2.5-.8 4.68-2.33 6.4-1.5 1.7-3.56 2.65-5.88 2.65h-2.2c-2.1 0-4.06-.95-5.32-2.55l-3.73-4.85c-.55-.72-.47-1.76.18-2.4.7-.67 1.83-.6 2.46.12l2.02 2.02V3.42c0-1.06.85-1.92 1.9-1.92Z"
      fill="#FFFFFF"
      stroke="#141414"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <path
      d="M8.4 11.2V4.1M11.7 12.4V6.8M15.1 13.3V9.6M18.3 14.5v-3.2"
      stroke="#141414"
      strokeWidth="0.95"
      strokeLinecap="round"
      opacity="0.38"
    />
  </svg>
);

const RailAvatar: FC<{ src: string; size: number; ring?: boolean }> = ({ src, size, ring }) => {
  const outer = ring ? size + 6 : size;
  return (
    <div
      style={{
        position: 'absolute',
        left: 34.4 - outer / 2,
        top: 0,
        width: outer,
        height: outer,
        borderRadius: '50%',
        border: ring ? `1.6px solid ${AVATAR_RING}` : undefined,
        boxSizing: 'border-box',
        padding: ring ? 1.4 : 0,
        background: '#000000',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
      />
    </div>
  );
};

type TikTokMessagesDarkProps = {
  height?: number;
  hideChat?: boolean;
};

export const TikTokMessagesDark: FC<TikTokMessagesDarkProps> = ({ height = 884, hideChat = false }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: PAGE_LEFT,
        top: PAGE_TOP,
        width: 1272,
        height,
        background: '#000000',
        overflow: 'hidden',
        fontFamily: PAGE_FONT,
      }}
    >
      {/* The rail is static chrome: baked once from the reference, then the two
          real account avatars are covered by stock photos. */}
      <Img
        src={staticFile('textures/S06/tiktok-rail@1.25x.png')}
        style={{ position: 'absolute', left: 0, top: 0, width: RAIL_W, height: 655.9 }}
      />
      <div style={{ position: 'absolute', left: 0, top: 267.4 - 19, width: RAIL_W, height: 38 }}>
        <RailAvatar src="textures/S06/rail-account.jpg" size={32} ring />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 575.9 - 15, width: RAIL_W, height: 30 }}>
        <RailAvatar src="textures/S06/account.jpg" size={30} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: RAIL_W + 22,
          top: 26,
          width: LIST_W - 33,
          fontSize: 20,
          lineHeight: '26px',
          fontWeight: 700,
          color: INK,
          letterSpacing: 0.1,
        }}
      >
        Messages
      </div>

      {S06_CHAT_ROWS.map((row, index) => (
        <MessageRowView key={row.name} row={row} top={LIST_HEADER_H + index * ROW_H} />
      ))}

      {hideChat ? null : (
        <div style={{ position: 'absolute', left: CHAT_LEFT, top: 0, width: 1272 - CHAT_LEFT, height }}>
          <ChatPanel width={1272 - CHAT_LEFT} height={height} />
        </div>
      )}

      <HandCursor left={167} top={105} scale={1.05} />
    </div>
  );
};
