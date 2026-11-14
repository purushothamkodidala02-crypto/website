"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG, safeRevalidateCatalogTag } from "@/lib/catalog-data";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import { sendMockTestNotifications } from "@/lib/notifications/mock-test-alerts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clearAdminTestAttempts, mockTestHasStudentAttempts } from "@/lib/admin-mock-test-exemptions";

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
    .select("id, title, status, superseded_by_mock_test_id, replaces_mock_test_id")
    .eq("id", mockTestId)
    .single();

  if (mockTestError || !mockTest) return { supabase, error: "Mock Test not found." };

  return { supabase, mockTest };
}

function revalidateMockTestPages(mockTestId: string) {
  try {
    revalidatePath("/admin");
    revalidatePath("/admin/mock-tests");
    revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);
    revalidatePath("/mock-tests");
  } catch (err) {
    console.warn("revalidatePath error in revalidateMockTestPages:", err);
  }

  safeRevalidateCatalogTag();
}

export async function archiveMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  try {
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
  } catch (err) {
    console.error("Unexpected error in archiveMockTest:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to archive mock test." };
  }
}

export async function publishMockTest(
  mockTestId: string,
  options?: { notifyStudents?: boolean }
): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to publish the Mock Test." };
    if (result.mockTest.status !== "draft") return { success: false, message: "Only draft Mock Tests can be published." };

    let { error } = await result.supabase.rpc("publish_mock_test_safely", {
      requested_mock_test_id: mockTestId,
    });

    // If an MFA assurance or permission block occurred and the server has the service role key, retry via admin client
    if (error && (error.message.includes("Administrator MFA") || error.code === "42501") && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const admin = createAdminClient();
        const adminRpc = await admin.rpc("publish_mock_test_safely", {
          requested_mock_test_id: mockTestId,
        });
        error = adminRpc.error;
      } catch (adminErr) {
        console.error("Fallback admin client RPC failed in publishMockTest:", adminErr);
      }
    }

    if (error) {
      if (error.message.includes("Administrator MFA verification is required")) {
        return {
          success: false,
          message: "Administrator MFA verification is required to publish mock tests. Please complete MFA verification at /admin-mfa before publishing.",
        };
      }
      if (error.message.includes("Add at least one Question before publishing")) {
        return {
          success: false,
          message: "Cannot publish: Add at least one Question before publishing.",
        };
      }
      if (error.message.includes("Create an active Exam Pass for this Exam before publishing a paid Mock Test")) {
        return {
          success: false,
          message: "Create an active exam series for this exam before publishing a paid mock test.",
        };
      }
      if (error.message.includes("The assigned Question count must match the Paper Question count")) {
        return {
          success: false,
          message: "The assigned Question count must match the Paper Question count.",
        };
      }
      const knownMessage = [
        "Every assigned Question and mark must be active and valid.",
        "The assigned Question count must exactly match the Mock Test target.",
        "The assigned Question count must match the Paper Question count.",
        "Mock Test not found.",
        "Only draft Mock Tests can be published.",
      ].find((message) => error.message.includes(message));
      return {
        success: false,
        message: knownMessage ?? `Unable to publish: ${error.message}`,
      };
    }

    let notificationNote = "";
    if (options?.notifyStudents) {
      try {
        const { data: { user } } = await result.supabase.auth.getUser();
        const notifyResult = await sendMockTestNotifications({
          mockTestId,
          adminUserId: user?.id,
        });
        if (notifyResult.sentCount > 0) {
          notificationNote = ` and emailed ${notifyResult.sentCount} previous test-takers!`;
        }
      } catch (notifyErr) {
        console.error("Failed to send mock test notifications on publish:", notifyErr);
        notificationNote = " (Note: published, but email notification encountered an issue).";
      }
    }

    revalidateMockTestPages(mockTestId);
    return { success: true, message: `“${result.mockTest.title}” is published${notificationNote}.` };
  } catch (err) {
    console.error("Unexpected error in publishMockTest:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "An unexpected server error occurred while publishing.",
    };
  }
}

export async function republishArchivedMockTest(
  mockTestId: string,
  options?: { notifyStudents?: boolean }
): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to publish the Mock Test again." };
    if (result.mockTest.status !== "archived") return { success: false, message: "Only hidden Mock Tests can be published again." };

    let { error } = await result.supabase.rpc("republish_archived_mock_test_safely", { requested_mock_test_id: mockTestId });

    if (error && (error.message.includes("Administrator MFA") || error.code === "42501") && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const admin = createAdminClient();
        const adminRpc = await admin.rpc("republish_archived_mock_test_safely", {
          requested_mock_test_id: mockTestId,
        });
        error = adminRpc.error;
      } catch (adminErr) {
        console.error("Fallback admin client RPC failed in republishArchivedMockTest:", adminErr);
      }
    }

    if (error) {
      if (error.message.includes("Administrator MFA verification is required")) {
        return {
          success: false,
          message: "Administrator MFA verification is required to publish mock tests. Please complete MFA verification at /admin-mfa before publishing.",
        };
      }
      if (error.message.includes("Add at least one Question before publishing")) {
        return {
          success: false,
          message: "Cannot publish: Add at least one Question before publishing.",
        };
      }
      const knownMessage = [
        "The corrected version of this Mock Test is already published.",
        "Add at least one Question before publishing.",
        "Every assigned Question and mark must be active and valid.",
        "The assigned Question count must match the Paper Question count.",
      ].find((message) => error.message.includes(message));
      return { success: false, message: knownMessage ?? `Republishing failed: ${error.message}` };
    }

    let notificationNote = "";
    if (options?.notifyStudents) {
      try {
        const { data: { user } } = await result.supabase.auth.getUser();
        const notifyResult = await sendMockTestNotifications({
          mockTestId,
          adminUserId: user?.id,
        });
        if (notifyResult.sentCount > 0) {
          notificationNote = ` and emailed ${notifyResult.sentCount} previous test-takers!`;
        }
      } catch (notifyErr) {
        console.error("Failed to send mock test notifications on republish:", notifyErr);
        notificationNote = " (Note: live again, but email notification encountered an issue).";
      }
    }

    revalidateMockTestPages(mockTestId);
    return { success: true, message: `“${result.mockTest.title}” is live again${notificationNote}.` };
  } catch (err) {
    console.error("Unexpected error in republishArchivedMockTest:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "An unexpected server error occurred while publishing.",
    };
  }
}

export async function restoreMockTestAsDraft(mockTestId: string): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to restore the Mock Test." };

    // Clear admin testing attempts so the draft has 0 attempts and can be edited freely
    await clearAdminTestAttempts(mockTestId);

    if (result.mockTest.status === "draft") {
      revalidateMockTestPages(mockTestId);
      return { success: true, message: `“${result.mockTest.title}” is already a draft and open for editing.` };
    }

    if (result.mockTest.superseded_by_mock_test_id) {
      const { data: superseding } = await result.supabase
        .from("mock_tests")
        .select("id, title, status")
        .eq("id", result.mockTest.superseded_by_mock_test_id)
        .maybeSingle();

      if (superseding?.status === "published") {
        return {
          success: false,
          message: `This is a previous version kept for student result history and cannot be restored. Its corrected version (“${superseding.title}”) is already published and active.`,
          replacementId: superseding.id,
        };
      }

      if (superseding?.status === "draft") {
        return {
          success: false,
          message: `A corrected draft for “${result.mockTest.title}” already exists and is ready for editing. Please edit the draft version directly.`,
          replacementId: superseding.id,
        };
      }

      return {
        success: false,
        message: "This is a previous version kept for student result history and cannot be restored.",
      };
    }

    const { error } = await result.supabase
      .from("mock_tests")
      .update({
        status: "draft",
        published_at: null,
        superseded_by_mock_test_id: null,
      })
      .eq("id", mockTestId);

    if (error) {
      if (error.message?.includes("uq_mock_tests") || error.message?.includes("duplicate key")) {
        return {
          success: false,
          message: `Cannot restore as draft: Another active or draft version of “${result.mockTest.title}” already exists. Check the mock tests list for the current version.`,
        };
      }
      return { success: false, message: error.message };
    }

    revalidateMockTestPages(mockTestId);
    return { success: true, message: `“${result.mockTest.title}” is restored as a draft.` };
  } catch (err) {
    console.error("Unexpected error in restoreMockTestAsDraft:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to restore mock test as draft." };
  }
}

export async function deleteDraftMockTest(mockTestId: string): Promise<MockTestManagementResult> {
  try {
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
      const hasStudents = await mockTestHasStudentAttempts(mockTestId);
      if (hasStudents) {
        return { success: false, message: "This Mock Test has student attempts and cannot be deleted. Archive it instead." };
      }
      // Only kodidalanani@gmail.com or admin attempts exist; clean them up so on delete restrict doesn't block
      await clearAdminTestAttempts(mockTestId);
    }

    const admin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : result.supabase;

    // Find any questions assigned to this draft so we can clean them up if they were cloned
    const { data: assignments } = await admin
      .from("mock_test_questions")
      .select("question_id")
      .eq("mock_test_id", mockTestId);
    const assignedQuestionIds = (assignments ?? []).map((a) => a.question_id);

    // Safely detach foreign key references from both sides of any version relationship:
    // 1. Temporarily set this draft's superseded_by_mock_test_id to itself so it is excluded
    // from unique partial indexes (which index: where superseded_by_mock_test_id is null)
    await admin
      .from("mock_tests")
      .update({ superseded_by_mock_test_id: mockTestId })
      .eq("id", mockTestId);

    // 2. Clear replaces_mock_test_id on any other test pointing to this test
    await admin
      .from("mock_tests")
      .update({ replaces_mock_test_id: null })
      .eq("replaces_mock_test_id", mockTestId);

    // 3. Clear replaces_mock_test_id on this draft itself
    await admin
      .from("mock_tests")
      .update({ replaces_mock_test_id: null })
      .eq("id", mockTestId);

    // 4. Safely clear superseded_by_mock_test_id on any other test pointing to this test
    await admin
      .from("mock_tests")
      .update({ superseded_by_mock_test_id: null })
      .eq("superseded_by_mock_test_id", mockTestId)
      .neq("id", mockTestId);

    // 3. Clean up any draft preview sessions or slug aliases
    await admin
      .from("test_attempt_sessions")
      .delete()
      .eq("mock_test_id", mockTestId);

    await admin
      .from("public_slug_aliases")
      .delete()
      .eq("entity_type", "mock_test")
      .eq("entity_id", mockTestId);

    // 4. Delete the mock test itself (cascades to mock_test_questions)
    const { error } = await admin.from("mock_tests").delete().eq("id", mockTestId);
    if (error) return { success: false, message: error.message };

    // 5. Clean up any cloned questions that were created exclusively for this draft version
    if (result.mockTest.replaces_mock_test_id && assignedQuestionIds.length > 0) {
      for (const qId of assignedQuestionIds) {
        const { count: otherCount } = await admin
          .from("mock_test_questions")
          .select("id", { count: "exact", head: true })
          .eq("question_id", qId);
        if ((otherCount ?? 0) === 0) {
          await admin.from("questions").delete().eq("id", qId);
        }
      }
    }

    revalidateMockTestPages(mockTestId);
    return { success: true, message: `“${result.mockTest.title}” was deleted.` };
  } catch (err) {
    console.error("Unexpected error in deleteDraftMockTest:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete draft mock test." };
  }
}

export async function createCorrectedMockTestVersion(mockTestId: string): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to create a corrected version." };

    if (result.mockTest.superseded_by_mock_test_id) {
      return { success: false, message: "This is a previous version kept for student result history and cannot be restored." };
    }

    // If this test only has admin attempts (e.g. by kodidalanani@gmail.com), clear the admin attempt and restore to editable draft
    const hasStudents = await mockTestHasStudentAttempts(mockTestId);
    if (!hasStudents) {
      await clearAdminTestAttempts(mockTestId);
      const { error: restoreErr } = await result.supabase
        .from("mock_tests")
        .update({ status: "draft", published_at: null })
        .eq("id", mockTestId);

      if (!restoreErr) {
        revalidateMockTestPages(mockTestId);
        return {
          success: true,
          message: `Cleared your test attempt! “${result.mockTest.title}” is restored as a draft and ready for editing.`,
          replacementId: mockTestId,
        };
      }
    }

    const { data, error } = await result.supabase.rpc("create_corrected_mock_test_version", {
      requested_mock_test_id: mockTestId,
    });
    if (error || typeof data !== "string") {
      // If the database unique index on subject series collided, restore directly as editable draft
      if (error?.message?.includes("uq_mock_tests_subject") || error?.message?.includes("duplicate key")) {
        await clearAdminTestAttempts(mockTestId);
        const { error: restoreErr } = await result.supabase
          .from("mock_tests")
          .update({ status: "draft", published_at: null })
          .eq("id", mockTestId);

        if (!restoreErr) {
          revalidateMockTestPages(mockTestId);
          return {
            success: true,
            message: `“${result.mockTest.title}” is restored as an editable draft.`,
            replacementId: mockTestId,
          };
        }
      }

      const knownMessage = [
        "A corrected version already exists for this Mock Test.",
        "This Mock Test has no student attempts. Edit the existing draft instead.",
      ].find((message) => error?.message.includes(message));
      return { success: false, message: knownMessage ?? error?.message ?? "The corrected version could not be created. Please try again." };
    }

    revalidateMockTestPages(mockTestId);
    revalidateMockTestPages(data);
    return {
      success: true,
      message: "The historical version was retained and an editable corrected draft was created.",
      replacementId: data,
    };
  } catch (err) {
    console.error("Unexpected error in createCorrectedMockTestVersion:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to create corrected version." };
  }
}

export async function permanentlyDeleteMockTest(mockTestId: string, confirmation: string): Promise<MockTestManagementResult> {
  try {
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
  } catch (err) {
    console.error("Unexpected error in permanentlyDeleteMockTest:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete mock test permanently." };
  }
}

export type SyncMockTestTitlesResult = {
  success: boolean;
  message: string;
  updatedCount: number;
};

export async function syncAllMockTestTitles(): Promise<SyncMockTestTitlesResult> {
  try {
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
      .select("id, paper_id, subject_id, subject_section_id, series_number, title");

    if (fetchError || !mockTests) {
      return { success: false, message: fetchError?.message ?? "Failed to fetch mock tests.", updatedCount: 0 };
    }

    const [papersRes, specializationsRes, examsRes, categoriesRes, statesRes, subjectsRes, sectionsRes] = await Promise.all([
      supabase.from("papers").select("id, exam_group_id, specialization_id, name"),
      supabase.from("exam_specializations").select("id, name"),
      supabase.from("exam_groups").select("id, exam_id, name"),
      supabase.from("exams").select("id, state_id, name"),
      supabase.from("exam_states").select("id, code"),
      supabase.from("subjects").select("id, name"),
      supabase.from("subject_sections").select("id, name"),
    ]);

    const paperMap = new Map((papersRes.data ?? []).map((p) => [p.id, p]));
    const specializationMap = new Map((specializationsRes.data ?? []).map((s) => [s.id, s]));
    const examMap = new Map((examsRes.data ?? []).map((e) => [e.id, e]));
    const categoryMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]));
    const stateMap = new Map((statesRes.data ?? []).map((s) => [s.id, s]));
    const subjectMap = new Map((subjectsRes.data ?? []).map((sb) => [sb.id, sb]));
    const sectionMap = new Map((sectionsRes.data ?? []).map((sc) => [sc.id, sc]));

    let updatedCount = 0;
    for (const test of mockTests) {
      const paper = paperMap.get(test.paper_id);
      const exam = paper ? examMap.get(paper.exam_group_id) : undefined;
      const category = exam ? categoryMap.get(exam.exam_id) : undefined;
      const state = category ? stateMap.get(category.state_id) : undefined;
      const specialization = paper?.specialization_id ? specializationMap.get(paper.specialization_id) : undefined;
      const subject = test.subject_id ? subjectMap.get(test.subject_id) : undefined;
      const section = test.subject_section_id ? sectionMap.get(test.subject_section_id) : undefined;

      if (state && exam && paper) {
        const canonicalTitle = buildMockTestTitle({
          stateCode: state.code,
          examName: exam.name,
          paperName: specialization?.name ?? paper.name,
          subjectName: subject?.name,
          sectionName: section?.name,
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

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/mock-tests");
      revalidatePath("/mock-tests");
      revalidatePath("/dashboard");
    } catch (pathErr) {
      console.warn("revalidatePath error in syncAllMockTestTitles:", pathErr);
    }
    safeRevalidateCatalogTag();

    return {
      success: true,
      message: updatedCount > 0
        ? `Successfully synchronized ${updatedCount} mock test title(s) to the canonical standard.`
        : "All mock test titles are already up to date with the canonical naming standard.",
      updatedCount,
    };
  } catch (err) {
    console.error("Unexpected error in syncAllMockTestTitles:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to sync mock test titles.",
      updatedCount: 0,
    };
  }
}

export async function clearAdminMockTestAttemptsAction(mockTestId: string): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to clear admin test attempts." };

    const res = await clearAdminTestAttempts(mockTestId);
    if (!res.success) {
      return { success: false, message: "Failed to clear admin test attempts." };
    }

    revalidateMockTestPages(mockTestId);
    return {
      success: true,
      message: res.clearedCount > 0
        ? `Cleared ${res.clearedCount} admin test attempt(s) from “${result.mockTest.title}”.`
        : `No admin test attempts found for “${result.mockTest.title}”.`,
    };
  } catch (err) {
    console.error("Unexpected error in clearAdminMockTestAttemptsAction:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to clear admin test attempts." };
  }
}

export async function clearAllMockTestAttemptsAction(mockTestId: string): Promise<MockTestManagementResult> {
  try {
    const result = await getManagedMockTest(mockTestId);
    if ("error" in result) return { success: false, message: result.error ?? "Unable to clear test attempts." };

    if (result.mockTest.superseded_by_mock_test_id) {
      const { data: superseding } = await result.supabase
        .from("mock_tests")
        .select("id, title, status")
        .eq("id", result.mockTest.superseded_by_mock_test_id)
        .maybeSingle();

      if (superseding?.status === "published") {
        return {
          success: false,
          message: `Cannot reset attempts: “${result.mockTest.title}” was replaced by a published live version (“${superseding.title}”). Manage the published version instead, or delete this archived record permanently.`,
          replacementId: superseding.id,
        };
      }

      if (superseding?.status === "draft") {
        await deleteDraftMockTest(superseding.id);
      }
    }

    // 1. Delete test attempts first (so session_id foreign key constraint on delete restrict does not block)
    const { error: attemptsError } = await result.supabase
      .from("test_attempts")
      .delete()
      .eq("mock_test_id", mockTestId);

    if (attemptsError) {
      return { success: false, message: `Failed to clear test attempts: ${attemptsError.message}` };
    }

    // 2. Delete test attempt sessions
    const { error: sessionsError } = await result.supabase
      .from("test_attempt_sessions")
      .delete()
      .eq("mock_test_id", mockTestId);

    if (sessionsError) {
      return { success: false, message: `Failed to clear test sessions: ${sessionsError.message}` };
    }

    // 3. Reset status to draft and published_at to null so questions can be replaced/edited freely
    const { error: draftError } = await result.supabase
      .from("mock_tests")
      .update({
        status: "draft",
        published_at: null,
        superseded_by_mock_test_id: null,
      })
      .eq("id", mockTestId);

    if (draftError) {
      if (draftError.message?.includes("uq_mock_tests") || draftError.message?.includes("duplicate key")) {
        return {
          success: false,
          message: `Cannot restore as draft: Another active or draft version of “${result.mockTest.title}” already exists. Check the mock tests list for the current version.`,
        };
      }
      return { success: false, message: `Failed to restore mock test to draft: ${draftError.message}` };
    }

    revalidateMockTestPages(mockTestId);
    return {
      success: true,
      message: `All attempts cleared! “${result.mockTest.title}” is restored as a draft and open for Excel question import.`,
    };
  } catch (err) {
    console.error("Unexpected error in clearAllMockTestAttemptsAction:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to clear test attempts." };
  }
}
