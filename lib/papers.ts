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

export function extractStage(name: string): string | null {
  const match = name.match(
    /\b(screening(?:\s*test)?|prelims?|preliminary(?:\s*(?:written\s*test|examination|exam))?|\bpwt\b|mains?(?:\s*(?:written\s*test|examination|exam))?|\bfwe\b|written\s*(?:examination|exam)|tier\s*[-_]?[1234ivx]+|phase\s*[-_]?[1234ivx]+|stage\s*[-_]?[1234ivx]+)\b/i,
  );
  return match ? match[1].toLowerCase().replace(/\s+/g, " ") : null;
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
    // Check if common papers contain multiple distinct stages (e.g. Screening vs Mains in direct papers)
    const commonStages = new Set(
      commonPapers
        .map((p) => extractStage(p.name))
        .filter((s): s is string => Boolean(s)),
    );
    const hasMultipleCommonStages = commonStages.size > 1;

    if (hasMultipleCommonStages) {
      const commonByStage = new Map<string, OrderedPaper[]>();
      for (const paper of commonPapers) {
        const stage = extractStage(paper.name) ?? "common";
        const list = commonByStage.get(stage) ?? [];
        list.push(paper);
        commonByStage.set(stage, list);
      }
      for (const stagePapers of commonByStage.values()) {
        const sortedStage = sortPapers(stagePapers);
        const usedStageNumbers = new Set<number>();
        sortedStage.forEach((paper, index) => {
          const explicitNum = extractPaperNumber(paper.name);
          const storedOrder = Number(paper.display_order);
          let num =
            explicitNum ??
            (Number.isInteger(storedOrder) && storedOrder > 0
              ? storedOrder
              : index + 1);
          while (usedStageNumbers.has(num)) num += 1;
          usedStageNumbers.add(num);
          displayById.set(paper.id, formatPaperDisplay(paper.name, num));
        });
      }
    } else {
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
    }

    const commonCount = commonPapers.length;

    // 2. Process specialized papers per specialization branch
    for (const specPapers of specializedBySpec.values()) {
      const sortedSpec = sortPapers(specPapers);

      // Determine if this specialization represents an AEE-style technical branch:
      // Exactly 1 common paper (Paper 1), and specialization papers do not explicitly
      // declare themselves as Paper 1 or display_order 1 or a separate exam stage.
      const hasExplicitFirstPaper = sortedSpec.some((paper) => {
        const explicit = extractPaperNumber(paper.name);
        const storedOrder = Number(paper.display_order);
        return explicit === 1 || (Number.isInteger(storedOrder) && storedOrder === 1);
      });

      const isAeeStyleBranch = commonCount === 1 && !hasExplicitFirstPaper;
      const usedSpecNumbers = new Set<number>();

      sortedSpec.forEach((paper, index) => {
        const explicitNum = extractPaperNumber(paper.name);
        const storedOrder = Number(paper.display_order);

        let num: number;
        if (explicitNum !== null) {
          num = explicitNum;
        } else if (Number.isInteger(storedOrder) && storedOrder > 0) {
          num = storedOrder;
        } else if (isAeeStyleBranch) {
          // If commonCount is 1, the first specialization paper defaults to Paper 2!
          num = commonCount + index + 1;
        } else {
          // Independent stage or track (Screening, Mains, Written Examination, etc.): starts at Paper 1, Paper 2...
          num = index + 1;
        }

        while (usedSpecNumbers.has(num)) num += 1;
        usedSpecNumbers.add(num);

        displayById.set(paper.id, formatPaperDisplay(paper.name, num));
      });
    }
  }

  return displayById;
}
