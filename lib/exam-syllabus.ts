import { buildPaperDisplayMap, type OrderedPaper } from "./papers";
import { summarizeExamNegativeMarking, formatMarkValue } from "./scoring";
import type { ExamPatternInfo } from "./telugu-seo";

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

// Official APPSC General Studies Syllabus released in government notifications
export const DEFAULT_APPSC_GENERAL_STUDIES_SYLLABUS = `01 . Major Current Events and Issues pertaining to International, National and State of Andhra Pradesh.
02 . General Science and its applications to the day to day life Contemporary developments in Science & Technology and Information Technology.
03 . History of India – emphasis will be on broad general understanding of the subject in its social, economic, cultural and political aspects with a focus on AP and Indian National Movement.
04 . Geography of India with focus on Andhra Pradesh.
05 . Indian polity and Governance: constitutional issues, public policy, reforms and e-Governance initiatives.
06 . Indian Economy and planning
07 . Sustainable Development and Environmental Protection
08 . Disaster management: vulnerability profile, prevention and mitigation strategies, Application of Remote Sensing and GIS in the assessment of Disaster
09 . Logical reasoning, analytical ability and logical interpretation.
10 . Data Analysis: Tabulation of data Visual representation of data Basic data analysis (Summary Statistics such as mean, median, mode and variance)and Interpretation.`;

// Official TGPRB Telangana Police Constable Syllabus released in government notifications
export const DEFAULT_TELANGANA_POLICE_SYLLABUS = `01 . Arithmetic & Quantitative Aptitude: Number systems, percentages, averages, ratio & proportion, profit & loss, time & work, simple & compound interest, data interpretation.
02 . Test of Reasoning & Mental Ability: Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, puzzle tests, non-verbal reasoning.
03 . General Science: Everyday science observation, basic concepts of physics, chemistry, biology, scientific inventions, environmental studies.
04 . History of India & Indian Culture: Ancient, medieval, and modern Indian history, socio-cultural movements, freedom struggle, prominent national leaders.
05 . Telangana History, Culture & State Formation: Satavahanas, Kakatiyas, Asaf Jahis, Telangana Armed Struggle, 1969 agitation, Telangana statehood movement & cultural heritage.
06 . Indian Geography, Polity & Economy: Physical geography of India & Telangana, Indian Constitution, political system, fundamental rights, economic planning & development.
07 . Current Events of National & International Importance: Recent national & global developments, awards, sports, appointments, science & tech milestones, state welfare schemes.
08 . General English & Language Comprehension: Vocabulary, grammar, reading comprehension, error spotting, sentence rearrangement.`;

// Official Paper 2 (Hindu Philosophy & Temple Systems) for Endowment Officer exams
export const DEFAULT_ENDOWMENT_PAPER2_SYLLABUS = `01 . Ramayana, Mahabharata & Bhagavata Puranam: Epics, philosophical teachings, prominent characters, ethical values, and socio-cultural impact.
02 . Hindu Agamas, Vaikhanasa, Pancharatra & Saivagamas: Temple construction, consecration, idol worship rituals, daily poojas, and utsavas.
03 . Classical Philosophy, Vedas, Upanishads & Darshanas: Advaita, Visishtadvaita, Dvaita, Karma theory, and spiritual paths.
04 . Prominent Hindu Saints, Acharyas & Bhakti Movement: Adi Shankaracharya, Ramanujacharya, Madhvacharya, Annamacharya, Thyagaraja, Ramadasu.
05 . Temple Administration & Endowment Acts: AP/TG Charitable and Hindu Religious Institutions and Endowments Act 1987, duties of Executive Officer, temple funds, audit, and land management.
06 . Hindu Festivals, Tirthas, Kshetras & Temple Architecture: Major pilgrim centers, Dravida and Nagara temple architecture, sthala puranams, and traditions.`;

export function deriveSubjectTitle(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(current events|current affairs)\b/.test(lower)) return "Current Events & Regional Affairs";
  if (/\b(general science|science & technology|science and technology)\b/.test(lower)) return "General Science & Technology";
  if (/\b(history of india|national movement)\b/.test(lower)) return "History of India & National Movement";
  if (/\bgeography\b/.test(lower)) return lower.includes("telangana") ? "Geography of India & Telangana" : "Geography of India & Andhra Pradesh";
  if (/\b(polity|governance|constitution)\b/.test(lower)) return "Indian Polity & Governance";
  if (/\b(economy|planning)\b/.test(lower)) return "Indian Economy & Planning";
  if (/\b(sustainable development|environmental protection)\b/.test(lower)) return "Sustainable Development & Environment";
  if (/\b(disaster management|remote sensing|gis)\b/.test(lower)) return "Disaster Management & GIS";
  if (/\b(logical reasoning|analytical ability)\b/.test(lower)) return "Logical Reasoning & Mental Ability";
  if (/\b(data analysis|tabulation|summary statistics)\b/.test(lower)) return "Data Analysis & Interpretation";
  if (/\b(arithmetic|quantitative)\b/.test(lower)) return "Arithmetic & Quantitative Aptitude";
  if (/\b(telangana history|statehood movement)\b/.test(lower)) return "Telangana History & Movement";
  if (/\b(hindu agamas|pancharatra|saivagamas)\b/.test(lower)) return "Hindu Agamas & Ritual Systems";
  if (/\b(ramayana|mahabharata|bhagavata)\b/.test(lower)) return "Ramayana, Mahabharata & Puranas";
  if (/\b(hindu philosophy|darshanas|upanishads)\b/.test(lower)) return "Hindu Philosophy & Darshanas";
  if (/\b(saints|acharyas|bhakti movement)\b/.test(lower)) return "Bhakti Movement & Prominent Acharyas";
  if (/\bendowments act\b/.test(lower)) return "Endowments Acts & Administration";
  if (/\b(temple architecture|festivals|tirthas)\b/.test(lower)) return "Temple Architecture & Sacred Traditions";
  if (/\b(general english|comprehension)\b/.test(lower)) return "General English & Comprehension";

  const colonIdx = text.indexOf(":");
  const dashIdx = text.indexOf("–") !== -1 ? text.indexOf("–") : text.indexOf("-");
  const cutIdx = colonIdx !== -1 && colonIdx < 50 ? colonIdx : dashIdx !== -1 && dashIdx < 50 ? dashIdx : -1;
  if (cutIdx !== -1) return text.slice(0, cutIdx).trim();

  const periodIdx = text.indexOf(".");
  if (periodIdx !== -1 && periodIdx < 50) return text.slice(0, periodIdx).trim();
  return text.slice(0, 45).trim();
}

export function extractFocusTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  if (/\binternational\b/.test(lower)) found.push("International Affairs");
  if (/\bnational\b/.test(lower)) found.push("National Importance");
  if (/\b(andhra pradesh|ap)\b/.test(lower)) found.push("Andhra Pradesh Affairs");
  if (/\btelangana\b/.test(lower)) found.push("Telangana Regional Focus");
  if (/\b(science & technology|science and technology)\b/.test(lower)) found.push("Science & Technology");
  if (/\b(information technology|it)\b/.test(lower)) found.push("Information Technology (IT)");
  if (/\b(day to day life|general science)\b/.test(lower)) found.push("Everyday Science Observations");
  if (/\b(freedom struggle|national movement)\b/.test(lower)) found.push("Indian National Movement");
  if (/\b(social|cultural)\b/.test(lower)) found.push("Social & Cultural History");
  if (/\bgeography\b/.test(lower)) found.push("Physical & Regional Geography");
  if (/\b(constitution|constitutional)\b/.test(lower)) found.push("Constitutional Framework");
  if (/\bpublic policy\b/.test(lower)) found.push("Public Policy & Governance");
  if (/\be-governance\b/.test(lower)) found.push("e-Governance Initiatives");
  if (/\b(planning|five year)\b/.test(lower)) found.push("Economic Planning & NITI Aayog");
  if (/\bsustainable development\b/.test(lower)) found.push("Sustainable Development Goals (SDGs)");
  if (/\b(environmental protection|environment)\b/.test(lower)) found.push("Environmental Protection & Ecology");
  if (/\bdisaster management\b/.test(lower)) found.push("Disaster Mitigation Strategies");
  if (/\b(remote sensing|gis)\b/.test(lower)) found.push("Remote Sensing & GIS Applications");
  if (/\bvulnerability profile\b/.test(lower)) found.push("Vulnerability Profile & Assessment");
  if (/\blogical reasoning\b/.test(lower)) found.push("Logical Reasoning");
  if (/\banalytical ability\b/.test(lower)) found.push("Analytical Ability");
  if (/\binterpretation\b/.test(lower)) found.push("Logical & Data Interpretation");
  if (/\btabulation\b/.test(lower)) found.push("Tabulation & Visual Representation");
  if (/\b(summary statistics|mean|median|mode)\b/.test(lower)) found.push("Summary Statistics (Mean, Median, Mode)");
  if (/\bvariance\b/.test(lower)) found.push("Variance & Distribution");
  if (/\b(arithmetic|quantitative)\b/.test(lower)) found.push("Arithmetic & Numerical Aptitude");

  return Array.from(new Set(found)).slice(0, 5);
}

export function parseGovernmentSyllabus(
  rawText: string,
  defaultPaperName = "Official Notification Syllabus",
): ComputedUnit[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const units: ComputedUnit[] = [];
  let currentNum = "";
  let currentLines: string[] = [];

  const flush = () => {
    if (currentLines.length === 0) return;
    const fullText = currentLines.join(" ");
    const num = currentNum || String(units.length + 1).padStart(2, "0");
    units.push({
      unitNumber: `Unit ${num}`,
      name: deriveSubjectTitle(fullText),
      paperName: defaultPaperName,
      description: fullText,
      topics: extractFocusTopics(fullText),
      testCount: 0,
    });
    currentLines = [];
  };

  for (const line of lines) {
    const match =
      line.match(/^([0-9]{1,2})\s*[.:\-–—]\s*(.*)$/i) ||
      line.match(/^Unit\s*([0-9]{1,2})\s*[.:\-–—]?\s*(.*)$/i);
    if (match) {
      flush();
      currentNum = match[1].padStart(2, "0");
      if (match[2]) currentLines.push(match[2]);
    } else {
      if (units.length === 0 && currentLines.length === 0) {
        currentNum = "01";
      }
      currentLines.push(line);
    }
  }
  flush();
  return units;
}

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
  customSyllabusText?: string | null;
}): ComputedSyllabus {
  const {
    examName,
    stateName,
    stateCode = "",
    boardName,
    papers,
    subjects,
    sections,
    tests,
    overridePattern,
    customSyllabusText,
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
      .map((s) => {
        const dbTopics = sectionsBySubjectId.get(s.id) ?? [];
        const parsedTopics = s.description && !s.description.toLowerCase().startsWith("covers all")
          ? s.description
              .split(/[,;]/)
              .map((t) => t.trim().replace(/\.$/, ""))
              .filter(Boolean)
          : [];
        const combinedTopics = Array.from(new Set([...dbTopics, ...parsedTopics]));
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description ?? null,
          topics: combinedTopics,
          testCount: testsBySubjectId.get(s.id) ?? 0,
        };
      });

    const qCount = paper.question_count && paper.question_count > 0 ? paper.question_count : null;
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

  const pattern: ComputedExamPattern = {
    authority: authorityLabel,
    totalPapers: activePapers.length,
    totalQuestions:
      overridePattern?.totalQuestions ?? (hasKnownQuestions ? sumQuestions : null),
    totalMarks: overridePattern?.totalMarks ?? (hasKnownMarks ? sumMarks : null),
    durationMinutes:
      overridePattern?.durationMinutes ?? (hasKnownDuration ? sumDuration : null),
    negativeMarking: overridePattern?.negativeMarking || negativeMarkingLabel,
    medium: overridePattern?.medium || "Bilingual (Telugu & English)",
    mode: overridePattern?.mode || (examName.toLowerCase().includes("police") ? "OMR Sheet (Offline)" : "CBT / OMR Sheet"),
    stages: overridePattern?.stages?.length ? overridePattern.stages : defaultStages,
  };

  // Compile curriculum units from official government syllabus or custom syllabus
  const units: ComputedUnit[] = [];

  const isAndhra =
    stateName.toLowerCase().includes("andhra") ||
    stateCode.toUpperCase() === "AP" ||
    boardName?.toLowerCase().includes("appsc") ||
    examName.toLowerCase().includes("appsc");

  const isPolice =
    examName.toLowerCase().includes("police") ||
    Boolean(boardName && boardName.toLowerCase().includes("police"));

  const isEndowment =
    examName.toLowerCase().includes("endowment");

  let rawGovtSyllabus = customSyllabusText?.trim() || "";

  if (!rawGovtSyllabus) {
    if (isAndhra) {
      rawGovtSyllabus = DEFAULT_APPSC_GENERAL_STUDIES_SYLLABUS;
    } else if (isPolice) {
      rawGovtSyllabus = DEFAULT_TELANGANA_POLICE_SYLLABUS;
    }
  }

  if (rawGovtSyllabus) {
    const parsedGovtUnits = parseGovernmentSyllabus(rawGovtSyllabus, "Paper 1: General Studies");
    for (const u of parsedGovtUnits) {
      const matched = computedPapers
        .flatMap((p) => p.subjects.map((s) => ({ ...s, paperSlug: p.slug })))
        .find(
          (s) =>
            s.name.toLowerCase() === u.name.toLowerCase() ||
            s.name.toLowerCase().includes(u.name.toLowerCase()) ||
            u.name.toLowerCase().includes(s.name.toLowerCase()),
        );

      units.push({
        ...u,
        paperSlug: matched?.paperSlug || computedPapers[0]?.slug,
        subjectSlug: matched?.slug,
        testCount: matched?.testCount ?? 0,
      });
    }

    // For Endowment Officer exams, append Paper 2 (Hindu Philosophy & Acts) if not in custom syllabus
    if (
      isEndowment &&
      !rawGovtSyllabus.toLowerCase().includes("hindu agamas") &&
      !rawGovtSyllabus.toLowerCase().includes("ramayana")
    ) {
      const p2Units = parseGovernmentSyllabus(
        DEFAULT_ENDOWMENT_PAPER2_SYLLABUS,
        "Paper 2: Hindu Philosophy & Temple Systems",
      );
      for (const u of p2Units) {
        const nextNum = String(units.length + 1).padStart(2, "0");
        const matched = computedPapers
          .flatMap((p) => p.subjects.map((s) => ({ ...s, paperSlug: p.slug })))
          .find(
            (s) =>
              s.name.toLowerCase() === u.name.toLowerCase() ||
              s.name.toLowerCase().includes(u.name.toLowerCase()) ||
              u.name.toLowerCase().includes(s.name.toLowerCase()),
          );

        units.push({
          ...u,
          unitNumber: `Unit ${nextNum}`,
          paperSlug: matched?.paperSlug || computedPapers[1]?.slug || computedPapers[0]?.slug,
          subjectSlug: matched?.slug,
          testCount: matched?.testCount ?? 0,
        });
      }
    }
  } else if (overridePattern?.subjects?.length) {
    const fallbackPaperSlug = computedPapers[0]?.slug;
    let unitIndex = 1;
    for (const sub of overridePattern.subjects) {
      const matchedPaperSubject = computedPapers
        .flatMap((p) => p.subjects.map((s) => ({ ...s, paperSlug: p.slug })))
        .find(
          (s) =>
            s.name.toLowerCase() === sub.name.toLowerCase() ||
            s.name.toLowerCase().includes(sub.name.toLowerCase()) ||
            sub.name.toLowerCase().includes(s.name.toLowerCase()),
        );

      const dbTopics = matchedPaperSubject?.topics ?? [];
      const parsedTopics = sub.description
        ? sub.description
            .split(/[,;]/)
            .map((t) => t.trim().replace(/\.$/, ""))
            .filter((t) => t.length > 0 && !t.toLowerCase().startsWith("covers all"))
        : [];

      const topicSet = new Set<string>();
      for (const t of dbTopics) topicSet.add(t);
      for (const t of parsedTopics) topicSet.add(t);
      const combinedTopics = Array.from(topicSet);

      units.push({
        unitNumber: `Unit ${String(unitIndex).padStart(2, "0")}`,
        name: sub.name,
        paperName: sub.teluguName || "General Curriculum",
        paperSlug: matchedPaperSubject?.paperSlug || fallbackPaperSlug,
        subjectSlug: matchedPaperSubject?.slug,
        description: sub.description || "",
        topics: combinedTopics,
        testCount: matchedPaperSubject?.testCount ?? 0,
      });
      unitIndex++;
    }
  } else {
    let unitIndex = 1;
    for (const paper of computedPapers) {
      for (const sub of paper.subjects) {
        const parsedTopics =
          sub.description && !sub.description.toLowerCase().startsWith("covers all")
            ? sub.description
                .split(/[,;]/)
                .map((t) => t.trim().replace(/\.$/, ""))
                .filter(Boolean)
            : [];
        const combinedTopics = Array.from(new Set([...sub.topics, ...parsedTopics]));

        units.push({
          unitNumber: `Unit ${String(unitIndex).padStart(2, "0")}`,
          name: sub.name,
          paperName: paper.label,
          paperSlug: paper.slug,
          subjectSlug: sub.slug,
          description: sub.description || "",
          topics: combinedTopics,
          testCount: sub.testCount,
        });
        unitIndex++;
      }
    }
  }

  const hasCurriculum = activePapers.length > 0 || units.length > 0;
  const calculatedTopicsCount = units.reduce((acc, u) => acc + u.topics.length, 0);

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
    totalSubjectsCount: units.length > 0 ? units.length : activeSubjects.length,
    totalTopicsCount: calculatedTopicsCount > 0 ? calculatedTopicsCount : activeSections.length,
  };
}
