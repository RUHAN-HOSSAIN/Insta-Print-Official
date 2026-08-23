/**
 * Validates a page-range string like "1-5, 8, 11-13".
 * If totalPages is known, also checks that no page exceeds it.
 * Returns an error message, or null if valid.
 */
export const validatePageRange = (
  input: string,
  totalPages: number | null
): string | null => {
  const trimmed = input.trim();

  if (!trimmed) {
    return "Please enter a page range (e.g. 1-5, 8, 11-13)";
  }

  // Only digits, commas, hyphens, and spaces allowed
  if (!/^[\d,\-\s]+$/.test(trimmed)) {
    return "Only numbers, commas, and hyphens are allowed (e.g. 1-5, 8, 11-13)";
  }

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return "Please enter a valid page range";
  }

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = part.match(/^(\d+)$/);

    if (rangeMatch) {
      const from = Number(rangeMatch[1]);
      const to = Number(rangeMatch[2]);

      if (from < 1 || to < 1) {
        return "Page numbers must be at least 1";
      }
      if (from > to) {
        return `Invalid range "${part}" — start page must be less than end page`;
      }
      if (totalPages !== null && to > totalPages) {
        return `"${part}" goes beyond the document's ${totalPages} pages`;
      }
    } else if (singleMatch) {
      const page = Number(singleMatch[1]);
      if (page < 1) {
        return "Page numbers must be at least 1";
      }
      if (totalPages !== null && page > totalPages) {
        return `Page ${page} goes beyond the document's ${totalPages} pages`;
      }
    } else {
      return `"${part}" is not a valid page or range`;
    }
  }

  return null;
};

/** Counts how many pages a range string like "1-5, 8, 11-13" actually covers */
export const countPagesInRange = (input: string): number => {
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  let count = 0;

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = part.match(/^(\d+)$/);

    if (rangeMatch) {
      const from = Number(rangeMatch[1]);
      const to = Number(rangeMatch[2]);
      if (from <= to) count += to - from + 1;
    } else if (singleMatch) {
      count += 1;
    }
  }

  return count;
};