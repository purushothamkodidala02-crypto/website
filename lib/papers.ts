export type OrderedPaper = {
  id: string;
  exam_group_id: string;
  specialization_id?: string | null;
  name: string;
  display_order: number | null;
};

export type PaperDisplay = {
  number: number;
  shortLabel: string;
  label: string;
};

const ROMAN_NUMERALS: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

export function parseRomanNumeral(value: string): number | null {
  return ROMAN_NUMERALS[value.trim().toLowerCase()] ?? null;
}

export function extractPaperNumber(name: string): number | null {
  const trimmed = name.trim();

  // Match "Paper 2", "Paper-2", "Paper - 2", "Paper 02", "P2"
  const digitMatch = trimmed.match(/\bp(?:aper)?\s*[-_.:/]?\s*0*([1-9]\d*)\b/i);
  if (digitMatch) {
    const parsed = parseInt(digitMatch[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  // Match "Paper II", "Paper-II", "Paper - II", "Paper IV"
  const romanMatch = trimmed.match(
    /\bp(?:aper)?\s*[-_.:/]?\s*(x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/i,
  );
  if (romanMatch) {
    const roman = parseRomanNumeral(romanMatch[1]);
    if (roman !== null) return roman;
  }

  // Standalone Roman numerals e.g. "II", "II - Civil Engineering", "II. Civil"
  const standaloneRoman = trimmed.match(
    /^(x|ix|viii|vii|vi|v|iv|iii|ii|i)(?:\s*[-_.:/·–—]|\s*$)/i,
  );
  if (standaloneRoman) {
    const roman = parseRomanNumeral(standaloneRoman[1]);
    if (roman !== null) return roman;
  }

  return null;
}

export function formatPaperDisplay(
  name: string,
  assignedNumber: number,
): PaperDisplay {
  const extractedNumber = extractPaperNumber(name);
  const number = extractedNumber ?? assignedNumber;
  const shortLabel = `Paper ${number}`;

  const trimmed = name.trim();

  // Check if name is ONLY the paper designation (e.g. "Paper 1", "Paper II", "Paper-2", "II", "P2")
  const isOnlyPaperDesignation =
    /^(?:p(?:aper)?\s*[-_.:/]?\s*(?:\d+|x|ix|viii|vii|vi|v|iv|iii|ii|i)|(?:x|ix|viii|vii|vi|v|iv|iii|ii|i))$/i.test(
      trimmed,
    );

  if (isOnlyPaperDesignation) {
    return {
      number,
      shortLabel,
      label: shortLabel,
    };
  }

  // Check if name has a prefix like "Paper II - Civil Engineering" or "Paper 2: Civil"
  const prefixMatch = trimmed.match(
    /^p(?:aper)?\s*[-_.:/]?\s*(?:\d+|x|ix|viii|vii|vi|v|iv|iii|ii|i)\s*[-_.:/·–—]\s*(.+)$/i,
  );
  if (prefixMatch && prefixMatch[1]) {
    const descriptivePart = prefixMatch[1].trim();
    return {
      number,
      shortLabel,
      label: `Paper ${number} · ${descriptivePart}`,
    };
  }

  // Check if name is already formatted as "Paper <num> · <topic>"
  if (/^paper\s+\d+\s*·/i.test(trimmed)) {
    return {
      number,
      shortLabel,
      label: trimmed,
    };
  }

  // If paper name is descriptive, like "Civil Engineering" or "General Studies"
  return {
    number,
    shortLabel,
    label: `Paper ${number} · ${trimmed}`,
  };
}

export function buildPaperDisplayMap(
  papers: OrderedPaper[],
): Map<string, PaperDisplay> {
  const displayById = new Map<string, PaperDisplay>();

  // Group papers by exam_group_id so papers in the same exam are coordinated
  const papersByExam = new Map<string, OrderedPaper[]>();
  for (const paper of papers) {
    const list = papersByExam.get(paper.exam_group_id) ?? [];
    list.push(paper);
    papersByExam.set(paper.exam_group_id, list);
  }

  for (const examPapers of papersByExam.values()) {
    // Separate common papers (no specialization) and specialized papers
    const commonPapers = examPapers.filter((p) => !p.specialization_id);

    // Group specialized papers by specialization_id
    const specializedBySpec = new Map<string, OrderedPaper[]>();
    for (const paper of examPapers) {
      if (paper.specialization_id) {
        const list = specializedBySpec.get(paper.specialization_id) ?? [];
        list.push(paper);
        specializedBySpec.set(paper.specialization_id, list);
      }
    }

    // Sort papers within a group
    const sortPapers = (list: OrderedPaper[]) => {
      return [...list].sort((left, right) => {
        const leftExplicit = extractPaperNumber(left.name);
        const rightExplicit = extractPaperNumber(right.name);
        if (
          leftExplicit !== null &&
          rightExplicit !== null &&
          leftExplicit !== rightExplicit
        ) {
          return leftExplicit - rightExplicit;
        }

        const leftOrder = Number.isInteger(left.display_order)
          ? Number(left.display_order)
          : Number.MAX_SAFE_INTEGER;
        const rightOrder = Number.isInteger(right.display_order)
          ? Number(right.display_order)
          : Number.MAX_SAFE_INTEGER;

        return (
          leftOrder - rightOrder ||
          left.name.localeCompare(right.name) ||
          left.id.localeCompare(right.id)
        );
      });
    };

    // 1. Process common papers
    const sortedCommon = sortPapers(commonPapers);
    const usedCommonNumbers = new Set<number>();

    sortedCommon.forEach((paper, index) => {
      const explicitNum = extractPaperNumber(paper.name);
      const storedOrder = Number(paper.display_order);
      let num =
        explicitNum ??
        (Number.isInteger(storedOrder) && storedOrder > 0
          ? storedOrder
          : index + 1);
      while (usedCommonNumbers.has(num)) num += 1;
      usedCommonNumbers.add(num);

      displayById.set(paper.id, formatPaperDisplay(paper.name, num));
    });

    const commonCount = sortedCommon.length;

    // 2. Process specialized papers per specialization branch
    for (const specPapers of specializedBySpec.values()) {
      const sortedSpec = sortPapers(specPapers);
      const usedSpecNumbers = new Set<number>(usedCommonNumbers);

      sortedSpec.forEach((paper, index) => {
        const explicitNum = extractPaperNumber(paper.name);
        const storedOrder = Number(paper.display_order);

        let num: number;
        if (explicitNum !== null) {
          num = explicitNum;
        } else if (Number.isInteger(storedOrder) && storedOrder > 0) {
          num = storedOrder;
        } else {
          // If commonCount is 1, the first specialization paper defaults to Paper 2!
          num = commonCount + index + 1;
        }

        while (usedSpecNumbers.has(num)) num += 1;
        usedSpecNumbers.add(num);

        displayById.set(paper.id, formatPaperDisplay(paper.name, num));
      });
    }
  }

  return displayById;
}
