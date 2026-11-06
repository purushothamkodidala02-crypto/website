"use server";

import { createClient } from "@/lib/supabase/server";
import { getMockTestPublicContextById } from "@/lib/public-route-data";
import { mockTestUrl, paperUrl, subjectUrl } from "@/lib/public-urls";

export type StudentPracticeStatus = {
  attemptedMockTestIds: string[];
  lastPractice: {
    testId: string;
    testTitle: string;
    testPath: string;
    folderUrl: string;
    folderName: string;
    folderType: "subject" | "paper";
    examName: string;
    paperName?: string;
    subjectName?: string;
    stateCode?: string;
    score?: number;
    totalMarks?: number;
    submittedAt?: string;
    timestamp: number;
  } | null;
};

export async function getStudentPracticeStatus(): Promise<StudentPracticeStatus> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { attemptedMockTestIds: [], lastPractice: null };
    }

    // 1. Fetch user's completed test attempts (most recent first)
    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("id, mock_test_id, score, total_marks, submitted_at")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    const attemptedMockTestIds = Array.from(
      new Set((attempts ?? []).map((a) => a.mock_test_id).filter(Boolean)),
    );

    const latestAttempt = attempts?.[0];

    // If no completed attempts, check for active in-progress sessions
    if (!latestAttempt) {
      const { data: activeSession } = await supabase
        .from("test_attempt_sessions")
        .select("id, mock_test_id, started_at")
        .eq("user_id", user.id)
        .is("submitted_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activeSession) {
        return { attemptedMockTestIds, lastPractice: null };
      }

      const c = await getMockTestPublicContextById(activeSession.mock_test_id);
      if (!c) return { attemptedMockTestIds, lastPractice: null };

      const folderUrl = c.subject
        ? subjectUrl(c.state.slug, c.exam.slug, c.paper.slug, c.subject.slug)
        : paperUrl(c.state.slug, c.exam.slug, c.paper.slug);

      return {
        attemptedMockTestIds,
        lastPractice: {
          testId: c.mockTest.id,
          testTitle: c.mockTest.title,
          testPath: mockTestUrl(c.state.slug, c.exam.slug, c.paper.slug, c.mockTest.slug),
          folderUrl,
          folderName: c.subject?.name ?? c.paper.name,
          folderType: c.subject ? "subject" : "paper",
          examName: c.exam.name,
          paperName: c.paper.name,
          subjectName: c.subject?.name,
          stateCode: c.state.code,
          timestamp: new Date(activeSession.started_at).getTime(),
        },
      };
    }

    // Build lastPractice from the latest completed attempt
    const c = await getMockTestPublicContextById(latestAttempt.mock_test_id);
    if (!c) {
      return { attemptedMockTestIds, lastPractice: null };
    }

    const folderUrl = c.subject
      ? subjectUrl(c.state.slug, c.exam.slug, c.paper.slug, c.subject.slug)
      : paperUrl(c.state.slug, c.exam.slug, c.paper.slug);

    return {
      attemptedMockTestIds,
      lastPractice: {
        testId: c.mockTest.id,
        testTitle: c.mockTest.title,
        testPath: mockTestUrl(c.state.slug, c.exam.slug, c.paper.slug, c.mockTest.slug),
        folderUrl,
        folderName: c.subject?.name ?? c.paper.name,
        folderType: c.subject ? "subject" : "paper",
        examName: c.exam.name,
        paperName: c.paper.name,
        subjectName: c.subject?.name,
        stateCode: c.state.code,
        score: Number(latestAttempt.score ?? 0),
        totalMarks: Number(latestAttempt.total_marks ?? 0),
        submittedAt: latestAttempt.submitted_at,
        timestamp: new Date(latestAttempt.submitted_at).getTime(),
      },
    };
  } catch (err) {
    console.error("getStudentPracticeStatus error:", err);
    return { attemptedMockTestIds: [], lastPractice: null };
  }
}
