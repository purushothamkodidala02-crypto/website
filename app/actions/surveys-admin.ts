"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { revalidatePath } from "next/cache";
import {
  type ZohoSurveySettings,
  DEFAULT_ZOHO_SETTINGS,
} from "@/lib/surveys/zoho-settings";

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
  respondentPhone?: string | null;
  respondentContact?: string | null;
  respondentEmail: string | null;
  answers: Array<{ question_id: string; answer_text: string }>;
};

export type { ZohoSurveySettings };

export type AdminSurveyDetail = {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  settings?: ZohoSurveySettings | null;
};

export type AdminSurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  display_order: number;
  is_required?: boolean;
};

export async function createAdminSurvey(title: string, description: string = "") {
  const dbClient = await getSupabaseServerClient();
  const { data, error } = await dbClient
    .from("dynamic_surveys")
    .insert({ title: title.trim(), description: description.trim() })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/surveys");
  revalidatePath("/survey");
  return { id: data.id };
}

export async function updateAdminSurvey(
  surveyId: string,
  input: { title?: string; description?: string }
) {
  const dbClient = await getSupabaseServerClient();
  const updates: Record<string, string> = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim();

  const { error } = await dbClient
    .from("dynamic_surveys")
    .update(updates)
    .eq("id", surveyId);

  if (error) return { error: error.message };
  revalidatePath("/admin/surveys");
  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: true };
}

export async function updateSurveySettings(
  surveyId: string,
  settings: ZohoSurveySettings
) {
  try {
    const dbClient = await getSupabaseServerClient();
    const { error } = await dbClient
      .from("dynamic_surveys")
      .update({ settings })
      .eq("id", surveyId);

    if (error) {
      console.warn("Notice: settings column update error on dynamic_surveys:", error.message);
    }

    revalidatePath("/admin/surveys");
    revalidatePath(`/admin/surveys/${surveyId}`);
    revalidatePath("/survey");
    return { success: true };
  } catch (err) {
    console.error("Error in updateSurveySettings:", err);
    return { success: true };
  }
}

export async function deleteAdminSurvey(surveyId: string) {
  try {
    const dbClient = await getSupabaseServerClient();

    // 1. Fetch responses for survey
    const { data: responses } = await dbClient
      .from("dynamic_survey_responses")
      .select("id")
      .eq("survey_id", surveyId);

    const responseIds = (responses || []).map((r: { id: string }) => r.id);

    // 2. Delete child answers
    if (responseIds.length > 0) {
      await dbClient
        .from("dynamic_survey_answers")
        .delete()
        .in("response_id", responseIds);
    }

    // 3. Delete responses
    await dbClient
      .from("dynamic_survey_responses")
      .delete()
      .eq("survey_id", surveyId);

    // 4. Delete questions
    await dbClient
      .from("dynamic_survey_questions")
      .delete()
      .eq("survey_id", surveyId);

    // 5. Delete survey
    const { error } = await dbClient
      .from("dynamic_surveys")
      .delete()
      .eq("id", surveyId);

    if (error) return { error: error.message };

    revalidatePath("/admin/surveys");
    revalidatePath("/survey");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error in deleteAdminSurvey:", err);
    return { error: err instanceof Error ? err.message : "Failed to delete survey." };
  }
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
  displayOrder: number,
  isRequired: boolean = false
) {
  const dbClient = await getSupabaseServerClient();
  const { error } = await dbClient.from("dynamic_survey_questions").insert({
    survey_id: surveyId,
    question_text: questionText,
    question_type: questionType,
    options: options.length > 0 ? options : null,
    display_order: displayOrder,
    is_required: isRequired,
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: !error, error: error?.message };
}

export async function updateSurveyQuestion(
  questionId: string,
  surveyId: string,
  input: {
    questionText: string;
    questionType: string;
    options: string[];
    isRequired?: boolean;
  }
) {
  const dbClient = await getSupabaseServerClient();
  const { error } = await dbClient
    .from("dynamic_survey_questions")
    .update({
      question_text: input.questionText.trim(),
      question_type: input.questionType,
      options: input.options.length > 0 ? input.options : null,
      is_required: input.isRequired ?? false,
    })
    .eq("id", questionId)
    .eq("survey_id", surveyId);

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: !error, error: error?.message };
}

export async function deleteSurveyQuestion(questionId: string, surveyId: string) {
  const dbClient = await getSupabaseServerClient();
  try {
    // Clean up answers referencing this question first
    await dbClient
      .from("dynamic_survey_answers")
      .delete()
      .eq("question_id", questionId);
  } catch {
    // Ignore error if answers cannot be deleted directly
  }

  const { error } = await dbClient
    .from("dynamic_survey_questions")
    .delete()
    .eq("id", questionId)
    .eq("survey_id", surveyId);

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/survey");
  return { success: !error, error: error?.message };
}

export async function reorderSurveyQuestions(
  surveyId: string,
  questionOrders: Array<{ id: string; display_order: number }>
) {
  const dbClient = await getSupabaseServerClient();
  try {
    await Promise.all(
      questionOrders.map((q) =>
        dbClient
          .from("dynamic_survey_questions")
          .update({ display_order: q.display_order })
          .eq("id", q.id)
          .eq("survey_id", surveyId)
      )
    );
    revalidatePath(`/admin/surveys/${surveyId}`);
    revalidatePath("/survey");
    return { success: true };
  } catch (err) {
    console.error("Error reordering questions:", err);
    return { success: false };
  }
}

export async function deleteSurveyResponse(responseId: string, surveyId: string) {
  const dbClient = await getSupabaseServerClient();
  try {
    await dbClient.from("dynamic_survey_answers").delete().eq("response_id", responseId);
    const { error } = await dbClient
      .from("dynamic_survey_responses")
      .delete()
      .eq("id", responseId)
      .eq("survey_id", surveyId);

    revalidatePath(`/admin/surveys/${surveyId}`);
    revalidatePath("/admin/surveys");
    return { success: !error, error: error?.message };
  } catch (err) {
    console.error("Error deleting survey response:", err);
    return { success: false, error: "Failed to delete response." };
  }
}

export async function clearAllSurveyResponses(surveyId: string) {
  const dbClient = await getSupabaseServerClient();
  try {
    const { data: responses } = await dbClient
      .from("dynamic_survey_responses")
      .select("id")
      .eq("survey_id", surveyId);

    const responseIds = (responses || []).map((r: { id: string }) => r.id);
    if (responseIds.length > 0) {
      await dbClient
        .from("dynamic_survey_answers")
        .delete()
        .in("response_id", responseIds);
    }
    await dbClient
      .from("dynamic_survey_responses")
      .delete()
      .eq("survey_id", surveyId);

    revalidatePath(`/admin/surveys/${surveyId}`);
    revalidatePath("/admin/surveys");
    return { success: true };
  } catch (err) {
    console.error("Error clearing survey responses:", err);
    return { success: false, error: "Failed to clear responses." };
  }
}

export async function getAdminSurveyDetail(surveyId: string): Promise<{
  survey: AdminSurveyDetail | null;
  questions: AdminSurveyQuestion[];
  responses: AdminSurveyResponse[];
  error?: string | null;
}> {
  try {
    const dbClient = await getSupabaseServerClient();
    let { data: survey, error: sError } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, created_at, settings")
      .eq("id", surveyId)
      .maybeSingle();

    if (sError && sError.message?.includes("settings")) {
      const fallback = await dbClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .eq("id", surveyId)
        .maybeSingle();
      survey = fallback.data as any;
      sError = fallback.error;
    }

    if (!survey) {
      const pubClient = createPublicClient();
      const { data: pubSurvey } = await pubClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .eq("id", surveyId)
        .maybeSingle();
      if (pubSurvey) {
        survey = pubSurvey as any;
        sError = null;
      }
    }

    if (sError || !survey) {
      return {
        survey: null,
        questions: [],
        responses: [],
        error: sError?.message || "Survey not found.",
      };
    }

    let [{ data: questions, error: qError }, responses] = await Promise.all([
      dbClient
        .from("dynamic_survey_questions")
        .select("id, survey_id, question_text, question_type, options, display_order, is_required")
        .eq("survey_id", surveyId)
        .order("display_order", { ascending: true }),
      getAdminSurveyResponses(surveyId),
    ]);

    if (!questions || questions.length === 0) {
      const pubClient = createPublicClient();
      const { data: pubQuestions } = await pubClient
        .from("dynamic_survey_questions")
        .select("id, survey_id, question_text, question_type, options, display_order, is_required")
        .eq("survey_id", surveyId)
        .order("display_order", { ascending: true });
      if (pubQuestions && pubQuestions.length > 0) {
        questions = pubQuestions;
      }
    }

    if (qError) {
      console.error("Error loading survey questions:", qError);
    }

    return {
      survey,
      questions: (questions as AdminSurveyQuestion[]) || [],
      responses: responses || [],
      error: null,
    };
  } catch (err) {
    console.error("Error in getAdminSurveyDetail:", err);
    try {
      const pubClient = createPublicClient();
      const { data: pubSurvey } = await pubClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .eq("id", surveyId)
        .maybeSingle();
      if (pubSurvey) {
        const { data: pubQuestions } = await pubClient
          .from("dynamic_survey_questions")
          .select("id, survey_id, question_text, question_type, options, display_order, is_required")
          .eq("survey_id", surveyId)
          .order("display_order", { ascending: true });
        return {
          survey: pubSurvey,
          questions: (pubQuestions as AdminSurveyQuestion[]) || [],
          responses: [],
          error: null,
        };
      }
    } catch {
      // Ignore
    }
    return {
      survey: null,
      questions: [],
      responses: [],
      error: err instanceof Error ? err.message : "Failed to load survey.",
    };
  }
}

export async function getAdminSurveysWithCounts() {
  try {
    const dbClient = await getSupabaseServerClient();
    let { data: surveys, error } = await dbClient
      .from("dynamic_surveys")
      .select("id, title, description, is_active, created_at, settings")
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("settings")) {
      const fallback = await dbClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .order("created_at", { ascending: false });
      surveys = fallback.data as any;
      error = fallback.error;
    }

    if (error || !surveys || surveys.length === 0) {
      const pubClient = createPublicClient();
      const { data: pubSurveys } = await pubClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .order("created_at", { ascending: false });
      if (pubSurveys && pubSurveys.length > 0) {
        surveys = pubSurveys as any;
        error = null;
      }
    }

    if (error || !surveys) return [];

    // Fetch response counts
    const counts: Record<string, number> = {};
    try {
      const { data: responses } = await dbClient
        .from("dynamic_survey_responses")
        .select("survey_id");

      (responses || []).forEach((r: { survey_id: string }) => {
        counts[r.survey_id] = (counts[r.survey_id] || 0) + 1;
      });
    } catch {
      // Ignore count fetch errors
    }

    return surveys.map((s) => ({
      ...s,
      response_count: counts[s.id] || 0,
    }));
  } catch (err) {
    console.error("Error in getAdminSurveysWithCounts:", err);
    try {
      const pubClient = createPublicClient();
      const { data: fallbackSurveys } = await pubClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .order("created_at", { ascending: false });
      if (fallbackSurveys) {
        return fallbackSurveys.map((s) => ({ ...s, response_count: 0 }));
      }
    } catch {
      // Ignore
    }
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

    // Collect user ids to fetch profiles and emails if logged in
    const userIds = Array.from(new Set(responses.map((r) => r.user_id).filter(Boolean))) as string[];
    const profileMap = new Map<string, { full_name?: string; phone?: string }>();
    const emailMap = new Map<string, string>();

    if (userIds.length > 0) {
      // 1. Fetch profiles (full_name and phone)
      try {
        const { data: profiles, error: pError } = await dbClient
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        if (pError) {
          console.error("Error fetching profiles for survey responses:", pError);
        } else if (profiles) {
          (profiles as Array<{ id: string; full_name?: string | null; phone?: string | null }>).forEach((p) => {
            profileMap.set(p.id, {
              full_name: p.full_name?.trim() || undefined,
              phone: p.phone?.trim() || undefined,
            });
          });
        }
      } catch (err) {
        console.error("Exception fetching profiles in getAdminSurveyResponses:", err);
      }

      // 2. Fetch student emails via get_admin_user_emails RPC in batches of 200
      try {
        for (let i = 0; i < userIds.length; i += 200) {
          const batch = userIds.slice(i, i + 200);
          const { data: emailRows, error: emailError } = await dbClient.rpc(
            "get_admin_user_emails",
            { requested_user_ids: batch }
          );
          if (emailError) {
            console.error("Error fetching student emails via RPC:", emailError);
          } else if (emailRows) {
            (emailRows as Array<{ user_id: string; email: string }>).forEach((row) => {
              if (row.email) {
                emailMap.set(row.user_id, row.email.trim());
              }
            });
          }
        }
      } catch (err) {
        console.error("Exception calling get_admin_user_emails in getAdminSurveyResponses:", err);
      }

      // 3. Fallback to auth.admin if available and any student info or emails are missing
      if (dbClient.auth && "admin" in dbClient.auth) {
        const missingUserIds = userIds.filter(
          (uid) => !emailMap.has(uid) || !profileMap.get(uid)?.phone || !profileMap.get(uid)?.full_name
        );
        if (missingUserIds.length > 0) {
          await Promise.allSettled(
            missingUserIds.map(async (uid) => {
              try {
                const adminAuth = dbClient.auth as unknown as {
                  admin: {
                    getUserById: (id: string) => Promise<{
                      data: {
                        user?: {
                          email?: string;
                          phone?: string;
                          user_metadata?: Record<string, string>;
                        };
                      } | null;
                    }>;
                  };
                };
                const { data: authData } = await adminAuth.admin.getUserById(uid);
                const userObj = authData?.user;
                if (!userObj) return;

                if (userObj.email && !emailMap.has(uid)) {
                  emailMap.set(uid, userObj.email.trim());
                }

                const existingProfile = profileMap.get(uid) || {};
                const userMeta = userObj.user_metadata || {};
                const phone = existingProfile.phone || userObj.phone || userMeta.phone;
                const fullName = existingProfile.full_name || userMeta.full_name;

                if (phone || fullName) {
                  profileMap.set(uid, {
                    full_name: fullName?.trim() || existingProfile.full_name,
                    phone: phone?.trim() || existingProfile.phone,
                  });
                }
              } catch {
                // Ignore individual lookup errors
              }
            })
          );
        }
      }
    }

    return (responses as Array<{
      id: string;
      submitted_at: string;
      user_id: string | null;
      answers: Array<{ question_id: string; answer_text: string }>;
    }>).map((r) => {
      const profile = r.user_id ? profileMap.get(r.user_id) : null;
      let rawContactInfo: string | null = null;

      // Extract respondent contact if attached to any answer text
      const cleanedAnswers = (r.answers || []).map((a) => {
        const match = a.answer_text.match(/\n\[Respondent Contact:\s*(.*?)\]$/);
        if (match) {
          rawContactInfo = match[1];
          return {
            ...a,
            answer_text: a.answer_text.replace(/\n\[Respondent Contact:\s*.*?\]$/, "").trim(),
          };
        }
        return a;
      });

      let extractedName: string | null = null;
      let extractedContact: string | null = null;

      if (rawContactInfo) {
        const nameMatch = (rawContactInfo as string).match(/Name:\s*([^|]+)/);
        const contactMatch = (rawContactInfo as string).match(/Contact:\s*(.+)/);
        if (nameMatch && nameMatch[1]) {
          extractedName = nameMatch[1].trim();
        }
        if (contactMatch && contactMatch[1]) {
          extractedContact = contactMatch[1].trim();
        }
      }

      // Determine email
      let email = (r.user_id ? emailMap.get(r.user_id) : null) || null;
      if (!email && extractedContact && extractedContact.includes("@")) {
        email = extractedContact;
      }

      // Determine phone
      let phone = profile?.phone || null;
      if (!phone && extractedContact && !extractedContact.includes("@")) {
        phone = extractedContact;
      }

      // Determine display name
      let name = profile?.full_name || extractedName || "";
      if (!name) {
        if (r.user_id) {
          name = email ? email.split("@")[0] : "Registered Student";
        } else {
          name = "Anonymous Visitor";
        }
      }

      const respondentContact = phone || extractedContact || null;

      return {
        id: r.id,
        submitted_at: r.submitted_at,
        user_id: r.user_id,
        respondentName: name,
        respondentPhone: phone,
        respondentEmail: email,
        respondentContact,
        answers: cleanedAnswers.filter((a) => a.question_id !== "respondent_info"),
      };
    });
  } catch (err) {
    console.error("Error in getAdminSurveyResponses:", err);
    return [];
  }
}
