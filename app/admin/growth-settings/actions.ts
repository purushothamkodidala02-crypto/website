"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GrowthPopupSettings } from "@/lib/growth-settings";

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

  const suggestedAmounts = amountsRaw.length ? amountsRaw : [50, 100, 250, 500];

  const payload: GrowthPopupSettings = {
    enabled,
    minCompletedTests,
    cooldownDays,
    maxAppearances,
    displayDelaySeconds,
    targetRoutes,
    headline: headline || "Support the Mission to Keep Quality Mock Tests Open & Free",
    message:
      message ||
      "You have completed 5+ full-length mock tests on Varadhi Prep. We bear high server, database, and bilingual question curation costs every month to keep exams open to every serious aspirant without commercial advertisements or paywalls.",
    primaryButtonText: primaryButtonText || "Support Varadhi",
    secondaryButtonText: secondaryButtonText || "Maybe Later",
    suggestedAmounts,
    upiId: upiId || "support@varadhiprep.in",
    upiName: upiName || "Varadhi Prep",
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
