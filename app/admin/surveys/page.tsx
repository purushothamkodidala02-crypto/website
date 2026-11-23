"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  createAdminSurvey,
  createAdminCampaignPreset,
  type CampaignPresetType,
  updateAdminSurvey,
  updateSurveySettings,
  deleteAdminSurvey,
  toggleSurveyStatus,
  getAdminSurveysWithCounts,
  type SurveySettings,
} from "@/app/actions/surveys-admin";
import { useRouter } from "next/navigation";
import { ApEndowmentFeedbackSection } from "@/components/admin/ApEndowmentFeedbackSection";
import { SurveySettingsPanel } from "@/components/admin/SurveySettingsPanel";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type SurveyItem = {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  response_count?: number;
  settings?: SurveySettings | null;
};

export default function AdminSurveysList() {
  const [surveys, setSurveys] = useState<SurveyItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("varadhi_cached_surveys_list");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("varadhi_cached_surveys_list");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit Survey State
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Survey Settings State
  const [openSettingsSurveyId, setOpenSettingsSurveyId] = useState<string | null>(null);

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
      if (typeof window !== "undefined" && data && data.length > 0) {
        localStorage.setItem("varadhi_cached_surveys_list", JSON.stringify(data));
      }
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
          if (typeof window !== "undefined" && data && data.length > 0) {
            localStorage.setItem("varadhi_cached_surveys_list", JSON.stringify(data));
          }
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

  const handleCreatePreset = async (preset: CampaignPresetType) => {
    setIsCreating(true);
    setErrorMsg("");
    const res = await createAdminCampaignPreset(preset);
    setIsCreating(false);
    if (res.id) {
      setOpenSettingsSurveyId(res.id);
      refreshSurveys();
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

  const sortedSurveys = useMemo(() => {
    return surveys
      .filter((s) => !s.title.toLowerCase().includes("endowment"))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [surveys]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Administration • Surveys & Feedback • Pop-ups & Growth
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Student Surveys & Feedback
          </h1>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mt-0.5">
            Pop-ups, Surveys & Growth Forms Engine
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Create, target, and schedule application pop-ups, student surveys, and voluntary growth support forms. Select your app icon, target specific pages, set timers, and filter candidate criteria without writing any code.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 touch-manipulation"
          >
            {showCreateForm ? "✕ Close Custom Form" : "+ New Custom Form"}
          </button>
          <button
            type="button"
            onClick={refreshSurveys}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation"
          >
            {loading ? "Refreshing…" : "↻ Refresh All"}
          </button>
        </div>
      </div>

      {/* Quick Launch Preset Engine */}
      <div className="rounded-2xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/60 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚡ Quick-Launch Campaign Presets</span>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                No-Code Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Combine growth, surveys, and alerts into unified application pop-ups with 1 click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            disabled={isCreating}
            onClick={() => handleCreatePreset("survey")}
            className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-left hover:bg-teal-50 hover:border-teal-300 transition active:scale-98 shadow-2xs"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl shadow-2xs">
              📝
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black text-teal-950">Student Survey</div>
              <div className="text-[11px] text-teal-700">1–4 tests • Feedback questions</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isCreating}
            onClick={() => handleCreatePreset("growth")}
            className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-left hover:bg-rose-50 hover:border-rose-300 transition active:scale-98 shadow-2xs"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xl shadow-2xs">
              💖
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black text-rose-950">Help Us Grow Pop-up</div>
              <div className="text-[11px] text-rose-700">5+ tests • Voluntary UPI support</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isCreating}
            onClick={() => handleCreatePreset("announcement")}
            className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-left hover:bg-amber-50 hover:border-amber-300 transition active:scale-98 shadow-2xs"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl shadow-2xs">
              📢
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black text-amber-950">Announcement Pop-up</div>
              <div className="text-[11px] text-amber-700">All pages • Exam alerts</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isCreating}
            onClick={() => handleCreatePreset("custom")}
            className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-left hover:bg-indigo-50 hover:border-indigo-300 transition active:scale-98 shadow-2xs"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl shadow-2xs">
              🎯
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black text-indigo-950">Custom Form</div>
              <div className="text-[11px] text-indigo-700">Blank form & custom icon</div>
            </div>
          </button>
        </div>
      </div>

      {/* Create Survey Form (collapsible or if no dynamic surveys) */}
      {(showCreateForm || (!loading && surveys.length === 0)) && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Create New Form or Survey</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Create a dynamic form to gather student needs, mock test feedback, or exam prep requirements.
              </p>
            </div>
            {surveys.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs sm:text-sm font-semibold text-red-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. APPSC Group 2 Feedback Survey or Help Us to Grow"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
                required
              />
              <button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition active:scale-95 touch-manipulation text-center justify-center inline-flex items-center shrink-0 shadow-2xs"
              >
                {isCreating ? "Creating…" : "Create Form"}
              </button>
            </div>
            <input
              type="text"
              placeholder="Optional subtitle or purpose (e.g. Tell us which subjects you want us to cover next)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
            />
          </form>
        </div>
      )}

      {/* Unified Surveys & Forms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              All Active & Draft Campaigns ({1 + surveys.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pop-ups, surveys, and growth support forms ordered sequentially.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {/* Survey 1: AP Endowment Officer Targeted Feedback */}
          <ApEndowmentFeedbackSection />

          {/* Survey 2, Survey 3, etc.: Dynamic Surveys */}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center text-slate-500 shadow-2xs">
              <span className="inline-block animate-spin mr-2">⏳</span> Loading surveys…
            </div>
          ) : (
            sortedSurveys.map((survey, index) => {
              const surveyNumber = index + 2;
              const isEditing = editingSurveyId === survey.id;
              const s = survey.settings as SurveySettings | undefined;
              const formType = s?.formType || "survey";
              const appIcon = s?.appIcon || (formType === "growth_support" ? "💖" : formType === "announcement" ? "📢" : "📝");
              const delaySec = s?.triggerDelaySeconds ?? 2.5;
              const cooldown = s?.cooldownDays ?? 3;

              // Format criteria tag
              let criteriaTag = "All Students";
              if (s?.criteria) {
                if (s.criteria.testCondition === "zero_tests") criteriaTag = "0 Tests (New Users)";
                else if (s.criteria.testCondition === "one_to_four") criteriaTag = "1–4 Mock Tests";
                else if (s.criteria.testCondition === "five_plus") criteriaTag = "5+ Mock Tests";
                else if (s.criteria.testCondition === "custom_range") criteriaTag = `${s.criteria.minTests || 0} to ${s.criteria.maxTests || "∞"} Tests`;
              }

              // Format pages tag
              const pages: string[] = [];
              if (s?.targetRoutes?.all) pages.push("All Pages");
              else {
                if (s?.targetRoutes?.dashboard) pages.push("Dashboard");
                if (s?.targetRoutes?.mockTests) pages.push("Mock Tests");
                if (s?.targetRoutes?.testReview) pages.push("Review");
                if (s?.targetRoutes?.exams) pages.push("Exams");
                if (s?.targetRoutes?.home) pages.push("Home");
                if (s?.targetRoutes?.customPath) pages.push("Custom");
              }
              const pagesTag = pages.length > 0 ? pages.join(", ") : "Dashboard, Tests";

              return (
                <div
                  key={survey.id}
                  className="flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition"
                >
                  {/* Top Row: Visual App Icon, Title, Badges & Edit CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* App Icon Squircle */}
                      <div
                        className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-xs border ${
                          s?.themeColor === "rose"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : s?.themeColor === "amber"
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : s?.themeColor === "blue"
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : s?.themeColor === "indigo"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                            : "bg-teal-50 border-teal-200 text-teal-800"
                        }`}
                      >
                        {appIcon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Campaign {surveyNumber}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                              formType === "growth_support"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : formType === "announcement"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-teal-50 text-teal-800 border-teal-200"
                            }`}
                          >
                            {formType === "growth_support"
                              ? "💖 Growth Support"
                              : formType === "announcement"
                              ? "📢 Announcement"
                              : "📝 Student Survey"}
                          </span>

                          {survey.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 text-[11px] font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px] font-medium">
                              Draft
                            </span>
                          )}

                          <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium">
                            {survey.response_count || 0}{" "}
                            {survey.response_count === 1 ? "response" : "responses"}
                          </span>
                        </div>

                        {/* Title & Description */}
                        {isEditing ? (
                          <div className="space-y-2 mt-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900"
                              required
                            />
                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                              placeholder="Optional description"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(survey.id)}
                                disabled={isSavingEdit}
                                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-2xs"
                              >
                                {isSavingEdit ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSurveyId(null)}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                              {survey.title}
                            </h3>
                            {survey.description && (
                              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                                {survey.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {formType === "survey" && (
                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 whitespace-nowrap"
                        >
                          Edit Questions & Responses ({survey.response_count || 0}) &rarr;
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips: Pages, Criteria, Timers */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 font-medium">
                      📍 Pages: <strong className="text-slate-800">{pagesTag}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 font-medium">
                      🎯 Audience: <strong className="text-slate-800">{criteriaTag}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 font-medium">
                      ⏱️ Timer: <strong className="text-slate-800">{delaySec}s delay • {cooldown}d cooldown</strong>
                    </span>
                    {s?.badgeText && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 font-medium">
                        🏷️ Badge: <strong className="text-slate-800">{s.badgeText}</strong>
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Public link:{" "}
                        <code className="rounded-md bg-slate-50 border border-slate-200/90 px-1.5 py-0.5 font-mono text-slate-700">
                          {survey.is_active ? "/survey" : `/survey?id=${survey.id}`}
                        </code>
                      </span>
                      {survey.is_active && (
                        <a
                          href="/survey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 ml-1 transition whitespace-nowrap"
                        >
                          Open public page ↗
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSettingsSurveyId((prev) => (prev === survey.id ? null : survey.id))
                        }
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap ${
                          openSettingsSurveyId === survey.id
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                        title="Configure App Icon, Page Targeting, Timer & Candidate Criteria"
                      >
                        {openSettingsSurveyId === survey.id ? "✕ Close Settings" : "⚙️ Settings & Criteria"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(survey.id, survey.is_active)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                      >
                        {survey.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(survey.id, survey.is_active)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                        title="Copy link to share with students"
                      >
                        {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                      </button>

                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingSurveyId(null) : startEdit(survey))}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                        title="Edit title and description"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                        disabled={deletingId === survey.id}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50/60 hover:border-red-200 disabled:opacity-40 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                        title="Delete entire survey and its responses"
                      >
                        {deletingId === survey.id ? "Deleting…" : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Inline Settings & Criteria Panel */}
                  {openSettingsSurveyId === survey.id && (
                    <div className="w-full pt-2">
                      <SurveySettingsPanel
                        surveyId={survey.id}
                        surveyTitle={survey.title}
                        initialSettings={survey.settings}
                        onSave={async (newSettings) => {
                          await updateSurveySettings(survey.id, newSettings);
                          refreshSurveys();
                        }}
                        onClose={() => setOpenSettingsSurveyId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
