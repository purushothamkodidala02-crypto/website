import { NextResponse } from "next/server";
import { getApEndowmentFeedbackSummaryAction } from "@/app/actions/ap-endowment-feedback";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getApEndowmentFeedbackSummaryAction();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Error in GET /api/admin/feedback:", err);
    return NextResponse.json({
      totalResponses: 0,
      paper1Count: 0,
      paper2Count: 0,
      bothCount: 0,
      recentResponses: [],
    });
  }
}
