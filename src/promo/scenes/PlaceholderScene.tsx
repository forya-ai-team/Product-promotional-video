import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../theme/tokens';
import { SCENES, type SceneSpec } from '../timeline';

type Props = {
  scene: SceneSpec;
  index: number;
};

const badge: CSSProperties = {
  border: `1px solid ${tokens.color.accent}`,
  borderRadius: 999,
  padding: '6px 12px',
  fontFamily: tokens.fontFamily.mono,
  fontSize: 14,
  letterSpacing: 1.5,
};

const pill: CSSProperties = {
  border: `1px solid ${tokens.color.border}`,
  borderRadius: 999,
  padding: '8px 14px',
  fontFamily: tokens.fontFamily.mono,
  fontSize: 15,
  color: tokens.color.textMuted,
};

export const PlaceholderScene = ({ scene, index }: Props) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const progress = interpolate(
    frame,
    [0, Math.max(scene.durationInFrames - 1, 1)],
    [0, 1],
    { extrapolateRight: 'clamp' },
  );
  const total = String(SCENES.length).padStart(2, '0');

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tokens.color.background,
        color: tokens.color.text,
        fontFamily: tokens.fontFamily.sans,
        padding: 72,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: enter,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={badge}>SCAFFOLD</span>
          <span style={{ color: tokens.color.textMuted, fontSize: 18 }}>
            素材待接入 · {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
        <span
          style={{
            fontFamily: tokens.fontFamily.mono,
            fontSize: 16,
            color: tokens.color.textMuted,
          }}
        >
          {scene.id} · {scene.durationInFrames}f
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 24}px)`,
        }}
      >
        <div
          style={{
            width: 880,
            padding: 48,
            border: `1px dashed ${tokens.color.borderStrong}`,
            borderRadius: tokens.radius.large,
            backgroundColor: tokens.color.surface,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: tokens.fontFamily.mono,
              color: tokens.color.textMuted,
              fontSize: 16,
              letterSpacing: 2,
            }}
          >
            {scene.id}
          </div>
          <div style={{ fontSize: 56, fontWeight: 600, marginTop: 16 }}>
            {scene.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: tokens.color.textMuted,
              marginTop: 16,
            }}
          >
            等待截图、字体、文案与分镜确认
          </div>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {scene.cards.map((card) => (
              <span key={card} style={pill}>
                {card}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ opacity: enter }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: tokens.color.surfaceRaised,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: tokens.color.accent,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
            fontFamily: tokens.fontFamily.mono,
            fontSize: 14,
            color: tokens.color.textMuted,
          }}
        >
          <span>frame {frame}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
