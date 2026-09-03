from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

from create_lugano_video import make_audio


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "social"
ASSET_DIR = OUT / "lugano-fits-assets"
W, H, FPS, DURATION = 1080, 1920, 30, 16
NAVY, SAND, WHITE, GREEN = "#111D31", "#E8DDC8", "#F8F5EF", "#77846B"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_REG = "C:/Windows/Fonts/arial.ttf"

fits = [
    Image.open(ASSET_DIR / "fit-01-polo-navy-cap.png").convert("RGB"),
    Image.open(ASSET_DIR / "fit-02-star-tee.png").convert("RGB"),
    Image.open(ASSET_DIR / "fit-03-star-hoodie-cap-corrected.png").convert("RGB"),
    Image.open(ASSET_DIR / "fit-04-polo-green.png").convert("RGB"),
]


def font(size: int, bold: bool = False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def center(draw: ImageDraw.ImageDraw, text: str, y: int, fnt, fill: str):
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((W - box[2] + box[0]) // 2, y), text, font=fnt, fill=fill)


def cover(img: Image.Image, zoom: float = 1.0, pan_y: float = 0.5):
    ratio = max(W / img.width, H / img.height) * zoom
    scaled = img.resize((round(img.width * ratio), round(img.height * ratio)), Image.Resampling.LANCZOS)
    left = max(0, (scaled.width - W) // 2)
    top = round(max(0, scaled.height - H) * pan_y)
    return scaled.crop((left, top, left + W, top + H))


def scene_fit(index: int, local: float, length: float, label: str, subtitle: str):
    progress = local / length
    frame = cover(fits[index], 1 + 0.025 * progress, 0.5)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, W, 238), fill=(17, 29, 49, 224))
    d.rectangle((0, 1730, W, H), fill=(17, 29, 49, 218))
    frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(frame)
    center(d, label, 73, font(70, True), WHITE)
    center(d, subtitle, 166, font(25), SAND)
    center(d, "LUGANO & CO.", 1782, font(34, True), WHITE)
    return frame


def render(t: float):
    if t < 1.8:
        frame = cover(fits[0], 1.08, 0.44)
        frame = ImageEnhance.Brightness(frame).enhance(0.36)
        d = ImageDraw.Draw(frame)
        center(d, "LUGANO FITS", 650, font(112, True), WHITE)
        center(d, "4 LOOKS. UMA PRESENÇA.", 800, font(34), SAND)
        d.rectangle((300, 875, 780, 881), fill=GREEN)
        return frame
    if t < 4.7:
        return scene_fit(0, t - 1.8, 2.9, "FIT 01", "POLO NAVY / ALFAIATARIA / CLUB CAP")
    if t < 7.6:
        return scene_fit(1, t - 4.7, 2.9, "FIT 02", "STAR TEE / CHARCOAL / OFF-WHITE")
    if t < 10.5:
        return scene_fit(2, t - 7.6, 2.9, "FIT 03", "STAR HOODIE / DENIM / CLUB CAP")
    if t < 13.4:
        return scene_fit(3, t - 10.5, 2.9, "FIT 04", "POLO GREEN / SAND / LUGANO DETAILS")
    frame = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(frame)
    d.ellipse((456, 420, 624, 588), outline=SAND, width=5)
    center(d, "L", 443, font(104, True), SAND)
    center(d, "LUGANO", 720, font(126, True), WHITE)
    center(d, "& CO.", 875, font(48), SAND)
    d.rectangle((295, 1008, 785, 1014), fill=GREEN)
    center(d, "MONTE O SEU FIT.", 1090, font(48, True), WHITE)
    center(d, "CONHEÇA A COLEÇÃO", 1450, font(31, True), SAND)
    center(d, "link na bio", 1510, font(27), WHITE)
    return frame


def main():
    sys.path.insert(0, str(ROOT / ".tools" / "python"))
    import imageio_ffmpeg

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    silent = OUT / "lugano-fits-v3-silent.mp4"
    wav = OUT / "lugano-fits-v3-original.wav"
    final = OUT / "lugano-fits-v3.mp4"
    proc = subprocess.Popen([
        ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
        "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(silent)
    ], stdin=subprocess.PIPE)
    assert proc.stdin
    for i in range(FPS * DURATION):
        proc.stdin.write(render(i / FPS).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("Falha ao codificar o vídeo")
    make_audio(wav)
    subprocess.run([ffmpeg, "-y", "-i", str(silent), "-i", str(wav), "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
    silent.unlink(missing_ok=True)
    wav.unlink(missing_ok=True)
    print(final)


if __name__ == "__main__":
    main()
