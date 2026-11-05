export function formatMockNumber(seriesNumber: number) {
  return String(Math.max(1, seriesNumber)).padStart(2, "0");
}

export function mockTestLabel(seriesNumber: number) {
  return `Mock Test ${formatMockNumber(seriesNumber)}`;
}

export function displayMockTestHeading({
  subjectName,
  sectionName,
  testScope,
  seriesNumber,
}: {
  subjectName?: string | null;
  sectionName?: string | null;
  testScope?: string | null;
  seriesNumber: number;
}) {
  const numberStr = formatMockNumber(seriesNumber);
  if (subjectName) {
    const sectionPart = sectionName ? ` (${sectionName})` : "";
    return `${subjectName}${sectionPart}: Mock Test ${numberStr}`;
  }
  if (testScope === "paper") {
    return `Full Length Mock Test ${numberStr}`;
  }
  return `Mock Test ${numberStr}`;
}

export function formatCardTitle({
  subjectName,
  sectionName,
  testScope,
  seriesNumber,
}: {
  subjectName?: string | null;
  sectionName?: string | null;
  testScope?: string | null;
  seriesNumber: number;
}) {
  const numberStr = formatMockNumber(seriesNumber);
  if (subjectName) {
    const sectionPart = sectionName ? ` (${sectionName})` : "";
    return `${subjectName}${sectionPart}: Mock ${numberStr}`;
  }
  if (testScope === "paper") {
    return `Full Length Mock ${numberStr}`;
  }
  return `Mock Test ${numberStr}`;
}

export function formatFullMockTestTitle({
  stateCode,
  examName,
  paperLabel,
  subjectName,
  sectionName,
  testScope,
  seriesNumber,
}: {
  stateCode?: string | null;
  examName: string;
  paperLabel: string;
  subjectName?: string | null;
  sectionName?: string | null;
  testScope?: string | null;
  seriesNumber: number;
}) {
  const statePrefix =
    stateCode && !examName.toUpperCase().includes(stateCode.toUpperCase())
      ? `${stateCode} `
      : "";
  const numberStr = formatMockNumber(seriesNumber);

  if (subjectName) {
    const sectionPart = sectionName ? ` (${sectionName})` : "";
    return `${statePrefix}${examName} ${paperLabel} – ${subjectName}${sectionPart} Mock Test ${numberStr}`;
  }

  const scopePrefix = testScope === "paper" ? "Full Length " : "";
    return `${statePrefix}${examName} ${paperLabel} – ${scopePrefix}Mock Test ${numberStr}`;
}

export function buildMockTestTitle({
  stateCode,
  examName,
  paperName,
  subjectName,
  sectionName,
  seriesNumber,
}: {
  stateCode: string;
  examName: string;
  paperName: string;
  subjectName?: string | null;
  sectionName?: string | null;
  seriesNumber: number;
}) {
  const location = `${stateCode} ${examName} · ${paperName}`;
  const subjectPart = subjectName
    ? sectionName
      ? ` · ${subjectName} (${sectionName})`
      : ` · ${subjectName}`
    : "";
  return `${location}${subjectPart} · ${mockTestLabel(seriesNumber)}`;
}

export function toCatalogSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function studentFacingMockTestTitle({
  examName,
  paperLabel,
  seriesNumber,
  subjectName,
  sectionName,
}: {
  examName: string;
  paperLabel: string;
  seriesNumber: number;
  subjectName?: string | null;
  sectionName?: string | null;
}) {
  const subjectPart = subjectName
    ? sectionName
      ? ` · ${subjectName} (${sectionName})`
      : ` · ${subjectName}`
    : "";
  return `${examName} · ${paperLabel}${subjectPart} · ${mockTestLabel(seriesNumber)}`;
}

export function inferExamKind(name: string) {
  const normalized = name.toLowerCase();
  if (/police|constable|\bsi\b|sub[- ]?inspector/.test(normalized)) return "police" as const;
  if (/teacher|tet|dsc|school|education/.test(normalized)) return "education" as const;
  if (/engineer|aee|ae\b|technical/.test(normalized)) return "engineering" as const;
  if (/executive|officer|group|service|psc/.test(normalized)) return "administration" as const;
  return "general" as const;
}

export function hasMockTestSuffixOrMention(name: string): boolean {
  if (!name) return false;
  return /\b(mock[\s-]*tests?|test[\s-]*series)\b/i.test(name);
}

export function formatExamHeading(name: string): string {
  if (!name) return "";
  if (hasMockTestSuffixOrMention(name)) {
    return name;
  }
  return `${name} Mock Tests`;
}

export function formatExamFallbackTitle(examName: string, stateName?: string): string {
  if (!examName) return "";
  const hasSuffix = hasMockTestSuffixOrMention(examName);
  const mentionsState = Boolean(stateName && examName.toLowerCase().includes(stateName.toLowerCase()));

  if (hasSuffix) {
    if (mentionsState || !stateName) {
      return examName;
    }
    return `${examName} in ${stateName}`;
  }

  if (mentionsState || !stateName) {
    return `${examName} Mock Tests`;
  }
  return `${examName} Mock Tests in ${stateName}`;
}

export function formatExamFallbackDescription(examName: string, stateName?: string): string {
  if (!examName) return "";
  const hasSuffix = hasMockTestSuffixOrMention(examName);
  const mentionsState = Boolean(stateName && examName.toLowerCase().includes(stateName.toLowerCase()));
  const target = hasSuffix ? examName : `${examName} mock tests`;
  const location = mentionsState || !stateName ? "" : ` for ${stateName}`;
  return `Practise free ${target}${location} on Varadhi Prep. Take timed online practice tests, review comprehensive explanations, and improve your score.`;
}

export type ParsedMockTestTitle = {
  breadcrumb: string[];
  primaryTitle: string;
  testLabel: string;
  title: string;
  topic?: string;
  rawTitle: string;
};

export function parseMockTestTitle(rawTitle: string): ParsedMockTestTitle {
  if (!rawTitle) {
    return {
      breadcrumb: [],
      primaryTitle: "Mock Test",
      testLabel: "",
      title: "Mock Test",
      rawTitle: "",
    };
  }

  const parts = rawTitle
    .split(/\s*[•·]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length >= 4) {
    const testLabel = parts[parts.length - 1];
    const topic = parts[parts.length - 2];
    return {
      breadcrumb: parts.slice(0, parts.length - 2),
      primaryTitle: topic,
      testLabel,
      topic,
      title: testLabel,
      rawTitle,
    };
  }

  if (parts.length === 3) {
    const testLabel = parts[2];
    const paperOrSubject = parts[1];
    return {
      breadcrumb: [parts[0]],
      primaryTitle: paperOrSubject,
      testLabel,
      title: testLabel,
      rawTitle,
    };
  }

  if (parts.length === 2) {
    const testLabel = parts[1];
    const subjectOrExam = parts[0];
    return {
      breadcrumb: [],
      primaryTitle: subjectOrExam,
      testLabel,
      title: testLabel,
      rawTitle,
    };
  }

  return {
    breadcrumb: [],
    primaryTitle: rawTitle,
    testLabel: "",
    title: rawTitle,
    rawTitle,
  };
}

