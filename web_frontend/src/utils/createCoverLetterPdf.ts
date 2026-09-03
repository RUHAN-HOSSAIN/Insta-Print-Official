import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function createCoverLetterPdf(name: string, roll: string): Promise<File> {
  const pdfDocument = await PDFDocument.create();
  const page = pdfDocument.addPage([595.28, 841.89]);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const fontSize = 24;
  const text = `${name}\n${roll}`;
  const lines = text.split("\n");
  const lineHeight = fontSize * 1.5;
  const firstLineY = (page.getHeight() + lineHeight) / 2;

  lines.forEach((line, index) => {
    const textWidth = font.widthOfTextAtSize(line, fontSize);
    page.drawText(line, {
      x: (page.getWidth() - textWidth) / 2,
      y: firstLineY - index * lineHeight,
      size: fontSize,
      font,
      color: rgb(0.05, 0.05, 0.05),
    });
  });

  const pdfBytes = await pdfDocument.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new File([pdfBuffer], `${roll}_cover-letter.pdf`, { type: "application/pdf" });
}

export function previewPdf(file: File): void {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}