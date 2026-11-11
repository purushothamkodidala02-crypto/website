/**
 * Normalization, tokenization, and relevance scoring for on-site mock test
 * and syllabus catalog searches across English and Telugu text.
 */

const SEARCH_INTENT_STOPWORDS = new Set([
  "exam",
  "exams",
  "syllabus",
  "pattern",
  "notification",
  "mock",
  "test",
  "tests",
  "series",
  "free",
  "online",
  "practice",
  "practise",
  "paper",
  "papers",
  "for",
  "in",
  "of",
  "the",
  "and",
  "with",
]);

const ALIAS_EXPANSIONS: Array<[RegExp, string]> = [
  [/\btelangana\b/i, "tg ts"],
  [/\bandhra pradesh\b/i, "ap"],
  [/\btgprb\b/i, "tslprb tgprb"],
  [/\btslprb\b/i, "tgprb tslprb"],
  [/\btspsc\b/i, "tgpsc tspsc"],
  [/\btgpsc\b/i, "tspsc tgpsc"],
  [/\bpreliminary written test\b/i, "pwt prelims paper 1"],
  [/\bfinal written examination\b/i, "fwe mains"],
];

export function tokenizeSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/[\s,.;:!?/\\()[\]{}"'\-–—|_&+]+/)
    .filter(Boolean);
}

export function expandSearchableText(parts: Array<string | null | undefined>): string {
  const base = parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .toLowerCase();

  const extras: string[] = [];
  for (const [pattern, expansion] of ALIAS_EXPANSIONS) {
    if (pattern.test(base)) {
      extras.push(expansion);
    }
  }

  return extras.length > 0 ? `${base} ${extras.join(" ")}` : base;
}

export function scoreCatalogMatch(
  haystack: string,
  rawQuery: string,
  primaryText?: string,
): number {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) return 1;

  const allTokens = tokenizeSearchQuery(normalizedQuery);
  if (allTokens.length === 0) return 1;

  const normalizedHaystack = haystack.toLowerCase();
  const haystackTokenSet = new Set(tokenizeSearchQuery(normalizedHaystack));
  const contentTokens = allTokens.filter((token) => !SEARCH_INTENT_STOPWORDS.has(token));
  const requiredTokens = contentTokens.length > 0 ? contentTokens : allTokens;

  const matchesToken = (text: string, tokenSet: Set<string>, token: string) => {
    if (token.length <= 2) {
      return tokenSet.has(token);
    }
    return text.includes(token);
  };

  for (const token of requiredTokens) {
    if (!matchesToken(normalizedHaystack, haystackTokenSet, token)) {
      return 0;
    }
  }

  let score = 10;
  if (normalizedHaystack.includes(normalizedQuery)) {
    score += 50;
  }

  const normalizedPrimary = primaryText?.toLowerCase() ?? "";
  const primaryTokenSet = normalizedPrimary
    ? new Set(tokenizeSearchQuery(normalizedPrimary))
    : null;

  for (const token of allTokens) {
    if (matchesToken(normalizedHaystack, haystackTokenSet, token)) {
      score += contentTokens.includes(token) ? 10 : 3;
    }
    if (primaryTokenSet && matchesToken(normalizedPrimary, primaryTokenSet, token)) {
      score += contentTokens.includes(token) ? 12 : 4;
    }
  }

  return score;
}
