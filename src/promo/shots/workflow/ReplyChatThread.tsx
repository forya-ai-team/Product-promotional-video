import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { EASE, ramp } from '../spotlightHeroCard/polish';
import { ChatPanel } from '../../ui/tolink/ChatPanel';
import { S06_CHAT } from '../../ui/tolink/s06Data';

export type ReplyMessage = { kind: 'in' | 'out'; text: string; at: number };

// Mock conversation; the timings are the shot's reply beats (see plan.REPLY_AT).
export const REPLY_MESSAGES: ReplyMessage[] = [
  { kind: 'in', text: 'Is this still available?', at: 30 },
  { kind: 'out', text: 'Yes — in stock. Want the details?', at: 205 },
  { kind: 'in', text: 'How much for two?', at: 215 },
  { kind: 'out', text: 'US$58 for two, shipping included.', at: 240 },
  { kind: 'in', text: 'Can you ship to Germany?', at: 247 },
  { kind: 'out', text: 'Yes — 6–9 days, tracked.', at: 272 },
  { kind: 'in', text: 'Do you have it in black?', at: 279 },
  { kind: 'out', text: 'Black is in stock. Reserve one?', at: 304 },
  { kind: 'in', text: 'Reserve it please', at: 311 },
  { kind: 'out', text: 'Reserved for 24h — link sent.', at: 336 },
];

const IN_H = 40;
const OUT_H = 34;
const GAP = 10;

type Props = { frame: number; width: number; height: number; radius: number };

export const ReplyChatThread: FC<Props> = ({ frame, width, height, radius }) => {
  const start = height - 108;
  const rows: { y: number; h: number }[] = [];
  let cursor = start;
  for (const m of REPLY_MESSAGES) {
    const h = m.kind === 'in' ? IN_H : OUT_H;
    rows.push({ y: cursor, h });
    cursor += h + GAP;
  }

  const shifts: number[] = rows.map((r) => Math.max(0, r.y + r.h - (height - 70)));
  let shift = 0;
  for (let i = 0; i < REPLY_MESSAGES.length; i++) {
    const e = ramp(frame, REPLY_MESSAGES[i].at, 12, EASE.smooth);
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
              padding: '9px 16px 10px',
              borderRadius: 8,
              background: '#4B4B4B',
              color: '#FFFFFF',
              fontSize: 15.5,
              lineHeight: '20px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
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
            height: OUT_H,
            padding: '7px 18px',
            boxSizing: 'border-box',
            borderRadius: 8,
            background: '#00A8E8',
            color: '#FFFFFF',
            fontSize: 15.5,
            lineHeight: '20px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
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
      footerOpacity={1 - ramp(frame, 30, 14, EASE.out)}
      extra={<>{bubbles}</>}
    />
  );
};
