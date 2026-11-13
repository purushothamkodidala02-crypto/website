import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { summarizeExamNegativeMarking, formatMarkValue } from "@/lib/scoring";
import type { ExamPatternInfo } from "@/lib/telugu-seo";

export type RawPaper = {
  id: string;
  exam_group_id: string;
  specialization_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number | null;
  question_count?: number | null;
  duration_minutes?: number | null;
  default_correct_marks?: number | null;
  default_negative_marks?: number | null;
  is_active?: boolean;
};

export type RawSubject = {
  id: string;
  paper_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
  display_order?: number | null;
};

export type RawSection = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
  display_order?: number | null;
};

export type RawTest = {
  id: string;
  paper_id: string;
  subject_id?: string | null;
  subject_section_id?: string | null;
};

export type ComputedPaperSubject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  topics: string[];
  testCount: number;
};

export type ComputedPaper = {
  id: string;
  name: string;
  label: string;
  slug: string;
  description: string | null;
  questionCount: number | null;
  durationMinutes: number | null;
  correctMarks: number;
  negativeMarks: number;
  totalMarks: number | null;
  subjects: ComputedPaperSubject[];
};

export type ComputedUnit = {
  unitNumber: string;
  name: string;
  paperName: string;
  paperSlug?: string;
  subjectSlug?: string;
  description: string;
  topics: string[];
  testCount: number;
};

export type ComputedExamPattern = {
  authority: string;
  totalPapers: number;
  totalQuestions: number | null;
  totalMarks: number | null;
  durationMinutes: number | null;
  negativeMarking: string;
  medium: string;
  mode: string;
  stages: string[];
};

export type ComputedSyllabus = {
  hasCurriculum: boolean;
  hasPapers: boolean;
  hasSubjects: boolean;
  pattern: ComputedExamPattern;
  papers: ComputedPaper[];
  units: ComputedUnit[];
  totalQuestionsCount: number;
  totalMarksCount: number;
  totalDurationMinutes: number;
  totalSubjectsCount: number;
  totalTopicsCount: number;
};

export function computeExamSyllabus(params: {
  examName: string;
  examDescription?: string | null;
  stateName: string;
  stateCode?: string | null;
  boardName?: string | null;
  papers: RawPaper[];
  subjects: RawSubject[];
  sections: RawSection[];
  tests: RawTest[];
  overridePattern?: ExamPatternInfo;
}): ComputedSyllabus {
  const {
    examName,
    examDescription,
    stateName,
    stateCode = "",
    boardName,
    papers,
    subjects,
    sections,
    tests,
    overridePattern,
  } = params;

  const activePapers = papers.filter((p) => p.is_active !== false);
  const paperDisplayById = buildPaperDisplayMap(activePapers as OrderedPaper[]);
  const paperIds = new Set(activePapers.map((p) => p.id));
  const activeSubjects = subjects.filter(
    (s) => paperIds.has(s.paper_id) && s.is_active !== false,
  );
  const subjectIds = new Set(activeSubjects.map((s) => s.id));
  const activeSections = sections.filter(
    (sec) => subjectIds.has(sec.subject_id) && sec.is_active !== false,
  );

  const sectionsBySubjectId = new Map<string, string[]>();
  for (const sec of activeSections) {
    const list = sectionsBySubjectId.get(sec.subject_id) ?? [];
    list.push(sec.name);
    sectionsBySubjectId.set(sec.subject_id, list);
  }

  const testsBySubjectId = new Map<string, number>();
  for (const test of tests) {
    if (test.subject_id) {
      testsBySubjectId.set(
        test.subject_id,
        (testsBySubjectId.get(test.subject_id) ?? 0) + 1,
      );
    }
  }

  const isEndowment =
    examName.toLowerCase().includes("endowment") ||
    Boolean(examDescription && examDescription.toLowerCase().includes("endowment")) ||
    Boolean(boardName && boardName.toLowerCase().includes("endowment"));

  // Build computed papers
  let sumQuestions = 0;
  let hasKnownQuestions = false;
  let sumMarks = 0;
  let hasKnownMarks = false;
  let sumDuration = 0;
  let hasKnownDuration = false;

  const computedPapers: ComputedPaper[] = activePapers.map((paper) => {
    const paperSubjects = activeSubjects
      .filter((s) => s.paper_id === paper.id)
      .map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description ?? null,
        topics: sectionsBySubjectId.get(s.id) ?? [],
        testCount: testsBySubjectId.get(s.id) ?? 0,
      }));

    const rawQCount = paper.question_count && paper.question_count > 0 ? paper.question_count : null;
    const qCount =
      isEndowment && (paper.slug === "general-studies-mental-abilities" || rawQCount === 136)
        ? 150
        : rawQCount;
    const durMins = paper.duration_minutes && paper.duration_minutes > 0 ? paper.duration_minutes : null;
    const correctMarks = Number(paper.default_correct_marks ?? 1) || 1;
    const negMarks = Number(paper.default_negative_marks ?? 0) || 0;
    const calcMarks = qCount ? qCount * correctMarks : null;

    if (qCount) {
      sumQuestions += qCount;
      hasKnownQuestions = true;
    }
    if (calcMarks) {
      sumMarks += calcMarks;
      hasKnownMarks = true;
    }
    if (durMins) {
      sumDuration += durMins;
      hasKnownDuration = true;
    }

    const label = paperDisplayById.get(paper.id)?.label ?? paper.name;

    return {
      id: paper.id,
      name: paper.name,
      label,
      slug: paper.slug,
      description: paper.description ?? null,
      questionCount: qCount,
      durationMinutes: durMins,
      correctMarks,
      negativeMarks: negMarks,
      totalMarks: calcMarks,
      subjects: paperSubjects,
    };
  });

  // Calculate negative marking
  const negativeSummary = summarizeExamNegativeMarking(activePapers);
  let negativeMarkingLabel = "No Negative";
  if (negativeSummary.positiveValues.length === 1 && !negativeSummary.hasNoNegative) {
    negativeMarkingLabel = `-${formatMarkValue(negativeSummary.positiveValues[0])} Penalty`;
  } else if (negativeSummary.hasAnyNegative) {
    negativeMarkingLabel = negativeSummary.positiveValues.map((v) => `-${formatMarkValue(v)}`).join(" / ");
  }

  // Derive authority
  const authorityLabel =
    overridePattern?.authority ||
    (boardName
      ? `${boardName} (${stateCode || stateName})`
      : `${stateName} State Examination Board`);

  // Default selection stages
  const defaultStages = [
    activePapers.length > 1
      ? `Written Examination (${activePapers.length} Papers)`
      : "Preliminary / Main Written Examination",
    "Certificate & Document Verification",
    "Final Merit Order & Selection",
  ];

  const resolvedAuthority =
    overridePattern?.authority ||
    (isEndowment
      ? (stateName.toLowerCase().includes("andhra") || stateCode?.toUpperCase() === "AP"
          ? "APPSC (Andhra Pradesh Public Service Commission)"
          : "TGPSC / APPSC Endowments Commission")
      : authorityLabel);

  const resolvedTotalQuestions =
    isEndowment
      ? null
      : overridePattern?.totalQuestions !== undefined
        ? overridePattern.totalQuestions
        : activePapers.length === 1 && hasKnownQuestions
          ? sumQuestions
          : null;

  const resolvedTotalMarks =
    overridePattern?.totalMarks !== undefined
      ? overridePattern.totalMarks
      : isEndowment
        ? 300
        : hasKnownMarks
          ? sumMarks
          : null;

  const pattern: ComputedExamPattern = {
    authority: resolvedAuthority,
    totalPapers: activePapers.length,
    totalQuestions: resolvedTotalQuestions,
    totalMarks: resolvedTotalMarks,
    durationMinutes:
      overridePattern?.durationMinutes ?? (hasKnownDuration ? sumDuration : null),
    negativeMarking:
      overridePattern?.negativeMarking ||
      (isEndowment ? "0.33 (1/3rd penalty per wrong answer)" : negativeMarkingLabel),
    medium: overridePattern?.medium || "Bilingual (Telugu & English)",
    mode: overridePattern?.mode || (examName.toLowerCase().includes("police") ? "OMR Sheet (Offline)" : "CBT / OMR Sheet"),
    stages: overridePattern?.stages?.length ? overridePattern.stages : defaultStages,
  };

  // Compile curriculum units from subjects
  const units: ComputedUnit[] = [];
  let unitIndex = 1;

  if (overridePattern?.subjects?.length) {
    const fallbackPaperSlug = computedPapers[0]?.slug;
    for (const sub of overridePattern.subjects) {
      const matchedPaperSubject = computedPapers
        .flatMap((p) => p.subjects.map((s) => ({ ...s, paperSlug: p.slug })))
        .find(
          (s) =>
            s.name.toLowerCase() === sub.name.toLowerCase() ||
            s.name.toLowerCase().includes(sub.name.toLowerCase()) ||
            sub.name.toLowerCase().includes(s.name.toLowerCase()),
        );

      units.push({
        unitNumber: `Unit ${String(unitIndex).padStart(2, "0")}`,
        name: sub.name,
        paperName: sub.teluguName || "General Curriculum",
        paperSlug: matchedPaperSubject?.paperSlug || fallbackPaperSlug,
        subjectSlug: matchedPaperSubject?.slug,
        description: sub.description,
        topics: matchedPaperSubject?.topics ?? [],
        testCount: matchedPaperSubject?.testCount ?? 0,
      });
      unitIndex++;
    }
  } else {
    for (const paper of computedPapers) {
      for (const sub of paper.subjects) {
        units.push({
          unitNumber: `Unit ${String(unitIndex).padStart(2, "0")}`,
          name: sub.name,
          paperName: paper.label,
          paperSlug: paper.slug,
          subjectSlug: sub.slug,
          description:
            sub.description ||
            `Covers all essential exam-oriented concepts, high-yield practice questions, and bilingual mock test preparation for ${sub.name}.`,
          topics: sub.topics,
          testCount: sub.testCount,
        });
        unitIndex++;
      }
    }
  }

  const hasCurriculum = activePapers.length > 0 || units.length > 0;

  return {
    hasCurriculum,
    hasPapers: activePapers.length > 0,
    hasSubjects: activeSubjects.length > 0,
    pattern,
    papers: computedPapers,
    units,
    totalQuestionsCount: hasKnownQuestions ? sumQuestions : 0,
    totalMarksCount: hasKnownMarks ? sumMarks : 0,
    totalDurationMinutes: hasKnownDuration ? sumDuration : 0,
    totalSubjectsCount: activeSubjects.length,
    totalTopicsCount: activeSections.length,
  };
}
