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

export type AdminSurveyResponse = {
  id: string;
  submitted_at: string;
  user_id: string | null;
  respondentName: string;
  respondentContact?: string | null;
  respondentEmail: string | null;
  answers: Array<{ question_id: string; answer_text: string }>;
};

export async function createAdminSurvey(title: string) {
  const dbClient = await getSupabaseServerClient();
  const { data, error } = await dbClient
    .from("dynamic_surveys")
    .insert({ title, description: "" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/surveys");
  return { id: data.id };
}

export async function toggleSurveyStatus(surveyId: string, isActive: boolean) {
  const dbClient = await getSupabaseServerClient();

  if (isActive) {
    // Deactivate all others first so only one survey is primary active
    await dbClient.from("dynamic_surveys").update({ is_active: false }).neq("id", surveyId);
  }

  const { error } = await dbClient
    .from("dynamic_surveys")
    .update({ is_active: isActive })
    .eq("id", surveyId);

  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  revalidatePath("/");
  return { success: !error };
}

export async function saveSurveyQuestion(
  surveyId: string,
  questionText: string,
  questionType: string,
  options: string[],
  displayOrder: number
) {
  const dbClient = await getSupabaseServerClient();
  const { error } = await dbClient.from("dynamic_survey_questions").insert({
    survey_id: surveyId,
    question_text: questionText,
    question_type: questionType,
    options: options.length > 0 ? options : null,
    display_order: displayOrder,
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: !error };
}

export async function deleteSurveyQuestion(questionId: string, surveyId: string) {
  const dbClient = await getSupabaseServerClient();
  await dbClient.from("dynamic_survey_questions").delete().eq("id", questionId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: true };
}

export async function getAdminSurveysWithCounts() {
  try {
    const dbClient = await getSupabaseServerClient();
    const { data: surveys, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error || !surveys) return [];

    // Fetch response counts
    const { data: responses } = await dbClient
      .from("dynamic_survey_responses")
      .select("survey_id");

    const counts: Record<string, number> = {};
    (responses || []).forEach((r: { survey_id: string }) => {
      counts[r.survey_id] = (counts[r.survey_id] || 0) + 1;
    });

    return surveys.map((s) => ({
      ...s,
      response_count: counts[s.id] || 0,
    }));
  } catch (err) {
    console.error("Error in getAdminSurveysWithCounts:", err);
    return [];
  }
}

export async function getAdminSurveyResponses(surveyId: string): Promise<AdminSurveyResponse[]> {
  try {
    const dbClient = await getSupabaseServerClient();

    // Query responses and their answers without invalid PostgREST foreign key joins to auth.users
    const { data: responses, error: rError } = await dbClient
      .from("dynamic_survey_responses")
      .select(`
        id,
        submitted_at,
        user_id,
        answers:dynamic_survey_answers(question_id, answer_text)
      `)
      .eq("survey_id", surveyId)
      .order("submitted_at", { ascending: false });

    if (rError || !responses) {
      console.error("Error fetching survey responses:", rError);
      return [];
    }

    // Collect user ids to fetch profiles if logged in
    const userIds = Array.from(new Set(responses.map((r) => r.user_id).filter(Boolean))) as string[];
    const profileMap = new Map<string, { full_name?: string; email?: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await dbClient
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      (profiles as Array<{ id: string; full_name?: string; email?: string }> || []).forEach((p) => {
        profileMap.set(p.id, { full_name: p.full_name, email: p.email });
      });
    }

    return (responses as Array<{
      id: string;
      submitted_at: string;
      user_id: string | null;
      answers: Array<{ question_id: string; answer_text: string }>;
    }>).map((r) => {
      const profile = r.user_id ? profileMap.get(r.user_id) : null;
      let contactInfo: string | null = null;

      // Extract respondent contact if attached to any answer text
      const cleanedAnswers = (r.answers || []).map((a) => {
        const match = a.answer_text.match(/\n\[Respondent Contact:\s*(.*?)\]$/);
        if (match) {
          contactInfo = match[1];
          return {
            ...a,
            answer_text: a.answer_text.replace(/\n\[Respondent Contact:\s*.*?\]$/, "").trim(),
          };
        }
        return a;
      });

      let name = profile?.full_name || (r.user_id ? "Registered Student" : "Anonymous Visitor");
      const email = profile?.email || null;

      if (contactInfo) {
        const nameMatch = (contactInfo as string).match(/Name:\s*([^|]+)/);
        const contactMatch = (contactInfo as string).match(/Contact:\s*(.+)/);
        if (nameMatch && nameMatch[1]) {
          name = nameMatch[1].trim();
        }
        if (contactMatch && contactMatch[1]) {
          contactInfo = contactMatch[1].trim();
        }
      }

      return {
        id: r.id,
        submitted_at: r.submitted_at,
        user_id: r.user_id,
        respondentName: name,
        respondentContact: contactInfo,
        respondentEmail: email,
        answers: cleanedAnswers.filter((a) => a.question_id !== "respondent_info"),
      };
    });
  } catch (err) {
    console.error("Error in getAdminSurveyResponses:", err);
    return [];
  }
}
