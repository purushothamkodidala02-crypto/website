import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { mockTestUrl } from "@/lib/public-urls";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMockTestNotificationEmail, formatMockTestNotificationSubject } from "./email-template";
import {
  prioritizeCandidateRecipients,
  type CandidateRecipient,
  type RecipientPriorityTier,
} from "./recipient-priority";

export {
  buildMockTestNotificationEmail,
  formatMockTestNotificationSubject,
  prioritizeCandidateRecipients,
  type CandidateRecipient,
  type RecipientPriorityTier,
};

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

export type PreviewRecipient = {
  email: string;
  name: string;
  priorityTier?: RecipientPriorityTier;
  inactiveDays?: number | null;
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
  recipientsPreview: PreviewRecipient[];
  recipients: PreviewRecipient[];
  alreadyNotifiedAt: string | null;
  previousSendCount: number;
  previousSends: {
    id: string;
    sent_at: string;
    recipient_count: number;
    recipients?: { email: string; name: string }[];
  }[];
  emailSubject?: string;
};

export type SendNotificationResult = {
  success: boolean;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
};

function getBrevoApiKey(): string | null {
  if (process.env.BREVO_API_KEY) {
    return process.env.BREVO_API_KEY;
  }
  try {
    const cfContext = (globalThis as Record<symbol, any>)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env?.BREVO_API_KEY) {
      return cfContext.env.BREVO_API_KEY;
    }
  } catch {
    // Ignore context lookup errors outside Cloudflare
  }
  return null;
}

async function getDbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  const { createClient } = await import("@/lib/supabase/server");
  return await createClient();
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function fetchMockTestWithDetails(mockTestId: string) {
  const admin = await getDbClient();

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
      subject_id,
      subjects(name),
      papers!inner(
        id,
        name,
        slug,
        exam_group_id,
        exam_groups!inner(
          id,
          name,
          slug,
          exam_id,
          exams!inner(
            id,
            name,
            slug,
            state_id,
            exam_states!inner(
              id,
              name,
              code,
              slug
            )
          )
        )
      )
    `)
    .eq("id", mockTestId)
    .single();

  if (error || !test) {
    throw new Error(`Mock test not found: ${error?.message ?? "unknown"}`);
  }

  type JoinedState = { id: string; name: string; code: string; slug: string };
  type JoinedExam = { id: string; name: string; slug: string; state_id: string; exam_states: JoinedState | JoinedState[] };
  type JoinedGroup = { id: string; name: string; slug: string; exam_id: string; exams: JoinedExam | JoinedExam[] };
  type JoinedPaper = { id: string; name: string; slug: string; exam_group_id: string; exam_groups: JoinedGroup | JoinedGroup[] };
  type JoinedSubject = { name: string };

  const joined = test as typeof test & {
    papers?: JoinedPaper | JoinedPaper[] | null;
    subjects?: JoinedSubject | JoinedSubject[] | null;
  };

  const paper = unwrapRelation(joined.papers);
  if (!paper) throw new Error("Paper associated with mock test not found");

  const group = unwrapRelation(paper.exam_groups);
  if (!group) throw new Error("Exam group associated with paper not found");

  const exam = unwrapRelation(group.exams);
  if (!exam) throw new Error("Exam associated with exam group not found");

  const state = unwrapRelation(exam.exam_states);
  if (!state) throw new Error("State associated with exam not found");

  const subject = unwrapRelation(joined.subjects);
  const subjectName: string | null = subject?.name ?? null;

  const formattedTitle = studentFacingMockTestTitle({
    examName: group.name,
    paperLabel: paper.name,
    seriesNumber: test.series_number,
    subjectName,
  });

  const relativeUrl = mockTestUrl(state.slug, group.slug, paper.slug, test.slug);
  const targetUrl = absoluteUrl(relativeUrl);

  return {
    test: {
      id: test.id,
      title: test.title,
      slug: test.slug,
      duration_minutes: test.duration_minutes,
      target_question_count: test.target_question_count,
      series_number: test.series_number,
      status: test.status,
      paper_id: test.paper_id,
      subject_id: test.subject_id,
    },
    paper: {
      id: paper.id,
      name: paper.name,
      slug: paper.slug,
      exam_group_id: paper.exam_group_id,
    },
    group: {
      id: group.id,
      name: group.name,
      slug: group.slug,
      exam_id: group.exam_id,
    },
    exam: {
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      state_id: exam.state_id,
    },
    state: {
      id: state.id,
      name: state.name,
      code: state.code,
      slug: state.slug,
    },
    formattedTitle,
    targetUrl,
  };
}

export async function fetchEligibleStudentsForMockTest(mockTestId: string): Promise<CandidateRecipient[]> {
  const admin = await getDbClient();

  // 1. Try RPC function first
  const { data: rpcRecipients, error: rpcError } = await admin.rpc(
    "get_mock_test_candidate_recipients",
    { requested_mock_test_id: mockTestId }
  );

  if (!rpcError && Array.isArray(rpcRecipients)) {
    return prioritizeCandidateRecipients(rpcRecipients as CandidateRecipient[]);
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

  // Query test attempts and sessions (only user_ids + submitted_at fallback)
  const [{ data: attempts }, { data: sessions }] = await Promise.all([
    admin.from("test_attempts").select("user_id, submitted_at").in("mock_test_id", testIds),
    admin.from("test_attempt_sessions").select("user_id").in("mock_test_id", testIds),
  ]);

  const lastSubmittedByUser = new Map<string, string>();
  for (const a of attempts ?? []) {
    if (!a.submitted_at) continue;
    const prev = lastSubmittedByUser.get(a.user_id);
    if (!prev || Date.parse(a.submitted_at) > Date.parse(prev)) {
      lastSubmittedByUser.set(a.user_id, a.submitted_at);
    }
  }

  const distinctUserIds = [...new Set([
    ...(attempts ?? []).map((a) => a.user_id),
    ...(sessions ?? []).map((s) => s.user_id),
  ])];

  if (distinctUserIds.length === 0) return [];

  // Query user emails and profiles (using denormalized last_test_submitted_at)
  const [{ data: profiles }, emailResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, role, created_at, last_test_submitted_at")
      .in("id", distinctUserIds),
    admin.rpc("get_admin_user_emails", { requested_user_ids: distinctUserIds.slice(0, 200) }),
  ]);

  const profileMap = new Map(
    (profiles ?? [])
      .filter((p) => p.role === "student")
      .map((p) => [
        p.id,
        {
          full_name: p.full_name,
          created_at: p.created_at as string | null,
          last_test_submitted_at: (p as { last_test_submitted_at?: string | null }).last_test_submitted_at ?? null,
        },
      ])
  );
  const emailRows = (emailResult.data ?? []) as { user_id: string; email: string }[];

  const recipients: CandidateRecipient[] = [];
  for (const row of emailRows) {
    const prof = profileMap.get(row.user_id);
    if (row.email && prof) {
      const lastSubmittedAt =
        prof.last_test_submitted_at ?? lastSubmittedByUser.get(row.user_id) ?? prof.created_at ?? null;
      recipients.push({
        user_id: row.user_id,
        email: row.email,
        full_name: prof.full_name?.trim() || "Student",
        last_seen_at: lastSubmittedAt,
        registered_at: prof.created_at ?? null,
        has_taken_exam: true,
      });
    }
  }

  return prioritizeCandidateRecipients(recipients);
}

export async function previewMockTestNotification(mockTestId: string): Promise<MockTestNotificationPreview> {
  const admin = await getDbClient();
  const [details, recipients, { data: notificationHistory }] = await Promise.all([
    fetchMockTestWithDetails(mockTestId),
    fetchEligibleStudentsForMockTest(mockTestId),
    admin
      .from("mock_test_notifications")
      .select("id, sent_at, recipient_count, metadata")
      .eq("mock_test_id", mockTestId)
      .order("sent_at", { ascending: false }),
  ]);

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
    recipientsPreview: recipients.slice(0, 5).map((r) => ({
      email: r.email,
      name: r.full_name,
      priorityTier: r.priority_tier ?? undefined,
      inactiveDays: r.inactive_days ?? null,
    })),
    recipients: recipients.map((r) => ({
      email: r.email,
      name: r.full_name,
      priorityTier: r.priority_tier ?? undefined,
      inactiveDays: r.inactive_days ?? null,
    })),
    alreadyNotifiedAt: latestNotification?.sent_at ?? null,
    previousSendCount: history.reduce((sum, item) => sum + (item.recipient_count || 0), 0),
    previousSends: history.map((item) => ({
      id: item.id,
      sent_at: item.sent_at,
      recipient_count: item.recipient_count,
      recipients: item.metadata?.recipients ?? [],
    })),
    emailSubject: formatMockTestNotificationSubject({
      examName: details.group.name,
      testTitle: details.formattedTitle,
    }),
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

  const [details, eligible] = await Promise.all([
    fetchMockTestWithDetails(mockTestId),
    fetchEligibleStudentsForMockTest(mockTestId),
  ]);

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

  const senderEmail = process.env.CUSTOM_OTP_FROM_EMAIL || "noreply@varadhiprep.in";
  const senderName = process.env.CUSTOM_OTP_FROM_NAME || "Varadhiprep";

  let sentCount = 0;
  let failedCount = 0;
  let lastBrevoError = "";

  const templateEmail = buildMockTestNotificationEmail({
    studentName: "{{ params.studentName }}",
    examName: details.group.name,
    testTitle: details.formattedTitle,
    testUrl: details.targetUrl,
    durationMinutes: details.test.duration_minutes,
    questionCount: details.test.target_question_count,
  });

  // Batch send via Brevo messageVersions (50 recipients per single API call).
  // This reduces 350 individual HTTP requests down to just 7 calls, staying safely
  // within Cloudflare Workers' 50 subrequest limit and preventing worker execution timeouts.
  const BATCH_SIZE = 50;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const messageVersions = batch.map((recipient) => ({
      to: [{ email: recipient.email, name: recipient.full_name?.trim() || undefined }],
      params: { studentName: recipient.full_name?.trim() || "Student" },
    }));

    try {
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
          subject: templateEmail.subject,
          textContent: templateEmail.textContent,
          htmlContent: templateEmail.htmlContent,
          messageVersions,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error(`Brevo API Batch Error (${response.status}):`, errText);
        failedCount += batch.length;

        let parsedReason = "";
        try {
          const parsed = JSON.parse(errText);
          parsedReason = parsed.message || parsed.code || errText;
        } catch {
          parsedReason = errText || `HTTP ${response.status}`;
        }
        lastBrevoError = parsedReason;

        // If daily credit limit is hit or authorization/IP fails, abort subsequent batches cleanly
        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 402 ||
          response.status === 403
        ) {
          const remaining = recipients.length - (i + batch.length);
          if (remaining > 0) {
            failedCount += remaining;
          }
          break;
        }
      } else {
        const data = (await response.json().catch(() => ({}))) as { messageIds?: string[] };
        const delivered = Array.isArray(data.messageIds) ? data.messageIds.length : batch.length;
        sentCount += delivered;
      }
    } catch (batchErr) {
      console.error("Failed to send Brevo notification batch:", batchErr);
      failedCount += batch.length;
      lastBrevoError = batchErr instanceof Error ? batchErr.message : "Network request failed";
    }

    // Controlled delay between batch requests
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Log in mock_test_notifications table
  const admin = await getDbClient();
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
    success: sentCount > 0,
    message:
      sentCount > 0
        ? `Notified ${sentCount} student${sentCount === 1 ? "" : "s"} who previously practiced ${details.group.name} tests!${
            failedCount > 0
              ? ` (${failedCount} could not be delivered: ${lastBrevoError || "limit reached"}).`
              : ""
          }`
        : `Could not send emails (${failedCount} failed)${lastBrevoError ? `: ${lastBrevoError}` : ""}. Please verify your Brevo credentials or settings.`,
    recipientCount: recipients.length,
    sentCount,
    failedCount,
  };
}
