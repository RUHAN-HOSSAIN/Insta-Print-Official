import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(file: File): Promise<number> {
  const fileBytes = await file.arrayBuffer();
  const pdfDocument = await PDFDocument.load(fileBytes, {
    ignoreEncryption: true,
  });
  return pdfDocument.getPageCount();
}
