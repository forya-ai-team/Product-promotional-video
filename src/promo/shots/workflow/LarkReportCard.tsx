import type { FC, ReactNode } from 'react';

// Lark bot message re-typeset from the customer's reference screenshot
// (screenshot/…/bd2a9e35…png). The emoji bullet set, field order and values are
// kept; the nickname and the summary tail were covered by that screenshot's
// player button, so those two pieces are shortened / rewritten.
export const REPORT_W = 838;
export const REPORT_H = 748;

const FONT = '"Segoe UI", "Microsoft YaHei", sans-serif';
const INK = '#1D2129';
const MUTED = '#8A9099';
const RED = '#C0271E';
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

export const LarkReportCard: FC = () => (
  <div
    style={{
      width: REPORT_W,
      height: REPORT_H,
      borderRadius: 16,
      overflow: 'hidden',
      background: '#FFFFFF',
      fontFamily: FONT,
      color: INK,
      boxShadow: '0 44px 130px rgba(0,0,0,0.62), 0 0 0 1px rgba(0,0,0,0.06)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '23px 30px 21px',
        background: '#FCEDEA',
        borderBottom: '1px solid #F3D8D3',
      }}
    >
      <span style={{ fontSize: 32, fontFamily: EMOJI, lineHeight: 1 }}>🎯</span>
      <span style={{ fontSize: 33, fontWeight: 700, color: RED, letterSpacing: '0.01em' }}>
        矩阵用户 ID 分析报告 - salmon (8375)
      </span>
    </div>

    <div style={{ padding: '22px 30px 0' }}>
      <div style={{ display: 'flex', gap: 26 }}>
        <div style={{ flex: '0 0 326px' }}>
          <Row icon="📱">
            <Label>Oumi ID:</Label> 2194615
          </Row>
        </div>
        <Row icon="💎">
          <Label>TikTok等级:</Label> 未识别
        </Row>
      </div>
      <Row icon="👤">
        <Label>Tk昵称:</Label> Wisdom prego
      </Row>
      <Row icon="💻">
        <Label>设备型号:</Label> App Store/iPhone SE (3rd generation)
      </Row>
      <Row icon="⏰">
        <Label>收集时间:</Label> 2026/10/28 13:54:33
      </Row>

      <div style={{ height: 18 }} />
      <Row icon="🚫">
        <Label>撞单警告:</Label> 已存在的老用户
      </Row>
      <Row icon="👤">
        <Label>归属运营:</Label> carter
      </Row>
      <Row icon="💰">
        <Label>累计充值:</Label> $170.96
      </Row>
      <Row icon="🗓">
        <Label>注册时间:</Label> 2026/04/21 13:45:38
      </Row>
      <Row icon="🔗">
        <Label>邀请码:</Label> 5278
      </Row>
      <Row icon="📋" size={28}>
        <Label>用户画像分析报告</Label>
        <span style={{ fontSize: 25 }}> 🤖 </span>
        <Label>来源账号:</Label> Karri <span style={{ fontSize: 23, color: MUTED }}>(未在映射表中找到)</span>
      </Row>

      <div style={{ height: 18 }} />
      <Row icon="🔥">
        <Label>客户热度:</Label> <b style={{ fontWeight: 700 }}>8/10</b>
      </Row>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ width: 38, flex: '0 0 38px', fontSize: 27, lineHeight: '40px', fontFamily: EMOJI }}>📝</span>
        <div style={{ fontSize: 30, lineHeight: '40px' }}>
          <Label>画像摘要:</Label>
          一位来自尼日利亚、从事手工制作工作的单身用户，沟通简短直接，愿意为继续联系而下载 Oumi 并注册，交友意图较强。
        </div>
      </div>
    </div>
  </div>
);
