"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG } from "@/lib/catalog-data";
import { readSeoFields } from "@/lib/seo-fields";
import { createClient } from "@/lib/supabase/server";

export type FaqActionState = { success: boolean; message: string };
export type ExamPageContentActionState = { success: boolean; message: string };
export type PrimaryPageActionState = { success: boolean; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Please sign in again." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { supabase, error: "Administrator access is required." };
  return { supabase, error: null };
}

function readFaq(formData: FormData) {
  const examGroupId = String(formData.get("exam_group_id") ?? "").trim();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const displayOrder = Number(formData.get("display_order") ?? 0);
  if (!/^[0-9a-f-]{36}$/i.test(examGroupId)) return { error: "Choose an exam first." } as const;
  if (question.length < 5 || question.length > 300) return { error: "Question must be 5 to 300 characters." } as const;
  if (answer.length < 10 || answer.length > 3000) return { error: "Answer must be 10 to 3,000 characters." } as const;
  if (!Number.isInteger(displayOrder) || displayOrder < 0) return { error: "Display order must be zero or a positive whole number." } as const;
  return { examGroupId, question, answer, displayOrder } as const;
}

function refresh() {
  revalidatePath("/admin/exam-pages");
  revalidatePath("/mock-tests", "layout");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");
}

export async function updateExamPageContent(
  _previous: ExamPageContentActionState,
  formData: FormData,
): Promise<ExamPageContentActionState> {
  const examGroupId = String(formData.get("exam_group_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(examGroupId)) return { success: false, message: "Choose an exam first." };
  if (description.length > 3000) return { success: false, message: "Student introduction must be 3,000 characters or fewer." };
  const seo = readSeoFields(formData);
  if (seo.error) return { success: false, message: seo.error };
  const { supabase, error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const { error: updateError } = await supabase
    .from("exam_groups")
    .update({ description: description || null, ...seo.value })
    .eq("id", examGroupId);
  if (updateError) return { success: false, message: updateError.message };
  refresh();
  return { success: true, message: "Public exam page content updated." };
}

export async function createExamPageFaq(_previous: FaqActionState, formData: FormData): Promise<FaqActionState> {
  const values = readFaq(formData);
  if (typeof values.error === "string") return { success: false, message: values.error };
  const { supabase, error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const { error: insertError } = await supabase.from("exam_page_faqs").insert({ exam_group_id: values.examGroupId, question: values.question, answer: values.answer, display_order: values.displayOrder });
  if (insertError) return { success: false, message: insertError.message };
  refresh();
  return { success: true, message: "Question added to this exam page." };
}

export async function updateExamPageFaq(_previous: FaqActionState, formData: FormData): Promise<FaqActionState> {
  const faqId = String(formData.get("faq_id") ?? "").trim();
  const values = readFaq(formData);
  if (!/^[0-9a-f-]{36}$/i.test(faqId)) return { success: false, message: "That question could not be found." };
  if (typeof values.error === "string") return { success: false, message: values.error };
  const { supabase, error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const { error: updateError } = await supabase.from("exam_page_faqs").update({ question: values.question, answer: values.answer, display_order: values.displayOrder }).eq("id", faqId).eq("exam_group_id", values.examGroupId);
  if (updateError) return { success: false, message: updateError.message };
  refresh();
  return { success: true, message: "Question updated." };
}

export async function deleteExamPageFaq(formData: FormData) {
  const faqId = String(formData.get("faq_id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(faqId)) return;
  const { supabase, error } = await requireAdmin();
  if (error) return;
  await supabase.from("exam_page_faqs").delete().eq("id", faqId);
  refresh();
}

function readPrimaryPage(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const teluguTitle = String(formData.get("telugu_title") ?? "").trim();
  const state = String(formData.get("state") ?? "Andhra Pradesh").trim();
  const status = String(formData.get("status") ?? "live").trim() === "upcoming" ? "upcoming" : "live";
  const statusCode = String(formData.get("status_code") ?? (status === "live" ? "200 OK" : "Upcoming Pipeline")).trim();
  const vacancies = String(formData.get("vacancies") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const publishedDate = String(formData.get("published_date") ?? "").trim() || "15 Nov 2026";
  const lastUpdated = String(formData.get("last_updated") ?? "").trim() || "15 Nov 2026";
  const highlightsRaw = String(formData.get("highlights") ?? "").trim();
  const highlights = highlightsRaw
    ? highlightsRaw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const displayOrder = Number(formData.get("display_order") ?? 0);

  if (!url || (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/"))) {
    return { error: "Please enter a valid URL (e.g. https://varadhiprep.in/news/... or /news/...)." } as const;
  }
  if (title.length < 3 || title.length > 300) {
    return { error: "Title must be between 3 and 300 characters." } as const;
  }

  return {
    url,
    title,
    teluguTitle,
    state,
    status,
    statusCode,
    vacancies,
    description,
    publishedDate,
    lastUpdated,
    highlights,
    displayOrder: Number.isInteger(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
  } as const;
}

export async function createPrimaryExamPage(
  _previous: PrimaryPageActionState,
  formData: FormData,
): Promise<PrimaryPageActionState> {
  const values = readPrimaryPage(formData);
  if ("error" in values && typeof values.error === "string") {
    return { success: false, message: values.error };
  }
  const { supabase, error } = await requireAdmin();
  if (error) return { success: false, message: error };

  const { error: insertError } = await supabase
    .from("primary_exam_pages")
    .upsert(
      {
        url: values.url,
        title: values.title,
        telugu_title: values.teluguTitle,
        state: values.state,
        status: values.status,
        status_code: values.statusCode,
        vacancies: values.vacancies,
        description: values.description,
        published_date: values.publishedDate,
        last_updated: values.lastUpdated,
        highlights: values.highlights,
        display_order: values.displayOrder,
      },
      { onConflict: "url" },
    );

  if (insertError) return { success: false, message: insertError.message };
  refresh();
  return { success: true, message: `Notification link "${values.title}" uploaded successfully!` };
}

export async function deletePrimaryExamPage(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const { supabase, error } = await requireAdmin();
  if (error) return;

  if (/^[0-9a-f-]{36}$/i.test(id)) {
    await supabase.from("primary_exam_pages").delete().eq("id", id);
  } else if (url) {
    await supabase.from("primary_exam_pages").delete().eq("url", url);
  }
  refresh();
}
