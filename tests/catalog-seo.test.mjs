import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getExamTeluguMetadata } from "../lib/telugu-seo.ts";
import { resolveSeoFields } from "../lib/seo-fields.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("all public catalogue levels support optional custom search metadata", async () => {
  const [migration, catalog, examRoute, subjectRoute, testPage, fields] = await Promise.all([
    read("supabase/migrations/20260821213000_add_catalog_seo_fields.sql"),
    read("lib/catalog-data.ts"),
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("app/mock-tests/[id]/[exam]/[paper]/subject/[subject]/page.tsx"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
    read("lib/seo-fields.ts"),
  ]);
  for (const table of ["exam_states", "exams", "exam_groups", "exam_specializations", "papers", "subjects", "mock_tests"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table}[\\s\\S]*?seo_title text[\\s\\S]*?seo_description text`));
  }
  assert.match(catalog, /seo_title, seo_description/);
  assert.match(examRoute, /resolveSeoFields\(context\.exam/);
  assert.match(subjectRoute, /resolveSeoFields\(c\.subject/);
  assert.match(testPage, /resolveSeoFields\(test/);
  assert.match(fields, /fallback\.title/);
  assert.match(fields, /fallback\.description/);
});

test("every active exam automatically receives a complete public landing page", async () => {
  const [examRoute, catalog, sitemap, createAction] = await Promise.all([
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("lib/catalog-data.ts"),
    read("app/sitemap.ts"),
    read("app/admin/groups/actions.ts"),
  ]);

  assert.match(examRoute, /mock test papers/);
  assert.match(examRoute, /Latest mock tests/);
  assert.match(examRoute, /"@type": "FAQPage"/);
  assert.match(examRoute, /"@type": "ItemList"/);
  assert.match(examRoute, /context\.exam\.description/);
  assert.match(examRoute, /Mock tests are coming soon/);
  assert.match(catalog, /exam_groups[^\n]*description, seo_title, seo_description/);
  assert.match(sitemap, /for \(const exam of catalog\.exams\)/);
  assert.match(sitemap, /add\(examUrl\(state\.slug, exam\.slug\)/);
  assert.match(createAction, /public landing page is now available automatically/);
});

test("admin SEO fields are validated, optional, and independent from slugs", async () => {
  const [fields, form, action, stateManager, migration] = await Promise.all([
    read("lib/seo-fields.ts"),
    read("components/admin/SeoFields.tsx"),
    read("app/admin/seo/actions.ts"),
    read("app/admin/exams/StateManager.tsx"),
    read("supabase/migrations/20260821213000_add_catalog_seo_fields.sql"),
  ]);
  assert.match(fields, /SEO_TITLE_MAX_LENGTH = 100/);
  assert.match(fields, /SEO_DESCRIPTION_MAX_LENGTH = 320/);
  assert.match(form, /Do not add “\| Varadhi Prep”/);
  assert.match(action, /profile\?\.role !== "admin"/);
  assert.match(action, /tableByType/);
  assert.match(stateManager, /Save search appearance/);
  assert.match(migration, /Telangana Police Constable Mock Test 2026 – Free Online Tests/);
});

test("Telugu script SEO metadata generates bilingual titles, descriptions, and FAQs", async () => {
  const pc = getExamTeluguMetadata("police-constable", "Police Constable", "tg");
  assert.ok(pc);
  assert.equal(pc.teluguName, "తెలంగాణ పోలీస్ కానిస్టేబుల్");
  assert.match(pc.bilingualPageTitle, /TG Police Constable Free Mock Test 2026/);
  assert.match(pc.bilingualPageTitle, /తెలంగాణ పోలీస్ కానిస్టేబుల్/);
  assert.match(pc.bilingualDescription, /తెలంగాణ పోలీస్ కానిస్టేబుల్/);
  assert.ok(pc.keywords.length >= 5);
  assert.ok(pc.keywords.some((k) => k.includes("కానిస్టేబుల్")));
  assert.ok(pc.teluguFaqs.length >= 2);

  const dynamicTg = getExamTeluguMetadata("sub-inspector", "Sub Inspector", "tg");
  assert.ok(dynamicTg);
  assert.match(dynamicTg.teluguTitle, /తెలంగాణ Sub Inspector/);
  assert.match(dynamicTg.bilingualPageTitle, /TG Sub Inspector/);

  const examRoute = await read("app/mock-tests/[id]/[exam]/page.tsx");
  assert.match(examRoute, /getExamTeluguMetadata/);
  assert.match(examRoute, /teluguData\.teluguTitle/);
});

test("publicCollectionMetadata preserves bilingual titles and descriptions without dropping Telugu script", async () => {
  const publicSeo = await read("lib/public-seo.ts");
  assert.match(publicSeo, /title\.includes\("\|"\)/);
  assert.match(publicSeo, /minPunctuationIndex/);

  const resolved = resolveSeoFields(
    { seo_title: "Telangana Police Constable Mock Test 2026 – Free Online Tests", seo_description: "Take free Telangana Police Constable mock tests online for preliminary..." },
    { title: "Fallback Title", description: "Fallback Description" }
  );
  assert.equal(resolved.title, "Fallback Title");
  assert.equal(resolved.description, "Fallback Description");
});

test("APPSC Endowment Officer SEO generates rich bilingual metadata, keywords, and JSON-LD", async () => {
  const eo = getExamTeluguMetadata("appsc-endowment-officer-mock-test", "Endowment Officer", "andhra-pradesh");
  assert.ok(eo);
  assert.equal(eo.teluguName, "ఎండోమెంట్ ఆఫీసర్ (APPSC Endowment Officer)");
  assert.match(eo.bilingualPageTitle, /APPSC Endowment Officer Free Mock Test/);
  assert.match(eo.bilingualPageTitle, /ఎండోమెంట్ ఆఫీసర్/);
  assert.match(eo.bilingualDescription, /APPSC Endowment Officer/);
  assert.match(eo.bilingualDescription, /ఎండోమెంట్ ఆఫీసర్/);
  assert.match(eo.bilingualDescription, /Paper 1 GS & Paper 2 Hindu Philosophy/);
  assert.ok(eo.keywords.length >= 15);
  assert.ok(eo.keywords.some((k) => k.includes("Hindu philosophy")));

  const examRoute = await read("app/mock-tests/[id]/[exam]/page.tsx");
  assert.match(examRoute, /"@type": \["LearningResource", "Quiz"\]/);
  assert.match(examRoute, /courseCode: context\.exam\.slug\.toUpperCase\(\)/);
  assert.match(examRoute, /papersItemListJsonLd/);

  const resolved = resolveSeoFields(
    {
      seo_title: "APPSC Endowment Officer Mock Test – Online Exam Practice",
      seo_description: "Prepare for the APPSC Endowment Officer exam with online mock tests, practice questions, answers, and detailed explanations. Improve your accuracy, speed, and exam readiness with effective practice."
    },
    {
      title: eo.bilingualPageTitle,
      description: eo.bilingualDescription,
    }
  );
  assert.equal(resolved.title, eo.bilingualPageTitle);
  assert.equal(resolved.description, eo.bilingualDescription);
});

test("TG-TET SEO provides clean mock test focus without extraneous pattern, schedule or job profile bloat", async () => {
  const tet = getExamTeluguMetadata("tg-tet-2026", "TG TET 2026", "tg");
  assert.ok(tet);
  assert.equal(tet.teluguName, "తెలంగాణ టెట్ (TG-TET 2026)");
  assert.equal(tet.teluguTitle, "తెలంగాణ టెట్ 2026 ఉచిత మాక్ టెస్ట్");
  assert.equal(tet.bilingualPageTitle, "TG-TET 2026 Free Mock Test | తెలంగాణ టెట్ మాక్ టెస్ట్ తెలుగు");
  assert.match(tet.bilingualDescription, /TG-TET 2026 free online mock tests/);
  assert.equal(tet.pattern, undefined);
  assert.equal(tet.schedule, undefined);
  assert.equal(tet.jobProfile, undefined);
  assert.ok(tet.teluguFaqs.length >= 2);
  assert.ok(tet.englishFaqs.length >= 2);
});

