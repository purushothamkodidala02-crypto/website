import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUploadFile } from "@/lib/questions/media";

export const MOCK_TEST_PDF_BUCKET = "mock-test-pdfs";
export const MAX_MOCK_TEST_PDF_BYTES = 20_000_000;

export function isPdfFile(file: { type?: string; name?: string }): boolean {
  const type = (file.type || "").toLowerCase().trim();
  if (type === "application/pdf") return true;
  const name = (file.name || "").toLowerCase().trim();
  return /\.pdf$/i.test(name);
}

export function normalizeMockTestPdfUrl(value: unknown) {
  const candidate = String(value ?? "").trim();
  if (!candidate) return { url: null as string | null, error: null as string | null };

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return { url: candidate, error: null };
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      return { url: null, error: "PDF URL must use a public HTTPS URL or a site path starting with /." };
    }
    return { url: parsed.toString(), error: null };
  } catch {
    return { url: null, error: "PDF URL is not valid." };
  }
}

export async function uploadMockTestPdf(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  if (!isPdfFile(file)) {
    return { url: null, path: null, error: "Please upload a valid PDF (.pdf) file." };
  }
  if (file.size > MAX_MOCK_TEST_PDF_BYTES) {
    return { url: null, path: null, error: "PDF files must be 20 MB or smaller." };
  }

  const path = `${userId}/${randomUUID()}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(MOCK_TEST_PDF_BUCKET).upload(path, bytes, {
    cacheControl: "31536000",
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("bucket") && message.includes("not found")) {
      return {
        url: null,
        path: null,
        error: "Mock test PDF storage is not configured yet. Apply the mock-test-pdfs Supabase migration, then try again.",
      };
    }
    if (message.includes("row-level security") || message.includes("unauthorized")) {
      return {
        url: null,
        path: null,
        error: "Your secure Admin verification has expired. Refresh the page, complete Admin verification, and upload again.",
      };
    }
    return { url: null, path: null, error: `PDF upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from(MOCK_TEST_PDF_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, error: null };
}

export function mockTestPdfPath(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${MOCK_TEST_PDF_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function removeMockTestPdf(supabase: SupabaseClient, path: string | null) {
  if (!path) return;
  await supabase.storage.from(MOCK_TEST_PDF_BUCKET).remove([path]);
}

export async function resolveMockTestPdfInput(
  supabase: SupabaseClient,
  userId: string,
  formData: FormData,
  existingUrl?: string | null,
): Promise<{
  pdfUrl: string | null;
  uploadedPath: string | null;
  oldPathToRemove: string | null;
  error: string | null;
}> {
  const fileEntry = formData.get("pdf_file");
  const removeRequested = String(formData.get("remove_pdf") ?? "") === "1";

  if (isUploadFile(fileEntry)) {
    const uploaded = await uploadMockTestPdf(supabase, userId, fileEntry);
    if (uploaded.error || !uploaded.url) {
      return {
        pdfUrl: null,
        uploadedPath: null,
        oldPathToRemove: null,
        error: uploaded.error ?? "PDF upload failed.",
      };
    }
    return {
      pdfUrl: uploaded.url,
      uploadedPath: uploaded.path,
      oldPathToRemove: mockTestPdfPath(existingUrl),
      error: null,
    };
  }

  if (removeRequested) {
    return {
      pdfUrl: null,
      uploadedPath: null,
      oldPathToRemove: mockTestPdfPath(existingUrl),
      error: null,
    };
  }

  const normalized = normalizeMockTestPdfUrl(formData.get("pdf_url"));
  if (normalized.error) {
    return {
      pdfUrl: null,
      uploadedPath: null,
      oldPathToRemove: null,
      error: normalized.error,
    };
  }

  const oldPath =
    existingUrl && normalized.url !== existingUrl ? mockTestPdfPath(existingUrl) : null;

  return {
    pdfUrl: normalized.url,
    uploadedPath: null,
    oldPathToRemove: oldPath,
    error: null,
  };
}
