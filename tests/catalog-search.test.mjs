import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { expandSearchableText, scoreCatalogMatch, tokenizeSearchQuery } from "../lib/catalog-search.ts";
import { syllabusUrl } from "../lib/public-urls.ts";
import { getExamTeluguMetadata } from "../lib/telugu-seo.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("tokenizeSearchQuery handles English punctuation and preserves Telugu words", () => {
  assert.deepEqual(tokenizeSearchQuery("tg police exam syllabus"), ["tg", "police", "exam", "syllabus"]);
  assert.deepEqual(tokenizeSearchQuery("TG-TET 2026: Paper-1"), ["tg", "tet", "2026", "paper", "1"]);
  assert.deepEqual(tokenizeSearchQuery("తెలంగాణ పోలీస్ సిలబస్"), ["తెలంగాణ", "పోలీస్", "సిలబస్"]);
});

test("catalog search matches multi-word, regional alias, and syllabus queries without false positives", () => {
  const pcSeo = getExamTeluguMetadata("police-constable-free-mock-test", "Police Constable", "telangana");
  assert.ok(pcSeo);

  const pcHaystack = expandSearchableText([
    "Telangana",
    "TG",
    "TGPRB Police",
    "Police Constable",
    "Preliminary Written Test (PWT)",
    "Arithmetic",
    pcSeo.teluguName,
    pcSeo.keywords.join(" "),
    pcSeo.pattern?.subjects.map((s) => `${s.name} ${s.teluguName} ${s.description}`).join(" "),
    "exam syllabus pattern mock test",
  ]);

  const apHaystack = expandSearchableText([
    "Andhra Pradesh",
    "AP",
    "APPSC",
    "Group 2",
    "General Studies",
    "exam syllabus pattern mock test",
  ]);

  const tgGeoTestHaystack = expandSearchableText([
    "Telangana",
    "TG",
    "TGPRB Police",
    "Police Constable",
    "Principles of Geography",
    "exam syllabus pattern mock test",
  ]);

  assert.ok(scoreCatalogMatch(pcHaystack, "tg police exam syllabus") > 0);
  assert.ok(scoreCatalogMatch(pcHaystack, "ts police constable") > 0);
  assert.ok(scoreCatalogMatch(pcHaystack, "police syllabus") > 0);
  assert.ok(scoreCatalogMatch(pcHaystack, "తెలంగాణ పోలీస్ సిలబస్") > 0);

  // "tg police exam syllabus" must NOT match Andhra Pradesh Group 2
  assert.equal(scoreCatalogMatch(apHaystack, "tg police exam syllabus"), 0);

  // Short code "ap" must NOT falsely match "geography" inside Telangana
  assert.equal(scoreCatalogMatch(tgGeoTestHaystack, "ap"), 0);
  assert.ok(scoreCatalogMatch(apHaystack, "ap syllabus") > 0);

  // Exact/primary matches rank above incidental description matches
  const primaryMatchScore = scoreCatalogMatch(
    pcHaystack,
    "police constable",
    "Telangana TG Police Constable PWT Mock Test 01",
  );
  const secondaryMatchScore = scoreCatalogMatch(
    pcHaystack,
    "police constable",
    "Telangana TG General Mock Test 01",
  );
  assert.ok(primaryMatchScore > secondaryMatchScore);
});

test("exam syllabus redirect, sitemap entries, and catalog search integration are wired", async () => {
  const [examPage, catalogPage, sitemap, publicSeo, nextConfig] = await Promise.all([
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("app/mock-tests/page.tsx"),
    read("app/sitemap.ts"),
    read("lib/public-seo.ts"),
    read("next.config.ts"),
  ]);

  assert.equal(syllabusUrl("telangana", "police-constable-free-mock-test"), "/mock-tests/telangana/police-constable-free-mock-test/syllabus");
  assert.match(nextConfig, /source:\s*"\/mock-tests\/:state\/:exam\/syllabus"/);
  assert.match(nextConfig, /destination:\s*"\/mock-tests\/:state\/:exam"/);
  assert.doesNotMatch(examPage, /syllabusUrl/);
  assert.match(examPage, /rel="nofollow"/);
  assert.match(catalogPage, /scoreCatalogMatch/);
  assert.match(catalogPage, /matchingExams/);
  assert.doesNotMatch(sitemap, /syllabusUrl/);
  assert.match(publicSeo, /index:\s*true/);
  assert.match(publicSeo, /!filters\.view/);
  assert.match(nextConfig, /source:\s*"\/exams"/);
});
