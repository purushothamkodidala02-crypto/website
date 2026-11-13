import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mock test email notifications schema, service, and admin UI are properly wired", async () => {
  const [migration, service, template, actions, modal, table, page] = await Promise.all([
    read("supabase/migrations/20260920190000_add_mock_test_notifications.sql"),
    read("lib/notifications/mock-test-alerts.ts"),
    read("lib/notifications/email-template.ts"),
    read("app/admin/mock-tests/notification-actions.ts"),
    read("app/admin/mock-tests/NotifyStudentsModal.tsx"),
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("app/admin/mock-tests/page.tsx"),
  ]);

  // Migration verifies mock_test_notifications table and RPC
  assert.match(migration, /create table if not exists public\.mock_test_notifications/);
  assert.match(migration, /recipient_count integer not null default 0/);
  assert.match(migration, /sent_at timestamptz not null default now\(\)/);
  assert.match(migration, /create or replace function public\.get_mock_test_candidate_recipients/);
  assert.match(migration, /from public\.test_attempts ta/);
  assert.match(migration, /from public\.test_attempt_sessions tas/);
  assert.match(migration, /from public\.student_entitlements se/);
  assert.match(migration, /u\.email_confirmed_at is not null/);
  assert.match(migration, /prof\.role = 'student'/);
  assert.match(migration, /grant execute on function public\.get_mock_test_candidate_recipients/);

  // Service verifies Brevo integration, batching, and email content
  assert.match(service, /api\.brevo\.com\/v3\/smtp\/email/);
  assert.match(service, /buildMockTestNotificationEmail/);
  assert.match(service, /fetchEligibleStudentsForMockTest/);
  assert.match(service, /sendMockTestNotifications/);
  assert.match(service, /BATCH_SIZE = 15/);
  assert.match(service, /mock_test_notifications/);
  assert.match(template, /🎯 New Mock Test Live:/);

  // Server actions verify authorization and execution
  assert.match(actions, /getMockTestNotificationPreviewAction/);
  assert.match(actions, /sendMockTestNotificationAction/);
  assert.match(actions, /profile\?\.role !== "admin"/);
  assert.match(actions, /revalidatePath\("\/admin\/mock-tests"\)/);

  // Modal client component verifies interactivity and feedback
  assert.match(modal, /NotifyStudentsModal/);
  assert.match(modal, /getMockTestNotificationPreviewAction/);
  assert.match(modal, /sendMockTestNotificationAction/);
  assert.match(modal, /Target Audience/);
  assert.match(modal, /Send Email to/);

  // Admin Table & Page integrate the notifications
  assert.match(table, /NotifyStudentsModal/);
  assert.match(table, /test\.status === "published"/);
  assert.match(page, /mock_test_notifications/);
  assert.match(page, /notificationMap/);
  assert.match(page, /lastNotifiedAt/);
  assert.match(page, /notificationCount/);
});

test("email template generation produces correct HTML and plain text structure", async () => {
  const { buildMockTestNotificationEmail } = await import("../lib/notifications/email-template.ts");

  const email = buildMockTestNotificationEmail({
    studentName: "Purushotham",
    examName: "Telangana Police Constable",
    testTitle: "Paper 1 Prelims · Mock Test 05",
    testUrl: "https://varadhiprep.in/mock-tests/telangana/police-constable/prelims/mock-test-05",
    durationMinutes: 180,
    questionCount: 200,
  });

  assert.equal(
    email.subject,
    "🎯 New Mock Test Live: Telangana Police Constable - Paper 1 Prelims · Mock Test 05 | Varadhi Prep"
  );

  assert.match(email.textContent, /Hi Purushotham/);
  assert.match(email.textContent, /Telangana Police Constable/);
  assert.match(email.textContent, /Paper 1 Prelims · Mock Test 05/);
  assert.match(email.textContent, /180 minutes/);
  assert.match(email.textContent, /200/);
  assert.match(email.textContent, /https:\/\/varadhiprep\.in\/mock-tests\/telangana\/police-constable\/prelims\/mock-test-05/);

  assert.match(email.htmlContent, /Purushotham/);
  assert.match(email.htmlContent, /Telangana Police Constable/);
  assert.match(email.htmlContent, /180 mins/);
  assert.match(email.htmlContent, /200/);
  assert.match(email.htmlContent, /href="https:\/\/varadhiprep\.in\/mock-tests\/telangana\/police-constable\/prelims\/mock-test-05"/);
  assert.match(email.htmlContent, /Start Mock Test Now/);
  assert.match(email.htmlContent, /📝 Questions:/);
  assert.doesNotMatch(email.htmlContent, /❓ Questions:/);

  // When testTitle already begins with examName, subject does not duplicate the exam name
  const deduplicatedEmail = buildMockTestNotificationEmail({
    studentName: "Purushotham",
    examName: "APPSC Endowment Officer",
    testTitle: "APPSC Endowment Officer · Paper 2 · Hindu Puranams · Mock Test 07",
    testUrl: "https://varadhiprep.in/mock-tests/andhra-pradesh/appsc-endowment-officer/paper-2/mock-test-07",
    durationMinutes: 150,
    questionCount: 150,
  });

  assert.equal(
    deduplicatedEmail.subject,
    "🎯 New Mock Test Live: APPSC Endowment Officer · Paper 2 · Hindu Puranams · Mock Test 07 | Varadhi Prep"
  );
  assert.doesNotMatch(deduplicatedEmail.subject, /APPSC Endowment Officer - APPSC Endowment Officer/);
});
