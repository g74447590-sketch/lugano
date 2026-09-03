from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "cartao-divulgacao-lugano-pb-a4.pdf"
LINK = "https://linktr.ee/luganoco"
SOURCE_IMAGE = ROOT / "public" / "collection" / "lugano-star-tees.png"
BW_IMAGE = ROOT / "tmp" / "pdfs" / "star-drop-pb.png"


def draw_crop_marks(c, x, y, w, h):
    mark = 3 * mm
    gap = 1.2 * mm
    c.setLineWidth(0.35)
    for px, direction in ((x, -1), (x + w, 1)):
        c.line(px + direction * gap, y, px + direction * (gap + mark), y)
        c.line(px + direction * gap, y + h, px + direction * (gap + mark), y + h)
    for py, direction in ((y, -1), (y + h, 1)):
        c.line(x, py + direction * gap, x, py + direction * (gap + mark))
        c.line(x + w, py + direction * gap, x + w, py + direction * (gap + mark))


def draw_qr(c, x, y, size):
    widget = qr.QrCodeWidget(LINK)
    bounds = widget.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(size, size, transform=[size / width, 0, 0, size / height, 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)


def prepare_bw_image():
    image = Image.open(SOURCE_IMAGE).convert("RGB")
    image = ImageOps.grayscale(image)
    image = ImageEnhance.Contrast(image).enhance(1.35)
    image = ImageOps.autocontrast(image, cutoff=1)
    image.save(BW_IMAGE, quality=92)


def draw_card(c, x, y, w, h):
    pad = 5.5 * mm
    c.setStrokeColorRGB(0, 0, 0)
    c.setFillColorRGB(0, 0, 0)
    c.setLineWidth(0.8)
    c.rect(x, y, w, h, stroke=1, fill=0)
    draw_crop_marks(c, x, y, w, h)

    left = x + pad
    top = y + h - 5.8 * mm

    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(left, top, "LUGANO CLOTHING")
    c.setFont("Helvetica", 5.6)
    c.drawRightString(x + w - pad, top, "PRESENÇA SEM EXCESSO")
    c.setLineWidth(0.8)
    c.line(left, top - 2 * mm, x + w - pad, top - 2 * mm)

    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(left, top - 7.5 * mm, "UM BRIGADEIRO HOJE.")
    c.drawString(left, top - 12.3 * mm, "MAIS LUGANO AMANHÃ.")

    c.setFont("Helvetica", 6.3)
    c.drawString(left, top - 17.5 * mm, "O lucro desta venda será investido no")
    c.drawString(left, top - 21.2 * mm, "crescimento da Lugano Clothing.")

    image_x = x + 57 * mm
    image_y = y + 29.5 * mm
    image_w = 27.5 * mm
    image_h = 17.5 * mm
    c.drawImage(ImageReader(BW_IMAGE), image_x, image_y, image_w, image_h,
                preserveAspectRatio=True, anchor="c", mask="auto")
    c.setFont("Helvetica-Bold", 5.8)
    c.drawCentredString(image_x + image_w / 2, image_y - 2.3 * mm, "STAR DROP - R$ 96")

    c.setLineWidth(0.45)
    c.line(left, y + 24.5 * mm, x + w - pad, y + 24.5 * mm)

    qr_size = 18.5 * mm
    qr_x = left
    qr_y = y + 3.5 * mm
    draw_qr(c, qr_x, qr_y, qr_size)

    text_x = qr_x + qr_size + 4 * mm
    c.setFont("Helvetica-Bold", 7.4)
    c.drawString(text_x, y + 19 * mm, "CONHEÇA AS PEÇAS")
    c.setFont("Helvetica", 5.8)
    c.drawString(text_x, y + 15.5 * mm, "Essential Tee - R$ 45")
    c.drawString(text_x, y + 12.3 * mm, "Star Drop - R$ 96")
    c.drawString(text_x, y + 9.1 * mm, "Star Hoodie - R$ 188")
    c.setFont("Helvetica-Bold", 6.7)
    c.drawString(text_x, y + 4.4 * mm, "@lugano_coo")

    c.setFillColorRGB(0, 0, 0)
    c.rect(x + w - 26.5 * mm, y + 3.5 * mm, 21 * mm, 18.5 * mm, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 5.8)
    c.drawCentredString(x + w - 16 * mm, y + 16.5 * mm, "NÃO É SÓ UM DOCE.")
    c.setFont("Helvetica", 5.4)
    c.drawCentredString(x + w - 16 * mm, y + 11.2 * mm, "FAZ PARTE DA")
    c.drawCentredString(x + w - 16 * mm, y + 7.5 * mm, "NOSSA HISTÓRIA.")
    c.setFillColorRGB(0, 0, 0)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    prepare_bw_image()
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Cartao de divulgacao Lugano Clothing - preto e branco")
    c.setAuthor("Lugano Clothing")

    card_w = 90 * mm
    card_h = 62 * mm
    gap_x = 10 * mm
    gap_y = 7 * mm
    start_x = (A4[0] - (2 * card_w + gap_x)) / 2
    total_h = 4 * card_h + 3 * gap_y
    start_y = (A4[1] - total_h) / 2

    for row in range(4):
        for col in range(2):
            x = start_x + col * (card_w + gap_x)
            y = start_y + (3 - row) * (card_h + gap_y)
            draw_card(c, x, y, card_w, card_h)

    c.showPage()
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
