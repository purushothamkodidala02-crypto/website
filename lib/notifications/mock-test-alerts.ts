import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { mockTestUrl } from "@/lib/public-urls";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMockTestNotificationEmail } from "./email-template";

export { buildMockTestNotificationEmail };

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

export type CandidateRecipient = {
  user_id: string;
  email: string;
  full_name: string;
};

export type MockTestNotificationPreview = {
  mockTestId: string;
  mockTestTitle: string;
  examName: string;
  paperName: string;
  targetUrl: string;
  durationMinutes: number;
  questionCount: number;
  recipientCount: number;
  recipientsPreview: { email: string; name: string }[];
  recipients: { email: string; name: string }[];
  alreadyNotifiedAt: string | null;
  previousSendCount: number;
  previousSends: {
    id: string;
    sent_at: string;
    recipient_count: number;
    recipients?: { email: string; name: string }[];
  }[];
};

export type SendNotificationResult = {
  success: boolean;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
};

function getBrevoApiKey(): string | null {
  return process.env.BREVO_API_KEY || null;
}

export async function fetchMockTestWithDetails(mockTestId: string) {
  const admin = createAdminClient();

  const { data: test, error } = await admin
    .from("mock_tests")
    .select(`
      id,
      title,
      slug,
      duration_minutes,
      target_question_count,
      series_number,
      status,
      paper_id,
      subject_id
    `)
    .eq("id", mockTestId)
    .single();

  if (error || !test) {
    throw new Error(`Mock test not found: ${error?.message ?? "unknown"}`);
  }

  const { data: paper } = await admin
    .from("papers")
    .select("id, name, slug, exam_group_id")
    .eq("id", test.paper_id)
    .single();

  if (!paper) throw new Error("Paper associated with mock test not found");

  const { data: group } = await admin
    .from("exam_groups")
    .select("id, name, slug, exam_id")
    .eq("id", paper.exam_group_id)
    .single();

  if (!group) throw new Error("Exam group associated with paper not found");

  const { data: exam } = await admin
    .from("exams")
    .select("id, name, slug, state_id")
    .eq("id", group.exam_id)
    .single();

  if (!exam) throw new Error("Exam associated with exam group not found");

  const { data: state } = await admin
    .from("exam_states")
    .select("id, name, code, slug")
    .eq("id", exam.state_id)
    .single();

  if (!state) throw new Error("State associated with exam not found");

  let subjectName: string | null = null;
  if (test.subject_id) {
    const { data: subject } = await admin
      .from("subjects")
      .select("name")
      .eq("id", test.subject_id)
      .maybeSingle();
    subjectName = subject?.name ?? null;
  }

  const formattedTitle = studentFacingMockTestTitle({
    examName: group.name,
    paperLabel: paper.name,
    seriesNumber: test.series_number,
    subjectName,
  });

  const relativeUrl = mockTestUrl(state.slug, group.slug, paper.slug, test.slug);
  const targetUrl = absoluteUrl(relativeUrl);

  return {
    test,
    paper,
    group,
    exam,
    state,
    formattedTitle,
    targetUrl,
  };
}

export async function fetchEligibleStudentsForMockTest(mockTestId: string): Promise<CandidateRecipient[]> {
  const admin = createAdminClient();

  // 1. Try RPC function first
  const { data: rpcRecipients, error: rpcError } = await admin.rpc(
    "get_mock_test_candidate_recipients",
    { requested_mock_test_id: mockTestId }
  );

  if (!rpcError && Array.isArray(rpcRecipients)) {
    return rpcRecipients as CandidateRecipient[];
  }

  // 2. Fallback query if RPC isn't loaded yet
  const details = await fetchMockTestWithDetails(mockTestId);
  const examGroupId = details.group.id;

  // Find tests in this exam group
  const { data: examPapers } = await admin
    .from("papers")
    .select("id")
    .eq("exam_group_id", examGroupId);

  const paperIds = (examPapers ?? []).map((p) => p.id);
  if (paperIds.length === 0) return [];

  const { data: groupTests } = await admin
    .from("mock_tests")
    .select("id")
    .in("paper_id", paperIds);

  const testIds = (groupTests ?? []).map((t) => t.id);
  if (testIds.length === 0) return [];

  // Query test attempts
  const { data: attempts } = await admin
    .from("test_attempts")
    .select("user_id")
    .in("mock_test_id", testIds);

  // Query test attempt sessions
  const { data: sessions } = await admin
    .from("test_attempt_sessions")
    .select("user_id")
    .in("mock_test_id", testIds);

  const distinctUserIds = [...new Set([
    ...(attempts ?? []).map((a) => a.user_id),
    ...(sessions ?? []).map((s) => s.user_id),
  ])];

  if (distinctUserIds.length === 0) return [];

  // Query user emails and profiles
  const [{ data: profiles }, emailResult] = await Promise.all([
    admin.from("profiles").select("id, full_name, role").in("id", distinctUserIds),
    admin.rpc("get_admin_user_emails", { requested_user_ids: distinctUserIds.slice(0, 200) }),
  ]);

  const profileMap = new Map((profiles ?? []).filter((p) => p.role === "student").map((p) => [p.id, p.full_name]));
  const emailRows = (emailResult.data ?? []) as { user_id: string; email: string }[];

  const recipients: CandidateRecipient[] = [];
  for (const row of emailRows) {
    if (row.email && profileMap.has(row.user_id)) {
      recipients.push({
        user_id: row.user_id,
        email: row.email,
        full_name: profileMap.get(row.user_id)?.trim() || "Student",
      });
    }
  }

  return recipients;
}

export async function previewMockTestNotification(mockTestId: string): Promise<MockTestNotificationPreview> {
  const admin = createAdminClient();
  const details = await fetchMockTestWithDetails(mockTestId);
  const recipients = await fetchEligibleStudentsForMockTest(mockTestId);

  // Check if already notified
  const { data: notificationHistory } = await admin
    .from("mock_test_notifications")
    .select("id, sent_at, recipient_count, metadata")
    .eq("mock_test_id", mockTestId)
    .order("sent_at", { ascending: false });

  const history = (notificationHistory ?? []) as {
    id: string;
    sent_at: string;
    recipient_count: number;
    metadata?: { recipients?: { email: string; name: string }[] };
  }[];
  const latestNotification = history[0];

  return {
    mockTestId,
    mockTestTitle: details.formattedTitle,
    examName: details.group.name,
    paperName: details.paper.name,
    targetUrl: details.targetUrl,
    durationMinutes: details.test.duration_minutes,
    questionCount: details.test.target_question_count,
    recipientCount: recipients.length,
    recipientsPreview: recipients.slice(0, 5).map((r) => ({ email: r.email, name: r.full_name })),
    recipients: recipients.map((r) => ({ email: r.email, name: r.full_name })),
    alreadyNotifiedAt: latestNotification?.sent_at ?? null,
    previousSendCount: history.reduce((sum, item) => sum + (item.recipient_count || 0), 0),
    previousSends: history.map((item) => ({
      id: item.id,
      sent_at: item.sent_at,
      recipient_count: item.recipient_count,
      recipients: item.metadata?.recipients ?? [],
    })),
  };
}

export async function sendMockTestNotifications({
  mockTestId,
  adminUserId,
  selectedEmails,
  customEmails,
}: {
  mockTestId: string;
  adminUserId?: string;
  selectedEmails?: string[];
  customEmails?: string[];
}): Promise<SendNotificationResult> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured on the server.");
  }

  const details = await fetchMockTestWithDetails(mockTestId);
  const eligible = await fetchEligibleStudentsForMockTest(mockTestId);

  let recipients: CandidateRecipient[];
  if (selectedEmails !== undefined) {
    const selectedSet = new Set(selectedEmails.map((e) => e.trim().toLowerCase()));
    recipients = eligible.filter((r) => selectedSet.has(r.email.trim().toLowerCase()));
  } else {
    recipients = [...eligible];
  }

  const existingEmails = new Set(recipients.map((r) => r.email.trim().toLowerCase()));
  for (const raw of customEmails ?? []) {
    const email = raw.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !existingEmails.has(email)) {
      existingEmails.add(email);
      recipients.push({
        user_id: "",
        email,
        full_name: email.split("@")[0] || "Student",
      });
    }
  }

  if (recipients.length === 0) {
    return {
      success: false,
      message:
        selectedEmails !== undefined || (customEmails && customEmails.length > 0)
          ? "No valid recipient emails were selected or specified."
          : `No previous test-takers found for ${details.group.name}.`,
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const senderEmail = process.env.CUSTOM_OTP_FROM_EMAIL ?? "no-reply@varadhiprep.in";
  const senderName = process.env.CUSTOM_OTP_FROM_NAME ?? "Varadhi Prep";

  let sentCount = 0;
  let failedCount = 0;

  // Send in controlled batches of 15 to avoid Brevo rate limits & request timeouts
  const BATCH_SIZE = 15;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (recipient) => {
      const emailContent = buildMockTestNotificationEmail({
        studentName: recipient.full_name,
        examName: details.group.name,
        testTitle: details.formattedTitle,
        testUrl: details.targetUrl,
        durationMinutes: details.test.duration_minutes,
        questionCount: details.test.target_question_count,
      });

      const response = await fetch(BREVO_SEND_EMAIL_URL, {
        method: "POST",
        cache: "no-store",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient.email, name: recipient.full_name }],
          subject: emailContent.subject,
          textContent: emailContent.textContent,
          htmlContent: emailContent.htmlContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Brevo API Error (${response.status}): ${errText}`);
      }

      return true;
    });

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === "fulfilled") {
        sentCount += 1;
      } else {
        failedCount += 1;
        console.error("Failed to send mock test alert to recipient:", res.reason);
      }
    }

    // Small delay between batches if there are more
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  // Log in mock_test_notifications table
  const admin = createAdminClient();
  const emailMeta = buildMockTestNotificationEmail({
    studentName: "Student",
    examName: details.group.name,
    testTitle: details.formattedTitle,
    testUrl: details.targetUrl,
    durationMinutes: details.test.duration_minutes,
    questionCount: details.test.target_question_count,
  });

  const { error: insertError } = await admin.from("mock_test_notifications").insert({
    mock_test_id: mockTestId,
    recipient_count: sentCount,
    sent_by: adminUserId ?? null,
    email_subject: emailMeta.subject,
    metadata: {
      exam_name: details.group.name,
      paper_name: details.paper.name,
      mock_title: details.formattedTitle,
      attempted_count: recipients.length,
      failed_count: failedCount,
      recipients: recipients.map((r) => ({
        email: r.email,
        name: r.full_name,
      })),
    },
  });

  if (insertError) {
    console.error("Failed to record notification history:", insertError.message);
  }

  return {
    success: true,
    message: `Notified ${sentCount} student${sentCount === 1 ? "" : "s"} who previously practiced ${details.group.name} tests!`,
    recipientCount: recipients.length,
    sentCount,
    failedCount,
  };
}
