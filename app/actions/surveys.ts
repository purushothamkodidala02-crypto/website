"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { revalidatePath } from "next/cache";
import type { SurveySettings } from "@/lib/surveys/survey-settings";

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

export type DynamicSurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: "text" | "textarea" | "radio" | string;
  options: string[] | null;
  display_order: number;
  is_required?: boolean;
};

export type DynamicSurveyData = {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  settings?: SurveySettings | null;
  questions: DynamicSurveyQuestion[];
};

export async function submitDynamicSurvey(
  surveyId: string,
  answers: Record<string, string>,
  respondentInfo?: { name?: string; contact?: string }
) {
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    // Link to logged-in user if available, otherwise anonymous submission
    const userId = user?.id || null;

    const dbClient = await getSupabaseServerClient();
    const responseId = crypto.randomUUID();
    const { error: responseError } = await dbClient
      .from("dynamic_survey_responses")
      .insert({ id: responseId, survey_id: surveyId, user_id: userId });

    if (responseError) {
      console.error("Survey Response Insert Error:", responseError);
      return { error: responseError.message || "Failed to submit survey. Please try again." };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const answerInserts = Object.entries(answers)
      .filter(([questionId, text]) => uuidRegex.test(questionId) && text !== undefined && text !== null && text.trim() !== "")
      .map(([questionId, text]) => ({
        response_id: responseId,
        question_id: questionId,
        answer_text: text.trim(),
      }));

    // If respondent provided extra contact info, append it cleanly to the last answer so foreign key constraint is preserved
    if (respondentInfo?.name || respondentInfo?.contact) {
      const contactText = [
        respondentInfo.name ? `Name: ${respondentInfo.name.trim()}` : null,
        respondentInfo.contact ? `Contact: ${respondentInfo.contact.trim()}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      if (contactText) {
        if (answerInserts.length > 0) {
          answerInserts[answerInserts.length - 1].answer_text += `\n[Respondent Contact: ${contactText}]`;
        } else {
          // If no specific question was answered, attach contact info to the first question of this survey
          const { data: firstQuestion } = await dbClient
            .from("dynamic_survey_questions")
            .select("id")
            .eq("survey_id", surveyId)
            .limit(1)
            .maybeSingle();

          if (firstQuestion?.id) {
            answerInserts.push({
              response_id: responseId,
              question_id: firstQuestion.id,
              answer_text: `[Respondent Contact: ${contactText}]`,
            });
          }
        }
      }
    }

    if (answerInserts.length > 0) {
      const { error: answersError } = await dbClient
        .from("dynamic_survey_answers")
        .insert(answerInserts);

      if (answersError) {
        console.error("Survey Answers Insert Error:", answersError);
        return { error: answersError.message || "Failed to save survey answers." };
      }
    }

    revalidatePath(`/admin/surveys/${surveyId}`);
    revalidatePath("/admin/surveys");
    revalidatePath("/admin");
    revalidatePath("/survey");

    return { success: true };
  } catch (err: unknown) {
    console.error("Survey submission unexpected error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred while submitting.";
    return { error: message };
  }
}

export type SurveyEligibilityResult = {
  eligible: boolean;
  reason?: "not_logged_in" | "no_exam_attempts" | "already_submitted" | "inactive" | "expired" | "not_targeted";
  isApEndowment?: boolean;
};

export async function checkSurveyEligibilityAction(
  surveyId: string
): Promise<SurveyEligibilityResult> {
  try {
    const dbClient = await getSupabaseServerClient();
    const { data: survey, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, settings")
      .eq("id", surveyId)
      .maybeSingle();

    if (error || !survey || !survey.is_active) {
      return { eligible: false, reason: "inactive" };
    }

    const settings = survey.settings as SurveySettings | null | undefined;

    // Check expiry
    if (settings?.expiryDate) {
      const exp = new Date(settings.expiryDate).getTime();
      if (!isNaN(exp) && Date.now() > exp) {
        return { eligible: false, reason: "expired" };
      }
    }

    // Determine target audience
    const isApEndowment =
      settings?.targetAudience === "ap_endowment" ||
      /endowment|enrollment/i.test(survey.title || "") ||
      /endowment|enrollment/i.test(survey.description || "");

    const targetAudience = settings?.targetAudience || (isApEndowment ? "ap_endowment" : "all");

    // Fetch authenticated user
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    // Check AP Endowment / Enrollment audience:
    // Form will ONLY appear to those who attended the enrollment/endowment exam
    if (isApEndowment || targetAudience === "ap_endowment") {
      if (!user) {
        return { eligible: false, reason: "not_logged_in", isApEndowment: true };
      }

      // Check if user already submitted in dynamic_survey_responses or ap_endowment_feedback
      const { data: existingResp } = await dbClient
        .from("dynamic_survey_responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("user_id", user.id)
        .limit(1);

      if (existingResp && existingResp.length > 0) {
        return { eligible: false, reason: "already_submitted", isApEndowment: true };
      }

      const { data: existingFeedback } = await dbClient
        .from("ap_endowment_feedback")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (existingFeedback && existingFeedback.length > 0) {
        return { eligible: false, reason: "already_submitted", isApEndowment: true };
      }

      // Check if user attended the AP Endowment / Enrollment exam
      let hasAttended = false;

      // 1. Completed test attempts
      const { data: attempts, error: attemptsError } = await dbClient
        .from("test_attempts")
        .select("id, mock_tests!inner(id, title)")
        .eq("user_id", user.id)
        .ilike("mock_tests.title", "%Endowment%")
        .limit(1);

      if (!attemptsError && attempts && attempts.length > 0) {
        hasAttended = true;
      } else {
        // 2. Active or historical test attempt sessions (attended exam)
        const { data: sessions, error: sessionsError } = await dbClient
          .from("test_attempt_sessions")
          .select("id, mock_tests!inner(id, title)")
          .eq("user_id", user.id)
          .ilike("mock_tests.title", "%Endowment%")
          .limit(1);

        if (!sessionsError && sessions && sessions.length > 0) {
          hasAttended = true;
        }
      }

      // Fallback check for Enrollment in test title
      if (!hasAttended) {
        const { data: enrollmentAttempts } = await dbClient
          .from("test_attempts")
          .select("id, mock_tests!inner(id, title)")
          .eq("user_id", user.id)
          .ilike("mock_tests.title", "%Enrollment%")
          .limit(1);

        if (enrollmentAttempts && enrollmentAttempts.length > 0) {
          hasAttended = true;
        } else {
          const { data: enrollmentSessions } = await dbClient
            .from("test_attempt_sessions")
            .select("id, mock_tests!inner(id, title)")
            .eq("user_id", user.id)
            .ilike("mock_tests.title", "%Enrollment%")
            .limit(1);

          if (enrollmentSessions && enrollmentSessions.length > 0) {
            hasAttended = true;
          }
        }
      }

      if (!hasAttended) {
        return { eligible: false, reason: "no_exam_attempts", isApEndowment: true };
      }

      return { eligible: true, isApEndowment: true };
    }

    // Other targeted exam audiences
    if (targetAudience === "tg_police") {
      if (!user) return { eligible: false, reason: "not_logged_in" };
      const { data: policeAttempts } = await dbClient
        .from("test_attempts")
        .select("id, mock_tests!inner(id, title)")
        .eq("user_id", user.id)
        .or("mock_tests.title.ilike.%Police%,mock_tests.title.ilike.%Constable%")
        .limit(1);

      if (!policeAttempts || policeAttempts.length === 0) {
        return { eligible: false, reason: "no_exam_attempts" };
      }
    } else if (targetAudience === "appsc") {
      if (!user) return { eligible: false, reason: "not_logged_in" };
      const { data: appscAttempts } = await dbClient
        .from("test_attempts")
        .select("id, mock_tests!inner(id, title)")
        .eq("user_id", user.id)
        .or("mock_tests.title.ilike.%APPSC%,mock_tests.title.ilike.%Andhra%")
        .limit(1);

      if (!appscAttempts || appscAttempts.length === 0) {
        return { eligible: false, reason: "no_exam_attempts" };
      }
    } else if (targetAudience === "tgpsc") {
      if (!user) return { eligible: false, reason: "not_logged_in" };
      const { data: tgpscAttempts } = await dbClient
        .from("test_attempts")
        .select("id, mock_tests!inner(id, title)")
        .eq("user_id", user.id)
        .or("mock_tests.title.ilike.%TGPSC%,mock_tests.title.ilike.%TSPSC%,mock_tests.title.ilike.%Telangana%")
        .limit(1);

      if (!tgpscAttempts || tgpscAttempts.length === 0) {
        return { eligible: false, reason: "no_exam_attempts" };
      }
    }

    // Generic "all" audience
    if (!settings?.allowAnonymous && !user) {
      return { eligible: false, reason: "not_logged_in" };
    }

    if (user) {
      const { data: existingResp } = await dbClient
        .from("dynamic_survey_responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("user_id", user.id)
        .limit(1);

      if (existingResp && existingResp.length > 0 && !settings?.reappearIfSubmitted) {
        return { eligible: false, reason: "already_submitted" };
      }
    }

    return { eligible: true };
  } catch (err) {
    console.error("Error checking survey eligibility:", err);
    return { eligible: false, reason: "inactive" };
  }
}

const SURVEY_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
let memActiveSurvey: { data: DynamicSurveyData | null; expiresAt: number } | null = null;

export async function clearActiveSurveyCache() {
  memActiveSurvey = null;
}

export async function getActiveSurvey(): Promise<DynamicSurveyData | null> {
  const now = Date.now();
  if (memActiveSurvey && now < memActiveSurvey.expiresAt) {
    return memActiveSurvey.data;
  }
  try {
    const dbClient = createPublicClient();
    let { data: survey, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, settings")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.message?.includes("settings")) {
      const fallback = await dbClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      survey = fallback.data as any;
      error = fallback.error;
    }

    if (error) {
      console.error("Error fetching active survey:", error);
      return null;
    }

    if (!survey) {
      memActiveSurvey = { data: null, expiresAt: now + SURVEY_CACHE_TTL_MS };
      return null;
    }

    const { data: questions } = await dbClient
      .from("dynamic_survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("display_order", { ascending: true });

    const result = { ...survey, questions: questions ?? [] };
    memActiveSurvey = { data: result, expiresAt: now + SURVEY_CACHE_TTL_MS };
    return result;
  } catch (err) {
    console.error("Error in getActiveSurvey:", err);
    return null;
  }
}

export async function getSurveyById(surveyId: string): Promise<DynamicSurveyData | null> {
  try {
    const dbClient = await getSupabaseServerClient();
    let { data: survey, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, settings")
      .eq("id", surveyId)
      .maybeSingle();

    if (error && error.message?.includes("settings")) {
      const fallback = await dbClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active")
        .eq("id", surveyId)
        .maybeSingle();
      survey = fallback.data as any;
      error = fallback.error;
    }

    if (error) {
      console.error("Error fetching survey by id:", error);
      return null;
    }

    if (!survey) return null;

    const { data: questions } = await dbClient
      .from("dynamic_survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("display_order", { ascending: true });

    return { ...survey, questions: questions ?? [] };
  } catch (err) {
    console.error("Error in getSurveyById:", err);
    return null;
  }
}
