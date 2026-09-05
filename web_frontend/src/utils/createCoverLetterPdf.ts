import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoUrl from "./logo_main_grayscale.jpg";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const TEXT_COLOR = rgb(0.38, 0.38, 0.38);
const DARK_TEXT_COLOR = rgb(0.25, 0.25, 0.25);
let grayscaleLogoBytes: Promise<ArrayBuffer> | null = null;

async function loadGrayscaleLogo(pdfDocument: PDFDocument) {
  try {
    grayscaleLogoBytes ??= fetch(logoUrl).then(async (response) => {
      if (!response.ok)
        throw new Error("Unable to load the cover-letter logo.");
      return response.arrayBuffer();
    });
    return await pdfDocument.embedJpg(await grayscaleLogoBytes);
  } catch {
    grayscaleLogoBytes = null;
    return null;
  }
}

function centeredX(pageWidth: number, textWidth: number): number {
  return (pageWidth - textWidth) / 2;
}

export async function createCoverLetterPdf(
  name: string,
  roll: string,
): Promise<File> {
  const pdfDocument = await PDFDocument.create();
  const page = pdfDocument.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadGrayscaleLogo(pdfDocument);

  if (logo) {
    const logoWidth = 92;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    page.drawImage(logo, {
      x: centeredX(PAGE_WIDTH, logoWidth),
      y: PAGE_HEIGHT - 190,
      width: logoWidth,
      height: logoHeight,
    });
  }

  const title = "Insta Print";
  page.drawText(title, {
    x: centeredX(PAGE_WIDTH, boldFont.widthOfTextAtSize(title, 29)),
    y: PAGE_HEIGHT - 237,
    size: 29,
    font: boldFont,
    color: DARK_TEXT_COLOR,
  });

  const subtitle = "Quick and Easy Document Printing Near Me";
  page.drawText(subtitle, {
    x: centeredX(PAGE_WIDTH, regularFont.widthOfTextAtSize(subtitle, 11)),
    y: PAGE_HEIGHT - 260,
    size: 11,
    font: regularFont,
    color: TEXT_COLOR,
  });

  const collector = "Collector";
  page.drawText(collector, {
    x: centeredX(PAGE_WIDTH, regularFont.widthOfTextAtSize(collector, 16)),
    y: PAGE_HEIGHT / 2 + 55,
    size: 16,
    font: regularFont,
    color: TEXT_COLOR,
  });

  const nameText = `Name: ${name}`;
  page.drawText(nameText, {
    x: centeredX(PAGE_WIDTH, regularFont.widthOfTextAtSize(nameText, 22)),
    y: PAGE_HEIGHT / 2 + 15,
    size: 22,
    font: regularFont,
    color: DARK_TEXT_COLOR,
  });

  const rollText = `Roll: ${roll}`;
  page.drawText(rollText, {
    x: centeredX(PAGE_WIDTH, boldFont.widthOfTextAtSize(rollText, 25)),
    y: PAGE_HEIGHT / 2 - 30,
    size: 25,
    font: boldFont,
    color: DARK_TEXT_COLOR,
  });

  const footer = "Thank you for stay with Insta Print";
  page.drawText(footer, {
    x: centeredX(PAGE_WIDTH, regularFont.widthOfTextAtSize(footer, 12)),
    y: 170,
    size: 12,
    font: regularFont,
    color: TEXT_COLOR,
  });

  const dateToday = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dateText = `Date: ${dateToday}`;
  page.drawText(dateText, {
    x: centeredX(PAGE_WIDTH, boldFont.widthOfTextAtSize(dateText, 12)),
    y: 150,
    size: 12,
    font: boldFont,
    color: TEXT_COLOR,
  });

  const pdfBytes = await pdfDocument.save();
  const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(pdfBuffer).set(pdfBytes);
  return new File([pdfBuffer], `${roll}_cover-letter.pdf`, {
    type: "application/pdf",
  });
}

export function previewPdf(file: File): void {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}