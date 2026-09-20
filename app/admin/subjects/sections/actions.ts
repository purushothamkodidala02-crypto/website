"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG } from "@/lib/catalog-data";
import { createClient } from "@/lib/supabase/server";

export type SectionActionState = { success: boolean; message: string };

function sectionSlug(name: string, index: number, used: Set<string>) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `section-${index + 1}`;
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(slug);
  return slug;
}

export async function createSubjectSection(
  _previous: SectionActionState,
  formData: FormData,
): Promise<SectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to create sections." };
  }

  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const rawNames = String(formData.get("names") ?? "").trim();

  if (!subjectId) return { success: false, message: "Choose a subject." };
  if (!rawNames) return { success: false, message: "Enter at least one sub-section name (e.g. June, July)." };

  // Support comma-separated or newline-separated names
  const names = rawNames
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) return { success: false, message: "Enter valid sub-section names." };

  const { data: existing, error: existingError } = await supabase
    .from("subject_sections")
    .select("name, slug, display_order")
    .eq("subject_id", subjectId);

  if (existingError) return { success: false, message: existingError.message };

  const existingNames = new Set((existing ?? []).map((s) => s.name.trim().toLowerCase()));
  const usedSlugs = new Set((existing ?? []).map((s) => s.slug));
  const nextOrder =
    Math.max(0, ...(existing ?? []).map((s) => s.display_order)) + 1;

  const newSections = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (existingNames.has(name.toLowerCase())) {
      return {
        success: false,
        message: `Sub-section "${name}" already exists for this subject.`,
      };
    }
    existingNames.add(name.toLowerCase());
    newSections.push({
      subject_id: subjectId,
      name,
      slug: sectionSlug(name, i, usedSlugs),
      display_order: nextOrder + i,
      is_active: true,
    });
  }

  const { error: insertError } = await supabase
    .from("subject_sections")
    .insert(newSections);

  if (insertError) return { success: false, message: insertError.message };

  revalidatePath("/admin/subjects");
  revalidatePath(`/admin/subjects/${subjectId}/edit`);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");

  return {
    success: true,
    message: `${newSections.length} sub-section${newSections.length === 1 ? "" : "s"} added successfully.`,
  };
}

export async function deleteSubjectSection(
  sectionId: string,
  subjectId: string,
): Promise<SectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to delete sections." };
  }

  // Check if any mock tests are assigned to this section
  const { count, error: countError } = await supabase
    .from("mock_tests")
    .select("id", { count: "exact", head: true })
    .eq("subject_section_id", sectionId);

  if (countError) return { success: false, message: countError.message };
  if (count && count > 0) {
    return {
      success: false,
      message: `Cannot delete sub-section because ${count} mock test${count === 1 ? "" : "s"} are assigned to it. Reassign or delete the tests first.`,
    };
  }

  const { error: deleteError } = await supabase
    .from("subject_sections")
    .delete()
    .eq("id", sectionId);

  if (deleteError) return { success: false, message: deleteError.message };

  revalidatePath("/admin/subjects");
  revalidatePath(`/admin/subjects/${subjectId}/edit`);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");

  return { success: true, message: "Sub-section deleted successfully." };
}

export async function quickCreateSubjectSection(
  subjectId: string,
  name: string,
): Promise<{
  success: boolean;
  message: string;
  section?: { id: string; subjectId: string; name: string; slug: string };
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to create sections." };
  }

  const trimmedName = name.trim();
  if (!subjectId) return { success: false, message: "Choose a subject." };
  if (!trimmedName) return { success: false, message: "Enter a sub-section name." };

  const { data: existing, error: existingError } = await supabase
    .from("subject_sections")
    .select("id, subject_id, name, slug, display_order")
    .eq("subject_id", subjectId);

  if (existingError) return { success: false, message: existingError.message };

  const match = (existing ?? []).find(
    (s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
  if (match) {
    return {
      success: true,
      message: `Sub-section "${match.name}" already exists and was selected.`,
      section: {
        id: match.id,
        subjectId: match.subject_id,
        name: match.name,
        slug: match.slug,
      },
    };
  }

  const usedSlugs = new Set((existing ?? []).map((s) => s.slug));
  const nextOrder =
    Math.max(0, ...(existing ?? []).map((s) => s.display_order)) + 1;
  const slug = sectionSlug(trimmedName, 0, usedSlugs);

  const { data: inserted, error: insertError } = await supabase
    .from("subject_sections")
    .insert({
      subject_id: subjectId,
      name: trimmedName,
      slug,
      display_order: nextOrder,
      is_active: true,
    })
    .select("id, subject_id, name, slug")
    .single();

  if (insertError) return { success: false, message: insertError.message };

  revalidatePath("/admin/subjects");
  revalidatePath(`/admin/subjects/${subjectId}/edit`);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");

  return {
    success: true,
    message: `Sub-section "${inserted.name}" added.`,
    section: {
      id: inserted.id,
      subjectId: inserted.subject_id,
      name: inserted.name,
      slug: inserted.slug,
    },
  };
}

export async function updateSubjectSection(
  sectionId: string,
  subjectId: string,
  name: string,
): Promise<SectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to update sections." };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { success: false, message: "Sub-section name cannot be empty." };

  const { data: existing, error: existingError } = await supabase
    .from("subject_sections")
    .select("id, name")
    .eq("subject_id", subjectId);

  if (existingError) return { success: false, message: existingError.message };

  if (
    (existing ?? []).some(
      (s) => s.id !== sectionId && s.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
  ) {
    return {
      success: false,
      message: `Another sub-section named "${trimmedName}" already exists.`,
    };
  }

  const { error: updateError } = await supabase
    .from("subject_sections")
    .update({ name: trimmedName })
    .eq("id", sectionId);

  if (updateError) return { success: false, message: updateError.message };

  revalidatePath("/admin/subjects");
  revalidatePath(`/admin/subjects/${subjectId}/edit`);
  revalidatePath("/admin/mock-tests");
  revalidatePath("/mock-tests");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");

  return { success: true, message: "Sub-section updated successfully." };
}

