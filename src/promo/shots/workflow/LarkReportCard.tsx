import type { FC, ReactNode } from 'react';
import { MaskedText } from '../../ui/MaskedText';
import {
  CARD_W,
  HERO_FULL,
  INK,
  MUTED,
  PANEL_PAD,
  PANEL_STRIP,
  PANEL_W,
  REPORT_SHADOW,
  TONE,
  metrics,
  panelMetrics,
  reportHeight,
  rowHeight,
  type Metrics,
  type Report,
  type ReportRow,
  type SectionSpan,
} from './reportData';

// Lark bot message re-typeset from the customer's reference screenshots. The
// emoji bullet set, field order and values are kept; the profile sections are
// transcribed from the complete card the user supplied on 2026-10-30.
export const REPORT_W = CARD_W;

const FONT = '"Segoe UI", "Microsoft YaHei", sans-serif';
const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji"';
const MONO = '"Cascadia Mono", "Consolas", monospace';

const Label: FC<{ children: ReactNode }> = ({ children }) => (
  <b style={{ fontWeight: 700, letterSpacing: '0.01em' }}>{children}</b>
);

const Row: FC<{ m: Metrics; icon: string; children: ReactNode }> = ({ m, icon, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 10 * (m.body / 30),
      minHeight: m.rowH,
      color: INK,
    }}
  >
    <span
      style={{
        width: 38 * (m.body / 30),
        flex: `0 0 ${38 * (m.body / 30)}px`,
        fontSize: m.body * 0.9,
        lineHeight: `${m.line}px`,
        fontFamily: EMOJI,
      }}
    >
      {icon}
    </span>
    <span style={{ fontSize: m.body, lineHeight: `${m.line}px`, whiteSpace: 'nowrap' }}>{children}</span>
  </div>
);

const Kv: FC<{ m: Metrics; icon: string; label: string; value: string }> = ({ m, icon, label, value }) => (
  <Row m={m} icon={icon}>
    <Label>
      <MaskedText text={label} />
    </Label>
    {` ${value}`}
  </Row>
);

const renderRow = (row: ReportRow, i: number, m: Metrics): ReactNode => {
  switch (row.t) {
    case 'gap':
      return <div key={i} style={{ height: m.gapH }} />;
    case 'pair':
      return (
        <div key={i} style={{ display: 'flex', gap: 26 * (m.body / 30) }}>
          <div style={{ flex: `0 0 ${326 * (m.body / 30)}px` }}>
            <Kv m={m} {...row.a} />
          </div>
          <Kv m={m} {...row.b} />
        </div>
      );
    case 'kv':
      return (
        <div key={i}>
          <Kv m={m} icon={row.icon} label={row.label} value={row.value} />
        </div>
      );
    case 'txt':
      return (
        <div key={i}>
          <Row m={m} icon={row.icon}>
            {row.text}
          </Row>
        </div>
      );
    case 'src':
      return (
        <div key={i}>
          <Row m={m} icon={row.icon}>
            <Label>{row.label}</Label>
            <span style={{ fontSize: m.body * 0.83 }}> 🤖 </span>
            <Label>来源账号:</Label>{` ${row.value} `}
            <span style={{ fontSize: m.body * 0.77, color: MUTED }}>{row.note}</span>
          </Row>
        </div>
      );
    case 'heat':
      return (
        <div key={i}>
          <Row m={m} icon={row.icon}>
            <Label>{row.label}</Label> <b style={{ fontWeight: 700 }}>{row.value}</b>
          </Row>
        </div>
      );
    case 'sum':
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 * (m.body / 30) }}>
          <span
            style={{
              width: 38 * (m.body / 30),
              flex: `0 0 ${38 * (m.body / 30)}px`,
              fontSize: m.body * 0.9,
              lineHeight: `${m.line}px`,
              fontFamily: EMOJI,
            }}
          >
            {row.icon}
          </span>
          <div style={{ fontSize: m.body, lineHeight: `${m.line}px` }}>
            <Label>{row.label}</Label>
            <MaskedText text={row.text} />
          </div>
        </div>
      );
    case 'section':
      return (
        <div
          key={i}
          style={{
            height: m.secH,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8 * (m.body / 30),
            paddingBottom: 8 * (m.body / 30),
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontFamily: EMOJI, fontSize: m.secFont * 0.95, lineHeight: 1 }}>{row.icon}</span>
          <span
            style={{
              fontSize: m.secFont,
              lineHeight: 1,
              fontWeight: 700,
              color: row.accent === 'green' ? '#1F7D33' : INK,
            }}
          >
            {row.title}
          </span>
        </div>
      );
    case 'bullet':
      return <BulletRow key={i} m={m} row={row} />;
    case 'note':
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 * (m.body / 30), height: m.line }}>
          <span style={{ fontFamily: EMOJI, fontSize: m.body * 0.9, lineHeight: `${m.line}px` }}>{row.icon}</span>
          <span style={{ fontSize: m.body, lineHeight: `${m.line}px`, whiteSpace: 'nowrap' }}>
            <Label>{row.label}</Label>
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: m.body * 0.84,
              lineHeight: `${m.line - 6}px`,
              padding: '0 8px',
              borderRadius: 5,
              background: '#F2F3F5',
              color: '#3D444D',
            }}
          >
            {`\`${row.code}\``}
          </span>
        </div>
      );
    default:
      return null;
  }
};

const BulletRow: FC<{ m: Metrics; row: Extract<ReportRow, { t: 'bullet' }> }> = ({ m, row }) => (
  <div style={{ display: 'flex', minHeight: rowHeight(row, m), color: INK }}>
    <span
      style={{
        width: m.bulletLead,
        flex: `0 0 ${m.bulletLead}px`,
        fontSize: m.body,
        lineHeight: `${m.line}px`,
      }}
    >
      •
    </span>
    <div style={{ flex: 1, fontSize: m.body, lineHeight: `${m.line}px` }}>
      {row.icon ? <span style={{ fontFamily: EMOJI }}>{row.icon} </span> : null}
      <Label>{row.label}</Label>
      {' '}
      <MaskedText text={row.text} />
    </div>
  </div>
);

type Props = {
  report?: Report;
  height?: number;
  shadow?: string;
};

export const LarkReportCard: FC<Props> = ({ report = HERO_FULL, height, shadow = REPORT_SHADOW }) => {
  const m = metrics(report.typeScale ?? 1);
  const h = height ?? reportHeight(report);
  const tone = TONE[report.tone];
  return (
    <div
      style={{
        width: CARD_W,
        height: h,
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
          height: m.headH,
          padding: `0 ${m.padX}px`,
          boxSizing: 'border-box',
          background: tone.headBg,
          borderBottom: `1px solid ${tone.headLine}`,
        }}
      >
        <span style={{ fontSize: m.headFont * 0.97, fontFamily: EMOJI, lineHeight: 1 }}>🎯</span>
        <span style={{ fontSize: m.headFont, fontWeight: 700, color: tone.title, letterSpacing: '0.01em' }}>
          {`矩阵用户 ID 分析报告 - ${report.name} (${report.serial})`}
        </span>
      </div>

      <div style={{ padding: `${m.padTop}px ${m.padX}px 0` }}>
        {report.rows.map((row, i) => renderRow(row, i, m))}
      </div>
      <div style={{ height: m.padBottom }} />
    </div>
  );
};

// One section lifted out of the complete card. Same rows, re-typeset wide and
// large enough to read while the card itself stays a whole document.
export const SectionPanel: FC<{
  report: Report;
  section: SectionSpan;
  width?: number;
  shadow?: string;
}> = ({ report, section, width = PANEL_W, shadow = '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)' }) => {
  const m = panelMetrics(width);
  const rows = report.rows.slice(section.from + 1, section.to + 1).filter((row) => row.t !== 'gap');
  return (
    <div
      style={{
        width,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#FFFFFF',
        fontFamily: FONT,
        color: INK,
        boxShadow: shadow,
      }}
    >
      <div
        style={{
          height: PANEL_STRIP,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: `0 ${m.padX}px`,
          boxSizing: 'border-box',
          background: '#F7F9FA',
          borderBottom: '1px solid #E9EDF1',
        }}
      >
        <span style={{ fontFamily: EMOJI, fontSize: 30, lineHeight: 1 }}>{section.icon}</span>
        <span
          style={{
            fontSize: m.secFont - 4,
            fontWeight: 700,
            color: section.accent === 'green' ? '#1F7D33' : INK,
            letterSpacing: '0.01em',
          }}
        >
          {section.title}
        </span>
      </div>
      <div style={{ padding: `${PANEL_PAD}px ${m.padX}px` }}>
        {rows.map((row, i) => renderRow(row, i, m))}
      </div>
    </div>
  );
};
