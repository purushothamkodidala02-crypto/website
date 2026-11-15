import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("AP Endowment Officer Notification 2026 broadsheet page exists and has comprehensive content", async () => {
  const page = await read("app/news/ap-endowment-officer-notification-2026/page.tsx");

  // Metadata & SEO
  assert.match(page, /title:\s*["']AP Endowment Officer Notification 2026/);
  assert.match(page, /ఎగ్జిక్యూటివ్ ఆఫీసర్/);
  assert.match(page, /CANONICAL_PATH\s*=\s*`\/news\/\${PRIMARY_SLUG}`/);

  // Structured Data (JSON-LD)
  assert.match(page, /"@type":\s*["']NewsArticle["']/);
  assert.match(page, /"@type":\s*["']JobPosting["']/);
  assert.match(page, /"@type":\s*["']FAQPage["']/);
  assert.match(page, /"@type":\s*["']BreadcrumbList["']/);

  // Snapshot metrics (104 posts, single-level CBRT, pay scale, 300 marks)
  assert.match(page, /104/);
  assert.match(page, /₹25,220/);
  assert.match(page, /₹80,910/);
  assert.match(page, /CBRT/);
  assert.match(page, /300 Marks/);

  // Section 29 Hindu religion requirement
  assert.match(page, /Section 29/);
  assert.match(page, /profess Hindu Religion/i);

  // Salary breakdown
  assert.match(page, /CPS/);
  assert.match(page, /₹33,517/);

  // Paper-I and Paper-II weightage analysis
  assert.match(page, /Paper-I:\s*General Studies/);
  assert.match(page, /Paper-II:\s*Hindu Philosophy/);
  assert.match(page, /Ramayanam/);
  assert.match(page, /Mahabharatham/);
  assert.match(page, /Bhagavatham/);
  assert.match(page, /Temple Agamas/);
  assert.match(page, /Endowments Act.*1987/i);

  // CPT Blueprint (G.O. Ms No. 26)
  assert.match(page, /Computer Proficiency Test/i);
  assert.match(page, /G\.O\.\s*Ms\s*No\.\s*26/i);

  // CTA link to mock tests
  assert.match(page, /\/mock-tests\/andhra-pradesh\/appsc-endowment-officer-mock-test/);

  // In-site PDF Viewing and Download
  assert.match(page, /\/docs\/appsc-endowment-officer-notification-2026-official\.pdf/);
  assert.match(page, /download="APPSC-Endowment-Officer-Notification-23-2026-Official\.pdf"/);
  assert.match(page, /<iframe[\s\S]*?src="\/docs\/appsc-endowment-officer-notification-2026-official\.pdf#toolbar=1/);
  assert.match(page, /id="pdf-viewer"/);
});

test("Official APPSC Endowment Officer PDF document exists under public docs", async () => {
  const { stat } = await import("node:fs/promises");
  const fileStat = await stat(new URL("../public/docs/appsc-endowment-officer-notification-2026-official.pdf", import.meta.url));
  assert.ok(fileStat.size > 100000, `Expected PDF file size > 100KB, got ${fileStat.size}`);
});

test("Root redirect and news slug alias routes handle AP Endowment Officer URLs cleanly", async () => {
  const [rootRedirect, slugPage, sitemap] = await Promise.all([
    read("app/ap-endowment-officer-notification-2026/page.tsx"),
    read("app/news/[slug]/page.tsx"),
    read("app/sitemap.ts"),
  ]);

  // Root redirect uses permanentRedirect
  assert.match(rootRedirect, /permanentRedirect\(["']\/news\/ap-endowment-officer-notification-2026["']\)/);

  // Slugs aliases
  assert.match(slugPage, /AP_ENDOWMENT_ALIASES/);
  assert.match(slugPage, /"ap-endowment-officer-notification-2026"/);
  assert.match(slugPage, /"appsc-endowment-officer-notification-2026"/);

  // Sitemap
  assert.match(sitemap, /\/news\/ap-endowment-officer-notification-2026/);
});
