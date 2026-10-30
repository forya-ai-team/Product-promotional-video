import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { BigCursor } from '../ui/tolink/BigCursor';
import { CONFIG_ROWS } from '../ui/tolink/data';
import { LAUNCH_BUTTON_RIGHT, LAUNCH_BUTTON_CENTER, type RowMotion } from '../ui/tolink/MainArea';
import { Stage } from '../ui/tolink/Stage';
import { TolinkDesktop } from '../ui/tolink/TolinkDesktop';
import { tol } from '../ui/tolink/tokens';
import { S03_LEAD } from '../timeline';

const WINDOW_TOP = tol.layout.stageTop;
const CARD = { x: 172.5, y: 309.5 };
const LAUNCH = LAUNCH_BUTTON_CENTER;

// Pointer travel runs 1.25x its old pace (34f -> 27f, 48f -> 38f); every beat
// downstream keeps its own duration and shifts earlier with it. That, not any
// retimed beat, is what shortens the shot.
const CURSOR_SPEEDUP = 1.25;
const CURSOR_START = 24;
const CURSOR_END = CURSOR_START + Math.round(34 / CURSOR_SPEEDUP); // 51
const PRESS_START = CURSOR_END + 2; // 53
const CLICK_FRAME = PRESS_START + 4; // 57
const RIPPLE_DURATION = 44;
const PUSH_START = CLICK_FRAME + 24; // 81
const PUSH_END = PUSH_START + 44; // 125
const HOLD_END = PUSH_END + 24; // 149
// scroll-brake-moves A: sprint with sin-in, overshoot 34px past the end, then
// eight frames of rebound. The end offset is unchanged.
const SCROLL_START = HOLD_END; // 149
const SCROLL_SPRINT_END = SCROLL_START + 62; // 211
const SCROLL_BRAKE_END = SCROLL_SPRINT_END + 28; // 239
const SCROLL_SETTLE_END = SCROLL_BRAKE_END + 8; // 247
const SCROLL_SHORTFALL = 520;
const SCROLL_OVERSHOOT = 34;
// The crane starts six frames before the overshoot peak, so the pull-out
// begins while the list is still decelerating and reads as its reaction.
const CRANE_START = SCROLL_START + 84; // 233
const CRANE_END = CRANE_START + 82; // 315

// The pointer waits for the crane to settle, then crosses the window to the
// toolbar so it never rides the camera transform.
const MOVE2_START = CRANE_END + 8; // 323
const MOVE2_END = MOVE2_START + Math.round(48 / CURSOR_SPEEDUP); // 361
const MOVE2_CONTROL = { x: 620, y: 150 };
const PRESS2_START = MOVE2_END + 12; // 373
const CLICK2_FRAME = PRESS2_START + 4; // 377

const FOCUS_START = { x: 530, y: 330 };
const FOCUS_END = { x: 960, y: 540 };
const SCALE_START = 3.6;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const cursorEase = Easing.bezier(0.3, 0, 0.25, 1);
const pushEase = Easing.bezier(0.4, 0, 0.2, 1);
const craneEase = Easing.bezier(0.2, 0, 0.25, 1);

const cursorAt = (frame: number) => {
  if (frame < MOVE2_START) {
    const p = cursorEase(clamp01((frame - CURSOR_START) / (CURSOR_END - CURSOR_START)));
    const q = 1 - p;
    return {
      x: q * q * 1320 + 2 * q * p * 720 + p * p * CARD.x,
      y: q * q * 800 + 2 * q * p * 640 + p * p * CARD.y,
    };
  }

  const p = cursorEase(clamp01((frame - MOVE2_START) / (MOVE2_END - MOVE2_START)));
  const q = 1 - p;
  return {
    x: q * q * CARD.x + 2 * q * p * MOVE2_CONTROL.x + p * p * LAUNCH.x,
    y: q * q * CARD.y + 2 * q * p * MOVE2_CONTROL.y + p * p * LAUNCH.y,
  };
};

const pressAt = (frame: number, pressStart: number, clickFrame: number) => {
  const pressIn = Easing.out(Easing.cubic)(clamp01((frame - pressStart) / 3));
  const pressOut = Easing.inOut(Easing.sin)(clamp01((frame - (clickFrame + 1)) / 5));
  return pressIn * (1 - pressOut);
};

const hoverAt = (
  frame: number,
  cursor: { x: number; y: number },
  target: { x: number; y: number },
  clickFrame: number,
) => {
  const raw = 1 - Easing.inOut(Easing.sin)(clamp01((dist(cursor, target) - 45) / 130));
  return frame < clickFrame ? raw : raw * (1 - clamp01((frame - clickFrame) / 20));
};

const cameraAt = (frame: number) => {
  let s = 1;
  let fx = FOCUS_END.x;
  let fy = FOCUS_END.y;

  if (frame >= PUSH_START && frame < PUSH_END) {
    const p = pushEase(clamp01((frame - PUSH_START) / (PUSH_END - PUSH_START)));
    s = mix(1, SCALE_START, p);
    fx = mix(FOCUS_END.x, FOCUS_START.x, p);
    fy = mix(FOCUS_END.y, FOCUS_START.y, p);
  } else if (frame >= PUSH_END && frame < HOLD_END) {
    const breath = Easing.inOut(Easing.sin)(
      clamp01((frame - PUSH_END) / (HOLD_END - PUSH_END)),
    );
    s = SCALE_START * (1 + 0.015 * breath);
    fx = FOCUS_START.x;
    fy = FOCUS_START.y;
  } else if (frame >= HOLD_END && frame < CRANE_START) {
    s = SCALE_START * 1.015;
    fx = FOCUS_START.x;
    fy = FOCUS_START.y;
  } else if (frame >= CRANE_START) {
    const p = craneEase(clamp01((frame - CRANE_START) / (CRANE_END - CRANE_START)));
    s = mix(SCALE_START * 1.015, 1, p);
    fx = mix(FOCUS_START.x, FOCUS_END.x, p);
    fy = mix(FOCUS_START.y, FOCUS_END.y, p);
  }

  return {
    s,
    fx,
    fy,
    tx: 960 - fx * s,
    ty: 540 - fy * s,
    visTop: fy - 540 / s,
  };
};

// 18 rows are inside the viewport; their landing schedule accelerates as it
// travels down. Each row is in the air for 10f before it lands (row-embed).
const VISIBLE_ROWS = 18;
const LOAD_START = CLICK_FRAME + 12; // 69
const LOAD_SPAN = 36;
const ROW_FLIGHT = 10;
const ROW_FLY_EASE = Easing.bezier(0.5, 0, 0.8, 0.75);

const rowLandAt = (index: number) =>
  LOAD_START +
  LOAD_SPAN * (1 - Math.pow(1 - Math.min(1, index / (VISIBLE_ROWS - 1)), 2.2));

const rowAirAt = (frame: number, index: number) => {
  if (index >= VISIBLE_ROWS) return 0;
  const start = rowLandAt(index) - ROW_FLIGHT;
  return 1 - ROW_FLY_EASE(clamp01((frame - start) / ROW_FLIGHT));
};

const rowMotionAt = (frame: number) => (index: number): RowMotion => {
  if (index >= VISIBLE_ROWS) {
    return {
      reveal: frame >= LOAD_START + LOAD_SPAN + 8 ? 1 : 0,
      air: 0,
      settle: 1,
      blur: 0,
    };
  }

  const land = rowLandAt(index);
  const start = land - ROW_FLIGHT;
  const age = frame - land;
  const air = rowAirAt(frame, index);
  const reveal = Easing.out(Easing.cubic)(clamp01((frame - start) / 4));
  const settle = Easing.out(Easing.quad)(clamp01(age / 4));
  const velocity = rowAirAt(frame - 0.5, index) - rowAirAt(frame + 0.5, index);
  const blur = age < 0 ? Math.min(1.2, 120 * velocity * 0.1) : 0;

  return { reveal, air, settle, blur };
};

const TABLE_BODY_HEIGHT =
  tol.layout.height - tol.layout.tableTop - tol.layout.headerHeight;
const MAX_SCROLL = 90 * tol.layout.rowHeight - TABLE_BODY_HEIGHT;

const scrollAt = (frame: number) => {
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  if (frame <= SCROLL_START) return 0;
  if (frame <= SCROLL_SPRINT_END) {
    return interpolate(
      frame,
      [SCROLL_START, SCROLL_SPRINT_END],
      [0, MAX_SCROLL - SCROLL_SHORTFALL],
      { ...clamp, easing: Easing.in(Easing.sin) },
    );
  }
  if (frame <= SCROLL_BRAKE_END) {
    return interpolate(
      frame,
      [SCROLL_SPRINT_END, SCROLL_BRAKE_END],
      [MAX_SCROLL - SCROLL_SHORTFALL, MAX_SCROLL + SCROLL_OVERSHOOT],
      { ...clamp, easing: Easing.out(Easing.cubic) },
    );
  }
  return interpolate(
    frame,
    [SCROLL_BRAKE_END, SCROLL_SETTLE_END],
    [MAX_SCROLL + SCROLL_OVERSHOOT, MAX_SCROLL],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );
};

// The tag sits above 批量启动 inside the camera layer, so the 3.6x push carries
// it off-frame on its own and no fade schedule is needed. The 55px offset is
// 44 (tag) + 9 (leader) + 2 (air above the button).
const NOTE_TOP = tol.layout.stageTop + tol.layout.toolbarTop - 55;
const NOTE_HEIGHT = 44;

const DemoNote: FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        right: tol.layout.width - LAUNCH_BUTTON_RIGHT,
        top: NOTE_TOP,
        height: NOTE_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        borderRadius: 6,
        boxSizing: 'border-box',
        background: tol.color.noteBg,
        border: `1.5px solid ${tol.color.noteLine}`,
        color: tol.color.noteText,
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          flex: 'none',
          background: tol.color.warning,
        }}
      />
      <span>真实案例（部分演示）</span>
    </div>
    <div
      style={{
        position: 'absolute',
        left: LAUNCH.x - 1,
        top: NOTE_TOP + NOTE_HEIGHT,
        width: 2,
        height: 9,
        background: tol.color.noteLine,
      }}
    />
  </>
);

const AppClip: FC<{ children: ReactNode; zIndex: number }> = ({ children, zIndex }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: WINDOW_TOP,
      width: tol.layout.width,
      height: tol.layout.height,
      overflow: 'hidden',
      zIndex,
      pointerEvents: 'none',
    }}
  >
    {children}
  </div>
);

type ClickBurstProps = {
  frame: number;
  center: { x: number; y: number };
  clickFrame: number;
};

const ClickBurst: FC<ClickBurstProps> = ({ frame, center, clickFrame }) => {
  if (frame < clickFrame) return null;

  const age = frame - clickFrame;
  const rings = [0, 10, 20].map((delay, index) => {
    const p = clamp01((frame - clickFrame - delay) / RIPPLE_DURATION);
    const radius = 24 + 820 * p;
    const opacity = (0.82 - index * 0.16) * Math.pow(1 - p, 0.9);
    return { radius, opacity, delay };
  });
  const washP = clamp01(age / (RIPPLE_DURATION + 18));
  const washR = 900 * washP;
  const flashP = clamp01(age / 16);

  return (
    <AppClip zIndex={40}>
      {washP < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: center.x - washR,
            top: center.y - WINDOW_TOP - washR,
            width: washR * 2,
            height: washR * 2,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(68,162,255,0.16) 0%, rgba(68,162,255,0.06) 58%, rgba(68,162,255,0) 74%)',
            opacity: 0.95 * (1 - washP),
          }}
        />
      ) : null}
      {rings.map((ring) =>
        frame < clickFrame + ring.delay || ring.opacity <= 0.003 ? null : (
          <div
            key={ring.delay}
            style={{
              position: 'absolute',
              left: center.x - ring.radius,
              top: center.y - WINDOW_TOP - ring.radius,
              width: ring.radius * 2,
              height: ring.radius * 2,
              borderRadius: '50%',
              border: `4px solid rgba(92, 182, 255, ${ring.opacity.toFixed(3)})`,
              boxShadow: `0 0 22px rgba(68, 162, 255, ${(ring.opacity * 0.8).toFixed(3)}), 0 0 70px rgba(68, 162, 255, ${(ring.opacity * 0.42).toFixed(3)})`,
            }}
          />
        ),
      )}
      {flashP < 1 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: center.x - 48 * flashP - 48,
              top: center.y - WINDOW_TOP - 48 * flashP - 48,
              width: (48 + 48 * flashP) * 2,
              height: (48 + 48 * flashP) * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,255,255,${0.34 * (1 - flashP)}) 0%, rgba(68,162,255,${0.12 * (1 - flashP)}) 45%, rgba(68,162,255,0) 70%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: center.x - 20 - 52 * flashP,
              top: center.y - WINDOW_TOP - 20 - 52 * flashP,
              width: (20 + 52 * flashP) * 2,
              height: (20 + 52 * flashP) * 2,
              borderRadius: '50%',
              border: `4px solid rgba(255, 255, 255, ${0.85 * (1 - flashP)})`,
              boxShadow: `0 0 20px rgba(255, 255, 255, ${0.35 * (1 - flashP)})`,
            }}
          />
        </>
      ) : null}
    </AppClip>
  );
};

export const S03: FC = () => {
  // Negative frames during the lead clamp to the shot's frame-0 state, which is
  // what the portal-wipe lands on.
  const frame = useCurrentFrame() - S03_LEAD;
  const camera = cameraAt(frame);
  const cursor = cursorAt(frame);

  const press = pressAt(frame, PRESS_START, CLICK_FRAME);
  const press2 = pressAt(frame, PRESS2_START, CLICK2_FRAME);
  const glow = hoverAt(frame, cursor, CARD, CLICK_FRAME);
  const launchGlow = hoverAt(frame, cursor, LAUNCH, CLICK2_FRAME);

  const scrollOffset = scrollAt(frame);
  const scrollProgress = Math.min(1, scrollOffset / MAX_SCROLL);
  const rowMotion = rowMotionAt(frame);
  // The row wash hands over to the brake at SCROLL_BRAKE_END so the landed
  // bottom rows are clean when the crane reveals them.
  const rowGlow =
    0.75 *
    clamp01((frame - (SCROLL_START - 6)) / 12) *
    (1 - clamp01((frame - SCROLL_BRAKE_END) / 16));
  const count = Math.round(90 * Math.pow(clamp01((frame - LOAD_START) / LOAD_SPAN), 1.5));
  const headerChecked = frame >= LOAD_START + LOAD_SPAN;
  const scrollbarOpacity = Easing.out(Easing.cubic)(clamp01((frame - (LOAD_START + 28)) / 18));

  return (
    <Stage>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            width: tol.layout.width,
            height: tol.layout.stageHeight,
            transformOrigin: '0 0',
            transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.s})`,
          }}
        >
          <TolinkDesktop
            cardFeedback={{ glow, press }}
            rows={CONFIG_ROWS}
            rowMotion={rowMotion}
            scrollOffset={scrollOffset}
            scrollProgress={scrollProgress}
            rowGlow={rowGlow}
            scrollbarOpacity={scrollbarOpacity}
            scrollbarThumbHeight={160}
            count={count}
            headerChecked={headerChecked}
            launchFeedback={{ glow: launchGlow, press: press2 }}
            elevation={frame < CRANE_START ? 0.6 : mix(0.6, 1, craneEase(clamp01((frame - CRANE_START) / (CRANE_END - CRANE_START))))}
            cursor={false}
          />
          <DemoNote />
          <ClickBurst frame={frame} center={CARD} clickFrame={CLICK_FRAME} />
          <ClickBurst frame={frame} center={LAUNCH} clickFrame={CLICK2_FRAME} />
          <BigCursor x={cursor.x} y={cursor.y} scale={1 - 0.12 * (press + press2)} />
        </div>
      </div>
    </Stage>
  );
};
