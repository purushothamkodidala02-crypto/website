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

type CacheEntry = {
  timestamp: number;
  data: AdminNavBadges;
};

// In-memory server-side cache for 15 seconds to prevent spamming DB on rapid tabs/mounts
let badgeCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15_000;

export async function getAdminNavBadges(
  lastSeenSurveysTime?: string | null
): Promise<AdminNavBadges> {
  const fallbackResult: AdminNavBadges = {
    reports: { openCount: 0, latestCreatedAt: null },
    surveys: { newCount: 0, totalCount: 0, latestSubmittedAt: null },
  };

  try {
    const now = Date.now();
    if (badgeCache && now - badgeCache.timestamp < CACHE_TTL_MS) {
      // Re-calculate newCount based on user's lastSeenSurveysTime if present
      if (lastSeenSurveysTime) {
        const lastSeenMs = new Date(lastSeenSurveysTime).getTime();
        const latestMs = badgeCache.data.surveys.latestSubmittedAt
          ? new Date(badgeCache.data.surveys.latestSubmittedAt).getTime()
          : 0;

        return {
          ...badgeCache.data,
          surveys: {
            ...badgeCache.data.surveys,
            newCount:
              !isNaN(lastSeenMs) && !isNaN(latestMs) && latestMs > lastSeenMs
                ? badgeCache.data.surveys.newCount
                : 0,
          },
        };
      }
      return {
        ...badgeCache.data,
        surveys: {
          ...badgeCache.data.surveys,
          newCount: 0,
        },
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return fallbackResult;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return fallbackResult;
    }

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    // Fetch open reports in a single query
    const reportsPromise = db
      .from("question_reports")
      .select("id, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch survey responses in a single query
    const surveysPromise = db
      .from("dynamic_survey_responses")
      .select("id, submitted_at", { count: "exact" })
      .order("submitted_at", { ascending: false })
      .limit(50);

    const [reportsRes, surveysRes] = await Promise.all([
      Promise.resolve(reportsPromise).catch(() => ({ data: [], count: 0, error: null })),
      Promise.resolve(surveysPromise).catch(() => ({ data: [], count: 0, error: null })),
    ]);

    const reportRows = (reportsRes.data ?? []) as Array<{ id: string; created_at: string }>;
    const openCount = reportsRes.count ?? reportRows.length;
    const latestCreatedAt = reportRows[0]?.created_at ?? null;

    const surveyRows = (surveysRes.data ?? []) as Array<{ id: string; submitted_at: string }>;
    const totalCount = surveysRes.count ?? surveyRows.length;
    const latestSubmittedAt = surveyRows[0]?.submitted_at ?? null;

    let newCount = 0;
    if (lastSeenSurveysTime) {
      const lastSeenMs = new Date(lastSeenSurveysTime).getTime();
      if (!isNaN(lastSeenMs)) {
        newCount = surveyRows.filter((r) => {
          if (!r.submitted_at) return false;
          const subMs = new Date(r.submitted_at).getTime();
          return !isNaN(subMs) && subMs > lastSeenMs;
        }).length;
      }
    }

    const result: AdminNavBadges = {
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

    badgeCache = {
      timestamp: now,
      data: result,
    };

    return result;
  } catch (err) {
    console.error("Error in getAdminNavBadges:", err);
    return fallbackResult;
  }
}
