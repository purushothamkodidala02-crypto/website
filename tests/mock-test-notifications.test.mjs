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
  assert.match(service, /messageVersions/);
  assert.match(service, /BATCH_SIZE = 50/);
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

test("prioritizeCandidateRecipients puts inactive exam-takers first and recent signups at the bottom", async () => {
  const [migration, { prioritizeCandidateRecipients }] = await Promise.all([
    read("supabase/migrations/20261126140000_prioritize_inactive_mock_test_recipients.sql"),
    import("../lib/notifications/recipient-priority.ts"),
  ]);

  assert.match(migration, /drop function if exists public\.get_mock_test_candidate_recipients\(uuid\);/);
  assert.match(migration, /priority_tier text/);
  assert.match(migration, /inactive_test_taker/);
  assert.match(migration, /recent_signup/);

  const now = new Date("2026-11-26T10:00:00Z");
  const recipients = [
    {
      user_id: "u-new-today",
      email: "new.today@example.com",
      full_name: "New Today",
      registered_at: "2026-11-26T08:00:00Z",
      last_seen_at: "2026-11-26T08:00:00Z",
      has_taken_exam: true,
    },
    {
      user_id: "u-active",
      email: "active@example.com",
      full_name: "Active User",
      registered_at: "2026-10-01T10:00:00Z",
      last_seen_at: "2026-11-24T10:00:00Z",
      has_taken_exam: true,
    },
    {
      user_id: "u-inactive-10d",
      email: "inactive10@example.com",
      full_name: "Inactive 10d",
      registered_at: "2026-09-01T10:00:00Z",
      last_seen_at: "2026-11-16T10:00:00Z",
      has_taken_exam: true,
    },
    {
      user_id: "u-new-3d",
      email: "new.3d@example.com",
      full_name: "New 3d",
      registered_at: "2026-11-23T10:00:00Z",
      last_seen_at: "2026-11-23T10:00:00Z",
      has_taken_exam: true,
    },
    {
      user_id: "u-inactive-25d",
      email: "inactive25@example.com",
      full_name: "Inactive 25d",
      registered_at: "2026-08-15T10:00:00Z",
      last_seen_at: "2026-11-01T10:00:00Z",
      has_taken_exam: true,
    },
  ];

  const ordered = prioritizeCandidateRecipients(recipients, now);
  assert.deepEqual(
    ordered.map((r) => r.email),
    [
      "inactive25@example.com",
      "inactive10@example.com",
      "active@example.com",
      "new.3d@example.com",
      "new.today@example.com",
    ]
  );
  assert.equal(ordered[0].priority_tier, "inactive_test_taker");
  assert.equal(ordered[0].inactive_days, 25);
  assert.equal(ordered[2].priority_tier, "active_or_entitled");
  assert.equal(ordered[4].priority_tier, "recent_signup");
});

test("inactivity by last submitted test is denormalized and indexed for fast queries", async () => {
  const optMigration = await read(
    "supabase/migrations/20261126150000_optimize_inactivity_by_last_submitted_test.sql"
  );

  assert.match(optMigration, /add column if not exists last_test_submitted_at timestamptz/);
  assert.match(optMigration, /create or replace function public\.sync_profile_last_test_submitted_at/);
  assert.match(optMigration, /create trigger trg_sync_profile_last_test_submitted_at/);
  assert.match(optMigration, /idx_test_attempt_sessions_mock_test_user/);
  assert.match(optMigration, /idx_student_entitlements_product_expires_user/);
  assert.match(optMigration, /idx_profiles_student_last_submitted/);
  assert.match(optMigration, /coalesce\(prof\.last_test_submitted_at, u\.created_at\)/);
});
