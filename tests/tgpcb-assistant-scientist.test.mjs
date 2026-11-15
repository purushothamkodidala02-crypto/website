import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("TGPCB Assistant Scientist (Analyst Grade-II) Notification 2026 broadsheet page exists and has comprehensive content", async () => {
  const page = await read("app/news/tgpcb-assistant-scientist-notification-2026/page.tsx");

  // Metadata & SEO
  assert.match(page, /title:\s*["']TGPSC TGPCB Assistant Scientist Cutoff Marks 2026/);
  assert.match(page, /తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డ్/);
  assert.match(page, /PRIMARY_SLUG\s*=\s*["']tgpcb-assistant-scientist-notification-2026["']/);

  // Structured Data (JSON-LD)
  assert.match(page, /"@type":\s*["']NewsArticle["']/);
  assert.match(page, /"@type":\s*["']JobPosting["']/);
  assert.match(page, /"@type":\s*["']FAQPage["']/);
  assert.match(page, /"@type":\s*["']BreadcrumbList["']/);

  // Snapshot metrics (20 posts, pay scale ₹45,960–₹1,24,150, 300 marks)
  assert.match(page, /TOTAL_VACANCIES\s*=\s*20/);
  assert.match(page, /₹45,960/);
  assert.match(page, /₹1,24,150/);
  assert.match(page, /300 Marks/);
  assert.match(page, /B\.Sc\./);
  assert.match(page, /Chemistry/);

  // Official 2026 Cutoff Marks & TGPSC Notification No. 01/OG/PC/2026
  assert.match(page, /01\/OG\/PC\/2026/);
  assert.match(page, /248\.91275/); // Topper / OC-UR-CF
  assert.match(page, /228\.79866/); // OC General Cutoff
  assert.match(page, /225\.77852/); // OC Women Cutoff
  assert.match(page, /225\.79195/); // BC-B Cutoff
  assert.match(page, /223\.76510/); // BC-D Cutoff
  assert.match(page, /222\.84564/); // BC-A & SC-GR2 Cutoff
  assert.match(page, /210\.68456/); // EWS Cutoff
  assert.match(page, /207\.68456/); // ST Cutoff
  assert.match(page, /202\.78523/); // SC-GR3 Regular Cutoff
  assert.match(page, /239\.73826/); // SC-GR3 Carry Forward

  // Selected candidates table with 19 rows
  assert.match(page, /2620114891/); // State 1st Rank HTNO
  assert.match(page, /2620113661/); // Rank 2 HTNO
  assert.match(page, /2620104957/); // Rank 104 HTNO
  assert.match(page, /19 Selected Candidates/);

  // Age relaxation (G.O.Ms.No.86 10 years up to 44)
  assert.match(page, /44 Years/);
  assert.match(page, /G\.O\.Ms\.No\.86/);

  // Scheme of Exam (Paper-I 150M + Paper-II 150M = 300M)
  assert.match(page, /Paper-I:\s*General Studies/);
  assert.match(page, /Paper-II:\s*Chemistry/);
  assert.match(page, /150 Questions/);
  assert.match(page, /150 Marks/);

  // Degree Chemistry Syllabus coverage across 4 branches
  assert.match(page, /Inorganic Chemistry/);
  assert.match(page, /Physical Chemistry/);
  assert.match(page, /Organic Chemistry/);
  assert.match(page, /Environmental (&|&amp;) Analytical Chemistry/);

  // Salary breakdown (~₹73,465 gross, ~₹65,921 net)
  assert.match(page, /₹73,465/);
  assert.match(page, /₹65,921/);

  // Bilingual FAQs
  assert.match(page, /FAQ/);
  assert.match(page, /teluguQuestion/);
});

test("TGPCB Assistant Scientist routes, aliases, sitemap, and admin entries are configured", async () => {
  const [rootRedirect, slugAliases, sitemap, adminPage, faqManager] = await Promise.all([
    read("app/tgpcb-assistant-scientist-notification-2026/page.tsx"),
    read("app/news/[slug]/page.tsx"),
    read("app/sitemap.ts"),
    read("app/admin/exam-pages/page.tsx"),
    read("app/admin/exam-pages/ExamPageFaqManager.tsx"),
  ]);

  // Root redirect
  assert.match(rootRedirect, /permanentRedirect\(["']\/news\/tgpcb-assistant-scientist-notification-2026["']\)/);

  // News slug aliases
  assert.match(slugAliases, /TGPCB_SCIENTIST_ALIASES/);
  assert.match(slugAliases, /tgpcb-assistant-scientist-notification-2026/);
  assert.match(slugAliases, /tspcb-assistant-scientist-notification-2026/);

  // Sitemap
  assert.match(sitemap, /\/news\/tgpcb-assistant-scientist-notification-2026/);

  // Admin exam pages
  assert.match(adminPage, /tgpcb-assistant-scientist-2026/);
  assert.match(adminPage, /https:\/\/varadhiprep\.in\/news\/tgpcb-assistant-scientist-notification-2026/);
  assert.match(faqManager, /tgpcb-assistant-scientist-2026/);
});
