import type { CSSProperties, FC, ReactNode } from 'react';
import type { ProxyToast } from './data';
import { CheckGlyph } from './glyphs';
import { tol } from './tokens';

const PANEL_LEFT = tol.layout.sidebarWidth;
const PANEL_TOP = tol.layout.contentTop;
const PANEL_WIDTH = tol.layout.rightRailX - tol.layout.sidebarWidth;
const PANEL_HEIGHT = tol.layout.height - tol.layout.contentTop;

export const TOAST_LEFT = 509;
export const TOAST_TOP = 17;
export const TOAST_WIDTH = 342;
export const TOAST_HEIGHT = 46;
export const TOAST_PITCH = 68;

const SPINNER_SIZE = 50;
const SPINNER_RADIUS = 21;
const SPINNER_CENTER_Y = 465.5;
const SPINNER_ARC = 0.34;

const ToastIcon: FC<{ pop: number }> = ({ pop }) => (
  <div
    style={{
      position: 'absolute',
      left: 22,
      top: 14,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: tol.color.toastIcon,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${0.5 + 0.5 * pop})`,
    }}
  >
    <CheckGlyph size={11} />
  </div>
);

type ProxyToastCardProps = {
  toast: ProxyToast;
  checkPop?: number;
  style?: CSSProperties;
};

export const ProxyToastCard: FC<ProxyToastCardProps> = ({ toast, checkPop = 1, style }) => (
  <div
    style={{
      position: 'absolute',
      width: TOAST_WIDTH,
      height: TOAST_HEIGHT,
      borderRadius: 4,
      background: tol.color.toastBg,
      border: `1px solid ${tol.color.toastBorder}`,
      boxSizing: 'border-box',
      boxShadow: '0 2px 8px rgba(90, 160, 60, 0.10)',
      ...style,
    }}
  >
    <ToastIcon pop={checkPop} />
    <div
      style={{
        position: 'absolute',
        left: 47.5,
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontSize: 13,
        color: tol.color.toastText,
        whiteSpace: 'nowrap',
      }}
    >
      代理IP: {toast.ip} ({toast.region})
    </div>
  </div>
);

export const StaticToastStack: FC<{ toasts: ProxyToast[] }> = ({ toasts }) => (
  <>
    {toasts.map((toast, index) => (
      <ProxyToastCard
        key={`${index}-${toast.ip}`}
        toast={toast}
        style={{ left: TOAST_LEFT, top: TOAST_TOP + index * TOAST_PITCH }}
      />
    ))}
  </>
);

export type ToastFeedItem = {
  key: string;
  toast: ProxyToast;
  top: number;
  reveal: number;
  pop: number;
};

export const ToastFeed: FC<{ items: ToastFeedItem[]; backingOpacity?: number; cardFade?: number }> = ({
  items,
  backingOpacity = 1,
  cardFade = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: TOAST_LEFT - 10,
      top: TOAST_TOP,
      width: TOAST_WIDTH + 20,
      bottom: 0,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: tol.color.pageBg,
        opacity: backingOpacity,
      }}
    />
    {items.map((item) => (
      <ProxyToastCard
        key={item.key}
        toast={item.toast}
        checkPop={item.pop}
        style={{
          left: 10,
          top: item.top,
          opacity: item.reveal * cardFade,
          transform: `scale(${0.98 + 0.02 * item.reveal})`,
          transformOrigin: '50% 0%',
        }}
      />
    ))}
  </div>
);

type ConnectionPanelProps = {
  children?: ReactNode;
  textReveal?: number;
  spinnerAngle?: number;
};

export const ConnectionPanel: FC<ConnectionPanelProps> = ({
  children,
  textReveal = 1,
  spinnerAngle = 0,
}) => {
  const circumference = 2 * Math.PI * SPINNER_RADIUS;

  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL_LEFT,
        top: PANEL_TOP,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        background: tol.color.pageBg,
        overflow: 'hidden',
      }}
    >
      <svg
        width={SPINNER_SIZE}
        height={SPINNER_SIZE}
        viewBox={`0 0 ${SPINNER_SIZE} ${SPINNER_SIZE}`}
        style={{
          position: 'absolute',
          left: PANEL_WIDTH / 2 - SPINNER_SIZE / 2,
          top: SPINNER_CENTER_Y - SPINNER_SIZE / 2,
          transform: `rotate(${spinnerAngle}deg)`,
        }}
      >
        <circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={SPINNER_RADIUS}
          fill="none"
          stroke={tol.color.loadingTrack}
          strokeWidth={4}
        />
        <circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={SPINNER_RADIUS}
          fill="none"
          stroke={tol.color.loadingBlue}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${circumference * SPINNER_ARC} ${circumference * (1 - SPINNER_ARC)}`}
          transform={`rotate(-75 ${SPINNER_SIZE / 2} ${SPINNER_SIZE / 2})`}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: SPINNER_CENTER_Y + 47,
          width: '100%',
          textAlign: 'center',
          fontSize: 16,
          lineHeight: '22px',
          color: tol.color.textBody,
          opacity: textReveal,
        }}
      >
        正在加载中...
      </div>

      {children}
    </div>
  );
};
