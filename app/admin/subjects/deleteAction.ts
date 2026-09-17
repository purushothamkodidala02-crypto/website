"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteSubjectResult = {
  success: boolean;
  message: string;
};

export async function deleteSubject(
  subjectId: string
): Promise<DeleteSubjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      success: false,
      message: "You are not authorized to delete Subjects.",
    };
  }

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    return {
      success: false,
      message: "Subject not found.",
    };
  }

  const {
    count: mockTestCount,
    error: mockTestCountError,
  } = await supabase
    .from("mock_tests")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("subject_id", subjectId);

  if (mockTestCountError) {
    return {
      success: false,
      message: "Unable to check the Subject’s related Mock Tests.",
    };
  }

  if ((mockTestCount ?? 0) > 0) {
    return {
      success: false,
      message: `Cannot delete "${subject.name}" because it contains ${mockTestCount} Mock Test(s). Deactivate it instead.`,
    };
  }

  const { count: questionCount, error: questionCountError } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("subject_id", subjectId);

  if (questionCountError) {
    return { success: false, message: "Unable to check the Subject’s Questions." };
  }

  if ((questionCount ?? 0) > 0) {
    return { success: false, message: `Cannot delete "${subject.name}" because it contains ${questionCount} Question(s). Deactivate it instead.` };
  }

  const { error: deleteError } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);

  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
    };
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/admin/exams");

  return {
    success: true,
    message: `"${subject.name}" was deleted successfully.`,
  };
}

export type BulkSubjectResult = {
  success: boolean;
  successCount: number;
  failureCount: number;
  message: string;
};

export async function bulkDeleteSubjects(
  subjectIds: string[]
): Promise<BulkSubjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      successCount: 0,
      failureCount: subjectIds.length,
      message: "You must be logged in.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      success: false,
      successCount: 0,
      failureCount: subjectIds.length,
      message: "You are not authorized to delete Subjects.",
    };
  }

  if (!subjectIds || subjectIds.length === 0) {
    return {
      success: false,
      successCount: 0,
      failureCount: 0,
      message: "No subjects selected.",
    };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const subjectId of subjectIds) {
    const { count: mockTestCount } = await supabase
      .from("mock_tests")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", subjectId);

    if ((mockTestCount ?? 0) > 0) {
      failureCount++;
      continue;
    }

    const { count: questionCount } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", subjectId);

    if ((questionCount ?? 0) > 0) {
      failureCount++;
      continue;
    }

    const { error: deleteError } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (deleteError) {
      failureCount++;
    } else {
      successCount++;
    }
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/admin/exams");

  if (failureCount === 0) {
    return {
      success: true,
      successCount,
      failureCount: 0,
      message: `Successfully deleted ${successCount} subject${successCount === 1 ? "" : "s"}.`,
    };
  } else if (successCount === 0) {
    return {
      success: false,
      successCount: 0,
      failureCount,
      message: `Could not delete ${failureCount} subject${failureCount === 1 ? "" : "s"}. Subjects containing mock tests or questions cannot be deleted.`,
    };
  } else {
    return {
      success: true,
      successCount,
      failureCount,
      message: `Deleted ${successCount} subject${successCount === 1 ? "" : "s"}. ${failureCount} subject${failureCount === 1 ? "" : "s"} could not be deleted because they contain questions or mock tests.`,
    };
  }
}
