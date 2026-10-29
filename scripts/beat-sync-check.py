#!/usr/bin/env python3
"""Check that the BGM's kick transients land on the picture's beat frames.

Run: python scripts/beat-sync-check.py public/audio/bgm/apple-score-bgm.wav
"""

import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
FPS = 30
CLICK_FRAMES = [446, 461, 476, 491]          # S02 picker clicks
SECTION_FRAMES = [521, 1031, 1495, 1915, 2191]  # portal / S04 / S05 / burst / flow
GATE = (2019, 2027)                            # dip-to-dark, music must be silent


def load(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.ndim == 1:
        x = x[:, None]
    return x.mean(axis=1)


def low_env(mono):
    sos = signal.butter(2, [45 / (SR / 2), 130 / (SR / 2)], 'bandpass', output='sos')
    y = signal.sosfilt(sos, mono)
    win = int(0.012 * SR)
    pad = (win - len(y) % win) % win
    y = np.concatenate([y, np.zeros(pad)])
    return np.sqrt((y.reshape(-1, win) ** 2).mean(axis=1))


def at(env, frame):
    i = int(frame / FPS * SR / int(0.012 * SR))
    return env[i]


def main(path):
    env = low_env(load(path))
    print(f'{path}')
    print('expected beat  env@beat  env@offbeat  ratio   verdict')
    for f in CLICK_FRAMES + SECTION_FRAMES:
        on = max(at(env, f + k) for k in (-1, 0, 1))
        off = min(at(env, f + k) for k in (6, 7, 8, 9))
        ratio = on / (off + 1e-9)
        print(f'{f:>12}f  {on:8.4f}  {off:9.4f}  {ratio:6.2f}   '
              f'{"kick on beat" if ratio > 1.6 else "CHECK"}')
    gate_a, gate_b = int(GATE[0] / FPS * SR), int(GATE[1] / FPS * SR)
    print(f'gate {GATE[0]}-{GATE[1]}f peak {np.max(np.abs(load(path)[gate_a:gate_b])):.2e}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'public/audio/bgm/apple-score-bgm.wav')
