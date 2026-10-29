import type { FC } from 'react';
import { Audio, staticFile } from 'remotion';

// BGM is the user's own track, stretched to the film length by one replayed
// section (scripts/bgm-loop.mjs). SFX still come from scripts/score.py, whose
// cues are placed against picture frames. The `bgm` prop mutes the music bed so
// the no-BGM delivery keeps the designed SFX.
export const Soundtrack: FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm ? <Audio src={staticFile('audio/bgm/user-track-looped.wav')} /> : null}
    <Audio src={staticFile('audio/sfx/apple-score-sfx.wav')} />
  </>
);
