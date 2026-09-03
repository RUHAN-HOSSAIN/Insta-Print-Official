import { useCallback, useState } from "react";
import type { PrintFile } from "../types/PrintRequest";

export function usePrintFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [totals, setTotals] = useState<number[]>([]);
  const [details, setDetails] = useState<(PrintFile | null)[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((current) => [...current, ...newFiles]);
    setTotals((current) => [...current, ...newFiles.map(() => 0)]);
    setDetails((current) => [...current, ...newFiles.map(() => null)]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setTotals((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setDetails((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  const updateTotal = useCallback((index: number, total: number) => {
    setTotals((current) => {
      if (current[index] === total) return current;
      const next = [...current];
      next[index] = total;
      return next;
    });
  }, []);

  const updateDetails = useCallback((index: number, fileDetails: PrintFile | null) => {
    setDetails((current) => {
      const previous = current[index];
      if (previous?.subtotal === fileDetails?.subtotal && previous?.pages === fileDetails?.pages && previous?.copies === fileDetails?.copies && previous?.color === fileDetails?.color) return current;
      const next = [...current];
      next[index] = fileDetails;
      return next;
    });
  }, []);

  const replaceFiles = useCallback((nextFiles: File[], nextDetails: (PrintFile | null)[]) => {
    setFiles(nextFiles);
    setDetails(nextDetails);
    setTotals(nextDetails.map((fileDetails) => fileDetails?.subtotal ?? 0));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setTotals([]);
    setDetails([]);
  }, []);

  return { files, totals, details, addFiles, removeFile, updateTotal, updateDetails, replaceFiles, clearFiles };
}
