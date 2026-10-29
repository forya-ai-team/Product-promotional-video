import type { FC } from 'react';
import { Img, staticFile } from 'remotion';

const PAGE_LEFT = 280;
const PAGE_TOP = 48;
const PAGE_WIDTH = 1577;
const PAGE_HEIGHT = 884;

const HEADER_HEIGHT = 104.5;
const BODY_TOP = 104.5;
const BODY_BG = '#F7F7F7';

const PANEL_TOP = 120.5;
const MSG_LEFT = 238.5;
const MSG_WIDTH = 401;
const CHAT_LEFT = 655.5;
const CHAT_WIDTH = 685.5;
const PANEL_RADIUS = 12;

const ROW_TOP = 122;
const ROW_HEIGHT = 72;
const LIST_TOP = ROW_TOP + ROW_HEIGHT;

const INK = '#161823';
const PREVIEW = '#6B6B73';
const MUTED = '#75757C';
const ACCENT = '#EE1357';
const BORDER = '#E5E5E5';
const REQUESTS_ICON_BG = '#565F89';

const COUNT_FORMAT = new Intl.NumberFormat('en-US');

export type TikTokMessagesProps = {
  requests?: number;
  unread?: number;
};

type MessageRow = {
  name: string;
  preview: string;
  time: string;
  badge?: number;
  highlight?: boolean;
};

const ROWS: MessageRow[] = [
  { name: 'Aniekan Ben', preview: "can't believe i'm still thinkin...", time: '01:31', badge: 5 },
  { name: 'JHONGCOOK', preview: 'sooo... are u done signing ...', time: '00:55', badge: 3 },
  { name: 'The Unforgiven2025', preview: 'ugh, i literally have s...', time: '10/27/2026', badge: 3 },
  { name: 'BRDevon Merriman', preview: 'shared the LIVE', time: '10/27/2026', badge: 1 },
  { name: 'Chuck', preview: 'lol sounds fun, love t...', time: '10/27/2026', highlight: true },
  { name: 'jackpnilsson329', preview: 'Hi 😊', time: '10/27/2026', badge: 2 },
  { name: 'Arthur Flick', preview: 'i literally just got out ...', time: '10/27/2026' },
  { name: 'pappy', preview: 'Hello', time: '10/27/2026', badge: 1 },
  { name: 'glen66@', preview: 'fine, keep me waiting...', time: '' },
];

const CloudGlyph: FC = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path
      d="M7.2 19h9.1a4.4 4.4 0 0 0 .6-8.8 6.1 6.1 0 0 0-11.7-1.5A4.6 4.6 0 0 0 7.2 19Z"
      stroke={INK}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 17v-7M9.2 12.8 12 10l2.8 2.8" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlaneGlyph: FC = () => (
  <svg width={24} height={24} viewBox="0 0 24 24">
    <path d="M3.4 4.2 21 11.1l-8.1 3.1-3 7-2.4-6.4Z" fill={INK} strokeLinejoin="round" />
  </svg>
);

const DownloadGlyph: FC = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1.5v8.2M4.4 6.8l3.1 3.2 3.1-3.2" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13.2h11" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BackGlyph: FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path d="M14 8H2.2M7.4 2.8 2.2 8l5.2 5.2" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FunnelGlyph: FC = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <path d="M1.8 2.2h10.4L8.4 7.3v4.1l-2.8 1.2V7.3Z" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const ChevronGlyph: FC<{ size?: number }> = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path d="M2.2 3.6 5 6.4l2.8-2.8" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RequestsGlyph: FC = () => (
  <svg width={34} height={34} viewBox="0 0 32 32">
    <path
      d="M10.6 5H23a5.2 5.2 0 0 1 5.2 5.2v7.6A5.2 5.2 0 0 1 23 23h-8.6l-6.8 5c-.8.6-2 0-2-1V10.2A5.2 5.2 0 0 1 10.6 5Z"
      fill="#FFFFFF"
    />
    <rect x="10.6" y="11.2" width="12.4" height="2.4" rx="1.2" fill={REQUESTS_ICON_BG} />
    <rect x="10.6" y="16.2" width="12.4" height="2.4" rx="1.2" fill={REQUESTS_ICON_BG} />
  </svg>
);

export const REQUESTS_ROW_WIDTH = MSG_WIDTH;
export const REQUESTS_ROW_HEIGHT = ROW_HEIGHT;

// Same row the list renders, without the list offset: S05 lifts this exact DOM
// into its floating card so the card and the page cannot drift apart.
export const MessageRequestsRow: FC<{ requests: number }> = ({ requests }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: MSG_WIDTH, height: ROW_HEIGHT }}>
    <div
      style={{
        position: 'absolute',
        left: 19,
        top: 2,
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: REQUESTS_ICON_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RequestsGlyph />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 85.5,
        top: 5,
        fontSize: 15.5,
        lineHeight: '21px',
        fontWeight: 600,
        color: INK,
      }}
    >
      Message requests
    </div>
    <div
      style={{
        position: 'absolute',
        left: 85.5,
        top: 29,
        fontSize: 14.5,
        lineHeight: '20px',
        color: PREVIEW,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      You have {COUNT_FORMAT.format(requests)} requests
    </div>
    <div
      style={{
        position: 'absolute',
        right: 28.5,
        top: 19.5,
        height: 20,
        padding: '0 8px',
        borderRadius: 10,
        background: ACCENT,
        color: '#FFFFFF',
        fontSize: 12.5,
        lineHeight: '20px',
        fontWeight: 600,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {requests > 99 ? '99+' : requests}
    </div>
  </div>
);

const MessageRequestsItem: FC<{ requests: number }> = ({ requests }) => (
  <div style={{ position: 'absolute', left: 0, top: ROW_TOP, width: MSG_WIDTH, height: ROW_HEIGHT }}>
    <MessageRequestsRow requests={requests} />
  </div>
);

const MessageItem: FC<{ row: MessageRow; index: number }> = ({ row, index }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: LIST_TOP + index * ROW_HEIGHT,
      width: MSG_WIDTH,
      height: ROW_HEIGHT,
      background: row.highlight ? '#F1F1F1' : undefined,
    }}
  >
    <Img
      src={staticFile(`textures/S05/avatar-${index + 1}.jpg`)}
      style={{
        position: 'absolute',
        left: 16,
        top: 0,
        width: 56,
        height: 56,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 85.5,
        top: 5,
        fontSize: 15.5,
        lineHeight: '21px',
        fontWeight: 600,
        color: INK,
      }}
    >
      {row.name}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 85.5,
        top: 29,
        width: 184,
        fontSize: 14.5,
        lineHeight: '20px',
        color: PREVIEW,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {row.preview}
    </div>
    {row.time ? (
      <div
        style={{
          position: 'absolute',
          right: 91.5,
          top: 30,
          width: 95,
          fontSize: 13.5,
          lineHeight: '18px',
          color: MUTED,
          textAlign: 'right',
        }}
      >
        {row.time}
      </div>
    ) : null}
    {row.badge ? (
      <div
        style={{
          position: 'absolute',
          right: 28.5,
          top: 19.5,
          width: 19.5,
          height: 19.5,
          borderRadius: '50%',
          background: ACCENT,
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {row.badge}
      </div>
    ) : null}
    {row.highlight ? (
      <div
        style={{
          position: 'absolute',
          right: 26.5,
          top: 26.5,
          display: 'flex',
          gap: 4.5,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: INK }}
          />
        ))}
      </div>
    ) : null}
  </div>
);

export const TikTokMessages: FC<TikTokMessagesProps> = ({ requests = 250, unread = 203 }) => (
  <div
    style={{
      position: 'absolute',
      left: PAGE_LEFT,
      top: PAGE_TOP,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      overflow: 'hidden',
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: HEADER_HEIGHT,
        background: '#FFFFFF',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: BODY_TOP,
        width: '100%',
        height: PAGE_HEIGHT - BODY_TOP,
        background: BODY_BG,
      }}
    />

    <Img
      src={staticFile('textures/S05/tiktok-logo@2x.png')}
      style={{ position: 'absolute', left: 64, top: 14, width: 128, height: 38 }}
    />
    <div
      style={{
        position: 'absolute',
        left: 81,
        top: 71,
        fontSize: 20,
        lineHeight: '26px',
        fontWeight: 700,
        color: INK,
      }}
    >
      Messages
    </div>
    <div style={{ position: 'absolute', left: 81, top: 98, width: 74, height: 2, background: INK }} />
    <div
      style={{
        position: 'absolute',
        left: 157,
        top: 69,
        height: 16,
        minWidth: 29.5,
        padding: '0 5px',
        borderRadius: 8,
        background: ACCENT,
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {COUNT_FORMAT.format(unread)}
    </div>

    <div style={{ position: 'absolute', left: 1374, top: 22 }}><CloudGlyph /></div>
    <div style={{ position: 'absolute', left: 1410, top: 22 }}><PlaneGlyph /></div>
    <Img
      src={staticFile('textures/S05/avatar-10.jpg')}
      style={{ position: 'absolute', left: 1474, top: 22, width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
    />

    <div style={{ position: 'absolute', left: 1336, top: 76 }}><DownloadGlyph /></div>
    <div
      style={{
        position: 'absolute',
        left: 1352,
        top: 72,
        fontSize: 15,
        lineHeight: '20px',
        fontWeight: 600,
        color: INK,
      }}
    >
      Download contacts
    </div>

    <div
      style={{
        position: 'absolute',
        left: 182,
        top: 128,
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: '#F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BackGlyph />
    </div>

    <div
      style={{
        position: 'absolute',
        left: MSG_LEFT,
        top: PANEL_TOP,
        width: MSG_WIDTH,
        bottom: 0,
        background: '#FFFFFF',
        borderRadius: `${PANEL_RADIUS}px ${PANEL_RADIUS}px 0 0`,
        boxShadow: '0 0 18px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 23.5,
          top: 12.5,
          fontSize: 24,
          lineHeight: '30px',
          fontWeight: 700,
          color: INK,
        }}
      >
        Messages
      </div>

      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 76.5,
          width: 110,
          height: 25.5,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          background: '#FFFFFF',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'absolute', left: 13, top: 6 }}><FunnelGlyph /></div>
        <div
          style={{
            position: 'absolute',
            left: 35,
            top: 3.5,
            fontSize: 13,
            lineHeight: '18px',
            color: INK,
          }}
        >
          Filter
        </div>
        <div style={{ position: 'absolute', right: 11, top: 9 }}><ChevronGlyph /></div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 285.5,
          top: 83.5,
          width: 14,
          height: 14,
          border: '1px solid #D9D9D9',
          borderRadius: 2,
          background: '#FFFFFF',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 305.5,
          top: 78.5,
          fontSize: 14,
          lineHeight: '20px',
          color: INK,
        }}
      >
        Unread only
      </div>

      <MessageRequestsItem requests={requests} />
      {ROWS.map((row, index) => (
        <MessageItem key={row.name} row={row} index={index} />
      ))}
    </div>

    <div
      style={{
        position: 'absolute',
        left: CHAT_LEFT,
        top: PANEL_TOP,
        width: CHAT_WIDTH,
        bottom: 0,
        background: '#FFFFFF',
        borderRadius: `${PANEL_RADIUS}px ${PANEL_RADIUS}px 0 0`,
        boxShadow: '0 0 18px rgba(0, 0, 0, 0.05)',
      }}
    />

    <div
      style={{
        position: 'absolute',
        left: 632,
        top: 242,
        width: 8,
        height: 200,
        borderRadius: 4,
        background: '#F1F1F1',
        zIndex: 3,
      }}
    />
  </div>
);
