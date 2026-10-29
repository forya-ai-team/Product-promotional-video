import type { FC, ReactNode } from 'react';
import { S06_SCRIPT } from './s06Data';
import { tol } from './tokens';

const PANEL_W = 310;
const PAD_L = 26;
const PAD_R = 12;
const CONTROL_H = 30;

const STEPPER_BORDER = '#DCDFE6';
const DIVIDER = '#ECECEC';
const LABEL = '#303133';
const VALUE = '#606266';
const MUTED = '#909399';

const PanelLabel: FC<{ top: number; strong?: boolean; color?: string; children: ReactNode }> = ({
  top,
  strong = true,
  color = LABEL,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: PAD_L,
      top,
      fontSize: 13,
      lineHeight: '17px',
      fontWeight: strong ? 600 : 400,
      color,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const DividerLine: FC<{ left: number }> = ({ left }) => (
  <div style={{ position: 'absolute', left, top: 1, width: 1, height: CONTROL_H - 2, background: DIVIDER }} />
);

const Stepper: FC<{ left: number; top: number; width: number; value: string; cell?: number }> = ({
  left,
  top,
  width,
  value,
  cell = 30,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      height: CONTROL_H,
      boxSizing: 'border-box',
      border: `1px solid ${STEPPER_BORDER}`,
      borderRadius: 4,
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        width: cell,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: MUTED,
        fontSize: 15,
        lineHeight: '18px',
      }}
    >
      −
    </div>
    <DividerLine left={cell} />
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        color: LABEL,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    <DividerLine left={width - cell - 1} />
    <div
      style={{
        width: cell,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: MUTED,
        fontSize: 15,
        lineHeight: '18px',
      }}
    >
      +
    </div>
  </div>
);

const Select: FC<{ left: number; top: number; width: number; value: string }> = ({
  left,
  top,
  width,
  value,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      height: 34,
      boxSizing: 'border-box',
      border: `1px solid ${STEPPER_BORDER}`,
      borderRadius: 4,
      background: '#FFFFFF',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 12,
        top: 7,
        fontSize: 13,
        lineHeight: '18px',
        color: VALUE,
      }}
    >
      {value}
    </div>
    <svg width={10} height={10} viewBox="0 0 10 10" style={{ position: 'absolute', right: 11, top: 11 }}>
      <path d="M2.2 3.7 5 6.5l2.8-2.8" fill="none" stroke="#A8ABB2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ScriptButton: FC<{ left: number; top: number; label: string; bg: string }> = ({
  left,
  top,
  label,
  bg,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 48,
      height: CONTROL_H,
      borderRadius: 4,
      background: bg,
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: `${CONTROL_H}px`,
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

const Unchecked: FC<{ left: number; top: number; label: string }> = ({ left, top, label }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: 16,
        height: 16,
        boxSizing: 'border-box',
        border: `1px solid ${STEPPER_BORDER}`,
        borderRadius: 2,
        background: '#FFFFFF',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: left + 24,
        top: top - 1,
        fontSize: 13,
        lineHeight: '18px',
        color: LABEL,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  </>
);

const CloseGlyph: FC = () => (
  <svg width={18} height={18} viewBox="0 0 18 18" style={{ position: 'absolute', right: 20, top: 39 }}>
    <path
      d="M2.6 2.6 15.4 15.4 M15.4 2.6 2.6 15.4"
      stroke="#B3B6BB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type TKScriptPanelProps = {
  width?: number;
  height?: number;
};

export const TKScriptPanel: FC<TKScriptPanelProps> = ({ width = PANEL_W, height = 884 }) => (
  <div
    style={{
      position: 'absolute',
      left: 1920 - width,
      top: 48,
      width,
      height,
      background: '#FFFFFF',
      fontFamily: tol.fontFamily,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: PAD_L,
        top: 36,
        fontSize: 20,
        lineHeight: '26px',
        fontWeight: 600,
        color: LABEL,
      }}
    >
      TK脚本
    </div>
    <CloseGlyph />

    <PanelLabel top={108}>手动激活请求用户(每天数量,今天已清理 0)</PanelLabel>
    <Stepper left={PAD_L} top={134} width={142} value={S06_SCRIPT.manualCount} />
    <ScriptButton left={191} top={134} label="激活" bg="#419EFE" />
    <ScriptButton left={252} top={134} label="停止" bg="#F46C6C" />

    <div style={{ position: 'absolute', left: PAD_L, top: 190, fontSize: 13, lineHeight: '17px', color: LABEL }}>
      <div>激活间隔</div>
      <div>(秒)</div>
    </div>
    <Stepper left={104} top={194} width={78} value={S06_SCRIPT.intervalFrom} cell={22} />
    <div
      style={{
        position: 'absolute',
        left: 188,
        top: 200,
        width: 14,
        textAlign: 'center',
        fontSize: 13,
        lineHeight: '18px',
        color: LABEL,
      }}
    >
      至
    </div>
    <Stepper left={206} top={194} width={78} value={S06_SCRIPT.intervalTo} cell={22} />

    <PanelLabel top={269}>自动激活请求用户</PanelLabel>
    <Select left={width - PAD_R - 100} top={259} width={100} value={S06_SCRIPT.autoActivate} />

    <PanelLabel top={327}>每日激活用户数</PanelLabel>
    <Stepper left={width - PAD_R - 132} top={315} width={132} value={S06_SCRIPT.dailyLimit} />

    <PanelLabel top={394} color="#23418F">删除历史会话</PanelLabel>
    <Select left={width - PAD_R - 100} top={384} width={100} value={S06_SCRIPT.deleteHistory} />

    <Stepper left={PAD_L} top={442} width={132} value={S06_SCRIPT.idleHours} />
    <div
      style={{
        position: 'absolute',
        left: 168,
        top: 449,
        fontSize: 13,
        lineHeight: '18px',
        color: LABEL,
      }}
    >
      小时无回复
    </div>

    <Unchecked left={PAD_L} top={500} label="无效用户" />
    <Unchecked left={168} top={500} label="AI工作流已完成" />
  </div>
);
