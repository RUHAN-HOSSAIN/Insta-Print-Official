import { PDFDocument } from "pdf-lib";

export async function reversePdfPages(file: File): Promise<File> {
  const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
  const outputPdf = await PDFDocument.create();
  const pageIndices = sourcePdf.getPageIndices().reverse();
  const pages = await outputPdf.copyPages(sourcePdf, pageIndices);

  for (const page of pages) outputPdf.addPage(page);

  const pdfBytes = await outputPdf.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new File([pdfBuffer], file.name, {
    type: "application/pdf",
    lastModified: file.lastModified,
  });
}