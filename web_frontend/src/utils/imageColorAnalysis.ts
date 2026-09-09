import type { InkAnalysisResult } from "./pdfColorAnalysis";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image"));
    };
    image.src = url;
  });
}

function calculateCoverage(imageData: ImageData): number {
  let inkPixels = 0;
  let sampledPixels = 0;
  for (let index = 0; index < imageData.data.length; index += 16) {
    const red = imageData.data[index];
    const green = imageData.data[index + 1];
    const blue = imageData.data[index + 2];
    const alpha = imageData.data[index + 3];
    if (alpha > 20 && (red + green + blue) / 3 < 240) inkPixels += 1;
    sampledPixels += 1;
  }
  return sampledPixels ? (inkPixels / sampledPixels) * 100 : 0;
}

function ratesFromCoverage(
  coverage: number,
  baseBwRate: number,
  baseColorRate: number,
): { bwRate: number; colorRate: number } {
  if (coverage <= 40) return { bwRate: baseBwRate, colorRate: baseColorRate };
  if (coverage <= 75) {
    const ratio = (coverage - 40) / 35;
    return { bwRate: baseBwRate + ratio * 2, colorRate: baseColorRate + ratio * 2 };
  }
  if (coverage <= 90) {
    const ratio = (coverage - 75) / 15;
    return { bwRate: baseBwRate + 2 + ratio * 1.5, colorRate: baseColorRate + 2 + ratio * 1.5 };
  }
  const ratio = (coverage - 90) / 10;
  return { bwRate: baseBwRate + 3.5 + ratio * 1.5, colorRate: baseColorRate + 3.5 + ratio * 1.5 };
}

export async function analyzeImageInkCoverage(
  file: File,
  baseBwRate: number,
  baseColorRate: number,
): Promise<InkAnalysisResult> {
  try {
    const image = await loadImage(file);
    const scale = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Unable to analyze image");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const coverage = Math.round(calculateCoverage(context.getImageData(0, 0, canvas.width, canvas.height)) * 10) / 10;
    const { bwRate, colorRate } = ratesFromCoverage(coverage, baseBwRate, baseColorRate);
    return {
      coveragePercentage: coverage,
      bwRate: Math.round(bwRate * 100) / 100,
      colorRate: Math.round(colorRate * 100) / 100,
      isDynamic: coverage > 40,
      inkMessage: coverage <= 40 ? null : coverage <= 75 ? "Extra ink, lvl-1" : coverage <= 90 ? "High ink, lvl-2" : "Very high ink, lvl-3",
    };
  } catch {
    return { coveragePercentage: 0, bwRate: baseBwRate, colorRate: baseColorRate, isDynamic: false, inkMessage: null };
  }
}
