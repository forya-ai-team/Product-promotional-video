import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { EASE, ramp } from '../spotlightHeroCard/polish';
import { ChatPanel } from '../../ui/tolink/ChatPanel';
import { S06_CHAT } from '../../ui/tolink/s06Data';

export type ReplyMessage = { kind: 'in' | 'out'; text: string; at: number; lines: number };

// Mock DM: the bot guides the download, the customer answers with the UID he
// registered in the app. Timings are the shot's beats (plan.ts).
export const REPLY_MESSAGES: ReplyMessage[] = [
  { kind: 'in', text: 'hey! how do I get started?', at: 20, lines: 1 },
  { kind: 'out', text: 'Welcome to Oumi 👋 Want to grow your TikTok account?', at: 44, lines: 1 },
  { kind: 'in', text: 'yes! I need more real followers', at: 68, lines: 1 },
  { kind: 'out', text: "Download the Oumi app and sign up first — it's free.", at: 94, lines: 1 },
  { kind: 'in', text: 'ok, just downloaded it', at: 120, lines: 1 },
  { kind: 'out', text: 'Nice. Open your profile page and send me your UID.', at: 144, lines: 1 },
  { kind: 'in', text: '2194615', at: 170, lines: 1 },
];

const IN_H = 40;
const OUT_H = 34;
const GAP = 10;

const rowHeight = (m: ReplyMessage) => (m.kind === 'in' ? IN_H + (m.lines - 1) * 20 : OUT_H + (m.lines - 1) * 21);

type Props = { frame: number; width: number; height: number; radius: number };

export const ReplyChatThread: FC<Props> = ({ frame, width, height, radius }) => {
  const start = height - 108;
  const rows: { y: number; h: number }[] = [];
  let cursor = start;
  for (const m of REPLY_MESSAGES) {
    const h = rowHeight(m);
    rows.push({ y: cursor, h });
    cursor += h + GAP;
  }

  const shifts: number[] = rows.map((r) => Math.max(0, r.y + r.h - (height - 118)));
  let shift = 0;
  for (let i = 0; i < REPLY_MESSAGES.length; i++) {
    // Scroll the thread up a beat before the bubble lands, so the newest
    // message never slides out from behind the composer bar.
    const e = ramp(frame, REPLY_MESSAGES[i].at - 8, 12, EASE.smooth);
    if (e <= 0) break;
    shift = (i === 0 ? 0 : shifts[i - 1]) + (shifts[i] - (i === 0 ? 0 : shifts[i - 1])) * e;
  }

  const bubbles = REPLY_MESSAGES.map((m, i) => {
    const e = ramp(frame, m.at, 9, EASE.out);
    if (e <= 0) return null;
    const top = rows[i].y + (1 - e) * 12;
    if (m.kind === 'in') {
      return (
        <div key={`m${i}`}>
          <Img
            src={staticFile(S06_CHAT.peerAvatar)}
            style={{
              position: 'absolute',
              left: 25,
              top: top + 4,
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
              opacity: e,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 65,
              top,
              height: rows[i].h,
              maxWidth: 600,
              padding: '9px 16px 10px',
              boxSizing: 'border-box',
              borderRadius: 8,
              background: '#4B4B4B',
              color: '#FFFFFF',
              fontSize: 15.5,
              lineHeight: '20px',
              fontWeight: 500,
              whiteSpace: 'pre-wrap',
              opacity: e,
            }}
          >
            {m.text}
          </div>
        </div>
      );
    }
    return (
      <div key={`m${i}`}>
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: top + 2,
            width: 30,
            height: 30,
            borderRadius: '50%',
            overflow: 'hidden',
            opacity: e,
          }}
        >
          <Img src={staticFile(S06_CHAT.accountAvatar)} style={{ width: 30, height: 30, objectFit: 'cover' }} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 51,
            top,
            height: rows[i].h,
            maxWidth: 560,
            padding: '7px 18px',
            boxSizing: 'border-box',
            borderRadius: 8,
            background: '#00A8E8',
            color: '#FFFFFF',
            fontSize: 15.5,
            lineHeight: '21px',
            fontWeight: 500,
            whiteSpace: 'pre-wrap',
            opacity: e,
          }}
        >
          {m.text}
        </div>
      </div>
    );
  });

  return (
    <ChatPanel
      width={width}
      height={height}
      radius={radius}
      background="#050506"
      threadShift={shift}
      footerOpacity={1 - ramp(frame, 22, 12, EASE.out)}
      extra={<>{bubbles}</>}
    />
  );
};
