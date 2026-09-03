from __future__ import annotations

import math
import os
import struct
import subprocess
import sys
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "social"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
FPS = 30
DURATION = 16
TOTAL = FPS * DURATION

NAVY = "#111D31"
SAND = "#E8DDC8"
GREEN = "#77846B"
INK = "#101820"
WHITE = "#F8F5EF"

FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")
FONT_REG = Path("C:/Windows/Fonts/arial.ttf")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REG), size=size)


def cover(img: Image.Image, scale: float = 1.0, pan_x: float = 0.5, pan_y: float = 0.5) -> Image.Image:
    img = img.convert("RGB")
    ratio = max(W / img.width, H / img.height) * scale
    size = (max(W, round(img.width * ratio)), max(H, round(img.height * ratio)))
    img = img.resize(size, Image.Resampling.LANCZOS)
    left = round((img.width - W) * max(0, min(1, pan_x)))
    top = round((img.height - H) * max(0, min(1, pan_y)))
    return img.crop((left, top, left + W, top + H))


def contain(img: Image.Image, box: tuple[int, int], bg: str) -> Image.Image:
    canvas = Image.new("RGB", box, bg)
    copy = img.convert("RGB")
    copy.thumbnail(box, Image.Resampling.LANCZOS)
    canvas.paste(copy, ((box[0] - copy.width) // 2, (box[1] - copy.height) // 2))
    return canvas


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, fnt: ImageFont.FreeTypeFont, fill: str, spacing: int = 4) -> None:
    box = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    x = (W - (box[2] - box[0])) // 2
    draw.multiline_text((x, y), text, font=fnt, fill=fill, spacing=spacing, align="center")


def fade(frame: Image.Image, local_t: float, scene_len: float) -> Image.Image:
    edge = 0.35
    alpha = min(1.0, local_t / edge, (scene_len - local_t) / edge)
    if alpha >= 0.999:
        return frame
    return Image.blend(Image.new("RGB", frame.size, NAVY), frame, max(0, alpha))


paths = {
    "tee": ROOT / "public/collection/lugano-essential-tee-navy.png",
    "hoodies": ROOT / "public/collection/lugano-star-hoodies.png",
    "cap": ROOT / "public/collection/lugano-bone-algodao.png",
    "glasses": ROOT / "public/collection/lugano-oculos.png",
    "hero": ROOT / "public/hero-lugano-v2.png",
}
assets = {name: Image.open(path).convert("RGB") for name, path in paths.items()}


def render(t: float) -> Image.Image:
    # 0.0–2.5: editorial opening
    if t < 2.5:
        local, length = t, 2.5
        zoom = 1.0 + 0.025 * (t / length)
        bg = cover(assets["tee"], zoom, 0.5, 0.4).filter(ImageFilter.GaussianBlur(12))
        bg = ImageEnhance.Brightness(bg).enhance(0.42)
        frame = bg
        d = ImageDraw.Draw(frame)
        d.rectangle((72, 92, 1008, 98), fill=SAND)
        centered(d, "LUGANO & CO.", 150, font(42, True), SAND)
        centered(d, "STYLE SPEAKS\nBEFORE YOU DO", 690, font(92, True), WHITE, 2)
        centered(d, "ESSENTIALS / 2026", 970, font(29), SAND)
        return fade(frame, local, length)

    # 2.5–5.3: hoodie statement
    if t < 5.3:
        local, length = t - 2.5, 2.8
        zoom = 1.0 + 0.035 * (local / length)
        frame = cover(assets["hoodies"], zoom, 0.5, 0.5)
        overlay = Image.new("RGBA", (W, H), (17, 29, 49, 0))
        od = ImageDraw.Draw(overlay)
        od.rectangle((0, 0, W, 360), fill=(17, 29, 49, 220))
        od.rectangle((0, 1610, W, H), fill=(17, 29, 49, 225))
        frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")
        d = ImageDraw.Draw(frame)
        centered(d, "THE STAR EDIT", 118, font(74, True), WHITE)
        centered(d, "BLACK  /  WHITE  /  OFF-WHITE", 258, font(27), SAND)
        centered(d, "DESIGNED TO LEAVE A MARK.", 1692, font(42, True), WHITE)
        return fade(frame, local, length)

    # 5.3–8.1: cap, warm resort mood
    if t < 8.1:
        local, length = t - 5.3, 2.8
        frame = cover(assets["cap"], 1.0 + 0.03 * (local / length), 0.24, 0.5)
        d = ImageDraw.Draw(frame, "RGBA")
        d.rectangle((54, 104, 772, 365), fill=(232, 221, 200, 224))
        d.text((92, 142), "QUIET", font=font(94, True), fill=INK)
        d.text((92, 241), "CONFIDENCE.", font=font(60, True), fill=INK)
        d.rectangle((80, 1540, 1000, 1765), fill=(17, 29, 49, 218))
        centered(d, "LUGANO CLUB CAP", 1590, font(48, True), WHITE)
        centered(d, "THE DETAIL CHANGES EVERYTHING", 1670, font(25), SAND)
        return fade(frame, local, length)

    # 8.1–10.9: eyewear close-up
    if t < 10.9:
        local, length = t - 8.1, 2.8
        frame = cover(assets["glasses"], 1.0 + 0.045 * (local / length), 0.52, 0.26)
        d = ImageDraw.Draw(frame, "RGBA")
        d.rectangle((0, 0, W, 280), fill=(17, 29, 49, 230))
        centered(d, "SEE DIFFERENT.", 92, font(76, True), WHITE)
        d.rectangle((90, 1500, 990, 1728), fill=(232, 221, 200, 220))
        centered(d, "TIMELESS FORM", 1550, font(50, True), INK)
        centered(d, "LUGANO EYEWEAR", 1630, font(28), INK)
        return fade(frame, local, length)

    # 10.9–13.5: curated selection montage
    if t < 13.5:
        local, length = t - 10.9, 2.6
        frame = Image.new("RGB", (W, H), SAND)
        tee = contain(assets["tee"], (520, 880), WHITE)
        cap = contain(assets["cap"], (520, 880), SAND)
        glasses = contain(assets["glasses"], (1080, 720), WHITE)
        frame.paste(tee, (20, 270))
        frame.paste(cap, (540, 270))
        frame.paste(glasses, (0, 1150))
        d = ImageDraw.Draw(frame)
        d.rectangle((0, 0, W, 270), fill=NAVY)
        centered(d, "CURATED FOR YOUR ROUTINE", 86, font(58, True), WHITE)
        d.rectangle((0, 1810, W, H), fill=GREEN)
        centered(d, "LUGANO ESSENTIALS", 1848, font(34, True), WHITE)
        return fade(frame, local, length)

    # 13.5–16.0: brand close
    local, length = t - 13.5, 2.5
    frame = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(frame)
    d.ellipse((456, 440, 624, 608), outline=SAND, width=5)
    centered(d, "L", 463, font(108, True), SAND)
    centered(d, "LUGANO", 730, font(126, True), WHITE)
    centered(d, "& CO.", 885, font(48), SAND)
    d.rectangle((295, 1015, 785, 1021), fill=GREEN)
    centered(d, "WEAR YOUR PRESENCE.", 1100, font(44, True), WHITE)
    centered(d, "CONHEÇA A COLEÇÃO", 1450, font(31, True), SAND)
    centered(d, "link na bio", 1510, font(27), WHITE)
    return fade(frame, local, length)


def make_audio(path: Path) -> None:
    rate = 44100
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        for i in range(rate * DURATION):
            t = i / rate
            # Original minimal pulse: warm bass, soft chord and restrained beat.
            beat = math.exp(-18 * (t % 0.8))
            tone = 0.22 * math.sin(2 * math.pi * 55 * t) * beat
            pad = 0.06 * math.sin(2 * math.pi * 110 * t) + 0.035 * math.sin(2 * math.pi * 164.81 * t)
            shimmer = 0.025 * math.sin(2 * math.pi * 440 * t) * math.exp(-7 * (t % 1.6))
            fade_amp = min(1.0, t / 0.5, (DURATION - t) / 0.7)
            sample = int(max(-1, min(1, (tone + pad + shimmer) * fade_amp)) * 32767)
            wav.writeframesraw(struct.pack("<hh", sample, sample))


def main() -> None:
    tools = ROOT / ".tools" / "python"
    sys.path.insert(0, str(tools))
    import imageio_ffmpeg

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    silent = OUT / "lugano-style-speaks-silent.mp4"
    audio = OUT / "lugano-style-speaks-original.wav"
    final = OUT / "lugano-style-speaks.mp4"

    cmd = [
        ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
        "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium",
        "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(silent),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    try:
        for i in range(TOTAL):
            proc.stdin.write(render(i / FPS).tobytes())
    finally:
        proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("Video encoding failed")

    make_audio(audio)
    subprocess.run([
        ffmpeg, "-y", "-i", str(silent), "-i", str(audio), "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final),
    ], check=True)
    silent.unlink(missing_ok=True)
    audio.unlink(missing_ok=True)
    print(final)


if __name__ == "__main__":
    main()
