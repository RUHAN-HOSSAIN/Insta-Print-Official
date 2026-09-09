import { PDFDocument, rgb } from "pdf-lib";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_MARGIN = 18;

function loadImage(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

export async function convertImageToPdf(file: File): Promise<File> {
  const image = await loadImage(file);
  const isLandscape = image.width > image.height;
  const pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
  const pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;
  const pdfDocument = await PDFDocument.create();
  const page = pdfDocument.addPage([pageWidth, pageHeight]);
  const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
  const embeddedImage = isPng
    ? await pdfDocument.embedPng(await file.arrayBuffer())
    : await pdfDocument.embedJpg(await file.arrayBuffer());

  const availableWidth = pageWidth - PAGE_MARGIN * 2;
  const availableHeight = pageHeight - PAGE_MARGIN * 2;
  const scale = Math.min(
    availableWidth / image.width,
    availableHeight / image.height,
  );
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(1, 1, 1),
  });
  page.drawImage(embeddedImage, {
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  image.close();
  const pdfBytes = await pdfDocument.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new File([pdfBuffer], `${file.name.replace(/\.[^.]+$/, "")}.pdf`, {
    type: "application/pdf",
  });
}
