import type { FC, ReactNode } from 'react';
import { ImportGlyph, PlusGlyph, SendGlyph } from './glyphs';
import { REFERENCE_ROWS, type ConfigRow } from './data';
import { Checkbox } from './Checkbox';
import { tol } from './tokens';

type ToolbarButtonProps = {
  width: number;
  background: string;
  glow?: number;
  press?: number;
  children: ReactNode;
};

const ToolbarButton: FC<ToolbarButtonProps> = ({
  width,
  background,
  glow = 0,
  press = 0,
  children,
}) => (
  <div
    style={{
      width,
      height: 30,
      borderRadius: 4,
      background,
      color: '#FFFFFF',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingBottom: 2,
      boxSizing: 'border-box',
      filter: glow > 0.001 ? `brightness(${1 + 0.07 * glow})` : undefined,
      boxShadow:
        glow > 0.001 ? `0 ${3 * glow}px ${12 * glow}px rgba(0, 0, 0, ${0.22 * glow})` : undefined,
      transform: press > 0.001 ? `scale(${1 - 0.035 * press})` : undefined,
    }}
  >
    {children}
  </div>
);

const TOOLBAR_GAP = 14;
const TOOLBAR_BUTTON_HEIGHT = 30;
const TOOLBAR_WIDTH = {
  newConfig: 100,
  batchDelete: 112,
  import: 78,
  launch: 130,
  template: 99,
} as const;

// 批量启动 is second from the right; click target for S03.
export const LAUNCH_BUTTON_CENTER = {
  x:
    tol.layout.width -
    tol.layout.toolbarRight -
    TOOLBAR_WIDTH.template -
    TOOLBAR_GAP -
    TOOLBAR_WIDTH.launch / 2,
  y: tol.layout.stageTop + tol.layout.toolbarTop + TOOLBAR_BUTTON_HEIGHT / 2,
} as const;

const ActionButtons: FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 902,
      top: 10.5,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      gap: 11,
    }}
  >
    <div
      style={{
        width: 82,
        height: 22,
        marginRight: 2.5,
        borderRadius: 3,
        background: tol.color.primary,
        color: '#FFFFFF',
        fontSize: 11.5,
        paddingBottom: 1,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      启动浏览器
    </div>
    {['编辑', '复制'].map((label) => (
      <div
        key={label}
        style={{
          width: 49,
          height: 22,
          borderRadius: 3,
          background: 'transparent',
          border: `1px solid ${tol.color.buttonBorder}`,
          color: tol.color.textBody,
          fontSize: 11.5,
          paddingBottom: 1,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label}
      </div>
    ))}
    <div
      style={{
        width: 49.5,
        height: 22,
        borderRadius: 3,
        background: tol.color.danger,
        color: '#FFFFFF',
        fontSize: 11.5,
        paddingBottom: 1,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      删除
    </div>
  </div>
);

const Row: FC<{ row: ConfigRow; reveal: number; glow: number }> = ({ row, reveal, glow }) => (
  <div style={{ position: 'relative', height: tol.layout.rowHeight, opacity: reveal }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateY(${(1 - reveal) * -10}px)`,
      }}
    >
      <Checkbox left={14} top={14.5} />
      <div
        style={{
          position: 'absolute',
          left: 69,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          transform: 'translateY(-1.75px)',
          fontSize: 14,
          color: tol.color.textBody,
        }}
      >
        {row.name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 268.5,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          transform: 'translateY(0.25px)',
          fontSize: 14,
          color: tol.color.textBody,
        }}
      >
        {row.ip} - {row.port}
      </div>
      <ActionButtons />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 1.5,
        background: tol.color.rowLine,
      }}
    />
    {glow > 0.001 ? (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: glow,
          boxShadow:
            'inset 0 0 0 1px rgba(110, 190, 255, 0.72), inset 0 0 18px rgba(68, 162, 255, 0.10)',
          background:
            'linear-gradient(90deg, rgba(68, 162, 255, 0.04) 0%, rgba(68, 162, 255, 0.008) 100%)',
        }}
      />
    ) : null}
  </div>
);

const Scrollbar: FC<{ opacity: number; thumbHeight: number; progress: number }> = ({
  opacity,
  thumbHeight,
  progress,
}) => {
  const travel = tol.layout.height - tol.layout.tableTop - 35 - thumbHeight;
  return (
  <div
    style={{
      position: 'absolute',
      left: 1522,
      top: 0,
      bottom: 0,
      width: 14,
      zIndex: 3,
      opacity,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 3,
        top: 7,
        width: 9,
        height: 7,
        background: tol.color.scrollbar,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 2.5,
        top: 17.5 + progress * travel,
        width: 10,
        height: thumbHeight,
        borderRadius: 5,
        background: tol.color.scrollbar,
      }}
    />
  </div>
  );
};

type MainAreaProps = {
  rows?: ConfigRow[];
  rowReveal?: (index: number) => number;
  scrollOffset?: number;
  scrollProgress?: number;
  rowGlow?: number;
  scrollbarOpacity?: number;
  scrollbarThumbHeight?: number;
  count?: number;
  headerChecked?: boolean;
  launchFeedback?: { glow: number; press: number };
};

const alwaysOne = () => 1;

export const MainArea: FC<MainAreaProps> = ({
  rows = REFERENCE_ROWS,
  rowReveal = alwaysOne,
  scrollOffset = 0,
  scrollProgress = 0,
  rowGlow = 0,
  scrollbarOpacity = 1,
  scrollbarThumbHeight = 625,
  count = 30,
  headerChecked = true,
  launchFeedback,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: tol.layout.sidebarWidth,
        top: 0,
        width: tol.layout.rightRailX - tol.layout.sidebarWidth,
        height: tol.layout.height,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 21,
          top: 71,
          fontSize: 24,
          lineHeight: '32px',
          fontWeight: 600,
          color: tol.color.textStrong,
        }}
      >
        指纹浏览器配置
      </div>

      <div
        style={{
          position: 'absolute',
          right: 21,
          top: tol.layout.toolbarTop,
          display: 'flex',
          gap: TOOLBAR_GAP,
        }}
      >
        <ToolbarButton width={TOOLBAR_WIDTH.newConfig} background={tol.color.primary}>
          <PlusGlyph size={10} />
          <span>新建配置</span>
        </ToolbarButton>
        <ToolbarButton width={TOOLBAR_WIDTH.batchDelete} background={tol.color.danger}>
          <span>批量删除({count})</span>
        </ToolbarButton>
        <ToolbarButton width={TOOLBAR_WIDTH.import} background={tol.color.success}>
          <ImportGlyph />
          <span>导入</span>
        </ToolbarButton>
        <ToolbarButton
          width={TOOLBAR_WIDTH.launch}
          background={tol.color.warning}
          glow={launchFeedback?.glow}
          press={launchFeedback?.press}
        >
          <SendGlyph />
          <span>批量启动({count})</span>
        </ToolbarButton>
        <ToolbarButton width={TOOLBAR_WIDTH.template} background={tol.color.neutral}>
          <span>Tolink模板</span>
        </ToolbarButton>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 20,
          top: tol.layout.tableTop,
          width: tol.layout.tableWidth,
          height: tol.layout.height - tol.layout.tableTop,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', height: tol.layout.headerHeight }}>
          <Checkbox left={14} top={16} checked={headerChecked} />
          {[
            { label: '配置名称', left: 69 },
            { label: 'VPN', left: 268.5 },
            { label: '操作', left: 902 },
          ].map((cell) => (
            <div
              key={cell.label}
              style={{
                position: 'absolute',
                left: cell.left,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                transform: 'translateY(-1px)',
                fontSize: 14,
                color: tol.color.textMuted,
              }}
            >
              {cell.label}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 1.5,
              background: tol.color.rowLine,
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: tol.layout.headerHeight,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ transform: `translateY(${-scrollOffset}px)` }}>
            {rows.map((row, index) => (
              <Row
                key={`${row.name}-${index}`}
                row={row}
                reveal={rowReveal(index)}
                glow={rowGlow}
              />
            ))}
          </div>
        </div>

        <Scrollbar
          opacity={scrollbarOpacity}
          thumbHeight={scrollbarThumbHeight}
          progress={scrollProgress}
        />
      </div>
    </div>
  );
};
