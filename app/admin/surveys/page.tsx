"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createAdminSurvey,
  updateAdminSurvey,
  deleteAdminSurvey,
  toggleSurveyStatus,
  getAdminSurveysWithCounts,
} from "@/app/actions/surveys-admin";
import { useRouter } from "next/navigation";
import { ApEndowmentFeedbackSection } from "@/components/admin/ApEndowmentFeedbackSection";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type SurveyItem = {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  response_count?: number;
};

export default function AdminSurveysList() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Survey State
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  const fetchSurveysSafely = useCallback(async (): Promise<SurveyItem[]> => {
    // Strategy 1: Server action getAdminSurveysWithCounts
    try {
      const data = await getAdminSurveysWithCounts();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn("Server action getAdminSurveysWithCounts failed, falling back:", err);
    }

    // Strategy 2: Dedicated HTTP GET API route
    try {
      const res = await fetch("/api/admin/surveys", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.surveys && json.surveys.length > 0) {
          return json.surveys;
        }
      }
    } catch (err) {
      console.warn("API /api/admin/surveys failed:", err);
    }

    // Strategy 3: Direct browser Supabase client
    try {
      const supabase = createBrowserClient();
      const { data: clientSurveys, error } = await supabase
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at")
        .order("created_at", { ascending: false });
      if (!error && clientSurveys && clientSurveys.length > 0) {
        return clientSurveys.map((s) => ({ ...s, response_count: 0 }));
      }
    } catch (err) {
      console.warn("Browser Supabase fallback failed:", err);
    }

    return [];
  }, []);

  const refreshSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSurveysSafely();
      setSurveys(data);
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to load surveys. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchSurveysSafely]);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
    void (async () => {
      try {
        const data = await fetchSurveysSafely();
        if (!ignore) {
          setSurveys(data);
          setErrorMsg("");
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setErrorMsg("Failed to load surveys. Please try again.");
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchSurveysSafely]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    setErrorMsg("");
    const res = await createAdminSurvey(newTitle.trim(), newDescription.trim());
    setIsCreating(false);
    if (res.id) {
      router.push(`/admin/surveys/${res.id}`);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    await toggleSurveyStatus(id, !currentlyActive);
    refreshSurveys();
  };

  const handleCopyLink = (surveyId: string, isActive: boolean) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = isActive ? `${origin}/survey` : `${origin}/survey?id=${surveyId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(surveyId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const startEdit = (survey: SurveyItem) => {
    setEditingSurveyId(survey.id);
    setEditTitle(survey.title);
    setEditDescription(survey.description || "");
  };

  const handleSaveEdit = async (surveyId: string) => {
    if (!editTitle.trim()) return;
    setIsSavingEdit(true);
    await updateAdminSurvey(surveyId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    setIsSavingEdit(false);
    setEditingSurveyId(null);
    refreshSurveys();
  };

  const handleDeleteSurvey = async (surveyId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"?\n\nThis will remove all questions and recorded responses for this survey.`
      )
    ) {
      return;
    }
    setDeletingId(surveyId);
    await deleteAdminSurvey(surveyId);
    setDeletingId(null);
    refreshSurveys();
  };

  const activeSurvey = surveys.find((s) => s.is_active);

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Student Surveys & Feedback</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create surveys, share public links with students, and collect student feedback directly here.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshSurveys}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-95 touch-manipulation"
        >
          {loading ? "Refreshing…" : "↻ Refresh All"}
        </button>
      </div>

      {/* AP Endowment Officer Targeted Feedback Section */}
      <ApEndowmentFeedbackSection />

      {/* Active Public Survey Banner */}
      {activeSurvey && (
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Live Public Survey
                </span>
              </div>
              <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900 break-words">
                {activeSurvey.title}
              </h2>
              {activeSurvey.description && (
                <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 break-words">
                  {activeSurvey.description}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-600 break-words">
                Active on student dashboard and shareable link:{" "}
                <code className="rounded bg-teal-100/70 px-1.5 py-0.5 font-mono text-teal-900 break-all">
                  /survey
                </code>
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(activeSurvey.id, true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition active:scale-95 touch-manipulation"
              >
                {copiedId === activeSurvey.id ? "✓ Copied Link!" : "📋 Copy Survey Link"}
              </button>
              <a
                href="/survey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-xl border border-teal-300 bg-white px-3.5 py-2.5 text-xs font-bold text-teal-900 shadow-sm hover:bg-teal-50 transition active:scale-95 touch-manipulation"
              >
                View Public Page ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Create Survey Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Create New Survey</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Create a survey to gather student needs, mock test feedback, or exam prep requirements.
        </p>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="e.g. APPSC Group 2 Feedback Survey"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition active:scale-95 touch-manipulation text-center justify-center inline-flex items-center shrink-0"
            >
              {isCreating ? "Creating…" : "Create Survey"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Optional subtitle or purpose (e.g. Tell us which subjects you want us to cover next)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Survey List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            All Dynamic Surveys ({surveys.length})
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center text-slate-500">
            <span className="inline-block animate-spin mr-2">⏳</span> Loading surveys…
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => {
              const isEditing = editingSurveyId === survey.id;

              return (
                <div
                  key={survey.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    {isEditing ? (
                      <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
                        <label className="block text-xs font-bold text-teal-900">Survey Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
                          required
                        />
                        <label className="block text-xs font-bold text-teal-900">Survey Description</label>
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                          placeholder="Optional description shown to students"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(survey.id)}
                            disabled={isSavingEdit}
                            className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60 transition"
                          >
                            {isSavingEdit ? "Saving…" : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSurveyId(null)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 sm:text-xl break-words">
                            {survey.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {survey.is_active ? (
                              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                Active (Live)
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                                Draft
                              </span>
                            )}
                            <span className="shrink-0 rounded-full bg-teal-50 border border-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                              {survey.response_count || 0}{" "}
                              {survey.response_count === 1 ? "response" : "responses"}
                            </span>
                          </div>
                        </div>
                        {survey.description && (
                          <p className="text-xs sm:text-sm text-slate-600 break-words">
                            {survey.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          Created {new Date(survey.created_at).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0 sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(survey.id, survey.is_active)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 touch-manipulation"
                      title="Copy link to share with students"
                    >
                      {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(survey.id, survey.is_active)}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 touch-manipulation ${
                        survey.is_active
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {survey.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingSurveyId(null) : startEdit(survey))}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 touch-manipulation"
                      title="Edit title and description"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                      disabled={deletingId === survey.id}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-40 transition active:scale-95 touch-manipulation"
                      title="Delete entire survey and its responses"
                    >
                      {deletingId === survey.id ? "Deleting…" : "🗑️ Delete"}
                    </button>

                    <Link
                      href={`/admin/surveys/${survey.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation text-center"
                    >
                      Edit Questions & Responses ({survey.response_count || 0})
                    </Link>
                  </div>
                </div>
              );
            })}

            {surveys.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center text-slate-500">
                <p className="text-base font-semibold text-slate-700">No surveys created yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Create your first dynamic survey above to start collecting student opinions and requirements!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
