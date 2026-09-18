export function formatMockNumber(seriesNumber: number) {
  return String(Math.max(1, seriesNumber)).padStart(2, "0");
}

export function mockTestLabel(seriesNumber: number) {
  return `Mock Test ${formatMockNumber(seriesNumber)}`;
}

export function buildMockTestTitle({
  stateCode,
  examName,
  paperName,
  subjectName,
  seriesNumber,
}: {
  stateCode: string;
  examName: string;
  paperName: string;
  subjectName?: string | null;
  seriesNumber: number;
}) {
  const location = `${stateCode} ${examName} · ${paperName}`;
  return `${location}${subjectName ? ` · ${subjectName}` : ""} · ${mockTestLabel(seriesNumber)}`;
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
}: {
  examName: string;
  paperLabel: string;
  seriesNumber: number;
  subjectName?: string | null;
}) {
  return `${examName} · ${paperLabel}${subjectName ? ` · ${subjectName}` : ""} · ${mockTestLabel(seriesNumber)}`;
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

