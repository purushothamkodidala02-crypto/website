import { NextResponse } from "next/server";
import { getAdminSurveysWithCounts } from "@/app/actions/surveys-admin";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let surveys = await getAdminSurveysWithCounts();
    if (!surveys || surveys.length === 0) {
      const publicClient = createPublicClient();
      const { data: activeSurveys } = await publicClient
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .order("created_at", { ascending: false });
      if (activeSurveys && activeSurveys.length > 0) {
        surveys = activeSurveys.map((s) => ({ ...s, response_count: 0 }));
      }
    }
    return NextResponse.json({ surveys: surveys || [] });
  } catch (err) {
    console.error("Error in GET /api/admin/surveys:", err);
    return NextResponse.json({ surveys: [] });
  }
}
