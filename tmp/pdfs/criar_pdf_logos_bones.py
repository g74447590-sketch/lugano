from pathlib import Path

from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "logos-bones-lugano-clothing.pdf"

ARTS = [
    {
        "title": "MONOGRAMA LC - OFF-WHITE E TERRACOTA",
        "file": ROOT / "fornecedor" / "artes" / "lugano-lc-shield-off-white-terracotta.png",
        "background": (0.12, 0.15, 0.19),
        "background_label": "Fundo escuro usado somente para visualização.",
    },
    {
        "title": "MONOGRAMA LC - AZUL-MARINHO E TERRACOTA",
        "file": ROOT / "fornecedor" / "artes" / "lugano-lc-shield-navy-terracotta.png",
        "background": (0.94, 0.94, 0.92),
        "background_label": "Fundo claro usado somente para visualização.",
    },
]


def fit_inside(image_size, box_w, box_h):
    img_w, img_h = image_size
    scale = min(box_w / img_w, box_h / img_h)
    return img_w * scale, img_h * scale


def draw_page(c, art, page_number):
    page_w, page_h = A4
    margin = 18 * mm
    image = Image.open(art["file"])

    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(margin, page_h - 22 * mm, "LUGANO CLOTHING")
    c.setFont("Helvetica", 8)
    c.drawRightString(page_w - margin, page_h - 21.5 * mm, f"ARTE PARA BONÉ | {page_number}/2")
    c.setLineWidth(0.9)
    c.line(margin, page_h - 26 * mm, page_w - margin, page_h - 26 * mm)

    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin, page_h - 37 * mm, art["title"])

    box_x = margin
    box_y = 66 * mm
    box_w = page_w - 2 * margin
    box_h = 172 * mm
    c.setFillColorRGB(*art["background"])
    c.rect(box_x, box_y, box_w, box_h, stroke=0, fill=1)

    draw_w, draw_h = fit_inside(image.size, box_w - 36 * mm, box_h - 30 * mm)
    draw_x = box_x + (box_w - draw_w) / 2
    draw_y = box_y + (box_h - draw_h) / 2
    c.drawImage(ImageReader(image), draw_x, draw_y, draw_w, draw_h,
                preserveAspectRatio=True, anchor="c", mask="auto")

    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica", 7)
    c.drawString(margin, 58 * mm, art["background_label"])
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, 49 * mm, "ARQUIVO-FONTE")
    c.setFont("Helvetica", 7)
    c.drawString(margin, 44.5 * mm, art["file"].name)
    c.drawString(margin, 40.5 * mm, f"Dimensões: {image.width} x {image.height} px | Formato original: PNG com transparência")

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, 30.5 * mm, "ATENÇÃO AO FORNECEDOR")
    c.setFont("Helvetica", 7)
    c.drawString(margin, 26 * mm, "Arte rasterizada, não vetorial. Confirmar medidas, cores e técnica de aplicação antes da produção.")
    c.drawString(margin, 22 * mm, "Produzir uma amostra física para aprovação antes do lote final.")

    c.showPage()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Logos dos bonés - Lugano Clothing")
    c.setAuthor("Lugano Clothing")
    for index, art in enumerate(ARTS, start=1):
        draw_page(c, art, index)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
