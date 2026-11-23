"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GrowthPopupSettings, NewUserSurveySettings } from "@/lib/growth-settings";

export type GrowthSettingsActionState = {
  success: boolean;
  message: string;
};

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Sign in is required." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase, error: "Administrator access is required." };
  return { supabase, user };
}

export async function saveGrowthSettings(
  _prev: GrowthSettingsActionState,
  formData: FormData,
): Promise<GrowthSettingsActionState> {
  const auth = await adminClient();
  if ("error" in auth) {
    return { success: false, message: auth.error ?? "Access denied." };
  }

  const enabled = formData.get("enabled") === "true";
  const minCompletedTests = Math.max(
    1,
    parseInt(String(formData.get("minCompletedTests") || "5"), 10),
  );
  const cooldownDays = Math.max(
    0,
    parseInt(String(formData.get("cooldownDays") || "7"), 10),
  );
  const maxAppearances = Math.max(
    0,
    parseInt(String(formData.get("maxAppearances") || "3"), 10),
  );
  const displayDelaySeconds = Math.max(
    0.5,
    parseFloat(String(formData.get("displayDelaySeconds") || "2.5")),
  );

  const targetRoutes = {
    dashboard: formData.get("targetRouteDashboard") === "true",
    home: formData.get("targetRouteHome") === "true",
    mockTests: formData.get("targetRouteMockTests") === "true",
    exams: formData.get("targetRouteExams") === "true",
  };

  const headline = String(formData.get("headline") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const primaryButtonText = String(formData.get("primaryButtonText") ?? "").trim();
  const secondaryButtonText = String(formData.get("secondaryButtonText") ?? "").trim();
  const upiId = String(formData.get("upiId") ?? "").trim();
  const upiName = String(formData.get("upiName") ?? "").trim();

  const amountsRaw = String(formData.get("suggestedAmounts") ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const suggestedAmounts = amountsRaw.length ? amountsRaw : [49, 99, 199, 499];

  // Stage 1: Survey Form Configuration
  const surveyEnabled = formData.get("surveyEnabled") === "true";
  const surveyMinCompletedTests = Math.max(
    1,
    parseInt(String(formData.get("surveyMinCompletedTests") || "1"), 10),
  );
  const surveyHeadline = String(formData.get("surveyHeadline") ?? "").trim();
  const surveyDescription = String(formData.get("surveyDescription") ?? "").trim();
  const surveySubmitButtonText = String(formData.get("surveySubmitButtonText") ?? "").trim();
  const surveyDismissButtonText = String(formData.get("surveyDismissButtonText") ?? "").trim();
  const surveyCooldownDays = Math.max(
    0,
    parseInt(String(formData.get("surveyCooldownDays") || "3"), 10),
  );
  const surveyMaxAppearances = Math.max(
    0,
    parseInt(String(formData.get("surveyMaxAppearances") || "2"), 10),
  );
  const surveyDisplayDelaySeconds = Math.max(
    0.5,
    parseFloat(String(formData.get("surveyDisplayDelaySeconds") || "2.5")),
  );

  const surveyTargetRoutes = {
    dashboard: formData.get("surveyTargetRouteDashboard") === "true",
    home: formData.get("surveyTargetRouteHome") === "true",
    mockTests: formData.get("surveyTargetRouteMockTests") === "true",
    exams: formData.get("surveyTargetRouteExams") === "true",
  };

  const surveySettings: NewUserSurveySettings = {
    enabled: surveyEnabled,
    minCompletedTests: surveyMinCompletedTests,
    headline: surveyHeadline || "Help Us Grow Varadhi Prep",
    description:
      surveyDescription ||
      "All mock tests on Varadhi Prep are 100% free and ad-free. Tell us how your preparation is going and which mock tests you need next!",
    submitButtonText: surveySubmitButtonText || "Submit & Help Us Grow",
    dismissButtonText: surveyDismissButtonText || "Maybe Later",
    cooldownDays: surveyCooldownDays,
    maxAppearances: surveyMaxAppearances,
    displayDelaySeconds: surveyDisplayDelaySeconds,
    targetRoutes: surveyTargetRoutes,
    askTargetExam: formData.get("surveyAskTargetExam") === "true",
    askMediumPreference: formData.get("surveyAskMediumPreference") === "true",
    askSuggestions: formData.get("surveyAskSuggestions") === "true",
    askPhone: formData.get("surveyAskPhone") === "true",
  };

  const payload: GrowthPopupSettings = {
    enabled,
    minCompletedTests,
    cooldownDays,
    maxAppearances,
    displayDelaySeconds,
    targetRoutes,
    headline: headline || "Contribute to Varadhi Prep",
    message:
      message ||
      "If you are happy with our service and Varadhi Prep has helped your preparation, consider contributing to help us grow. We keep every mock test free and ad-free for everyone. Your support directly covers cloud servers, database hosting, and bilingual questions.",
    primaryButtonText: primaryButtonText || "Contribute to Varadhi",
    secondaryButtonText: secondaryButtonText || "Maybe Later",
    suggestedAmounts,
    upiId: upiId || "",
    upiName: upiName || "Varadhi Prep",
    survey: surveySettings,
  };

  try {
    const { error: upsertError } = await auth.supabase.from("site_settings").upsert({
      key: "growth_popup",
      enabled,
      value: payload,
      updated_at: new Date().toISOString(),
      updated_by: auth.user.id,
    });

    if (upsertError) {
      // Fallback: if value column is not yet present, update enabled column
      if (upsertError.message?.includes("value")) {
        await auth.supabase.from("site_settings").upsert({
          key: "growth_popup",
          enabled,
          updated_at: new Date().toISOString(),
          updated_by: auth.user.id,
        });
      } else {
        return {
          success: false,
          message: `Failed to update settings: ${upsertError.message}`,
        };
      }
    }

    revalidatePath("/admin/growth-settings");
    revalidatePath("/dashboard");
    revalidatePath("/help-us-to-grow");
    revalidatePath("/mock-tests");

    return {
      success: true,
      message: "Growth pop-up settings saved successfully.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }
}

export type GrowthInteractionRecord = {
  id: string;
  user_id: string | null;
  student_name: string | null;
  student_email: string | null;
  event_type: string;
  button_label: string;
  amount: number | null;
  page_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function getGrowthInteractions(): Promise<GrowthInteractionRecord[]> {
  try {
    const auth = await adminClient();
    if ("error" in auth) return [];

    const { data, error } = await auth.supabase
      .from("growth_popup_interactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error || !data) {
      return [];
    }

    return data as GrowthInteractionRecord[];
  } catch {
    return [];
  }
}

export type GrowthSurveySubmissionPayload = {
  targetExam?: string;
  medium?: string;
  suggestions?: string;
  phone?: string;
  completedAttempts?: number;
  pagePath?: string;
};

export async function submitGrowthSurveyAction(
  payload: GrowthSurveySubmissionPayload,
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let studentName = "Candidate (1+ Tests)";
    let studentEmail = "";

    if (user) {
      studentEmail = user.email || "";
      studentName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.email ? user.email.split("@")[0] : "Student");

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, mobile")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          studentName = profile.full_name;
        }
      } catch {
        // Fallback to metadata
      }
    }

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    const { error: insertError } = await db.from("growth_popup_interactions").insert({
      user_id: user?.id ?? null,
      student_name: studentName,
      student_email: studentEmail || null,
      event_type: "survey_response",
      button_label: "Submitted Growth Survey",
      amount: null,
      page_path: payload.pagePath ?? null,
      metadata: {
        targetExam: payload.targetExam || "Not specified",
        medium: payload.medium || "Not specified",
        suggestions: payload.suggestions || "",
        phone: payload.phone || "",
        completedAttempts: payload.completedAttempts ?? 1,
      },
    });

    if (insertError) {
      console.warn("Could not record growth survey response:", insertError.message);
      return { success: false, message: insertError.message };
    }

    return { success: true };
  } catch (err) {
    console.warn("Could not record growth survey response:", err);
    return { success: false, message: "Submission failed. Please try again." };
  }
}
