#!/usr/bin/env python3
"""Measure the percussive energy profile of a BGM/SFX stem.

Run: python scripts/bgm-energy.py public/audio/bgm/apple-score-bgm.wav
"""

import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR_DEFAULT = 48000


def load(path):
    sr, x = wavfile.read(path)
    if np.issubdtype(x.dtype, np.integer):
        x = x.astype(np.float64) / 32768.0
    else:
        x = x.astype(np.float64)
    if x.ndim == 1:
        x = x[:, None]
    return sr, x


def band(x, sr, lo, hi):
    sos = signal.butter(2, [lo / (sr / 2), min(hi, sr / 2 - 100) / (sr / 2)],
                        'bandpass', output='sos')
    return signal.sosfilt(sos, x, axis=0)


def rms(x, sr, win_s=0.05):
    n = max(1, int(win_s * sr))
    pad = (n - len(x) % n) % n
    xp = np.concatenate([x, np.zeros((pad, x.shape[1]))])
    return np.sqrt((xp.reshape(-1, n, x.shape[1]) ** 2).mean(axis=1) + 1e-12)


def onset_envelope(x, sr):
    # full-band spectral flux with half-wave rectification
    nfft = 2048
    hop = 256
    stft = np.abs(signal.stft(x[:, 0], sr, nperseg=nfft, noverlap=nfft - hop)[2])
    flux = np.maximum(0, np.diff(stft, axis=1)).sum(axis=0)
    return np.asarray(flux), sr / hop


def tempo(envelope, env_sr, lo_bpm=80, hi_bpm=190):
    e = envelope - envelope.mean()
    ac = np.correlate(e, e, 'full')[len(e) - 1:]
    ac = ac / (ac[0] + 1e-12)
    lo = int(env_sr * 60 / hi_bpm)
    hi = int(env_sr * 60 / lo_bpm)
    best_lag = lo + int(np.argmax(ac[lo:hi]))
    peaks = []
    for lag in range(int(env_sr * 60 / hi_bpm), int(env_sr * 60 / lo_bpm)):
        if ac[lag] > ac[lag - 1] and ac[lag] >= ac[lag + 1]:
            peaks.append((60 * env_sr / lag, ac[lag]))
    peaks.sort(key=lambda p: -p[1])
    return 60 * env_sr / best_lag, ac[best_lag], peaks[:3]


def main(path):
    sr, x = load(path)
    mono = x.mean(axis=1)
    dur = len(mono) / sr

    env, env_sr = onset_envelope(x, sr)
    bpm, strength, peaks = tempo(env, env_sr)

    # percussive onset rate: local maxima at least 100 ms apart, above 1.6x median
    win = int(0.05 * env_sr)
    sm = np.convolve(env, np.ones(win) / win, 'same')
    thr = np.median(sm[sm > 0]) * 1.6 if np.any(sm > 0) else 0
    onsets = []
    last = -1e9
    for i in range(1, len(sm) - 1):
        if sm[i] > sm[i - 1] and sm[i] >= sm[i + 1] and sm[i] > thr and (i - last) / env_sr > 0.1:
            onsets.append(i / env_sr)
            last = i

    low = rms(band(x[:, :1], sr, 45, 130), sr)      # kick / sub
    mid = rms(band(x[:, :1], sr, 200, 2000), sr)    # pads, bass tone
    high = rms(band(x[:, :1], sr, 6000, 15000), sr)  # hats, claps, sparkle
    peak = float(np.max(np.abs(x)))
    rms_all = float(np.sqrt((mono ** 2).mean()))
    crest = 20 * np.log10(peak / (rms_all + 1e-12))

    # Modulation depth of the harmonic band at the beat: this is the sidechain
    # pump. The low band stays occupied by the offbeat bass, so it cannot show
    # the pulse on its own.
    beat_s = 60 / bpm
    mid_env = rms(band(x[:, :1], sr, 250, 2000), sr, 0.02)
    frames = max(1, int(round(beat_s / 0.02)))
    n = len(mid_env) // frames
    grid = mid_env[:n * frames].reshape(n, frames).mean(axis=1)
    pump = float((grid.max() - np.median(grid)) / (grid.max() + 1e-12))

    # Kick rate: low-band transients, independent of how busy the hats are.
    lo_on = rms(band(x[:, :1], sr, 45, 120), sr, 0.01)
    thr_lo = np.median(lo_on[lo_on > 0]) * 1.9
    kicks = 0
    last = -10
    for i in range(1, len(lo_on) - 1):
        if lo_on[i] > lo_on[i - 1] and lo_on[i] >= lo_on[i + 1] and lo_on[i] > thr_lo and i - last > 6:
            kicks += 1
            last = i

    print(f'file              {path}')
    print(f'duration          {dur:.2f}s')
    print(f'tempo (onset acf) {bpm:.1f} BPM  strength {strength:.3f}')
    print(f'acfm alternatives {[(round(b,1),round(s,3)) for b,s in peaks]}')
    print(f'onset count       {len(onsets)}  rate {len(onsets)/dur*60:.1f}/min')
    print(f'kick rate         {kicks/dur*60:.1f}/min (grid max {60/beat_s:.1f}/min)')
    print(f'sidechain pump    {pump*100:.0f}% (250-2000Hz modulation at the beat)')
    print(f'low(45-130Hz)     rms {20*np.log10(low.mean()+1e-12):+.1f} dB   peak {20*np.log10(low.max()+1e-12):+.1f} dB')
    print(f'mid(200-2k)       rms {20*np.log10(mid.mean()+1e-12):+.1f} dB')
    print(f'high(6-15k)       rms {20*np.log10(high.mean()+1e-12):+.1f} dB   peak {20*np.log10(high.max()+1e-12):+.1f} dB')
    print(f'high/mid ratio    {20*np.log10(high.mean()/(mid.mean()+1e-12)):+.1f} dB')
    print(f'master            peak {20*np.log10(peak+1e-12):+.1f} dBFS  RMS {20*np.log10(rms_all+1e-12):+.1f} dBFS  crest {crest:.1f} dB')


if __name__ == '__main__':
    main(Path(sys.argv[1] if len(sys.argv) > 1 else 'public/audio/bgm/apple-score-bgm.wav'))
