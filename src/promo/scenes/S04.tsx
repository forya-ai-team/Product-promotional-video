import type { FC } from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { BigCursor } from '../ui/tolink/BigCursor';
import {
  ConnectionDesktop,
  FIRST_PROFILE_CENTER,
  type CardVisualState,
} from '../ui/tolink/ConnectionDesktop';
import {
  TOAST_PITCH,
  ToastFeed,
  type ToastFeedItem,
} from '../ui/tolink/ConnectionPanel';
import { PROXY_FEED } from '../ui/tolink/data';
import { Stage } from '../ui/tolink/Stage';

export const S04_DURATION = 464;

const CARD_START = 22;
const CARD_STAGGER = 12;
const CARD_FADE = 22;
const STATUS_DELAY = 16;
const STATUS_FADE = 10;
const TEXT_START = 30;
const TEXT_FADE = 14;

const POP_START = 78;
const POP_SPAN = 132;
const POP_EXP = 0.6;
const SHIFT_FADE = 7;
const ENTRY_FADE = 9;
const RENDER_AHEAD = 16;

const PUSH_START = 124;
const PUSH_END = 204;
const PULL_START = 222;
const PULL_END = 322;
const MAX_SCALE = 1.55;
const FOCUS_Y_TOP = 440;
const FOCUS_Y_FULL = 540;

const CURSOR_IN_START = 322;
const CURSOR_IN_END = 336;
const CURSOR_MOVE_START = 336;
const CURSOR_MOVE_END = 402;
// Screen position of S03's 批量启动 click, converted to window coords.
const CURSOR_FROM = { x: 1658, y: 86 };
const CURSOR_CONTROL = { x: 900, y: 210 };
const PRESS_START = 412;
const CLICK_FRAME = 416;
const SELECT_END = 434;
const RIPPLE_DURATION = 28;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const enterEase = Easing.out(Easing.cubic);
const shiftEase = Easing.out(Easing.cubic);
const checkEase = Easing.out(Easing.back(1.7));
const pushEase = Easing.inOut(Easing.cubic);
const pullEase = Easing.inOut(Easing.sin);
const cursorEase = Easing.bezier(0.3, 0, 0.25, 1);

// Accelerating schedule: first toast on 78, 90th on 210.
const POP_FRAMES = Array.from({ length: PROXY_FEED.length }, (_, index) =>
  POP_START + POP_SPAN * Math.pow(index / (PROXY_FEED.length - 1), POP_EXP),
);

const buildFeed = (frame: number): ToastFeedItem[] => {
  const popped = POP_FRAMES.filter((popFrame) => popFrame <= frame).length;
  if (popped === 0) return [];

  // One shared eased counter keeps every card 68px apart while the stack
  // scrolls, so overlapping pops never collapse into each other.
  let scroll = 0;
  for (let index = 0; index < popped; index++) {
    scroll += shiftEase(clamp01((frame - POP_FRAMES[index]) / SHIFT_FADE));
  }

  const items: ToastFeedItem[] = [];
  const first = Math.max(0, popped - RENDER_AHEAD);
  for (let index = first; index < popped; index++) {
    const top = (scroll - 1 - index) * TOAST_PITCH;
    if (top > 900) continue;
    const age = frame - POP_FRAMES[index];
    items.push({
      key: `${index}-${PROXY_FEED[index].ip}`,
      toast: PROXY_FEED[index],
      top,
      reveal: enterEase(clamp01(age / ENTRY_FADE)),
      pop: checkEase(clamp01(age / ENTRY_FADE)),
    });
  }
  return items;
};

const cameraAt = (frame: number) => {
  let scale = 1;
  let focusY = FOCUS_Y_FULL;

  if (frame >= PUSH_START && frame < PUSH_END) {
    const p = pushEase(clamp01((frame - PUSH_START) / (PUSH_END - PUSH_START)));
    scale = mix(1, MAX_SCALE, p);
    focusY = mix(FOCUS_Y_FULL, FOCUS_Y_TOP, p);
  } else if (frame >= PUSH_END && frame < PULL_START) {
    scale = MAX_SCALE;
    focusY = FOCUS_Y_TOP;
  } else if (frame >= PULL_START) {
    const p = pullEase(clamp01((frame - PULL_START) / (PULL_END - PULL_START)));
    scale = mix(MAX_SCALE, 1, p);
    focusY = mix(FOCUS_Y_TOP, FOCUS_Y_FULL, p);
  }

  return { scale, tx: 960 - 960 * scale, ty: 540 - focusY * scale };
};

const pressAt = (frame: number, pressStart: number, clickFrame: number) => {
  const pressIn = Easing.out(Easing.cubic)(clamp01((frame - pressStart) / 3));
  const pressOut = Easing.inOut(Easing.sin)(clamp01((frame - (clickFrame + 1)) / 5));
  return pressIn * (1 - pressOut);
};

const CardRipple: FC<{ frame: number }> = ({ frame }) => {
  if (frame < CLICK_FRAME) return null;
  const age = frame - CLICK_FRAME;
  const rings = [0, 9].map((delay, index) => {
    const p = clamp01((age - delay) / RIPPLE_DURATION);
    return {
      delay,
      radius: 20 + 95 * p,
      opacity: (0.5 - index * 0.16) * Math.pow(1 - Math.min(1, p), 1.1),
    };
  });
  const flash = clamp01(age / 14);

  return (
    <>
      {rings.map((ring) =>
        frame < CLICK_FRAME + ring.delay || ring.opacity <= 0.003 ? null : (
          <div
            key={ring.delay}
            style={{
              position: 'absolute',
              left: FIRST_PROFILE_CENTER.x - ring.radius,
              top: FIRST_PROFILE_CENTER.y - ring.radius,
              width: ring.radius * 2,
              height: ring.radius * 2,
              borderRadius: '50%',
              border: `3px solid rgba(92, 182, 255, ${ring.opacity.toFixed(3)})`,
              boxShadow: `0 0 16px rgba(68, 162, 255, ${(ring.opacity * 0.7).toFixed(3)})`,
            }}
          />
        ),
      )}
      {flash < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: FIRST_PROFILE_CENTER.x - 18 - 26 * flash,
            top: FIRST_PROFILE_CENTER.y - 18 - 26 * flash,
            width: (18 + 26 * flash) * 2,
            height: (18 + 26 * flash) * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${0.22 * (1 - flash)}) 0%, rgba(68,162,255,${0.10 * (1 - flash)}) 55%, rgba(68,162,255,0) 75%)`,
          }}
        />
      ) : null}
    </>
  );
};

export const S04: FC = () => {
  const frame = useCurrentFrame();

  const cardReveal = (index: number) =>
    enterEase(clamp01((frame - (CARD_START + index * CARD_STAGGER)) / CARD_FADE));

  const statusGlow = (index: number) => {
    const start = CARD_START + index * CARD_STAGGER + STATUS_DELAY;
    return clamp01((frame - start) / STATUS_FADE) * (1 - clamp01((frame - start) / 40));
  };

  const textReveal = enterEase(clamp01((frame - TEXT_START) / TEXT_FADE));
  const backing = enterEase(clamp01((frame - (POP_START - 4)) / 20));
  const cardFade = 1 - Easing.in(Easing.quad)(clamp01((frame - PULL_START) / 84));
  const camera = cameraAt(frame);

  const cursorOpacity = enterEase(
    clamp01((frame - CURSOR_IN_START) / (CURSOR_IN_END - CURSOR_IN_START)),
  );
  const moveP = cursorEase(
    clamp01((frame - CURSOR_MOVE_START) / (CURSOR_MOVE_END - CURSOR_MOVE_START)),
  );
  const q = 1 - moveP;
  const cursor = {
    x:
      q * q * CURSOR_FROM.x +
      2 * q * moveP * CURSOR_CONTROL.x +
      moveP * moveP * FIRST_PROFILE_CENTER.x,
    y:
      q * q * CURSOR_FROM.y +
      2 * q * moveP * CURSOR_CONTROL.y +
      moveP * moveP * FIRST_PROFILE_CENTER.y,
  };

  const hoverRaw =
    1 - Easing.inOut(Easing.sin)(clamp01((dist(cursor, FIRST_PROFILE_CENTER) - 45) / 130));
  const hover =
    frame < CLICK_FRAME ? hoverRaw : hoverRaw * (1 - clamp01((frame - CLICK_FRAME) / 20));
  const press = pressAt(frame, PRESS_START, CLICK_FRAME);
  const select = enterEase(
    clamp01((frame - CLICK_FRAME) / (SELECT_END - CLICK_FRAME)),
  );

  const cardState = (index: number): CardVisualState =>
    index === 0
      ? { select, hover, press }
      : { select: 0, hover: 0, press: 0 };

  return (
    <Stage>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            width: 1920,
            height: 1080,
            transformOrigin: '0 0',
            transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
          }}
        >
          <ConnectionDesktop
            toastLayer={
              <ToastFeed
                items={buildFeed(frame)}
                backingOpacity={backing}
                cardFade={cardFade}
              />
            }
            cardState={cardState}
            cardReveal={cardReveal}
            statusGlow={statusGlow}
            textReveal={textReveal}
            spinnerAngle={frame * 7}
            overlay={
              <>
                <CardRipple frame={frame} />
                <div style={{ position: 'absolute', inset: 0, opacity: cursorOpacity }}>
                  <BigCursor
                    x={cursor.x}
                    y={cursor.y}
                    scale={1 - 0.12 * press}
                  />
                </div>
              </>
            }
          />
        </div>
      </div>
    </Stage>
  );
};
