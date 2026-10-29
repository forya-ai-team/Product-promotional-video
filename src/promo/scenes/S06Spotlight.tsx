import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { PageCam, type CamKey2D } from '../shots/spotlightHeroCard/PageCam';
import { Dust, EASE, Grain, alpha, ramp } from '../shots/spotlightHeroCard/polish';
import { ChatPanel } from '../ui/tolink/ChatPanel';
import { S06Desktop } from '../ui/tolink/S06Desktop';

// spotlight-hero-card (vendor/video-shotcraft demos/opening/spotlight-hero-card,
// pin 43bd349). Adapted: the chat column starts in its S06 slot, rises as a
// rounded card, then travels to a left-stage hero position while the note grows
// on its right. The camera only pushes/rotates a little; the stage is extended
// beyond the 1920x932 window so the 3D camera never exposes a page edge.

const PAGE_W = 2600;
const PAGE_H = 1600;
const STAGE_TOP = 74;
const CARD_HOME = { x: 671, y: STAGE_TOP + 48 };
const CARD_HERO = { x: 140, y: STAGE_TOP + 48 };
const CARD_W = 881;
const CARD_H = 884;
const CARD_RADIUS = 16;

const GOLD = '#E4C58A';
const BEAM_CORE = 'rgba(255,250,238,0.98)';
const LAMP = '255,238,212';

const DURATION = 172;
const LOCK = 34;
const PUSH0 = 40;
const PUSH1 = 58;
const RISE0 = 56;
const RISE1 = 66;
const TRAVEL0 = 66;
const TRAVEL1 = 102;
const RESEAT0 = 124;
const LAND = 142;

const CAM_KEYS: CamKey2D[] = [
  { frame: 0, cx: 960, cy: 540, zoom: 0.94, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: PUSH0, cx: 960, cy: 540, zoom: 0.94, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: PUSH1, cx: 960, cy: 540, zoom: 1.0, rotX: 2, rotY: -6, rotZ: -1, persp: 1200 },
  { frame: DURATION, cx: 960, cy: 540, zoom: 1.0, rotX: 2, rotY: -6, rotZ: -1, persp: 1200 },
];
const PUSH_EASE = Easing.bezier(0.35, 0, 0.2, 1);
const POP_EASE = Easing.bezier(0.2, 1.25, 0.3, 1);
const RESEAT_EASE = Easing.bezier(0.4, 0, 0.3, 1.05);

const NOTE_LINE_1 = 'TikTok 私信';
const NOTE_LINE_2 = 'AI 自动应答';

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const S06Spotlight: FC = () => {
  const frame = useCurrentFrame();

  const lamp = interpolate(frame, [1, 3, 4, 6], [0, 1, 0.62, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Spotlight wanders, locks the card at its original S06 slot (screen 57.4%, 52.1%).
  const ST = [4, 10, 13, 19, 22, 28, LOCK, PUSH1];
  const spotX = interpolate(frame, ST, [24, 24, 72, 72, 38, 38, 57.4, 26], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.smooth,
  });
  const spotY = interpolate(frame, ST, [30, 30, 40, 40, 62, 62, 52.1, 50], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.smooth,
  });
  const poolBase = interpolate(frame, [22, LOCK, PUSH1], [420, 540, 460], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.swift,
  });
  const pulse = interpolate(frame, [LOCK, LOCK + 4, LOCK + 10], [0, 0.06, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const breathe = 1 + 0.015 * Math.sin((frame - LAND) / 14) * ramp(frame, LAND, 20, EASE.out);
  const poolRx = poolBase * (1 + pulse) * breathe;
  const poolRy =
    poolBase *
    interpolate(frame, [PUSH0, PUSH1], [0.8, 0.92], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    (1 + pulse) *
    breathe;
  const dark = interpolate(frame, [0, LOCK, PUSH1], [0.9, 0.92, 0.94], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardLight = ramp(frame, LOCK + 4, PUSH1 - LOCK - 4, EASE.smooth);
  const holdBreath = 1 + 0.012 * Math.sin((frame - LAND) / 14) * ramp(frame, LAND, 20, EASE.out);

  // Card: rise in place -> travel left -> hover -> land in the left hero slot.
  const rise = interpolate(frame, [RISE0, RISE1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: POP_EASE,
  });
  const travel = interpolate(frame, [TRAVEL0, TRAVEL1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.smooth,
  });
  const reseat = interpolate(frame, [RESEAT0, LAND], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: RESEAT_EASE,
  });
  const lift = rise * (1 - reseat);
  const cardX = mix(CARD_HOME.x, CARD_HERO.x, travel);
  const cardY = CARD_HOME.y;
  const bob = Math.sin(((frame - TRAVEL1) / 40) * Math.PI * 2) * 5 * lift * Math.min(1, travel);
  const z = 90 * lift + bob;
  const landed = frame >= LAND;
  const press = interpolate(frame, [LAND - 4, LAND - 1, LAND], [1, 0.997, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shadow = `${-10 * lift}px ${10 * lift}px ${12 + 12 * lift}px rgba(10,8,6,${0.35 * lift}), ${-36 * lift}px ${48 * lift}px ${90 * lift}px rgba(10,8,6,${0.42 * lift})`;

  // Extraction trace at the original slot, then the landing glow in the left slot.
  const slotVis =
    Math.min(1, ramp(frame, TRAVEL0, 8, EASE.smooth)) * (1 - ramp(frame, TRAVEL1, 20, EASE.smooth));
  const landPulse = interpolate(frame, [LAND - 4, LAND, LAND + 14], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Outline beams after the card reaches its left slot.
  const beam1Prog = interpolate(frame, [104, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.linear,
  });
  const beam1On = frame >= 103 && frame <= 119;
  const beam2Prog = interpolate(frame, [124, 144], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.swift,
  });
  const beam2On = frame >= 123 && frame <= 145;
  const beamTrail = interpolate(frame, [144, 158], [0.4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bw = CARD_W + 6;
  const bh = CARD_H + 6;

  // Note enters once the card has cleared the right side, marker grows, settles with the card.
  const lockRim = Math.min(1, ramp(frame, LOCK, 8, EASE.out) * (1 - ramp(frame, PUSH1, 8, EASE.out)));
  const noteIn = ramp(frame, 96, 14, EASE.out);
  const noteSettle = interpolate(frame, [RESEAT0 - 4, LAND], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: RESEAT_EASE,
  });
  const noteZ = 4 + (88 + Math.sin(((frame - 96) / 44) * Math.PI * 2) * 3) * (1 - noteSettle);
  const hl = ramp(frame, 108, 12, EASE.swift);

  // Volumetric cone from a source above/right of the pool.
  const px = (spotX / 100) * 1920;
  const py = (spotY / 100) * 1080;
  const sx = px + 420;
  const sy = -720;
  const coneW = poolRx * 0.6;
  const cone = `${sx - 26}px ${sy}px, ${sx + 26}px ${sy}px, ${px + coneW}px ${py}px, ${px - coneW}px ${py}px`;

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 95% at 50% 0%, #141C2C 0%, #0A0F18 55%, #05070C 100%)' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(42% 38% at 78% 6%, rgba(255,214,160,0.10) 0%, rgba(255,214,160,0) 70%)',
        }}
      />

      <PageCam keys={CAM_KEYS} pageW={PAGE_W} pageH={PAGE_H} ease={PUSH_EASE}>
        <S06Desktop hideChat />

        {/* Page-space dark room: the card-shaped soft hole follows the card. */}
        {cardLight > 0.001 ? (
          <svg
            width={PAGE_W}
            height={PAGE_H}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: 'translateZ(1px)',
              opacity: cardLight,
              pointerEvents: 'none',
            }}
          >
            <defs>
              <filter id="s06-tight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="20" />
              </filter>
              <filter id="s06-wide" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="48" />
              </filter>
              <mask id="s06-hole" maskUnits="userSpaceOnUse" x={0} y={0} width={PAGE_W} height={PAGE_H}>
                <rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="white" />
                <rect
                  x={cardX - 56}
                  y={cardY - 46}
                  width={CARD_W + 112}
                  height={CARD_H + 92}
                  rx={64}
                  fill="#0A0A0A"
                  filter="url(#s06-wide)"
                />
                <rect
                  x={cardX - 12}
                  y={cardY - 12}
                  width={CARD_W + 24}
                  height={CARD_H + 24}
                  rx={CARD_RADIUS + 12}
                  fill="black"
                  filter="url(#s06-tight)"
                />
              </mask>
            </defs>
            <rect
              x={0}
              y={0}
              width={PAGE_W}
              height={PAGE_H}
              fill="rgb(10,9,8)"
              fillOpacity={Math.min(0.955, 0.93 * holdBreath)}
              mask="url(#s06-hole)"
            />
          </svg>
        ) : null}

        <div style={{ transformStyle: 'preserve-3d' }}>
          {/* Extraction trace at the original chat slot */}
          {slotVis > 0.02 ? (
            <div
              style={{
                position: 'absolute',
                left: CARD_HOME.x - 2,
                top: CARD_HOME.y - 2,
                width: CARD_W + 4,
                height: CARD_H + 4,
                transform: 'translateZ(0.5px)',
                borderRadius: CARD_RADIUS,
                border: `1.5px solid ${alpha(GOLD, 0.55)}`,
                opacity: slotVis,
              }}
            />
          ) : null}

          {/* Landing glow in the left hero slot */}
          {landPulse > 0.02 ? (
            <div
              style={{
                position: 'absolute',
                left: cardX - 2,
                top: cardY - 2,
                width: CARD_W + 4,
                height: CARD_H + 4,
                transform: 'translateZ(1.5px)',
                borderRadius: CARD_RADIUS,
                border: `1.5px solid ${GOLD}`,
                opacity: landPulse * 0.8,
                boxShadow: `0 0 ${(26 * landPulse).toFixed(1)}px ${alpha(GOLD, 0.8)}, inset 0 0 26px ${alpha(GOLD, 0.16 * landPulse)}`,
              }}
            />
          ) : null}

          {/* Hero chat card */}
          <div
            style={{
              position: 'absolute',
              left: cardX,
              top: cardY,
              width: CARD_W,
              height: CARD_H,
              transform: `translateZ(${(z + 2).toFixed(2)}px) scale(${press})`,
              transformOrigin: 'center center',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: CARD_RADIUS,
                overflow: 'hidden',
                boxShadow: landed ? 'none' : shadow,
              }}
            >
              <ChatPanel width={CARD_W} height={CARD_H} radius={CARD_RADIUS} background="#050506" />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(200deg, rgba(${LAMP},0.16), rgba(${LAMP},0) 45%, rgba(20,16,10,0.1) 100%)`,
                  opacity: lift,
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: CARD_RADIUS,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,${(0.24 + 0.66 * lift).toFixed(3)}), 0 0 0 1.5px rgba(255,236,205,${(0.7 * cardLight + 0.35 * lockRim).toFixed(3)}), 0 0 44px rgba(255,214,160,${(0.16 * cardLight).toFixed(3)})`,
                pointerEvents: 'none',
              }}
            />

            {beam1On || beam2On ? (
              lift > 0.4 ? (
                <svg
                  width={bw}
                  height={bh}
                  viewBox={`0 0 ${bw} ${bh}`}
                  style={{
                    position: 'absolute',
                    left: -3,
                    top: -3,
                    overflow: 'visible',
                    pointerEvents: 'none',
                    opacity: beam1On ? 1 : 0.62,
                    filter: `drop-shadow(0 0 6px ${alpha(GOLD, 0.9)}) drop-shadow(0 0 18px rgba(255,236,200,0.55))`,
                  }}
                >
                  <rect
                    x={2}
                    y={2}
                    width={bw - 4}
                    height={bh - 4}
                    rx={CARD_RADIUS}
                    fill="none"
                    stroke={GOLD}
                    strokeWidth={beam1On ? 5 : 3.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.16 1"
                    strokeDashoffset={-(beam1On ? beam1Prog : beam2Prog)}
                  />
                  <rect
                    x={2}
                    y={2}
                    width={bw - 4}
                    height={bh - 4}
                    rx={CARD_RADIUS}
                    fill="none"
                    stroke={BEAM_CORE}
                    strokeWidth={beam1On ? 2.5 : 1.75}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.16 1"
                    strokeDashoffset={-(beam1On ? beam1Prog : beam2Prog)}
                  />
                </svg>
              ) : null
            ) : null}
            {beamTrail > 0.01 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: CARD_RADIUS + 3,
                  border: `1.5px solid ${GOLD}`,
                  opacity: beamTrail,
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </div>
        </div>
      </PageCam>

      {/* Screen-space theatre lighting */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(${(poolRx * 1.35).toFixed(1)}px ${(poolRy * 1.35).toFixed(1)}px at ${spotX}% ${spotY}%, rgba(14,12,10,0) 0%, rgba(14,12,10,0) 26%, rgba(14,12,10,${(dark * 0.25).toFixed(3)}) 44%, rgba(14,12,10,${(dark * 0.62).toFixed(3)}) 62%, rgba(14,12,10,${(dark * 0.9).toFixed(3)}) 80%, rgba(14,12,10,${dark.toFixed(3)}) 100%)`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          opacity: lamp * (1 - cardLight),
        }}
      />
      <AbsoluteFill
        style={{
          background: 'rgba(14,12,10,1)',
          mixBlendMode: 'multiply',
          opacity: 0.86 * (1 - lamp),
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(${(poolRx * 1.2).toFixed(1)}px ${(poolRy * 1.2).toFixed(1)}px at ${spotX}% ${spotY}%, rgba(${LAMP},0.24) 0%, rgba(${LAMP},0.12) 50%, rgba(${LAMP},0) 80%)`,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
          opacity: lamp * (1 - cardLight),
        }}
      />

      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          opacity: lamp * (1 - 0.45 * ramp(frame, PUSH0, 18, EASE.smooth)),
        }}
      >
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(28px)' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `polygon(${cone})`,
              background: `linear-gradient(${((Math.atan2(py - sy, px - sx) * 180) / Math.PI - 90).toFixed(1)}deg, rgba(${LAMP},0.13) 0%, rgba(${LAMP},0.06) 60%, rgba(${LAMP},0.025) 100%)`,
            }}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(${cone})` }}>
          <Dust count={36} seed={4} drift={0.3} opacity={0.35} color="#fff1dc" />
        </div>
      </AbsoluteFill>

      {/* Self-lit 3D note above the lighting, sharing the page camera */}
      <PageCam keys={CAM_KEYS} pageW={PAGE_W} pageH={PAGE_H} ease={PUSH_EASE} bg="transparent">
        {frame >= 96 ? (
          <div style={{ transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
            <div
              style={{
                position: 'absolute',
                left: 1076,
                top: 420,
                width: 380,
                height: 300,
                transform: `translateZ(${(noteZ - 1).toFixed(2)}px) translateY(${((1 - noteIn) * 26).toFixed(2)}px)`,
                background:
                  'radial-gradient(ellipse 50% 50% at 52% 50%, rgba(16,14,12,0.97) 0%, rgba(16,14,12,0.9) 60%, rgba(16,14,12,0) 100%)',
                filter: 'blur(6px)',
                opacity: noteIn,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 1100,
                top: 640,
                width: 320,
                height: 80,
                transform: 'translateZ(2px)',
                background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55), transparent 70%)',
                filter: 'blur(12px)',
                opacity: 0.5 * noteIn * (1 - noteSettle),
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 1110,
                top: 470,
                width: 'max-content',
                whiteSpace: 'nowrap',
                transform: `translateZ(${noteZ.toFixed(2)}px) translateY(${((1 - noteIn) * 26).toFixed(2)}px)`,
                opacity: noteIn,
                filter: noteIn < 1 ? `blur(${((1 - noteIn) * 4).toFixed(2)}px)` : undefined,
                fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 700, color: '#F6F3EC', textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}>
                {NOTE_LINE_1}
              </div>
              <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: -8,
                    top: '8%',
                    bottom: '2%',
                    width: `calc(${hl.toFixed(4)} * (100% + 16px))`,
                    background: GOLD,
                    borderRadius: 5,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    fontSize: 56,
                    fontWeight: 700,
                    color: hl > 0.55 ? '#14110C' : '#F6F3EC',
                  }}
                >
                  {NOTE_LINE_2}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageCam>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 78% 78% at 50% 46%, rgba(2,3,6,0) 45%, rgba(2,3,6,0.38) 100%)',
        }}
      />
      <Grain opacity={0.07} blend="soft-light" />
    </AbsoluteFill>
  );
};

export const S06_SPOTLIGHT_DURATION = DURATION;
