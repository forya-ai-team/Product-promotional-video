import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { tokens } from '../theme/tokens';

export const ThreeProbe = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: tokens.color.background }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 50, position: [0, 0, 5] }}
      >
        <color attach="background" args={[tokens.color.background]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <mesh rotation={[frame * 0.02, frame * 0.03, 0]}>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshStandardMaterial
            color={tokens.color.accent}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
