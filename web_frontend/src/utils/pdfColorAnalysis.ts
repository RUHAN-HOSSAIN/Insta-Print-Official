// utils/pdfColorAnalysis.ts
import * as pdfjsLib from "pdfjs-dist";

// pdf.js worker setup — CDN URL এর বদলে local bundled worker (নির্ভরযোগ্য, version mismatch হবে না)
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

export interface InkAnalysisResult {
  coveragePercentage: number; // 0-100
  bwRate: number;             // ৳/page for B&W
  colorRate: number;          // ৳/page for Color
  isDynamic: boolean;         // true হলে base rate থেকে আলাদা
}

/**
 * প্রতি pixel চেক করে কতটুকু "ink" (non-white) আছে সেটা বের করে।
 * এইটা প্রকৃত color-detection না — dark pixel density মাপে (ink coverage)।
 */
function calculateCoverage(imageData: ImageData): number {
  const pixels = imageData.data;
  let inkPixels = 0;
  let sampledPixels = 0;

  // প্রতি pixel এ RGBA = 4 values, তাই i += 16 মানে প্রতি ৪র্থ pixel sample (performance এর জন্য)
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a > 20 && (r + g + b) / 3 < 240) {
      inkPixels++;
    }
    sampledPixels++;
  }

  return sampledPixels === 0 ? 0 : (inkPixels / sampledPixels) * 100;
}

/**
 * Coverage percentage থেকে B&W ও Color দুইটার rate বের করে।
 * Piecewise linear — 40% পর্যন্ত base rate অপরিবর্তিত, তারপর ধীরে বাড়ে।
 */
function getRatesFromCoverage(
  coverage: number,
  baseBw: number,
  baseColor: number,
): { bwRate: number; colorRate: number } {
  if (coverage <= 40) {
    return { bwRate: baseBw, colorRate: baseColor };
  }
  if (coverage <= 75) {
    const t = (coverage - 40) / (75 - 40);
    return { bwRate: baseBw + t * 2, colorRate: baseColor + t * 2 };
  }
  if (coverage <= 90) {
    const t = (coverage - 75) / (90 - 75);
    return { bwRate: baseBw + 2 + t * 1.5, colorRate: baseColor + 2 + t * 1.5 };
  }
  const t = (coverage - 90) / (100 - 90);
  return { bwRate: baseBw + 3.5 + t * 1.5, colorRate: baseColor + 3.5 + t * 1.5 };
}

/**
 * PDF এর প্রথম ৩টা page sample করে average ink coverage বের করে,
 * এবং সেই অনুযায়ী B&W ও Color উভয়ের dynamic rate রিটার্ন করে।
 * Fail করলে (corrupt PDF, worker error ইত্যাদি) base rate এ fallback করে।
 */
export async function analyzePdfInkCoverage(
  file: File,
  baseBwRate: number,
  baseColorRate: number,
): Promise<InkAnalysisResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages || 1;
    const pagesToSample = Math.min(3, numPages);

    let totalCoverage = 0;
    for (let i = 1; i <= pagesToSample; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        totalCoverage += calculateCoverage(imageData);
      }
    }

    const avgCoverage = Math.round((totalCoverage / pagesToSample) * 10) / 10;
    const { bwRate, colorRate } = getRatesFromCoverage(avgCoverage, baseBwRate, baseColorRate);

    return {
      coveragePercentage: avgCoverage,
      bwRate: Math.round(bwRate * 100) / 100,
      colorRate: Math.round(colorRate * 100) / 100,
      isDynamic: avgCoverage > 40,
    };
  } catch (err) {
    console.warn("Ink analysis failed, using base rate:", err);
    return {
      coveragePercentage: 0,
      bwRate: baseBwRate,
      colorRate: baseColorRate,
      isDynamic: false,
    };
  }
}