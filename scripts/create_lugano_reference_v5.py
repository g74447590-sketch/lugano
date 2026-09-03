from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs/social"
ASSETS = OUT / "lugano-fits-assets"
W, H, FPS, DURATION = 1080, 1920, 30, 16
NAVY, CREAM, SAND, GREEN = "#111D31", "#F7F3EA", "#E8DDC8", "#78866B"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_REG = "C:/Windows/Fonts/arial.ttf"

fits = [
    Image.open(ASSETS / "fit-01-polo-navy-cap.png").convert("RGB"),
    Image.open(ASSETS / "fit-02-star-tee.png").convert("RGB"),
    Image.open(ASSETS / "fit-03-star-hoodie-cap-corrected.png").convert("RGB"),
    Image.open(ASSETS / "fit-04-polo-green.png").convert("RGB"),
]


def font(size: int, bold: bool = False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def center(draw: ImageDraw.ImageDraw, text: str, y: int, fnt, color: str):
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((W - (box[2] - box[0])) // 2, y), text, font=fnt, fill=color)


def cover(img: Image.Image, zoom: float, pan_y: float = 0.5):
    ratio = max(W / img.width, H / img.height) * zoom
    scaled = img.resize((round(img.width * ratio), round(img.height * ratio)), Image.Resampling.LANCZOS)
    x = max(0, (scaled.width - W) // 2)
    y = round(max(0, scaled.height - H) * pan_y)
    return scaled.crop((x, y, x + W, y + H))


def flash(frame: Image.Image, local: float):
    if local >= 0.10:
        return frame
    strength = (0.10 - local) / 0.10 * 0.44
    return Image.blend(frame, Image.new("RGB", frame.size, CREAM), strength)


def fit_frame(index: int, local: float, length: float, headline: str, sub: str):
    # Small punch-in followed by a slow editorial zoom.
    intro = min(1.0, local / 0.22)
    zoom = 1.085 - 0.045 * intro + 0.025 * (local / length)
    frame = cover(fits[index], zoom)
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    vd.rectangle((0, 0, W, 248), fill=(247, 243, 234, 230))
    vd.rectangle((0, 1745, W, H), fill=(247, 243, 234, 222))
    frame = Image.alpha_composite(frame.convert("RGBA"), veil).convert("RGB")
    d = ImageDraw.Draw(frame)
    center(d, headline, 55, font(77, True), NAVY)
    center(d, sub, 160, font(26), NAVY)
    center(d, "LUGANO & CO.", 1798, font(34, True), NAVY)
    d.rectangle((410, 1863, 670, 1868), fill=GREEN)
    return flash(frame, local)


def render(t: float):
    if t < 1.25:
        frame = cover(fits[0], 1.12)
        frame = ImageEnhance.Brightness(frame).enhance(0.31)
        d = ImageDraw.Draw(frame)
        center(d, "THE LUGANO EDIT", 665, font(92, True), CREAM)
        center(d, "4 FITS / 1 IDENTITY", 797, font(30), SAND)
        d.rectangle((350, 870, 730, 876), fill=GREEN)
        return frame
    if t < 4.1:
        return fit_frame(0, t - 1.25, 2.85, "CLUB", "POLO NAVY / ALFAIATARIA / LC CAP")
    if t < 6.95:
        return fit_frame(1, t - 4.1, 2.85, "STAR", "TEE BLACK / CHARCOAL / OFF-WHITE")
    if t < 9.8:
        return fit_frame(2, t - 6.95, 2.85, "LAYERED", "STAR HOODIE BACK / DENIM / LC CAP")
    if t < 12.65:
        return fit_frame(3, t - 9.8, 2.85, "RESORT", "POLO GREEN / SAND / LUGANO DETAILS")
    frame = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(frame)
    d.ellipse((458, 380, 622, 544), outline=SAND, width=5)
    center(d, "L", 404, font(98, True), SAND)
    center(d, "LUGANO", 690, font(126, True), CREAM)
    center(d, "& CO.", 844, font(46), SAND)
    d.rectangle((312, 986, 768, 992), fill=GREEN)
    center(d, "WEAR THE MOMENT.", 1076, font(50, True), CREAM)
    center(d, "CONHEÇA A COLEÇÃO", 1448, font(31, True), SAND)
    center(d, "link na bio", 1507, font(27), CREAM)
    return frame


def main():
    ffmpeg = ROOT / ".tools/python/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
    silent = OUT / "lugano-referencia-v5-silent.mp4"
    final = OUT / "lugano-referencia-v5.mp4"
    audio_source = OUT / "lugano-fits-v4.mp4"
    proc = subprocess.Popen([
        str(ffmpeg), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
        "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(silent)
    ], stdin=subprocess.PIPE)
    assert proc.stdin
    for i in range(FPS * DURATION):
        proc.stdin.write(render(i / FPS).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("Falha ao renderizar a versão v5")
    subprocess.run([
        str(ffmpeg), "-y", "-i", str(silent), "-i", str(audio_source),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "copy",
        "-shortest", "-movflags", "+faststart", str(final)
    ], check=True)
    silent.unlink(missing_ok=True)
    print(final)


if __name__ == "__main__":
    main()
