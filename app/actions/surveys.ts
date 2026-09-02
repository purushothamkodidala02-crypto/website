"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitDynamicSurvey(surveyId: string, answers: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // We allow null users if we want anonymous, but here we expect logged in
  const userId = user?.id || null;

  const { data: response, error: responseError } = await supabase
    .from("dynamic_survey_responses")
    .insert({ survey_id: surveyId, user_id: userId })
    .select("id")
    .single();

  if (responseError || !response) {
    console.error("Survey Response Error:", responseError);
    return { error: "Failed to submit survey. Please try again." };
  }

  const answerInserts = Object.entries(answers).map(([questionId, text]) => ({
    response_id: response.id,
    question_id: questionId,
    answer_text: text
  }));

  if (answerInserts.length > 0) {
    const { error: answersError } = await supabase
      .from("dynamic_survey_answers")
      .insert(answerInserts);

    if (answersError) {
      console.error("Survey Answers Error:", answersError);
      return { error: "Failed to save answers." };
    }
  }

  return { success: true };
}

export async function getActiveSurvey() {
  const supabase = await createClient();
  const { data: survey } = await supabase
    .from("dynamic_surveys")
    .select("id, title, description")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!survey) return null;

  const { data: questions } = await supabase
    .from("dynamic_survey_questions")
    .select("*")
    .eq("survey_id", survey.id)
    .order("display_order", { ascending: true });

  return { ...survey, questions: questions ?? [] };
}
