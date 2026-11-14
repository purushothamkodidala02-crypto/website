"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
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

export async function getActiveSurvey(): Promise<DynamicSurveyData | null> {
  try {
    const dbClient = createPublicClient();
    const { data: survey, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching active survey:", error);
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
    console.error("Error in getActiveSurvey:", err);
    return null;
  }
}

export async function getSurveyById(surveyId: string): Promise<DynamicSurveyData | null> {
  try {
    const dbClient = await getSupabaseServerClient();
    const { data: survey, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active")
      .eq("id", surveyId)
      .maybeSingle();

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
