import type { FC, ReactNode } from 'react';
import {
  CARD_W,
  HERO_EXISTING,
  INK,
  MUTED,
  REPORT_SHADOW,
  TONE,
  type Report,
  type ReportRow,
} from './reportData';

// Lark bot message re-typeset from the customer's reference screenshots. The
// emoji bullet set, field order and values are kept; the nickname and the
// summary tail were covered by that screenshot's player button, so those two
// pieces are shortened / rewritten.
export const REPORT_W = CARD_W;
export const REPORT_H = 748;

const FONT = '"Segoe UI", "Microsoft YaHei", sans-serif';
const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji"';

const Row: FC<{ icon: string; size?: number; children: ReactNode }> = ({ icon, size = 30, children }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minHeight: 40, color: INK }}>
    <span style={{ width: 38, flex: '0 0 38px', fontSize: size - 3, lineHeight: '40px', fontFamily: EMOJI }}>{icon}</span>
    <span style={{ fontSize: size, lineHeight: '40px', whiteSpace: 'nowrap' }}>{children}</span>
  </div>
);

const Label: FC<{ children: ReactNode }> = ({ children }) => (
  <b style={{ fontWeight: 700, letterSpacing: '0.01em' }}>{children}</b>
);

const Kv: FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <Row icon={icon}>
    <Label>{label}</Label>{` ${value}`}
  </Row>
);

const renderRow = (row: ReportRow, i: number): ReactNode => {
  switch (row.t) {
    case 'gap':
      return <div key={i} style={{ height: 18 }} />;
    case 'pair':
      return (
        <div key={i} style={{ display: 'flex', gap: 26 }}>
          <div style={{ flex: '0 0 326px' }}>
            <Kv {...row.a} />
          </div>
          <Kv {...row.b} />
        </div>
      );
    case 'kv':
      return <div key={i}><Kv icon={row.icon} label={row.label} value={row.value} /></div>;
    case 'txt':
      return (
        <div key={i}>
          <Row icon={row.icon}>{row.text}</Row>
        </div>
      );
    case 'src':
      return (
        <div key={i}>
          <Row icon={row.icon} size={28}>
            <Label>{row.label}</Label>
            <span style={{ fontSize: 25 }}> 🤖 </span>
            <Label>来源账号:</Label>{` ${row.value} `}
            <span style={{ fontSize: 23, color: MUTED }}>{row.note}</span>
          </Row>
        </div>
      );
    case 'heat':
      return (
        <div key={i}>
          <Row icon={row.icon}>
            <Label>{row.label}</Label> <b style={{ fontWeight: 700 }}>{row.value}</b>
          </Row>
        </div>
      );
    case 'sum':
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ width: 38, flex: '0 0 38px', fontSize: 27, lineHeight: '40px', fontFamily: EMOJI }}>
            {row.icon}
          </span>
          <div style={{ fontSize: 30, lineHeight: '40px' }}>
            <Label>{row.label}</Label>
            {row.text}
          </div>
        </div>
      );
    default:
      return null;
  }
};

type Props = {
  report?: Report;
  height?: number;
  shadow?: string;
};

export const LarkReportCard: FC<Props> = ({ report = HERO_EXISTING, height = REPORT_H, shadow = REPORT_SHADOW }) => {
  const tone = TONE[report.tone];
  return (
    <div
      style={{
        width: CARD_W,
        height,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#FFFFFF',
        fontFamily: FONT,
        color: INK,
        boxShadow: shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '23px 30px 21px',
          background: tone.headBg,
          borderBottom: `1px solid ${tone.headLine}`,
        }}
      >
        <span style={{ fontSize: 32, fontFamily: EMOJI, lineHeight: 1 }}>🎯</span>
        <span style={{ fontSize: 33, fontWeight: 700, color: tone.title, letterSpacing: '0.01em' }}>
          {`矩阵用户 ID 分析报告 - ${report.name} (${report.serial})`}
        </span>
      </div>

      <div style={{ padding: '22px 30px 0' }}>{report.rows.map(renderRow)}</div>
    </div>
  );
};
