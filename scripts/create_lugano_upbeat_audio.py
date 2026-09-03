from __future__ import annotations

import math
import random
import struct
import subprocess
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "social"
RATE = 44100
DURATION = 16.0
BPM = 128
BEAT = 60.0 / BPM


def env(x: float, decay: float) -> float:
    return math.exp(-decay * max(0.0, x))


def make_track(path: Path) -> None:
    rng = random.Random(20260821)
    chord_roots = [55.0, 65.41, 73.42, 49.0]  # A minor-style fashion loop
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        for i in range(round(RATE * DURATION)):
            t = i / RATE
            beat_pos = t % BEAT
            half_pos = t % (BEAT / 2)
            bar = int(t / (BEAT * 4))

            # Punchy four-on-the-floor kick.
            kick_phase = 2 * math.pi * (54 * beat_pos + 30 * beat_pos * beat_pos)
            kick = math.sin(kick_phase) * env(beat_pos, 18) * 0.52

            # Clap on beats two and four.
            beat_index = int(t / BEAT) % 4
            clap = 0.0
            if beat_index in (1, 3) and beat_pos < 0.12:
                clap = (rng.random() * 2 - 1) * env(beat_pos, 28) * 0.24

            # Bright eighth-note hi-hat.
            hat = (rng.random() * 2 - 1) * env(half_pos, 75) * 0.075

            # Syncopated bass notes, changing every bar.
            root = chord_roots[bar % len(chord_roots)]
            bass_gate = 1.0 if beat_pos < BEAT * 0.72 else 0.0
            bass = (math.sin(2 * math.pi * root * t) + 0.25 * math.sin(2 * math.pi * root * 2 * t)) * 0.20 * bass_gate

            # Airy synth chord for a premium fashion feel.
            chord = 0.0
            for ratio in (1.0, 1.25, 1.5):
                chord += math.sin(2 * math.pi * root * 4 * ratio * t)
            chord *= 0.035

            # Short rising accent at each scene change.
            accent = 0.0
            for cut in (1.8, 4.7, 7.6, 10.5, 13.4):
                dt = t - cut
                if 0 <= dt < 0.22:
                    accent += math.sin(2 * math.pi * (330 + 850 * dt) * dt) * env(dt, 12) * 0.12

            fade = min(1.0, t / 0.25, (DURATION - t) / 0.45)
            value = max(-0.96, min(0.96, (kick + clap + hat + bass + chord + accent) * fade))
            left = int(value * 32767)
            right = int(max(-0.96, min(0.96, value + chord * 0.15)) * 32767)
            wav.writeframesraw(struct.pack("<hh", left, right))


def main() -> None:
    ffmpeg = ROOT / ".tools/python/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
    source = OUT / "lugano-fits-v3.mp4"
    audio = OUT / "lugano-fits-v4-upbeat.wav"
    final = OUT / "lugano-fits-v4.mp4"
    make_track(audio)
    subprocess.run([
        str(ffmpeg), "-y", "-i", str(source), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "224k", "-shortest", "-movflags", "+faststart", str(final)
    ], check=True)
    audio.unlink(missing_ok=True)
    print(final)


if __name__ == "__main__":
    main()
