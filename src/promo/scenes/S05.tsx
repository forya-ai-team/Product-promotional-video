import type { FC } from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { ConnectionDesktop, type CardVisualState } from '../ui/tolink/ConnectionDesktop';
import { Stage } from '../ui/tolink/Stage';
import { TikTokMessages } from '../ui/tolink/TikTokMessages';

export const S05_DURATION = 900;

const OVERSCAN = 40;

const select241 = (index: number): CardVisualState =>
  index === 0 ? { select: 1, hover: 0, press: 0 } : { select: 0, hover: 0, press: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;

// Slow push from the full desktop into the requests row, then a creep that
// never settles while the counters run.
const PUSH_START = 6;
const PUSH_END = 168;
const SCALE_FROM = 1;
const SCALE_PUSH = 2.75;
const SCALE_CREEP = 3;
const FOCUS_FROM = { x: 960, y: 540 };
const FOCUS_PUSH = { x: 660, y: 310 };
const FOCUS_CREEP = { x: 660, y: 318 };

const COUNT_START = 30;
const COUNT_END = 900;
const REQUESTS_FROM = 250;
const REQUESTS_TO = 250000;
const UNREAD_RATIO = 203 / 250;
const RATE_FROM = 4;
const COUNT_SPAN = COUNT_END - COUNT_START;
// The rate climbs from near-still to ~1,140 requests per frame; integrating the
// cubic rate lands the final value on REQUESTS_TO.
const RATE_TO = (4 * (REQUESTS_TO - REQUESTS_FROM)) / COUNT_SPAN - 3 * RATE_FROM;

const pushEase = Easing.inOut(Easing.sin);
const creepEase = Easing.in(Easing.quad);

const requestsAt = (frame: number) => {
  const p = clamp01((frame - COUNT_START) / COUNT_SPAN);
  return (
    REQUESTS_FROM +
    RATE_FROM * COUNT_SPAN * p +
    ((RATE_TO - RATE_FROM) * COUNT_SPAN * p ** 4) / 4
  );
};

const cameraAt = (frame: number) => {
  const push = pushEase(clamp01((frame - PUSH_START) / (PUSH_END - PUSH_START)));
  const creep = creepEase(clamp01((frame - PUSH_END) / (COUNT_END - PUSH_END)));
  const scale = frame < PUSH_END ? mix(SCALE_FROM, SCALE_PUSH, push) : mix(SCALE_PUSH, SCALE_CREEP, creep);
  const focusX = mix(FOCUS_FROM.x, FOCUS_PUSH.x, push);
  const focusY =
    frame < PUSH_END ? mix(FOCUS_FROM.y, FOCUS_PUSH.y, push) : mix(FOCUS_PUSH.y, FOCUS_CREEP.y, creep);
  // CSS zoom multiplies the layer's own offsets, so left/top are solved in
  // layout px against the overscanned shake wrapper.
  return {
    scale,
    left: (960 + OVERSCAN) / scale - focusX,
    top: (540 + OVERSCAN) / scale - focusY,
  };
};

const shakeAt = (frame: number) => {
  const rate = requestsAt(frame) - requestsAt(frame - 1);
  const intensity = Math.pow(clamp01(rate / 1100), 0.75);
  // Counting starts while the camera is still pushing, so the frame already
  // carries a faint buzz before the growth is fast enough to drive it.
  const gate = clamp01((frame - COUNT_START) / 18);
  const amp = gate * (2 + 11 * Math.pow(intensity, 1.25));
  // Quadratic chirp: the buzz speeds up with the counter as growth accelerates.
  const phase = 0.7 * frame + 0.0011 * frame * frame;
  return {
    x: amp * (0.62 * Math.sin(phase + 0.9) + 0.38 * Math.sin(phase * 1.37 + 2.2)),
    y: amp * (0.6 * Math.sin(phase * 1.17 + 2.6) + 0.4 * Math.sin(phase * 1.59 + 0.4)),
    rot: gate * (0.05 + 0.4 * Math.pow(intensity, 1.2)) * Math.sin(phase * 0.83 + 1.9),
  };
};

export const S05: FC = () => {
  const frame = useCurrentFrame();
  const camera = cameraAt(frame);
  const shake = shakeAt(frame);
  const requests = Math.round(requestsAt(frame));
  const unread = Math.round(requests * UNREAD_RATIO);

  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          inset: -OVERSCAN,
          overflow: 'hidden',
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: camera.left,
            top: camera.top,
            width: 1920,
            height: 1080,
            zoom: camera.scale,
          }}
        >
          <ConnectionDesktop
            mainPanel={<TikTokMessages requests={requests} unread={unread} />}
            cardState={select241}
          />
        </div>
      </div>
    </Stage>
  );
};
