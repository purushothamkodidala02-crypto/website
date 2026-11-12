export type MockTestQuestionMarks = {
  marks: number | null;
  negative_marks: number | null;
};

export type MockTestStatsSummary = {
  question_count: number;
  total_marks: number;
  maximum_negative_marks: number;
};

export function formatMarkValue(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Number(value.toFixed(2));
  return String(rounded === 0 ? 0 : rounded);
}

export function resolveMockTestScoring({
  questions,
  stats,
  targetQuestionCount,
  paperQuestionCount,
  defaultCorrectMarks,
  defaultNegativeMarks,
}: {
  questions?: MockTestQuestionMarks[];
  stats?: MockTestStatsSummary | null;
  targetQuestionCount?: number | null;
  paperQuestionCount?: number | null;
  defaultCorrectMarks?: number | null;
  defaultNegativeMarks?: number | null;
}) {
  const mqList = (questions ?? []).filter((q): q is MockTestQuestionMarks => Boolean(q));
  const configuredQuestionCount = Number(targetQuestionCount ?? paperQuestionCount ?? 0);
  const statQuestionCount = stats ? Number(stats.question_count ?? 0) : 0;
  const paperPositive = Number(defaultCorrectMarks ?? 0);
  const paperNegative = Math.max(0, Number(defaultNegativeMarks ?? 0));

  let questionCount: number | null = null;
  let totalMarks: number | null = null;
  let positiveMark = paperPositive > 0 ? paperPositive : 1;
  let negativeMarks = Number.isFinite(paperNegative) ? paperNegative : 0;

  if (mqList.length > 0) {
    questionCount = mqList.length;
    totalMarks = mqList.reduce((sum, q) => sum + Number(q.marks ?? 0), 0);
    const firstMarks = Number(mqList[0]?.marks ?? 0);
    positiveMark = firstMarks > 0 ? firstMarks : positiveMark;
    negativeMarks = Math.max(0, ...mqList.map((q) => Number(q.negative_marks ?? 0)));
  } else if (statQuestionCount > 0 && stats) {
    questionCount = statQuestionCount;
    totalMarks = Number(stats.total_marks ?? 0);
    const averagePositive =
      totalMarks > 0 ? Number((totalMarks / statQuestionCount).toFixed(2)) : 0;
    positiveMark = paperPositive > 0 ? paperPositive : averagePositive > 0 ? averagePositive : 1;
    negativeMarks = Math.max(0, Number(stats.maximum_negative_marks ?? 0));
  } else {
    questionCount = configuredQuestionCount > 0 ? configuredQuestionCount : null;
    totalMarks =
      questionCount !== null && paperPositive > 0 ? questionCount * paperPositive : null;
  }

  if (!Number.isFinite(negativeMarks) || negativeMarks < 0) {
    negativeMarks = 0;
  }

  const hasNegativeMarking = negativeMarks > 0;
  const formattedPositive = formatMarkValue(positiveMark);
  const formattedNegative = formatMarkValue(negativeMarks);

  return {
    questionCount,
    totalMarks,
    positiveMark,
    negativeMarks,
    hasNegativeMarking,
    negativeSummaryLabel: hasNegativeMarking ? formattedNegative : "No negative marking",
    markingPairLabel: hasNegativeMarking
      ? `+${formattedPositive} / -${formattedNegative}`
      : `+${formattedPositive} / None`,
    cardNegativeLabel: hasNegativeMarking ? `-${formattedNegative} Negative` : "No Negative",
  };
}

export function summarizeExamNegativeMarking(
  papers: { default_negative_marks?: number | null }[],
) {
  const uniqueValues = Array.from(
    new Set(
      papers
        .map((paper) => Number(paper.default_negative_marks ?? 0))
        .filter((value) => Number.isFinite(value) && value >= 0),
    ),
  ).sort((a, b) => a - b);

  const positiveValues = uniqueValues.filter((value) => value > 0);
  const hasAnyNegative = positiveValues.length > 0;
  const hasNoNegative = uniqueValues.includes(0);

  if (positiveValues.length === 1 && !hasNoNegative) {
    const formatted = formatMarkValue(positiveValues[0]);
    return {
      hasAnyNegative,
      hasNoNegative,
      positiveValues,
      cardTitle: "Realistic Negative Marking",
      cardDescription: `Real ${formatted} penalty scoring ensures you learn disciplined attempt strategy and avoid negative mark traps in the actual exam.`,
    };
  }

  if (positiveValues.length > 0) {
    const penalties = positiveValues.map((value) => `-${formatMarkValue(value)}`).join(" / ");
    return {
      hasAnyNegative,
      hasNoNegative,
      positiveValues,
      cardTitle: "Paper-Specific Marking Rules",
      cardDescription: `Each paper follows its official marking scheme—either no negative marking or ${penalties} penalty scoring per wrong answer.`,
    };
  }

  if (papers.length > 0) {
    return {
      hasAnyNegative: false,
      hasNoNegative: true,
      positiveValues: [] as number[],
      cardTitle: "No Negative Marking",
      cardDescription:
        "Follows the official zero negative marking pattern so you can focus on speed, accuracy, and confident full-paper attempts.",
    };
  }

  return {
    hasAnyNegative: false,
    hasNoNegative: false,
    positiveValues: [] as number[],
    cardTitle: "Official Marking Scheme",
    cardDescription:
      "Scoring and any negative marking rules automatically match each paper's official examination scheme once tests are published.",
  };
}

export function formatPatternNegativeDisplay(
  patternNegativeText?: string | null,
  positivePaperMarks?: number[],
) {
  const trimmed = patternNegativeText?.trim() ?? "";
  if (trimmed) {
    if (/^(no\s+negative|none|zero|0(?:\.0+)?(?:\s|$))/i.test(trimmed)) {
      return { headline: "None", detail: "No Deduction" };
    }
    const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const fractionMatch = trimmed.match(/(\d+\s*\/\s*\d+)/);
      return {
        headline: `${formatMarkValue(Number(numberMatch[1]))} Mark`,
        detail: fractionMatch ? `${fractionMatch[1].replace(/\s+/g, "")} Deduction` : "Per Wrong Answer",
      };
    }
  }

  if (positivePaperMarks && positivePaperMarks.length > 0) {
    return {
      headline: `${formatMarkValue(positivePaperMarks[0])} Mark`,
      detail: "Per Wrong Answer",
    };
  }

  return { headline: "None", detail: "No Deduction" };
}
