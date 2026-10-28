import type { FC } from 'react';
import { Img, staticFile } from 'remotion';

const WindowIcon: FC = () => (
  <Img
    src={staticFile('textures/S03/win-icon@2x.png')}
    style={{ position: 'absolute', left: 1, top: 2, width: 17, height: 14 }}
  />
);

export const TitleBar: FC = () => {
  return (
    <>
      <WindowIcon />
      <div
        style={{
          position: 'absolute',
          left: 23,
          top: 2,
          fontSize: 13,
          lineHeight: '16px',
          color: '#3B3B3B',
        }}
      >
        Tolink
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1802,
          top: 8.6,
          width: 10,
          height: 1.2,
          background: '#4B4B4B',
        }}
      />

      <svg
        width={10.5}
        height={10.5}
        viewBox="0 0 11 11"
        style={{ position: 'absolute', left: 1847, top: 3.5 }}
      >
        <rect x="2.6" y="0.6" width="7.2" height="7.2" fill="none" stroke="#4B4B4B" strokeWidth="1.1" />
        <rect x="0.6" y="2.6" width="7.2" height="7.2" fill="none" stroke="#4B4B4B" strokeWidth="1.1" />
      </svg>

      <svg
        width={10.5}
        height={10.5}
        viewBox="0 0 11 11"
        style={{ position: 'absolute', left: 1893, top: 3.5 }}
      >
        <path d="M1.3 1.3 L9.7 9.7 M9.7 1.3 L1.3 9.7" stroke="#3B3B3B" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 5,
          top: 26,
          display: 'flex',
          gap: 13,
          fontSize: 12,
          lineHeight: '18px',
          color: '#2E2E2E',
        }}
      >
        <span>Tolink</span>
        <span>帮助</span>
        <span>编辑</span>
      </div>
    </>
  );
};
