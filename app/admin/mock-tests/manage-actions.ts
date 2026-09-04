"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG } from "@/lib/catalog-data";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import { createClient } from "@/lib/supabase/server";

export type MockTestManagementResult = {
  success: boolean;
  message: string;
  replacementId?: string;
};

async function getManagedMockTest(mockTestId: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return { supabase, error: "You must be logged in." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { supabase, error: "You are not authorized to manage Mock Tests." };
  }

  const { data: mockTest, error: mockTestError } = await supabase
    .from("mock_tests")
    .select("id, title, status, superseded_by_mock_test_id")
    .eq("id", mockTestId)
    .single();

  if (mockTestError || !mockTest) return { supabase, error: "Mock Test not found." };

  return { supabase, mockTest };
}

function revalidateMockTestPages(mockTestId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/mock-tests");
  revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);
  revalidatePath("/mock-tests");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");
}

export async function archiveMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to archive the Mock Test." };

  if (result.mockTest.status !== "published") {
    return { success: false, message: "Only published Mock Tests can be archived." };
  }

  const { error } = await result.supabase
    .from("mock_tests")
    .update({ status: "archived" })
    .eq("id", mockTestId);

  if (error) return { success: false, message: error.message };

  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” is hidden from students.` };
}

export async function publishMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to publish the Mock Test." };
  if (result.mockTest.status !== "draft") return { success: false, message: "Only draft Mock Tests can be published." };

  const { error } = await result.supabase.rpc("publish_mock_test_safely", {
    requested_mock_test_id: mockTestId,
  });
  if (error) {
    const needsExamSeries = error.message.includes(
      "Create an active Exam Pass for this Exam before publishing a paid Mock Test.",
    );
    const knownMessage = [
      "Add at least one Question before publishing.",
      "Every assigned Question and mark must be active and valid.",
      "The assigned Question count must exactly match the Mock Test target.",
    ].find((message) => error.message.includes(message));
    return {
      success: false,
      message: needsExamSeries
        ? "Create an active exam series for this exam before publishing a paid mock test."
        : knownMessage ?? "This Mock Test could not be published. Verify its Questions, marks, and Paper setup.",
    };
  }
  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” is published.` };
}

export async function republishArchivedMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to publish the Mock Test again." };
  if (result.mockTest.status !== "archived") return { success: false, message: "Only hidden Mock Tests can be published again." };

  const { error } = await result.supabase.rpc("republish_archived_mock_test_safely", { requested_mock_test_id: mockTestId });
  if (error) {
    const knownMessage = [
      "The corrected version of this Mock Test is already published.",
      "Add at least one Question before publishing.",
      "Every assigned Question and mark must be active and valid.",
      "The assigned Question count must match the Paper Question count.",
    ].find((message) => error.message.includes(message));
    return { success: false, message: knownMessage ?? "This Mock Test could not be published again. Verify its Questions and publishing setup." };
  }

  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” is live again.` };
}

export async function restoreMockTestAsDraft(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to restore the Mock Test." };

  if (result.mockTest.status !== "archived") {
    return { success: false, message: "Only archived Mock Tests can be restored." };
  }

  const { error } = await result.supabase
    .from("mock_tests")
    .update({ status: "draft", published_at: null })
    .eq("id", mockTestId);

  if (error) return { success: false, message: error.message };

  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” is restored as a draft.` };
}

export async function deleteDraftMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to delete the Mock Test." };

  if (result.mockTest.status !== "draft") {
    return { success: false, message: "Only draft Mock Tests can be deleted. Archive published tests instead." };
  }

  const { count, error: attemptsError } = await result.supabase
    .from("test_attempts")
    .select("id", { count: "exact", head: true })
    .eq("mock_test_id", mockTestId);

  if (attemptsError) return { success: false, message: "Unable to check student attempts for this Mock Test." };

  if ((count ?? 0) > 0) {
    return { success: false, message: "This Mock Test has student attempts and cannot be deleted. Archive it instead." };
  }

  const { error } = await result.supabase.from("mock_tests").delete().eq("id", mockTestId);
  if (error) return { success: false, message: error.message };

  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” was deleted.` };
}

export async function createCorrectedMockTestVersion(mockTestId: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to create a corrected version." };

  const { data, error } = await result.supabase.rpc("create_corrected_mock_test_version", {
    requested_mock_test_id: mockTestId,
  });
  if (error || typeof data !== "string") {
    const knownMessage = [
      "A corrected version already exists for this Mock Test.",
      "This Mock Test has no student attempts. Edit the existing draft instead.",
    ].find((message) => error?.message.includes(message));
    return { success: false, message: knownMessage ?? "The corrected version could not be created. Please try again." };
  }
  if (result.mockTest.superseded_by_mock_test_id) {
    return { success: false, message: "This is a previous version kept for student result history and cannot be restored." };
  }

  revalidateMockTestPages(mockTestId);
  revalidateMockTestPages(data);
  return {
    success: true,
    message: "The historical version was retained and an editable corrected draft was created.",
    replacementId: data,
  };
}

export async function permanentlyDeleteMockTest(mockTestId: string, confirmation: string): Promise<MockTestManagementResult> {
  const result = await getManagedMockTest(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to delete the Mock Test permanently." };

  const { error } = await result.supabase.rpc("permanently_delete_mock_test", {
    requested_mock_test_id: mockTestId,
    requested_confirmation: confirmation,
  });
  if (error) {
    const knownMessage = [
      "Type DELETE to confirm permanent deletion.",
      "Hide the Mock Test before deleting it permanently.",
    ].find((message) => error.message.includes(message));
    return { success: false, message: knownMessage ?? "The Mock Test could not be deleted permanently." };
  }

  revalidateMockTestPages(mockTestId);
  return { success: true, message: `“${result.mockTest.title}” and its complete attempt history were permanently deleted.` };
}

export type SyncMockTestTitlesResult = {
  success: boolean;
  message: string;
  updatedCount: number;
};

export async function syncAllMockTestTitles(): Promise<SyncMockTestTitlesResult> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return { success: false, message: "You must be logged in.", updatedCount: 0 };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to manage Mock Tests.", updatedCount: 0 };
  }

  const { data: mockTests, error: fetchError } = await supabase
    .from("mock_tests")
    .select("id, paper_id, subject_id, series_number, title");

  if (fetchError || !mockTests) {
    return { success: false, message: fetchError?.message ?? "Failed to fetch mock tests.", updatedCount: 0 };
  }

  const [papersRes, specializationsRes, examsRes, categoriesRes, statesRes, subjectsRes] = await Promise.all([
    supabase.from("papers").select("id, exam_group_id, specialization_id, name"),
    supabase.from("exam_specializations").select("id, name"),
    supabase.from("exam_groups").select("id, exam_id, name"),
    supabase.from("exams").select("id, state_id, name"),
    supabase.from("exam_states").select("id, code"),
    supabase.from("subjects").select("id, name"),
  ]);

  const paperMap = new Map((papersRes.data ?? []).map((p) => [p.id, p]));
  const specializationMap = new Map((specializationsRes.data ?? []).map((s) => [s.id, s]));
  const examMap = new Map((examsRes.data ?? []).map((e) => [e.id, e]));
  const categoryMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]));
  const stateMap = new Map((statesRes.data ?? []).map((s) => [s.id, s]));
  const subjectMap = new Map((subjectsRes.data ?? []).map((sb) => [sb.id, sb]));

  let updatedCount = 0;
  for (const test of mockTests) {
    const paper = paperMap.get(test.paper_id);
    const exam = paper ? examMap.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryMap.get(exam.exam_id) : undefined;
    const state = category ? stateMap.get(category.state_id) : undefined;
    const specialization = paper?.specialization_id ? specializationMap.get(paper.specialization_id) : undefined;
    const subject = test.subject_id ? subjectMap.get(test.subject_id) : undefined;

    if (state && exam && paper) {
      const canonicalTitle = buildMockTestTitle({
        stateCode: state.code,
        examName: exam.name,
        paperName: specialization?.name ?? paper.name,
        subjectName: subject?.name,
        seriesNumber: Number(test.series_number ?? 1),
      });

      if (test.title !== canonicalTitle) {
        const { error: updateError } = await supabase
          .from("mock_tests")
          .update({ title: canonicalTitle })
          .eq("id", test.id);

        if (!updateError) {
          updatedCount += 1;
        }
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  revalidatePath("/dashboard");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");

  return {
    success: true,
    message: updatedCount > 0
      ? `Successfully synchronized ${updatedCount} mock test title(s) to the canonical standard.`
      : "All mock test titles are already up to date with the canonical naming standard.",
    updatedCount,
  };
}
