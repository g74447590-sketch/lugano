from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "cartao-divulgacao-lugano-pb-a4-v1.pdf"
LINK = "https://linktr.ee/luganoco"


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


def draw_card(c, x, y, w, h):
    pad = 7 * mm
    c.setStrokeColorRGB(0, 0, 0)
    c.setFillColorRGB(0, 0, 0)
    c.setLineWidth(0.8)
    c.rect(x, y, w, h, stroke=1, fill=0)
    draw_crop_marks(c, x, y, w, h)

    left = x + pad
    top = y + h - 7.5 * mm
    c.setFont("Helvetica-Bold", 13)
    c.drawString(left, top, "LUGANO CLOTHING")
    c.setLineWidth(1.1)
    c.line(left, top - 2.3 * mm, x + w - pad, top - 2.3 * mm)

    c.setFont("Helvetica-Bold", 8)
    c.drawString(left, top - 8 * mm, "PRESENÇA SEM EXCESSO.")

    c.setFont("Helvetica", 7.5)
    c.drawString(left, top - 15 * mm, "Este brigadeiro ajuda a financiar")
    c.drawString(left, top - 19 * mm, "o crescimento da Lugano Clothing.")

    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(left, top - 26.5 * mm, "CONHEÇA O PROJETO")
    c.setFont("Helvetica", 7)
    c.drawString(left, top - 31 * mm, "Aponte a câmera para o QR Code")

    qr_size = 23 * mm
    qr_x = x + w - pad - qr_size
    qr_y = y + 10.5 * mm
    draw_qr(c, qr_x, qr_y, qr_size)

    c.setFont("Helvetica-Bold", 8)
    c.drawString(left, y + 13 * mm, "@lugano_coo")
    c.setFont("Helvetica", 6.5)
    c.drawString(left, y + 8.5 * mm, "linktr.ee/luganoco")


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Cartão de divulgação Lugano Clothing - versão 1")
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
