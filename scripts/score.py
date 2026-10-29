#!/usr/bin/env python3
"""Original score for the Dmex promo, 120 BPM in A major, drum-driven.

House-promo language: four-on-the-floor kick with a deep sidechain pump, clap
backbeat on 2 and 4, open hats on every offbeat, 16th shakers, an offbeat
sub-bass, short major ninth stabs instead of long pads, a bright pentatonic
pluck lead, and crashes on the scene entries. One designed impact at the 99+
burst, drums stop so the report card lands in a hole, and the brand card gets
the cadential chord. Everything is synthesized here; there are no third-party
samples, so the stems carry no sample license.

Beat grids are anchored to picture cues, in frames @30fps:
  446f  the four S02 picker clicks sit on beats (15f = 0.5s = one beat)
  1915f the S05 burst is the drop's downbeat
  2191f the S06 reply flow is the last groove's downbeat
The final cadence (2553f / 2661f) is free because the drums have stopped; the
tail card's own beats (2707 flip / 2719 bloom / 2751 brand field) are SFX only.

The picture has since moved ahead of these stems (D46 / D48 / D49 / D51 / D54):
the working tree is 3105f / 103.50s — S055 (1825-2005) and S065 (2647-2959)
inserted, S05 trimmed by 2s, S01 played at 1.4x (300f), S03 body trimmed to
456f. The tail card now starts at 2943f (this script's END_CARD +282f), S055's
1928f flip has no cue, and S05's shutter clicks are still missing. Re-anchor
every cue and re-render both cuts before a delivery master.

Outputs (48 kHz stereo float32, 94.1 s = 2823 frames; stems only, picture 3105f):
  public/audio/bgm/apple-score-bgm.wav   music bed
  public/audio/sfx/apple-score-sfx.wav   designed SFX (kept in the no-BGM cut)

Run: python scripts/score.py
"""

from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d

SR = 48000
FPS = 30
# Written for the S07-only timeline (2823f, S07 at 2661f). The working tree now also
# carries the undecided S065 scene -> 3119f with S07 at 2957f, so these stems leave
# the last 9.87s silent and the tail cues sit 296f early. See docs/decisions.md D46
# before rendering a delivery master.
TOTAL_FRAMES = 2823
DUR = TOTAL_FRAMES / FPS
N = int(round(SR * DUR))
rng = np.random.default_rng(20261029)

# ── Cues (absolute seconds, derived from timeline.ts) ────────────────────────
S02 = 404 / FPS
CLICK = [446 / FPS, 461 / FPS, 476 / FPS, 491 / FPS]
PORTAL = 521 / FPS
S03_CLICK_1 = 609 / FPS
S03_CLICK_2 = 939 / FPS
S04 = 1031 / FPS
S04_CLICK = 1447 / FPS
S05 = 1495 / FPS
BURST = 1915 / FPS
DIP = 2019 / FPS
DIP_MID = 2027 / FPS
S06_REPLY = 2191 / FPS
REPORT = 2553 / FPS
END_CARD = 2661 / FPS
MORPH_FLIP = (2661 + 46) / FPS    # S07 icon hits its thinnest frame
MORPH_LAND = (2661 + 58) / FPS    # wordmark finished blooming
MORPH_FIELD = (2661 + 90) / FPS   # orbit field + platform nodes fade in
END = DUR

BEAT = 0.5  # 120 BPM
BAR = 4 * BEAT  # 2.0 s
GRID = {
    'groove': CLICK[0],  # 14.867 — S02/S03/S04/S05 build
    'drop': BURST,       # 63.833 — the 99+ slam
    'flow': S06_REPLY,   # 73.033 — the workflow groove
}


def bar_grid(grid: str, b: int) -> float:
    return GRID[grid] + b * BAR


def gb(b: int) -> float:
    """Bar b on the groove grid; negative bars count back into the cold open."""
    return bar_grid('groove', b)


def beat_index(t: float, grid: str = 'groove') -> int:
    return int(round((t - GRID[grid]) / BEAT))


def beats_between(grid: str, start_t: float, end_t: float) -> list[float]:
    """Beat positions on `grid` inside [start_t, end_t)."""
    first = int(np.ceil((start_t - GRID[grid]) / BEAT - 1e-9))
    last = int(np.floor((end_t - GRID[grid]) / BEAT + 1e-9))
    return [GRID[grid] + k * BEAT for k in range(first, last + 1)]


# ── Harmony (A major: I - vi - IV - V) ───────────────────────────────────────
CHORDS = {
    'Amaj9': [110.00, 207.65, 246.94, 277.18, 329.63],
    'F#m9': [92.50, 220.00, 277.18, 329.63, 415.30],
    'Dmaj9': [73.42, 220.00, 277.18, 329.63, 369.99],
    'E9': [82.41, 207.65, 246.94, 293.66, 369.99],
    'A6add9': [110.00, 164.81, 246.94, 277.18, 369.99],
}
BASS_ROOT = {'Amaj9': 110.00, 'F#m9': 92.50, 'Dmaj9': 73.42, 'E9': 82.41, 'A6add9': 110.00}

# (start, chord, length in bars) on a named grid, or (start, chord, seconds) when
# `grid` is None for the free cadence at the head and tail of the film.
CHORD_PLAN: list[tuple[float | str, str, float]] = [
    ('groove', 'Amaj9', -7), ('groove', 'Amaj9', -6), ('groove', 'F#m9', -5),
    ('groove', 'F#m9', -4), ('groove', 'Dmaj9', -3), ('groove', 'E9', -2),
    ('groove', 'Amaj9', -1),
]
# 25 four-bar cycles of I-vi-IV-V across the groove grid, then a held dominant
# that resolves on the drop.
LOOP = ['Amaj9', 'F#m9', 'Dmaj9', 'E9']
for b in range(0, 24):
    CHORD_PLAN.append(('groove', LOOP[b % 4], b))
CADENCE_HOLD = bar_grid('groove', 24)  # 62.700, V held under the riser

FLOW_BARS = ['Amaj9', 'F#m9', 'Dmaj9', 'E9', 'Amaj9', 'F#m9', 'Dmaj9', 'E9']

CHORD_AT: list[tuple[float, str]] = []


def _build_chord_table() -> None:
    for grid, name, idx in CHORD_PLAN:
        CHORD_AT.append((bar_grid(grid, int(idx)), name))
    CHORD_AT.append((CADENCE_HOLD, 'E9'))
    CHORD_AT.append((GRID['drop'], 'Amaj9'))
    CHORD_AT.append((bar_grid('drop', 1), 'Dmaj9'))
    CHORD_AT.append((DIP_MID, 'Amaj9'))          # spotlight swell, free
    for i, name in enumerate(FLOW_BARS):
        CHORD_AT.append((bar_grid('flow', i), name))
    CHORD_AT.append((REPORT, 'Dmaj9'))           # report card lands
    CHORD_AT.append((REPORT + 2.0, 'E9'))        # riser into the brand card
    CHORD_AT.append((END_CARD, 'A6add9'))        # final resolve
    CHORD_AT.sort(key=lambda c: c[0])


_build_chord_table()


def chord_at(t: float) -> str:
    name = 'Amaj9'
    for start, n in CHORD_AT:
        if t >= start - 1e-9:
            name = n
        else:
            break
    return name


def chord_end(t: float) -> float:
    """Where the chord sounding at `t` gives way to the next one."""
    for start, _ in CHORD_AT:
        if start > t + 1e-9:
            return start
    return END


# ── Buses ────────────────────────────────────────────────────────────────────
bgm = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)
bgm_send = np.zeros((N, 2), np.float32)
sfx_send = np.zeros((N, 2), np.float32)
# Pads/stabs/bass/lead live on their own bus so the kick's duck does not squash
# the drums themselves; the harmonic bus is ducked before it joins the mix.
harm = np.zeros((N, 2), np.float32)
harm_send = np.zeros((N, 2), np.float32)
duck = np.ones(N, np.float32)


def pan_gains(pan: float) -> tuple[float, float]:
    th = (pan + 1) * np.pi / 4
    return float(np.cos(th)), float(np.sin(th))


def add_mono(buf, send_buf, sig, at, gain=1.0, pan=0.0, send=0.0):
    i = int(round(at * SR))
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    if n <= 0:
        return
    s = (sig[:n] * gain).astype(np.float32)
    gl, gr = pan_gains(pan)
    buf[i:i + n, 0] += s * gl
    buf[i:i + n, 1] += s * gr
    if send > 0:
        send_buf[i:i + n, 0] += s * gl * send
        send_buf[i:i + n, 1] += s * gr * send


def add_stereo(buf, send_buf, sig, at, gain=1.0, send=0.0):
    i = int(round(at * SR))
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    if n <= 0:
        return
    s = sig[:n].astype(np.float32) * gain
    buf[i:i + n] += s
    if send > 0:
        send_buf[i:i + n] += s * send


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR / 2 - 200) / (SR / 2), 'lowpass', output='sos')
    return signal.sosfilt(sos, x, axis=0)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc / (SR / 2), 'highpass', output='sos')
    return signal.sosfilt(sos, x, axis=0)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo / (SR / 2), min(hi, SR / 2 - 200) / (SR / 2)], 'bandpass', output='sos')
    return signal.sosfilt(sos, x, axis=0)


def tv_lp(x, cutoff):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        a = np.exp(-2 * np.pi * cutoff[i] / SR)
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def noise(n):
    return rng.standard_normal(n).astype(np.float32)


# ── Instruments ──────────────────────────────────────────────────────────────
def make_pad(notes, length, attack=0.35, release=1.2, cutoff=3000.0):
    n = int((length + release) * SR)
    t = np.arange(n) / SR
    env = np.ones(n, np.float32)
    a = min(int(attack * SR), n)
    env[:a] = np.linspace(0, 1, a) ** 1.4
    r = min(int(release * SR), n)
    env[-r:] *= np.linspace(1, 0, r) ** 1.3
    lfo = 1 + 0.06 * np.sin(2 * np.pi * 0.13 * t + rng.uniform(0, 6.28))
    sig = np.zeros((n, 2), np.float32)
    for f in notes:
        for det, pan in ((-0.0042, -0.7), (0.0038, 0.7)):
            ph = 2 * np.pi * f * (1 + det) * t
            w = np.sin(ph) * 0.8 + 0.3 * np.sin(2 * ph) + 0.14 * np.sin(3 * ph)
            s = (w * env * lfo).astype(np.float32)
            gl, gr = pan_gains(pan)
            sig[:, 0] += s * gl
            sig[:, 1] += s * gr
    sig = lp(sig, cutoff)
    return (sig / max(1.0, len(notes) * 1.5)).astype(np.float32)


def make_stab(notes, length=0.2, cutoff=3600.0):
    """Short house chord hit: instant attack, fast decay, bright top."""
    n = int(length * SR)
    t = np.arange(n) / SR
    env = (np.exp(-t / 0.075) * np.minimum(1, t / 0.004)).astype(np.float32)
    sig = np.zeros((n, 2), np.float32)
    for f in notes:
        for det, pan in ((-0.006, -0.55), (0.006, 0.55)):
            ph = 2 * np.pi * f * (1 + det) * t
            w = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.28 * np.sin(3 * ph) + 0.16 * np.sin(4 * ph)
            s = (w * env).astype(np.float32)
            gl, gr = pan_gains(pan)
            sig[:, 0] += s * gl
            sig[:, 1] += s * gr
    sig = lp(sig, cutoff)
    return (sig / (max(1.0, len(notes) * 1.7))).astype(np.float32)


def make_bass(f, length=0.34):
    """Offbeat house bass: saw stack over a sub octave, lowpassed."""
    n = int(length * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    saw = np.zeros(n, np.float32)
    for k, a in ((1, 1.0), (2, 0.46), (3, 0.26), (4, 0.16), (5, 0.1)):
        saw += a * np.sin(k * ph)
    sub = 0.62 * np.sin(np.pi * f * t)  # one octave down
    env = (np.minimum(1, t / 0.006) * np.exp(-np.maximum(0, t - 0.08) / 0.13)).astype(np.float32)
    x = lp((saw + sub) * env, 1150)
    return (x / (np.max(np.abs(x)) + 1e-9) * 0.9).astype(np.float32)


def make_kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 52 + 145 * np.exp(-t / 0.021)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.155)
    punch = hp(noise(n), 2600) * np.exp(-t / 0.0035) * 0.55
    return (body + punch).astype(np.float32)


def make_hat(length=0.055, tau=0.013):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = bp(noise(n), 8200, 16500)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (7100, 9300, 11700)) * 0.02
    return ((x + metal) * np.exp(-t / tau)).astype(np.float32)


def make_shaker(length=0.075):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = bp(noise(n), 5400, 11500)
    env = (np.sin(np.pi * np.linspace(0, 1, n)) ** 1.1 * np.exp(-t / 0.04)).astype(np.float32)
    return (x * env).astype(np.float32)


def make_clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n, np.float32)
    for off in (0.0, 0.009, 0.018, 0.027):
        seg = int(0.03 * SR)
        burst = bp(noise(seg), 1100, 4200) * np.exp(-np.arange(seg) / SR / 0.006)
        i = int(off * SR)
        x[i:i + seg] += burst.astype(np.float32)
    x += (bp(noise(n), 1100, 4200) * np.exp(-t / 0.075) * 0.42).astype(np.float32)
    x += (hp(noise(n), 5200) * np.exp(-t / 0.04) * 0.3).astype(np.float32)
    return x


def make_snare():
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    body = bp(noise(n), 1500, 7200) * np.exp(-t / 0.09)
    tone = np.sin(2 * np.pi * 205 * t) * np.exp(-t / 0.045) * 0.5
    return (body * 0.9 + tone).astype(np.float32)


def make_crash(length=1.6):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = hp(noise(n), 3400)
    ring = sum(np.sin(2 * np.pi * f * t + i) for i, f in
               enumerate((4300, 5900, 7700, 9400, 11300))) * 0.012
    env = (np.minimum(1, t / 0.003) * np.exp(-t / 0.55)).astype(np.float32)
    return ((x + ring) * env).astype(np.float32)


def make_bell(f, length=2.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.zeros(n, np.float32)
    for p, a, tau in ((1.0, 1.0, 1.25), (2.0, 0.4, 0.65), (3.01, 0.24, 0.4), (4.98, 0.12, 0.26), (6.7, 0.06, 0.16)):
        x += (a * np.sin(2 * np.pi * f * p * t + 0.4 * p) * np.exp(-t / tau)).astype(np.float32)
    a = int(0.003 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return x


def make_pluck(f, length=0.5):
    """Bright pentatonic lead: fast attack, ringing top end."""
    n = int(length * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t)
         + 0.22 * np.sin(6 * np.pi * f * t) + 0.1 * np.sin(8 * np.pi * f * t))
    x *= np.exp(-t / 0.13)
    a = int(0.002 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return x.astype(np.float32)


def make_riser(length, f0=220, f1=1800, gain=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = noise(n)
    fc = f0 * (f1 / f0) ** (t / length)
    y = tv_lp(nz, fc)
    tone_ph = 2 * np.pi * np.cumsum(f0 * 0.5 * (f1 / f0) ** (t / length)) / SR
    tone = np.sin(tone_ph) * 0.12
    env = (t / length) ** 2.0
    return ((y * 2.2 + tone) * env * gain).astype(np.float32)


def make_whoosh(length=1.1, gain=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = noise(n)
    center = 380 + 3200 * np.exp(-(((t - length * 0.55) / (length * 0.26)) ** 2))
    low = tv_lp(nz, center * 0.55)
    mid = tv_lp(nz, center)
    y = (mid - low) * 2.4
    env = np.minimum(1, t / 0.03) * np.exp(-np.maximum(0, t - length * 0.55) / 0.32)
    return (y * env * gain).astype(np.float32)


def make_sub_drop(length=1.1, f0=82, f1=30):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.006) * np.exp(-t / 0.55)
    return (np.sin(ph) * env).astype(np.float32)


def make_impact():
    n = int(2.8 * SR)
    t = np.arange(n) / SR
    f = 33 + 60 * np.exp(-t / 0.22)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.85)
    burst = lp(noise(n), 2200) * np.exp(-t / 0.055) * 0.5
    click = hp(noise(n), 2800) * np.exp(-t / 0.006) * 0.35
    return (sub + burst + click).astype(np.float32)


def make_click():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    top = bp(noise(n), 1900, 6200) * np.exp(-t / 0.006) * 0.7
    thump = np.sin(2 * np.pi * 175 * t) * np.exp(-t / 0.03) * 0.45
    return (top + thump).astype(np.float32)


def make_sparkle(freqs, gain=1.0):
    notes = []
    for i, f in enumerate(freqs):
        notes.append((int(0.06 * SR * i), (make_bell(f, 1.6) * (0.7 ** i)).astype(np.float32)))
    total = np.zeros(max(i0 + len(b) for i0, b in notes), np.float32)
    for i0, b in notes:
        total[i0:i0 + len(b)] += b
    return (total * gain).astype(np.float32)


STABS = {name: make_stab(notes) for name, notes in CHORDS.items()}
BELL_LEAD = {f: make_pluck(f) for f in
             {n for notes in CHORDS.values() for n in notes} | {n * 2 for notes in CHORDS.values() for n in notes}}


# ── Schedule: pads, stabs, bass ──────────────────────────────────────────────
PAD_SPANS = [
    (0.0, 'Amaj9', gb(-6)),           # brand card breathes before the pulse
    (gb(-6), 'Amaj9', gb(-4) - gb(-6)),
    (gb(-4), 'F#m9', gb(-3) - gb(-4)),  # still pad-only; the stabs enter next bar
    (DIP_MID, 'Amaj9', S06_REPLY - DIP_MID),   # spotlight swell
    (REPORT, 'Dmaj9', 2.0),
    (REPORT + 2.0, 'E9', END_CARD - REPORT - 2.0),
    (END_CARD, 'A6add9', END - END_CARD),
]
for start, name, length in PAD_SPANS:
    attack = 0.9 if start in (0.0, DIP_MID, END_CARD) else 0.06
    release = 1.6 if start in (0.0, DIP_MID, END_CARD) else 0.5
    pad = make_pad(CHORDS[name], length, attack=attack, release=release,
                   cutoff=2600 if start in (0.0, DIP_MID) else 3400)
    gain = 1.25 if start == END_CARD else 0.9
    add_stereo(harm, harm_send, pad, start, gain=gain, send=0.5)

# Groove bars: every chord bar that carries the beat grid, per grid anchor.
GROOVE_BARS = [(bar_grid('groove', b), chord_at(bar_grid('groove', b)))
               for b in range(-7, 25) if bar_grid('groove', b) <= CADENCE_HOLD]
DROP_BARS = [(bar_grid('drop', b), chord_at(bar_grid('drop', b))) for b in range(0, 2)]
FLOW_BARS_T = [(bar_grid('flow', b), FLOW_BARS[b]) for b in range(0, 6)
               if bar_grid('flow', b) < REPORT - 0.2]
CADENCE_BARS = [(REPORT, 'Dmaj9'), (REPORT + 2.0, 'E9'), (END_CARD, 'A6add9')]
GROOVE = sorted(GROOVE_BARS + DROP_BARS + FLOW_BARS_T + CADENCE_BARS)

HARMONIC_SPANS = [(gb(-3), S02, 'groove'), (S02, CADENCE_HOLD, 'groove'),
                  (CADENCE_HOLD, BURST, 'groove'),
                  (BURST, DIP, 'drop'), (S06_REPLY, REPORT, 'flow')]


for span_start, span_end, grid in HARMONIC_SPANS:
    for start, name in GROOVE:
        if not (span_start - 1e-9 <= start < span_end):
            continue
        length = min(chord_end(start), span_end) - start
        if length <= 0.05:
            continue
        bass = BASS_ROOT[name]
        stab = STABS[name]
        stab_gain = 0.15 if start < PORTAL else 0.20
        for t in beats_between(grid, start, start + length):
            # sub under the downbeat, an offbeat 8th for the drive, and a 16th
            # tail ahead of the next beat on the IV/V bars
            add_mono(harm, harm_send, make_bass(bass / 2, 0.5), t, gain=0.20, send=0.03)
            add_mono(harm, harm_send, make_bass(bass, 0.34), t + BEAT / 2, gain=0.40, pan=0.05, send=0.05)
            if name in ('Dmaj9', 'E9'):
                add_mono(harm, harm_send, make_bass(bass, 0.2), t + 0.75 * BEAT, gain=0.24, pan=-0.1, send=0.04)
            add_stereo(harm, harm_send, stab, t + 0.25 * BEAT, gain=stab_gain, send=0.26)
            add_stereo(harm, harm_send, stab, t + 0.75 * BEAT, gain=stab_gain * 0.75, send=0.26)

# ── Drums ────────────────────────────────────────────────────────────────────
KICK = make_kick()
HAT = make_hat()
OPEN = make_hat(0.24, 0.06)
SHAKER = make_shaker()
CLAP = make_clap()
SNARE = make_snare()
CRASH = make_crash()


def kick_at(t, gain=0.55):
    add_mono(bgm, bgm_send, KICK, t, gain=gain, send=0.02)
    i = int(t * SR)
    n = min(int(0.34 * SR), N - i)
    if n > 0:
        shape = 1 - 0.62 * np.exp(-np.arange(n) / SR / 0.085)
        duck[i:i + n] = np.minimum(duck[i:i + n], shape.astype(np.float32))


# Section 1: brand open. The pulse builds bar by bar so the 14s cold open is
# already moving, and the backbeat is in place before the S02 picker clicks.
for t in beats_between('groove', 0.0, S02):
    if t < gb(-7):
        continue
    odd = beat_index(t) % 2 == 1
    if t >= gb(-6):
        kick_at(t, 0.34 if t < gb(-2) else 0.5)
        add_mono(bgm, bgm_send, HAT, t + 0.5, gain=0.10, pan=0.2, send=0.02)
    if t >= gb(-4):
        add_mono(bgm, bgm_send, OPEN, t + 0.5, gain=0.12, pan=-0.2, send=0.03)
    if t >= gb(-3):
        for e in (0.25, 0.75):
            add_mono(bgm, bgm_send, HAT, t + e * BEAT, gain=0.065, pan=0.3, send=0.02)
    if t >= gb(-2) and odd:
        add_mono(bgm, bgm_send, CLAP, t, gain=0.22, pan=-0.06, send=0.13)

# Section 2: the main groove (S02 → S04) — four on the floor, clap backbeat,
# open hat on every offbeat, 16th shakers.
for t in beats_between('groove', S02, S05):
    kick_at(t, 0.56)
    add_mono(bgm, bgm_send, HAT, t + 0.25 * BEAT, gain=0.075, pan=0.32, send=0.02)
    add_mono(bgm, bgm_send, OPEN, t + 0.5, gain=0.155, pan=-0.22, send=0.04)
    add_mono(bgm, bgm_send, HAT, t + 0.75 * BEAT, gain=0.075, pan=-0.32, send=0.02)
    if beat_index(t) % 2 == 1:
        add_mono(bgm, bgm_send, CLAP, t, gain=0.30, pan=-0.06, send=0.12)
    for e in (0.125, 0.625):
        add_mono(bgm, bgm_send, SHAKER, t + e * BEAT, gain=0.05, pan=0.45, send=0.02)

# Section 3: the counting build (S05). The kick keeps running, hats go 16th and
# a snare roll fills the held dominant bar under the riser.
for t in beats_between('groove', S05, CADENCE_HOLD):
    kick_at(t, 0.58)
    add_mono(bgm, bgm_send, HAT, t + 0.25 * BEAT, gain=0.09, pan=0.3, send=0.02)
    add_mono(bgm, bgm_send, OPEN, t + 0.5, gain=0.15, pan=-0.2, send=0.03)
    add_mono(bgm, bgm_send, HAT, t + 0.75 * BEAT, gain=0.09, pan=-0.3, send=0.02)
    if beat_index(t) % 2 == 1:
        add_mono(bgm, bgm_send, CLAP, t, gain=0.28, pan=-0.06, send=0.11)
    for e in (0.125, 0.375, 0.625, 0.875):
        add_mono(bgm, bgm_send, SHAKER, t + e * BEAT, gain=0.05, pan=0.45, send=0.02)
for i, t in enumerate(np.arange(CADENCE_HOLD + 0.4, BURST - 0.04, 0.25)):
    add_mono(bgm, bgm_send, SNARE, t, gain=0.15 + 0.02 * i, pan=-0.12 + 0.24 * (i % 2), send=0.1)
add_mono(bgm, bgm_send, CRASH, BURST, gain=0.24, pan=0.0, send=0.4)

# Section 4: the drop — the 99+ burst is the new grid's downbeat.
for t in beats_between('drop', BURST, DIP):
    kick_at(t, 0.62)
    add_mono(bgm, bgm_send, HAT, t + 0.25 * BEAT, gain=0.09, pan=0.34, send=0.02)
    add_mono(bgm, bgm_send, OPEN, t + 0.5, gain=0.17, pan=-0.24, send=0.05)
    add_mono(bgm, bgm_send, HAT, t + 0.75 * BEAT, gain=0.09, pan=-0.34, send=0.02)
    if beat_index(t, 'drop') % 2 == 1:
        add_mono(bgm, bgm_send, CLAP, t, gain=0.32, pan=-0.06, send=0.14)

# Section 5: the spotlight gate is drum-free; shakers walk it into the flow grid.
for t in beats_between('drop', DIP_MID + 3.2, S06_REPLY):
    add_mono(bgm, bgm_send, SHAKER, t, gain=0.05, pan=0.4, send=0.03)
add_mono(bgm, bgm_send, make_riser(1.6, 320, 2400, 0.3), S06_REPLY - 1.6, gain=1.0, send=0.35)
add_mono(bgm, bgm_send, CRASH, S06_REPLY, gain=0.16, pan=0.0, send=0.35)

# Section 6: the workflow groove — still driving, one layer thinner so the
# chat and report card read.
for t in beats_between('flow', S06_REPLY, REPORT - 0.4):
    kick_at(t, 0.5)
    add_mono(bgm, bgm_send, HAT, t + 0.25 * BEAT, gain=0.07, pan=0.3, send=0.02)
    add_mono(bgm, bgm_send, OPEN, t + 0.5, gain=0.14, pan=-0.2, send=0.04)
    add_mono(bgm, bgm_send, HAT, t + 0.75 * BEAT, gain=0.07, pan=-0.3, send=0.02)
    if beat_index(t, 'flow') % 2 == 1:
        add_mono(bgm, bgm_send, CLAP, t, gain=0.26, pan=-0.06, send=0.12)
    for e in (0.125, 0.625):
        add_mono(bgm, bgm_send, SHAKER, t + e * BEAT, gain=0.045, pan=0.45, send=0.02)

# Crashes on the scene entries that read as section changes.
for t in (PORTAL, S04):
    add_mono(bgm, bgm_send, CRASH, t, gain=0.18, pan=0.0, send=0.4)

# ── Lead (bright pentatonic plucks) ─────────────────────────────────────────
LEAD_PATTERN = [0, 2, 3, 2, 4, 2, 1, 3]


def lead_notes(name: str) -> list[float]:
    return [f * 2 for f in CHORDS[name]]


# The lead drives the S03/S04 demo, answers the drop, and drops to a lighter
# 8th-note pulse under the S06 chat so the replies stay readable.
LEAD_SPANS = [(PORTAL, CADENCE_HOLD, 'groove', 0.115),
              (BURST, DIP, 'drop', 0.13),
              (S06_REPLY, REPORT - 0.4, 'flow', 0.075)]

for span_start, span_end, grid, gain in LEAD_SPANS:
    for start, name in GROOVE:
        if not (span_start - 1e-9 <= start < span_end):
            continue
        notes = lead_notes(name)
        for k, t in enumerate(beats_between(grid, start, min(chord_end(start), span_end))):
            for e in (0.0, 0.5):
                tt = t + e * BEAT
                if tt >= span_end:
                    continue
                f = notes[LEAD_PATTERN[(k * 2 + (1 if e else 0)) % 8]]
                add_mono(harm, harm_send, BELL_LEAD[f], tt, gain=gain,
                         pan=-0.38 if e else 0.38, send=0.3)

# Bell accents on the big picture beats.
for at, f, gain in [(CLICK[0], 1318.51, 0.1), (PORTAL, 1108.73, 0.12),
                    (S04, 1318.51, 0.11), (BURST, 1760.0, 0.16),
                    (S06_REPLY, 1318.51, 0.1), (END_CARD, 1760.0, 0.14)]:
    b = make_bell(f)
    add_mono(bgm, bgm_send, b, at, gain=gain * 1.6, pan=-0.1, send=0.55)
    for k in range(1, 3):
        add_mono(bgm, bgm_send, b, at + k * 0.375, gain=gain * 1.6 * 0.32 ** k,
                 pan=0.4 if k % 2 else -0.4, send=0.5)

# ── Risers ──────────────────────────────────────────────────────────────────
add_mono(bgm, bgm_send, make_riser(1.4, 300, 2600, 0.32), S02 - 1.3, gain=1.0, send=0.3)
add_mono(bgm, bgm_send, make_riser(1.6, 320, 2800, 0.32), PORTAL - 1.5, gain=1.0, send=0.3)
add_mono(bgm, bgm_send, make_riser(1.6, 300, 2600, 0.32), S04 - 1.5, gain=1.0, send=0.3)
add_mono(bgm, bgm_send, make_riser(2.6, 260, 3200, 0.36), CADENCE_HOLD - 0.4, gain=1.0, send=0.35)
add_mono(bgm, bgm_send, make_riser(1.8, 340, 2800, 0.34), END_CARD - 1.8, gain=1.0, send=0.3)

# ── Air ─────────────────────────────────────────────────────────────────────
air = hp(lp(noise(N), 7400), 500) * 0.012
add_stereo(bgm, bgm_send, np.stack([air, np.roll(air, 271)], 1), 0, gain=1.0, send=0.0)

# ── SFX ─────────────────────────────────────────────────────────────────────
for t in CLICK + [S03_CLICK_1, S03_CLICK_2, S04_CLICK]:
    add_mono(sfx, sfx_send, make_click(), t, gain=0.32, pan=0.0, send=0.12)

add_mono(sfx, sfx_send, make_whoosh(1.2), PORTAL - 0.15, gain=0.5, send=0.35)
add_mono(sfx, sfx_send, make_sub_drop(1.2), PORTAL, gain=0.45, send=0.3)
add_mono(sfx, sfx_send, make_whoosh(1.0), S04 - 0.3, gain=0.35, send=0.3)

# S05: the only big hit.
add_mono(sfx, sfx_send, make_riser(1.6, 200, 3200, 0.6), BURST - 1.5, gain=1.0, send=0.5)
add_mono(sfx, sfx_send, make_impact(), BURST, gain=1.15, send=0.6)
add_mono(sfx, sfx_send, make_sub_drop(0.9, 70, 28), BURST, gain=0.55, send=0.4)

# Lights out, lamp sparkle.
add_mono(sfx, sfx_send, make_sub_drop(0.5, 64, 26), DIP, gain=0.3, send=0.2)
add_mono(sfx, sfx_send, make_sparkle([1318.51, 1760.0, 2093.0], 0.5), DIP_MID + 0.05, gain=0.22, pan=0.2, send=0.6)

# Report card lands, end card resolves.
add_mono(sfx, sfx_send, make_sparkle([1046.5, 1318.51, 1567.98], 0.5), REPORT + 0.02, gain=0.24, pan=-0.15, send=0.6)
add_mono(sfx, sfx_send, make_impact(), END_CARD, gain=0.42, send=0.6)
add_mono(sfx, sfx_send, make_whoosh(1.4), END_CARD - 0.6, gain=0.3, send=0.35)
add_mono(sfx, sfx_send, make_sparkle([1760.0, 2637.02, 3520.0], 0.4), END_CARD + 0.02, gain=0.26, pan=0.25, send=0.65)

# End card morph: 唰 into the flip, 嗒 when the wordmark finishes blooming,
# sparkle as the orbit field arrives under the lockup.
add_mono(sfx, sfx_send, make_whoosh(0.7), MORPH_FLIP - 0.5, gain=0.42, send=0.3)
add_mono(sfx, sfx_send, make_click(), MORPH_LAND, gain=0.3, pan=0.1, send=0.2)
add_mono(sfx, sfx_send, make_sparkle([2093.0, 2637.02, 3135.96], 0.6), MORPH_FIELD, gain=0.2, pan=-0.2, send=0.6)

# ── Reverb ──────────────────────────────────────────────────────────────────
def make_ir(seconds=1.9, rt60=1.45):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-6.9078 * t / rt60)
    ir = []
    for _ in range(2):
        x = noise(n) * env
        x = lp(x, 8200)
        pre = int(0.012 * SR)
        x = np.concatenate([np.zeros(pre, np.float32), x])[:n]
        ir.append(x / np.sqrt(np.sum(x ** 2) + 1e-9))
    return np.stack(ir, 1).astype(np.float32)


IR = make_ir()


def apply_reverb(buf, send_buf, wet=1.0):
    for ch in range(2):
        w = signal.fftconvolve(send_buf[:, ch], IR[:, ch], mode='full')[:N]
        buf[:, ch] += (w * wet).astype(np.float32)


apply_reverb(bgm, bgm_send, 0.5)
apply_reverb(sfx, sfx_send, 0.9)

# ── Mixdown ─────────────────────────────────────────────────────────────────
harm *= duck[:, None]
harm_send *= duck[:, None]
bgm += harm
bgm_send += harm_send


def fade(x, start, length, in_=True):
    i = int(start * SR)
    n = min(int(length * SR), N - i)
    if n <= 0:
        return
    shape = np.linspace(0, 1, n) if in_ else np.linspace(1, 0, n)
    x[i:i + n] *= shape[:, None]


def compress(x, thresh=0.1, ratio=2.6):
    env = np.abs(x).max(axis=1) + 1e-6
    gain = np.minimum(1.0, (thresh + np.maximum(0, env - thresh) / ratio) / env)
    win = int(0.04 * SR)
    gain = uniform_filter1d(gain, win, mode='nearest')
    return x * gain[:, None]


bgm = compress(bgm)
for bus in (bgm, sfx):
    bus[:] = lp(hp(bus, 30), 16500)
    bus[:] = np.tanh(bus * 1.1) / 1.1

# Hard lights-out on the dip, then the spotlight pad swells back. Soft 8 ms
# edges on the gate so the cut does not click. This runs after the filters on
# purpose: an IIR band-edge filter rings for several milliseconds after the last
# sample, and gating before it would leave a low-frequency tail in the hole.
gate_in = int((DIP - 0.008) * SR)
gate_a = int(DIP * SR)
gate_b = int((DIP_MID + 0.01) * SR)
gate_out = int((DIP_MID + 0.018) * SR)
for bus in (bgm, sfx):
    bus[gate_in:gate_a] *= np.linspace(1, 0, gate_a - gate_in)[:, None]
    bus[gate_b:gate_out] *= np.linspace(0, 1, gate_out - gate_b)[:, None]
bgm[gate_a:gate_b] = 0
sfx[gate_a:gate_b] = 0
fade(bgm, 0.0, 0.5, True)
fade(bgm, END - 0.18, 0.18, False)
fade(sfx, END - 0.18, 0.18, False)

# Scale both stems by the same factor so the summed film audio keeps 1 dB of
# headroom instead of clipping when Remotion mixes them.
mix_peak = float(np.max(np.abs(bgm + sfx)))
stem_gain = 0.89 / max(mix_peak, 1e-9)
bgm *= stem_gain
sfx *= stem_gain

out_bgm = Path('public/audio/bgm/apple-score-bgm.wav')
out_sfx = Path('public/audio/sfx/apple-score-sfx.wav')
out_bgm.parent.mkdir(parents=True, exist_ok=True)
out_sfx.parent.mkdir(parents=True, exist_ok=True)
wavfile.write(out_bgm, SR, bgm.astype(np.float32))
wavfile.write(out_sfx, SR, sfx.astype(np.float32))

print(f'wrote {out_bgm}  {N / SR:.2f}s  peak {np.max(np.abs(bgm)):.3f} '
      f'rms {np.sqrt((bgm ** 2).mean()):.3f}')
print(f'wrote {out_sfx}  {N / SR:.2f}s  peak {np.max(np.abs(sfx)):.3f} '
      f'rms {np.sqrt((sfx ** 2).mean()):.3f}')
