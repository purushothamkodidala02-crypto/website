"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminNavBadges = {
  reports: {
    openCount: number;
    latestCreatedAt: string | null;
  };
  surveys: {
    newCount: number;
    totalCount: number;
    latestSubmittedAt: string | null;
  };
};

export async function getAdminNavBadges(
  lastSeenSurveysTime?: string | null
): Promise<AdminNavBadges> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        reports: { openCount: 0, latestCreatedAt: null },
        surveys: { newCount: 0, totalCount: 0, latestSubmittedAt: null },
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return {
        reports: { openCount: 0, latestCreatedAt: null },
        surveys: { newCount: 0, totalCount: 0, latestSubmittedAt: null },
      };
    }

    const admin = createAdminClient();

    // 1. Fetch Question Reports badge data
    const [reportsCountRes, latestReportRes] = await Promise.all([
      admin
        .from("question_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      admin
        .from("question_reports")
        .select("created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const openCount = reportsCountRes.count ?? 0;
    const latestCreatedAt = latestReportRes.data?.created_at ?? null;

    // 2. Fetch Survey Responses badge data
    const [surveysTotalRes, latestSurveyRes] = await Promise.all([
      admin
        .from("dynamic_survey_responses")
        .select("id", { count: "exact", head: true }),
      admin
        .from("dynamic_survey_responses")
        .select("submitted_at")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const totalCount = surveysTotalRes.count ?? 0;
    const latestSubmittedAt = latestSurveyRes.data?.submitted_at ?? null;

    let newCount = 0;
    if (lastSeenSurveysTime) {
      const { count } = await admin
        .from("dynamic_survey_responses")
        .select("id", { count: "exact", head: true })
        .gt("submitted_at", lastSeenSurveysTime);
      newCount = count ?? 0;
    } else {
      // If admin hasn't recorded a seen timestamp, treat responses from past 24 hours as new
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("dynamic_survey_responses")
        .select("id", { count: "exact", head: true })
        .gte("submitted_at", dayAgo);
      newCount = count ?? 0;
    }

    return {
      reports: {
        openCount,
        latestCreatedAt,
      },
      surveys: {
        newCount,
        totalCount,
        latestSubmittedAt,
      },
    };
  } catch (err) {
    console.error("Error in getAdminNavBadges:", err);
    return {
      reports: { openCount: 0, latestCreatedAt: null },
      surveys: { newCount: 0, totalCount: 0, latestSubmittedAt: null },
    };
  }
}
