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

function paperGroupKey(paper: OrderedPaper) {
  return `${paper.exam_group_id}:${paper.specialization_id ?? "general"}`;
}

export function buildPaperDisplayMap(papers: OrderedPaper[]) {
  const groupedPapers = new Map<string, OrderedPaper[]>();

  for (const paper of papers) {
    const key = paperGroupKey(paper);
    groupedPapers.set(key, [...(groupedPapers.get(key) ?? []), paper]);
  }

  const displayById = new Map<string, PaperDisplay>();

  for (const group of groupedPapers.values()) {
    const ordered = [...group].sort((left, right) => {
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
    const usedNumbers = new Set<number>();

    ordered.forEach((paper, index) => {
      const storedOrder = Number(paper.display_order);
      let number =
        Number.isInteger(storedOrder) && storedOrder > 0
          ? storedOrder
          : index + 1;

      while (usedNumbers.has(number)) number += 1;
      usedNumbers.add(number);

      // If the paper name already includes "Paper" or "P1" (e.g., "Paper 1 - Telugu" or "Civil P1"), use it as the label
      // to avoid renaming it to a confusing "Paper 5".
      const hasPaperInName = /p(?:aper)?\s*[-_]?\s*\d+/i.test(paper.name.trim());
      
      displayById.set(paper.id, {
        number,
        shortLabel: hasPaperInName ? paper.name : `Paper ${number}`,
        label: hasPaperInName ? paper.name : `Paper ${number} · ${paper.name}`,
      });
    });
  }

  return displayById;
}
