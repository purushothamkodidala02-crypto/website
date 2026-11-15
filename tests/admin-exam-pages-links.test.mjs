import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Admin Exam Pages has dynamic link upload and removal features", async () => {
  const [manager, actions, page] = await Promise.all([
    read("app/admin/exam-pages/ExamPageFaqManager.tsx"),
    read("app/admin/exam-pages/actions.ts"),
    read("app/admin/exam-pages/page.tsx"),
  ]);

  // ExamPageFaqManager receives dynamic primaryPages prop
  assert.match(manager, /primaryPages/);
  assert.match(manager, /UploadPrimaryPageForm/);
  assert.match(manager, /\+ Upload Link/);
  assert.match(manager, /deletePrimaryExamPage/);
  assert.match(manager, /Remove/);
  assert.match(manager, /https:\/\/varadhiprep\.in\/news\/andhra-police-constable-notification-2026/);

  // Actions provide createPrimaryExamPage and deletePrimaryExamPage
  assert.match(actions, /export async function createPrimaryExamPage/);
  assert.match(actions, /export async function deletePrimaryExamPage/);
  assert.match(actions, /from\("primary_exam_pages"\)/);
  assert.match(actions, /upsert/);
  assert.match(actions, /delete/);

  // Page queries primary_exam_pages table from Supabase
  assert.match(page, /supabase\.from\("primary_exam_pages"\)/);
  assert.match(page, /primaryPages=\{primaryPages\}/);
});

test("Andhra Police Constable Notification 2026 news page and redirects exist", async () => {
  const [newsPage, rootRedirect, slugAliases, sitemap] = await Promise.all([
    read("app/news/andhra-police-constable-notification-2026/page.tsx"),
    read("app/andhra-police-constable-notification-2026/page.tsx"),
    read("app/news/[slug]/page.tsx"),
    read("app/sitemap.ts"),
  ]);

  // News page content and SEO
  assert.match(newsPage, /Andhra Pradesh Police Constable Notification 2026/);
  assert.match(newsPage, /ఆంధ్రప్రదేశ్ పోలీస్ కానిస్టేబుల్/);
  assert.match(newsPage, /APSLPRB/);
  assert.match(newsPage, /6,100\+/);
  assert.match(newsPage, /₹25,220/);
  assert.match(newsPage, /₹80,910/);
  assert.match(newsPage, /1600m/i);
  assert.match(newsPage, /"@type":\s*"NewsArticle"/);
  assert.match(newsPage, /"@type":\s*"JobPosting"/);
  assert.match(newsPage, /"@type":\s*"FAQPage"/);

  // Root redirect
  assert.match(rootRedirect, /permanentRedirect\(["']\/news\/andhra-police-constable-notification-2026["']\)/);

  // Slug aliases
  assert.match(slugAliases, /AP_POLICE_ALIASES/);
  assert.match(slugAliases, /andhra-police-constable-notification-2026/);

  // Sitemap
  assert.match(sitemap, /\/news\/andhra-police-constable-notification-2026/);
});

test("Database migration creates primary_exam_pages with RLS and seed data", async () => {
  const migration = await read("supabase/migrations/20261115200000_create_primary_exam_pages.sql");

  assert.match(migration, /create table if not exists public\.primary_exam_pages/);
  assert.match(migration, /alter table public\.primary_exam_pages enable row level security/);
  assert.match(migration, /create policy "Anyone can view primary exam pages"/);
  assert.match(migration, /create policy "Admins can manage primary exam pages"/);
  assert.match(migration, /https:\/\/varadhiprep\.in\/news\/andhra-police-constable-notification-2026/);
});
