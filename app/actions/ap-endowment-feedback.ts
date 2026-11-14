"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getSupabaseServerClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      return createAdminClient();
    } catch {
      // Fall through to regular client
    }
  }
  return await createClient();
}

// Campaign runs for 7 days (1 week) from activation
// Expiry: Friday, November 20, 2026 at 23:59:59 IST
const AP_EO_CAMPAIGN_EXPIRY_MS = new Date("2026-11-20T23:59:59+05:30").getTime();

export type ApEndowmentEligibilityResult = {
  eligible: boolean;
  reason?: "campaign_expired" | "not_logged_in" | "already_submitted" | "no_endowment_attempts" | "error";
  studentEmail?: string;
  studentName?: string;
};

export async function checkApEndowmentFeedbackEligibilityAction(): Promise<ApEndowmentEligibilityResult> {
  // 1. Check campaign duration (1 week)
  if (Date.now() > AP_EO_CAMPAIGN_EXPIRY_MS) {
    return { eligible: false, reason: "campaign_expired" };
  }

  try {
    const supabase = await createClient();

    // Check if campaign was deactivated by admin
    const { data: surveyStatus } = await supabase
      .from("dynamic_surveys")
      .select("is_active")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (surveyStatus && surveyStatus.is_active === false) {
      return { eligible: false, reason: "campaign_expired" };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { eligible: false, reason: "not_logged_in" };
    }

    // 2. Check if user already submitted the form
    // Check in ap_endowment_feedback
    const { data: existingFeedback } = await supabase
      .from("ap_endowment_feedback")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingFeedback?.id) {
      return { eligible: false, reason: "already_submitted" };
    }

    // Check in dynamic_survey_responses for AP Endowment Survey
    const { data: existingSurveyResponses } = await supabase
      .from("dynamic_survey_responses")
      .select("id, dynamic_surveys!inner(title)")
      .eq("user_id", user.id)
      .ilike("dynamic_surveys.title", "%Endowment%Priority%")
      .limit(1);

    if (existingSurveyResponses && existingSurveyResponses.length > 0) {
      return { eligible: false, reason: "already_submitted" };
    }

    // 3. Check if user has attempted the AP Endowment Officer exam
    // A student qualifies if they have at least 1 attempt on any AP Endowment Officer mock test
    const { data: attempts, error: attemptsError } = await supabase
      .from("test_attempts")
      .select("id, mock_tests!inner(id, title)")
      .eq("user_id", user.id)
      .ilike("mock_tests.title", "%Endowment%")
      .limit(1);

    if (attemptsError || !attempts || attempts.length === 0) {
      return { eligible: false, reason: "no_endowment_attempts" };
    }

    // Retrieve student profile details
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    return {
      eligible: true,
      studentEmail: user.email || "",
      studentName: profile?.full_name || (user.user_metadata?.full_name as string) || "",
    };
  } catch (err) {
    console.error("Error checking AP Endowment eligibility:", err);
    return { eligible: false, reason: "error" };
  }
}

export type SubmitApEndowmentFeedbackInput = {
  paperChoice: string;
  subjectFocus: string;
  specificTopics?: string;
  studentName?: string;
  studentPhone?: string;
};

export type SubmitApEndowmentFeedbackResult = {
  success: boolean;
  message: string;
};

export async function submitApEndowmentFeedbackAction(
  input: SubmitApEndowmentFeedbackInput
): Promise<SubmitApEndowmentFeedbackResult> {
  const paperChoice = input.paperChoice?.trim();
  const subjectFocus = input.subjectFocus?.trim();
  const specificTopics = input.specificTopics?.trim() || "";

  if (!paperChoice) {
    return { success: false, message: "Please select Paper 1, Paper 2, or Both Papers." };
  }
  if (!subjectFocus) {
    return { success: false, message: "Please enter which subject you want us to focus on." };
  }

  try {
    const supabase = await createClient();

    // Check if campaign was deactivated by admin
    const { data: surveyStatus } = await supabase
      .from("dynamic_surveys")
      .select("is_active")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (surveyStatus && surveyStatus.is_active === false) {
      return { success: false, message: "This feedback campaign is currently paused." };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Please sign in to submit your subject priority." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    const name = input.studentName?.trim() || profile?.full_name || (user.user_metadata?.full_name as string) || "";
    const email = user.email || "";
    const phone = input.studentPhone?.trim() || profile?.phone || "";

    // 1. Try writing to ap_endowment_feedback table
    const { error: feedbackInsertError } = await supabase
      .from("ap_endowment_feedback")
      .insert({
        user_id: user.id,
        student_name: name,
        student_email: email,
        paper_choice: paperChoice,
        subject_focus: subjectFocus,
        specific_topics: specificTopics || null,
      });

    // 2. Fallback / Sync with dynamic_surveys so responses are guaranteed to be stored
    // Check if an AP Endowment priority survey exists in dynamic_surveys
    const { data: existingSurvey } = await supabase
      .from("dynamic_surveys")
      .select("id, dynamic_survey_questions(id, question_text)")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    let targetSurveyId = existingSurvey?.id;

    if (!targetSurveyId) {
      // Create survey in dynamic_surveys if not already present
      const { data: newSurvey } = await supabase
        .from("dynamic_surveys")
        .insert({
          title: "AP Endowment Officer Mock Test Priority",
          description: "Student feedback on Paper 1 and Paper 2 subjects to prioritize for upcoming mock tests.",
          is_active: false,
        })
        .select("id")
        .maybeSingle();

      if (newSurvey?.id) {
        targetSurveyId = newSurvey.id;
        // Insert questions
        await supabase.from("dynamic_survey_questions").insert([
          {
            survey_id: targetSurveyId,
            question_text: "Which paper do you want us to focus on?",
            question_type: "radio",
            options: [
              "Paper 1 - General Studies & Mental Ability",
              "Paper 2 - Hindu Philosophy & Temple System",
              "Both Paper 1 & Paper 2",
            ],
            display_order: 1,
            is_required: true,
          },
          {
            survey_id: targetSurveyId,
            question_text: "Which subject or topic should we focus on next to prepare for mock tests?",
            question_type: "text",
            options: null,
            display_order: 2,
            is_required: true,
          },
          {
            survey_id: targetSurveyId,
            question_text: "Any specific chapters, topics, or suggestions? (Optional)",
            question_type: "textarea",
            options: null,
            display_order: 3,
            is_required: false,
          },
        ]);
      }
    }

    if (targetSurveyId) {
      const { data: surveyQuestions } = await supabase
        .from("dynamic_survey_questions")
        .select("id, question_text, display_order")
        .eq("survey_id", targetSurveyId)
        .order("display_order");

      const { data: resp } = await supabase
        .from("dynamic_survey_responses")
        .insert({
          survey_id: targetSurveyId,
          user_id: user.id,
        })
        .select("id")
        .maybeSingle();

      if (resp?.id && surveyQuestions && surveyQuestions.length > 0) {
        const answersToInsert: Array<{ response_id: string; question_id: string; answer_text: string }> = [];

        for (const q of surveyQuestions) {
          const text = q.question_text.toLowerCase();
          if (text.includes("paper")) {
            answersToInsert.push({ response_id: resp.id, question_id: q.id, answer_text: paperChoice });
          } else if (text.includes("subject") || text.includes("focus") || text.includes("topic")) {
            answersToInsert.push({ response_id: resp.id, question_id: q.id, answer_text: subjectFocus });
          } else {
            let notes = specificTopics;
            if (phone || name) {
              notes += `\n[Student: ${name} | Contact: ${phone || email}]`;
            }
            answersToInsert.push({ response_id: resp.id, question_id: q.id, answer_text: notes.trim() || "N/A" });
          }
        }

        if (answersToInsert.length > 0) {
          await supabase.from("dynamic_survey_answers").insert(answersToInsert);
        }
      }
    }

    if (feedbackInsertError && !targetSurveyId) {
      console.error("Failed to insert into both feedback and surveys:", feedbackInsertError);
      return { success: false, message: feedbackInsertError.message || "Failed to submit feedback." };
    }

    revalidatePath("/admin/surveys");
    return { success: true, message: "Thank you! Your subject priority has been recorded." };
  } catch (err) {
    console.error("Error submitting AP Endowment feedback:", err);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export type ApEndowmentFeedbackSummary = {
  totalResponses: number;
  paper1Count: number;
  paper2Count: number;
  bothCount: number;
  recentResponses: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    paperChoice: string;
    subjectFocus: string;
    specificTopics?: string;
    createdAt: string;
  }>;
};

export async function getApEndowmentFeedbackSummaryAction(): Promise<ApEndowmentFeedbackSummary> {
  const empty: ApEndowmentFeedbackSummary = {
    totalResponses: 0,
    paper1Count: 0,
    paper2Count: 0,
    bothCount: 0,
    recentResponses: [],
  };

  try {
    const supabase = await getSupabaseServerClient();
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) return empty;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") return empty;

    // 1. First check ap_endowment_feedback table
    const { data: feedbackRows, error } = await supabase
      .from("ap_endowment_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && feedbackRows && feedbackRows.length > 0) {
      let p1 = 0;
      let p2 = 0;
      let both = 0;

      const responses = feedbackRows.map((row: any) => {
        const choice = (row.paper_choice || "").toLowerCase();
        if (choice.includes("both")) both++;
        else if (choice.includes("paper 1") || choice.includes("general studies")) p1++;
        else if (choice.includes("paper 2") || choice.includes("hindu")) p2++;

        return {
          id: row.id,
          studentName: row.student_name || "Student",
          studentEmail: row.student_email || "N/A",
          studentPhone: row.student_phone || undefined,
          paperChoice: row.paper_choice,
          subjectFocus: row.subject_focus,
          specificTopics: row.specific_topics || undefined,
          createdAt: row.created_at,
        };
      });

      return {
        totalResponses: responses.length,
        paper1Count: p1,
        paper2Count: p2,
        bothCount: both,
        recentResponses: responses,
      };
    }

    // 2. Check dynamic_survey_responses as fallback
    const { data: survey } = await supabase
      .from("dynamic_surveys")
      .select("id, dynamic_survey_questions(id, question_text)")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (!survey?.id) return empty;

    const { data: surveyResponses } = await supabase
      .from("dynamic_survey_responses")
      .select(`
        id,
        submitted_at,
        user_id,
        answers:dynamic_survey_answers(question_id, answer_text)
      `)
      .eq("survey_id", survey.id)
      .order("submitted_at", { ascending: false });

    if (!surveyResponses || surveyResponses.length === 0) return empty;

    const userIds = surveyResponses.map((r: any) => r.user_id).filter(Boolean);
    const { data: profiles } = userIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, phone").in("id", userIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const emailMap = new Map<string, string>();

    if (userIds.length > 0) {
      try {
        const { data: emailRows } = await supabase.rpc("get_admin_user_emails", {
          requested_user_ids: userIds.slice(0, 200),
        });
        if (emailRows) {
          (emailRows as Array<{ user_id: string; email: string }>).forEach((row) => {
            if (row.email) emailMap.set(row.user_id, row.email.trim());
          });
        }
      } catch {
        // Fallback silently if RPC is not accessible
      }
    }

    let p1 = 0;
    let p2 = 0;
    let both = 0;

    const responses = surveyResponses.map((r: any) => {
      const prof = r.user_id ? profileMap.get(r.user_id) : null;
      const answers: Array<{ question_id: string; answer_text: string }> = r.answers || [];

      let paperChoice = "Paper 2 - Hindu Philosophy & Temple System";
      let subjectFocus = "";
      let specificTopics = "";
      let noteName = "";
      let noteContact = "";

      for (const a of answers) {
        const text = a.answer_text || "";
        const match = text.match(/\[Student:\s*(.*?)\s*\|\s*Contact:\s*(.*?)\]/);
        if (match) {
          noteName = match[1];
          noteContact = match[2];
        }
        if (text.includes("Paper 1") || text.includes("Paper 2") || text.includes("Both")) {
          paperChoice = text.replace(/\[Student:.*?\]/, "").trim();
        } else if (!subjectFocus) {
          subjectFocus = text.replace(/\[Student:.*?\]/, "").trim();
        } else {
          specificTopics = text.replace(/\[Student:.*?\]/, "").trim();
        }
      }

      const choiceLower = paperChoice.toLowerCase();
      if (choiceLower.includes("both")) both++;
      else if (choiceLower.includes("paper 1") || choiceLower.includes("general studies")) p1++;
      else if (choiceLower.includes("paper 2") || choiceLower.includes("hindu")) p2++;

      const email =
        (r.user_id ? emailMap.get(r.user_id) : null) ||
        (noteContact && noteContact.includes("@") ? noteContact : null) ||
        "N/A";
      const phone = prof?.phone || (!noteContact.includes("@") && noteContact ? noteContact : undefined);

      return {
        id: r.id,
        studentName: prof?.full_name || noteName || "Registered Student",
        studentEmail: email,
        studentPhone: phone,
        paperChoice,
        subjectFocus: subjectFocus || "Mock Test Priority",
        specificTopics: specificTopics || undefined,
        createdAt: r.submitted_at,
      };
    });

    return {
      totalResponses: responses.length,
      paper1Count: p1,
      paper2Count: p2,
      bothCount: both,
      recentResponses: responses,
    };
  } catch (err) {
    console.error("Error getting AP Endowment feedback summary:", err);
    return empty;
  }
}

export async function deleteApEndowmentFeedbackAction(feedbackId: string) {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.from("ap_endowment_feedback").delete().eq("id", feedbackId);
    await supabase.from("dynamic_survey_answers").delete().eq("response_id", feedbackId);
    await supabase.from("dynamic_survey_responses").delete().eq("id", feedbackId);

    revalidatePath("/admin/surveys");
    return { success: true };
  } catch (err) {
    console.error("Error deleting feedback entry:", err);
    return { success: false, error: "Failed to delete feedback." };
  }
}

export async function clearAllApEndowmentResponsesAction() {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.from("ap_endowment_feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { data: survey } = await supabase
      .from("dynamic_surveys")
      .select("id")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (survey?.id) {
      await supabase.from("dynamic_survey_answers").delete().eq("survey_id", survey.id);
      await supabase.from("dynamic_survey_responses").delete().eq("survey_id", survey.id);
    }

    revalidatePath("/admin/surveys");
    return { success: true };
  } catch (err) {
    console.error("Error clearing all AP Endowment feedback responses:", err);
    return { success: false, error: "Failed to clear responses." };
  }
}

export async function toggleApEndowmentStatusAction(isActive: boolean) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: survey } = await supabase
      .from("dynamic_surveys")
      .select("id")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (survey?.id) {
      await supabase
        .from("dynamic_surveys")
        .update({ is_active: isActive })
        .eq("id", survey.id);
    }

    revalidatePath("/admin/surveys");
    return { success: true, isActive };
  } catch (err) {
    console.error("Error toggling AP Endowment survey status:", err);
    return { success: false, isActive: false };
  }
}

export type ApEndowmentSurveyConditions = {
  reappearIfSubmitted: boolean;
  submittedIntervalDays: number;
  reappearIfSkipped: boolean;
  maxSkipAppearances: number;
  skipIntervalHours: number;
};

export const DEFAULT_SURVEY_CONDITIONS: ApEndowmentSurveyConditions = {
  reappearIfSubmitted: false,
  submittedIntervalDays: 7,
  reappearIfSkipped: true,
  maxSkipAppearances: 2,
  skipIntervalHours: 24,
};

let cachedConditions: ApEndowmentSurveyConditions = { ...DEFAULT_SURVEY_CONDITIONS };

export async function getApEndowmentSurveyConditionsAction(): Promise<ApEndowmentSurveyConditions> {
  return cachedConditions;
}

export async function saveApEndowmentSurveyConditionsAction(
  conditions: ApEndowmentSurveyConditions
): Promise<{ success: boolean }> {
  cachedConditions = { ...DEFAULT_SURVEY_CONDITIONS, ...conditions };
  revalidatePath("/admin/surveys");
  return { success: true };
}

export async function updateApEndowmentMetaAction(title: string, description: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: survey } = await supabase
      .from("dynamic_surveys")
      .select("id")
      .ilike("title", "%Endowment%Priority%")
      .maybeSingle();

    if (survey?.id) {
      await supabase
        .from("dynamic_surveys")
        .update({ title: title.trim(), description: description.trim() })
        .eq("id", survey.id);
    }

    revalidatePath("/admin/surveys");
    return { success: true };
  } catch (err) {
    console.error("Error updating AP Endowment survey meta:", err);
    return { success: false, error: "Failed to update survey meta." };
  }
}
