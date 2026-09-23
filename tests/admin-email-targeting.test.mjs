import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildDirectAdminEmail } from "../lib/notifications/direct-email.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("buildDirectAdminEmail formats plain text and HTML correctly with Varadhi branding", () => {
  const email = buildDirectAdminEmail({
    recipientName: "Suresh Reddy",
    subject: "Update Regarding Your Test Series Access",
    message: "Your account has been granted full access to Group 2 mock tests.\n\nPlease log in and attempt the tests.",
  });

  assert.equal(email.subject, "Update Regarding Your Test Series Access");
  assert.match(email.textContent, /Hi Suresh Reddy,/);
  assert.match(email.textContent, /Your account has been granted full access/);
  assert.match(email.textContent, /Team Varadhi Prep/);
  assert.match(email.textContent, /https:\/\/varadhiprep\.in/);

  assert.match(email.htmlContent, /VARADHI PREP · OFFICIAL COMMUNICATION/);
  assert.match(email.htmlContent, /Update Regarding Your Test Series Access/);
  assert.match(email.htmlContent, /Hi <strong>Suresh Reddy<\/strong>/);
  assert.match(email.htmlContent, /Your account has been granted full access/);
});

test("mock test notifications support custom user emails and targeted selection", async () => {
  const [mockTestAlertsSrc, notificationActionsSrc, notifyStudentsModalSrc] = await Promise.all([
    read("lib/notifications/mock-test-alerts.ts"),
    read("app/admin/mock-tests/notification-actions.ts"),
    read("app/admin/mock-tests/NotifyStudentsModal.tsx"),
  ]);

  // 1. mock-test-alerts.ts supports selectedEmails and customEmails
  assert.match(mockTestAlertsSrc, /selectedEmails\?: string\[\]/);
  assert.match(mockTestAlertsSrc, /customEmails\?: string\[\]/);
  assert.match(mockTestAlertsSrc, /let recipients: CandidateRecipient\[\]/);

  // 2. notification-actions.ts accepts options with selectedEmails and customEmails
  assert.match(notificationActionsSrc, /selectedEmails\?: string\[\]/);
  assert.match(notificationActionsSrc, /customEmails\?: string\[\]/);

  // 3. NotifyStudentsModal supports student checkboxes and custom email input
  assert.match(notifyStudentsModalSrc, /selectedEmails/);
  assert.match(notifyStudentsModalSrc, /customEmailsInput/);
  assert.match(notifyStudentsModalSrc, /validCustomEmails/);
  assert.match(notifyStudentsModalSrc, /toggleStudent/);
  assert.match(notifyStudentsModalSrc, /selectAllStudents/);
  assert.match(notifyStudentsModalSrc, /Enter Specific User Email\(s\)/);
  assert.match(notifyStudentsModalSrc, /totalRecipients/);
});

test("admin students section supports composing and sending direct emails to users", async () => {
  const [directEmailSrc, directEmailActionsSrc, sendUserEmailModalSrc, studentsPageSrc] = await Promise.all([
    read("lib/notifications/direct-email.ts"),
    read("app/admin/students/direct-email-actions.ts"),
    read("app/admin/students/SendUserEmailModal.tsx"),
    read("app/admin/students/page.tsx"),
  ]);

  // 1. direct-email.ts
  assert.match(directEmailSrc, /export async function sendDirectUserEmail/);
  assert.match(directEmailSrc, /BREVO_SEND_EMAIL_URL/);

  // 2. direct-email-actions.ts
  assert.match(directEmailActionsSrc, /export async function sendDirectUserEmailAction/);
  assert.match(directEmailActionsSrc, /verifyAdminUser/);
  assert.match(directEmailActionsSrc, /revalidatePath\("\/admin\/students"\)/);

  // 3. SendUserEmailModal.tsx
  assert.match(sendUserEmailModalSrc, /Compose Email to User/);
  assert.match(sendUserEmailModalSrc, /To \(User Email\)/);
  assert.match(sendUserEmailModalSrc, /sendDirectUserEmailAction/);

  // 4. students/page.tsx integrates SendUserEmailModal
  assert.match(studentsPageSrc, /import \{ SendUserEmailModal \} from "\.\/SendUserEmailModal"/);
  assert.match(studentsPageSrc, /<SendUserEmailModal triggerLabel="Compose Email"/);
  assert.match(studentsPageSrc, /triggerVariant="row-action"/);
});
