export type ColorMode = "bw" | "color";
export type PagesPerSheet = "1" | "2" | "4" | "8" | "16";
export type PageSelection = "all" | "custom";

export interface PrintFileOptions {
  copies: number;
  colorMode: ColorMode;
  pagesPerSheet: PagesPerSheet;
  pageSelection: PageSelection;
  customPageRange: string; // e.g. "1-5, 8, 11-13"
}

export interface SelectedFile {
  id: string;
  file: File;
  totalPages: number | null; // null = not known yet (placeholder, backend will fill later)
  options: PrintFileOptions;
}

export const DEFAULT_PRINT_OPTIONS: PrintFileOptions = {
  copies: 1,
  colorMode: "bw",
  pagesPerSheet: "1",
  pageSelection: "all",
  customPageRange: "",
};