import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("HMWSSB Manager (Engineering) Notification 2026 broadsheet page exists and has comprehensive content", async () => {
  const page = await read("app/news/hmwssb-manager-engineering-notification-2026/page.tsx");

  // Metadata & SEO
  assert.match(page, /title:\s*["']TGPSC HMWSSB Manager \(Engineering\) Notification 2026/);
  assert.match(page, /హైదరాబాద్ మెట్రోపాలిటన్ వాటర్ సప్లై/);
  assert.match(page, /04\/OG\/HM\/2026/);
  assert.match(page, /PRIMARY_SLUG\s*=\s*["']hmwssb-manager-engineering-notification-2026["']/);

  // Structured Data (JSON-LD)
  assert.match(page, /"@type":\s*["']NewsArticle["']/);
  assert.match(page, /"@type":\s*["']JobPosting["']/);
  assert.match(page, /"@type":\s*["']FAQPage["']/);
  assert.match(page, /"@type":\s*["']BreadcrumbList["']/);

  // Snapshot metrics (130 posts, Multi Zone-II, pay scale, 450 marks)
  assert.match(page, /130/);
  assert.match(page, /₹54,220/);
  assert.match(page, /₹1,33,630/);
  assert.match(page, /450 Marks/);
  assert.match(page, /Multi Zone-II/);

  // Branch Quotas
  assert.match(page, /80%/);
  assert.match(page, /104 Posts/);
  assert.match(page, /15%/);
  assert.match(page, /5%/);
  assert.match(page, /Civil Engineering/);
  assert.match(page, /Electrical & Mechanical/);
  assert.match(page, /CSE \/ IT \/ ECE/);

  // Community and 95% Local Reservation
  assert.match(page, /95% local reservation/i);
  assert.match(page, /G\.O\.Ms\.No\.124/);
  assert.match(page, /Unreserved.*06/s);
  assert.match(page, /Local.*124/s);

  // Age relaxation (G.O.Ms.No.86 10 years up to 44)
  assert.match(page, /44 Years/);
  assert.match(page, /G\.O\.Ms\.No\.86/);

  // Fees (Unemployed 100% exempted from exam fee)
  assert.match(page, /₹1000/);
  assert.match(page, /₹120/);
  assert.match(page, /exempted/i);

  // Scheme of Exam (Paper-I 150M + Paper-II 300M = 450M)
  assert.match(page, /Paper-I:\s*General Studies/);
  assert.match(page, /Paper-II:\s*Concerned Subject/);
  assert.match(page, /150 Questions/);
  assert.match(page, /300 Marks/);

  // Syllabuses coverage for all engineering disciplines
  assert.match(page, /Building Materials and Construction/);
  assert.match(page, /Fluid Mechanics and Hydraulics/);
  assert.match(page, /Hydrology and Water Resources/);
  assert.match(page, /Environmental Engineering/);
  assert.match(page, /Applied Mechanics and Design/);
  assert.match(page, /Electric Circuits/);
  assert.match(page, /Computer Science (&|&amp;) Information Technology/);

  // Normalization formula (Annexure-VII)
  assert.match(page, /Normalization Formula/i);
  assert.match(page, /Annexure-VII/i);

  // Salary breakdown
  assert.match(page, /₹86,489/);
  assert.match(page, /₹77,541/);
});

test("HMWSSB Manager (Engineering) routes, aliases, sitemap, and admin entries are configured", async () => {
  const [rootRedirect, slugAliases, sitemap, adminPage, faqManager] = await Promise.all([
    read("app/hmwssb-manager-engineering-notification-2026/page.tsx"),
    read("app/news/[slug]/page.tsx"),
    read("app/sitemap.ts"),
    read("app/admin/exam-pages/page.tsx"),
    read("app/admin/exam-pages/ExamPageFaqManager.tsx"),
  ]);

  // Root redirect
  assert.match(rootRedirect, /permanentRedirect\(["']\/news\/hmwssb-manager-engineering-notification-2026["']\)/);

  // News slug aliases
  assert.match(slugAliases, /HMWSSB_MANAGER_ALIASES/);
  assert.match(slugAliases, /hmwssb-manager-engineering-notification-2026/);
  assert.match(slugAliases, /tgpsc-manager-engineering-hmwssb-notification-2026/);

  // Sitemap
  assert.match(sitemap, /\/news\/hmwssb-manager-engineering-notification-2026/);

  // Admin exam pages
  assert.match(adminPage, /tgpsc-hmwssb-manager-engineering-2026/);
  assert.match(adminPage, /https:\/\/varadhiprep\.in\/news\/hmwssb-manager-engineering-notification-2026/);
  assert.match(faqManager, /tgpsc-hmwssb-manager-engineering-2026/);
});
