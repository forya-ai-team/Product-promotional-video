import type { FC, ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import { S06_CHAT } from './s06Data';

export const PAGE_FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
export const CHAT_PANEL_W = 881;
export const CHAT_PANEL_H = 884;

const CHAT_HEADER_H = 79;
const INK = '#F4F4F4';
const DIM = '#8C8C8C';
const BUBBLE = '#4B4B4B';
const SENT = '#00A8E8';
const BORDER = '#1C1C1C';

const SmileyGlyph: FC = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.2" stroke="#9A9A9A" strokeWidth="1.7" />
    <circle cx="8.9" cy="10" r="1.15" fill="#9A9A9A" />
    <circle cx="15.1" cy="10" r="1.15" fill="#9A9A9A" />
    <path d="M7.9 14.1c.9 1.6 2.3 2.5 4.1 2.5s3.2-.9 4.1-2.5" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

type ChatPanelProps = {
  width?: number;
  height?: number;
  radius?: number;
  background?: string;
  /** Scrolls the message block up as new bubbles are appended (animated thread). */
  threadShift?: number;
  footerOpacity?: number;
  /** Extra bubbles rendered inside the scrolled block, in card coordinates. */
  extra?: ReactNode;
};

export const ChatPanel: FC<ChatPanelProps> = ({
  width = CHAT_PANEL_W,
  height = CHAT_PANEL_H,
  radius = 0,
  background = '#000000',
  threadShift = 0,
  footerOpacity = 1,
  extra,
}) => {
  const inputTop = height - 62;
  const footerTop = height - 96;
  const sentTop = height - 153;
  const incomingTop = height - 272;
  const dateTop = height - 303;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        background,
        borderRadius: radius,
        overflow: 'hidden',
        fontFamily: PAGE_FONT,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: CHAT_HEADER_H, borderBottom: `1px solid ${BORDER}`, background, zIndex: 2 }}>
        <Img
          src={staticFile(S06_CHAT.peerAvatar)}
          style={{
            position: 'absolute',
            left: 25,
            top: 16,
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 82,
            top: 17,
            fontSize: 17,
            lineHeight: '22px',
            fontWeight: 600,
            color: INK,
          }}
        >
          {S06_CHAT.peerName}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 82,
            top: 42,
            fontSize: 14,
            lineHeight: '20px',
            color: DIM,
          }}
        >
          {S06_CHAT.peerHandle}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          transform: threadShift ? `translateY(${-threadShift}px)` : undefined,
        }}
      >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: dateTop,
          width: '100%',
          textAlign: 'center',
          fontSize: 12.5,
          lineHeight: '17px',
          color: DIM,
        }}
      >
        {S06_CHAT.date}
      </div>

      <Img
        src={staticFile(S06_CHAT.peerAvatar)}
        style={{
          position: 'absolute',
          left: 25,
          top: incomingTop + 4,
          width: 40,
          height: 40,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 65,
          top: incomingTop,
          padding: '11px 18px 12px',
          borderRadius: 8,
          background: BUBBLE,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontSize: 15.5, lineHeight: '20px', fontWeight: 500 }}>{S06_CHAT.incoming}</div>
        <div style={{ fontSize: 15, lineHeight: '20px', color: '#BFBFBF', marginTop: 7 }}>
          {S06_CHAT.incomingTranslated}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: height - 180,
          width: '100%',
          textAlign: 'center',
          fontSize: 12.5,
          lineHeight: '16px',
          color: DIM,
        }}
      >
        {S06_CHAT.timestamp}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 10,
          top: sentTop + 2,
          width: 30,
          height: 30,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(S06_CHAT.accountAvatar)}
          style={{ width: 30, height: 30, objectFit: 'cover' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 51,
          top: sentTop,
          height: 34,
          padding: '7px 18px',
          boxSizing: 'border-box',
          borderRadius: 8,
          background: SENT,
          color: '#FFFFFF',
          fontSize: 15.5,
          lineHeight: '20px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {S06_CHAT.outgoing}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: footerTop,
          width: '100%',
          textAlign: 'center',
          fontSize: 13,
          lineHeight: '16px',
          color: '#A0A0A0',
          opacity: footerOpacity,
        }}
      >
        {S06_CHAT.footer}
      </div>

      {extra}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: inputTop,
          height: 46,
          borderRadius: 10,
          background: '#1F1F1F',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 17,
            top: 12,
            fontSize: 14,
            lineHeight: '22px',
            color: '#B0B0B0',
          }}
        >
          {S06_CHAT.placeholder}
        </div>
        <div style={{ position: 'absolute', right: 16, top: 11 }}>
          <SmileyGlyph />
        </div>
      </div>
    </div>
  );
};
