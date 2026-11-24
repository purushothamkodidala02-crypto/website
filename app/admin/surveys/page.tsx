"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createAdminSurvey,
  updateAdminSurvey,
  updateSurveySettings,
  deleteAdminSurvey,
  toggleSurveyStatus,
  getAdminSurveysWithCounts,
  getAllAdminSurveyResponses,
  type SurveySettings,
  type AdminAggregatedResponse,
} from "@/app/actions/surveys-admin";
import {
  getAdminGrowthSettings,
  getGrowthInteractions,
  type GrowthInteractionRecord,
} from "@/app/admin/growth-settings/actions";
import type { GrowthPopupSettings } from "@/lib/growth-settings";
import { DEFAULT_GROWTH_SETTINGS } from "@/lib/growth-settings";
import { ApEndowmentFeedbackSection } from "@/components/admin/ApEndowmentFeedbackSection";
import { SurveySettingsPanel } from "@/components/admin/SurveySettingsPanel";
import { GrowthSettingsForm } from "@/app/admin/growth-settings/GrowthSettingsForm";
import { GrowthAnalyticsTab } from "@/components/admin/growth/GrowthAnalyticsTab";
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

export default function AdminSurveysPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-2xs">
          <span className="inline-block animate-spin mr-2">⏳</span> Loading admin hub…
        </div>
      }
    >
      <AdminSurveysList />
    </Suspense>
  );
}

function AdminSurveysList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State: "surveys" | "growth" | "targeting" | "preview" | "responses"
  const initialTab = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<
    "surveys" | "growth" | "targeting" | "preview" | "responses"
  >(
    ["surveys", "growth", "targeting", "preview", "responses"].includes(initialTab)
      ? initialTab
      : "surveys",
  );

  // Surveys State
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

  // Create Survey State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Syllabus & Exam Demand");
  const [newRewardType, setNewRewardType] = useState<string>("none");
  const [newRewardTitle, setNewRewardTitle] = useState("");
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

  // Growth Settings & Interactions State
  const [growthSettings, setGrowthSettings] = useState<GrowthPopupSettings>(DEFAULT_GROWTH_SETTINGS);
  const [growthInteractions, setGrowthInteractions] = useState<GrowthInteractionRecord[]>([]);

  // Aggregated Responses State
  const [allResponses, setAllResponses] = useState<AdminAggregatedResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseSearchTerm, setResponseSearchTerm] = useState("");
  const [responseSurveyFilter, setResponseSurveyFilter] = useState("all");
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<AdminAggregatedResponse | null>(null);

  // Interactive Preview State (Admin Simulator)
  const [previewSurveyId, setPreviewSurveyId] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"side_button" | "popup_modal">("side_button");
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  const fetchSurveysSafely = useCallback(async (): Promise<SurveyItem[]> => {
    try {
      const data = await getAdminSurveysWithCounts();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn("Server action getAdminSurveysWithCounts failed:", err);
    }

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

    try {
      const supabase = createBrowserClient();
      const { data: clientSurveys, error } = await supabase
        .from("dynamic_surveys")
        .select("id, title, description, is_active, created_at, settings")
        .order("created_at", { ascending: false });

      if (!error && clientSurveys && clientSurveys.length > 0) {
        return clientSurveys as SurveyItem[];
      }
    } catch (err) {
      console.warn("Direct browser supabase client query failed:", err);
    }

    return [];
  }, []);

  const refreshSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSurveysSafely();
      setSurveys(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("varadhi_cached_surveys_list", JSON.stringify(data));
      }
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to load surveys. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchSurveysSafely]);

  // Load initial data and set last seen for admin badge
  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
    void (async () => {
      try {
        const [surveysData, growthData, interactionsData] = await Promise.all([
          fetchSurveysSafely(),
          getAdminGrowthSettings().catch(() => DEFAULT_GROWTH_SETTINGS),
          getGrowthInteractions().catch(() => []),
        ]);
        if (!ignore) {
          setSurveys(surveysData);
          setGrowthSettings(growthData);
          setGrowthInteractions(interactionsData);
          if (surveysData.length > 0 && !previewSurveyId) {
            setPreviewSurveyId(surveysData[0].id);
          }
          if (typeof window !== "undefined" && surveysData.length > 0) {
            localStorage.setItem("varadhi_cached_surveys_list", JSON.stringify(surveysData));
          }
          setErrorMsg("");
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setErrorMsg("Failed to load survey operations data.");
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchSurveysSafely, previewSurveyId]);

  // Lazy load aggregated responses when Responses tab is clicked
  useEffect(() => {
    if (activeTab === "responses" && allResponses.length === 0) {
      setLoadingResponses(true);
      void getAllAdminSurveyResponses()
        .then((data) => setAllResponses(data))
        .catch(() => setAllResponses([]))
        .finally(() => setLoadingResponses(false));
    }
  }, [activeTab, allResponses.length]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    setErrorMsg("");
    const res = await createAdminSurvey(newTitle.trim(), newDescription.trim());
    setIsCreating(false);
    if (res.id) {
      if (newRewardType !== "none" && newRewardTitle.trim()) {
        await updateSurveySettings(res.id, {
          ...res,
          rewardType: newRewardType as any,
          rewardTitle: newRewardTitle.trim(),
        } as any);
      }
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

  const sortedSurveys = useMemo(() => {
    return surveys
      .filter((s) => !s.title.toLowerCase().includes("endowment"))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [surveys]);

  const activeSurveysCount = useMemo(() => {
    return surveys.filter((s) => s.is_active).length;
  }, [surveys]);

  const totalResponsesCount = useMemo(() => {
    return surveys.reduce((acc, s) => acc + (s.response_count || 0), 0);
  }, [surveys]);

  const filteredResponses = useMemo(() => {
    return allResponses.filter((r) => {
      if (responseSurveyFilter !== "all" && r.survey_id !== responseSurveyFilter) {
        return false;
      }
      if (!responseSearchTerm.trim()) return true;
      const term = responseSearchTerm.toLowerCase();
      const matchName = r.respondentName.toLowerCase().includes(term);
      const matchEmail = (r.respondentEmail || "").toLowerCase().includes(term);
      const matchPhone = (r.respondentPhone || r.respondentContact || "").includes(term);
      const matchTitle = (r.survey_title || "").toLowerCase().includes(term);
      const matchAnswers = r.answers.some((a) => a.answer_text.toLowerCase().includes(term));
      return matchName || matchEmail || matchPhone || matchTitle || matchAnswers;
    });
  }, [allResponses, responseSurveyFilter, responseSearchTerm]);

  const handleExportResponsesCSV = () => {
    if (filteredResponses.length === 0) {
      alert("No responses available to export.");
      return;
    }

    const headers = ["Submission ID", "Survey Title", "Date", "Candidate Name", "Mobile", "Email", "Answers"];
    const rows = filteredResponses.map((r) => {
      const answersJoined = r.answers.map((a) => a.answer_text).join(" | ");
      return [
        `"${r.id}"`,
        `"${(r.survey_title || "Survey").replace(/"/g, '""')}"`,
        `"${new Date(r.submitted_at).toLocaleString()}"`,
        `"${(r.respondentName || "").replace(/"/g, '""')}"`,
        `"${r.respondentPhone || r.respondentContact || ""}"`,
        `"${r.respondentEmail || ""}"`,
        `"${answersJoined.replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `varadhi_survey_responses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePreviewSurvey = useMemo(() => {
    return surveys.find((s) => s.id === previewSurveyId) || surveys[0] || null;
  }, [surveys, previewSurveyId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0055a2]" />
            Administration • Surveys, Growth &amp; Engagement Operations
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Student Surveys & Feedback
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Create survey forms, configure audience targeting rules (who can see, mock tests written, state, exam, specific candidates), manage voluntary contributions &amp; validity perks, and inspect student feedback.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("surveys");
              setShowCreateForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 touch-manipulation cursor-pointer"
          >
            + Create New Survey
          </button>
          <button
            type="button"
            onClick={refreshSurveys}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation cursor-pointer"
          >
            {loading ? "Refreshing…" : "↻ Refresh All"}
          </button>
          <Link
            href="/help-us-to-grow"
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            Live Growth Page ↗
          </Link>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("surveys")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "surveys"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📋 Survey Forms</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeTab === "surveys" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {1 + surveys.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("growth")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "growth"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>🌱 Help Us Grow &amp; Contributions</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
            Validity Perks
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("targeting")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "targeting"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>🎯 Who Can See &amp; Rewards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "preview"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>🎨 Side Button &amp; Pop-up Preview</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800">
            Simulator
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("responses")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "responses"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📊 Submissions &amp; Feedback</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeTab === "responses" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
            }`}
          >
            {totalResponsesCount}
          </span>
        </button>
      </div>

      {/* TAB 1: SURVEY FORMS (INFORMATION REQUESTS) */}
      {activeTab === "surveys" && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Survey Forms
              </span>
              <p className="mt-1 text-2xl font-black text-slate-900">{1 + surveys.length}</p>
              <span className="text-[10px] text-slate-400">Targeted + dynamic forms</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Campaigns
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-700">{1 + activeSurveysCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Eligible to display</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Student Responses
              </span>
              <p className="mt-1 text-2xl font-black text-slate-900">{totalResponsesCount}</p>
              <span className="text-[10px] text-slate-400">Total verified submissions</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Targeting Modes
              </span>
              <p className="mt-1 text-2xl font-black text-[#0055a2]">4 Modes</p>
              <span className="text-[10px] text-slate-400">New, Returning, Exam &amp; Specific</span>
            </div>
          </div>

          {/* Create Survey Form Modal / Expandable Card */}
          {(showCreateForm || (!loading && surveys.length === 0)) && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Create New Survey Form</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Set up questions to ask students (syllabus needs, exam preparation hurdles, difficulty feedback).
                  </p>
                </div>
                {surveys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs sm:text-sm font-semibold text-red-800">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Survey Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. APPSC Group 2 Core Subject Demand Survey"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Category / Purpose</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                    >
                      <option value="Syllabus & Exam Demand">Syllabus &amp; Exam Demand (What to cover next)</option>
                      <option value="Question Quality & Difficulty">Question Quality &amp; Difficulty Feedback</option>
                      <option value="New User Onboarding">New User Onboarding (0 Mock Tests Written)</option>
                      <option value="Experienced Student Deep Dive">Experienced Student Deep Dive (5+ Tests Written)</option>
                      <option value="Custom Research">Custom Information Collection</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Description / Subtitle</label>
                  <input
                    type="text"
                    placeholder="Optional purpose shown to students (e.g. Tell us which subjects you need test series for)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition"
                  />
                </div>

                {/* Optional Incentive / Reward Setup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Incentive / Reward Offered <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={newRewardType}
                      onChange={(e) => setNewRewardType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                    >
                      <option value="none">None (Standard Voluntary Feedback)</option>
                      <option value="validity_extension">⏳ Mock Test Validity Extension (+30 or +60 Days)</option>
                      <option value="free_pass">🎟️ 100% Free Mock Test Series Pass</option>
                      <option value="study_notes">📚 Free High-Yield Study Notes / Blueprint PDF</option>
                      <option value="discount_code">🏷️ Special Discount Coupon Code</option>
                    </select>
                  </div>

                  {newRewardType !== "none" && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Reward Title</label>
                      <input
                        type="text"
                        placeholder="e.g. +30 Days Free Mock Pass Validity Extension"
                        value={newRewardTitle}
                        onChange={(e) => setNewRewardTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition active:scale-95 touch-manipulation cursor-pointer shadow-2xs"
                  >
                    {isCreating ? "Creating…" : "Create & Manage Questions →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Unified Surveys List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  All Survey Campaigns ({1 + surveys.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered survey forms and feedback campaigns configured in the platform.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Campaign 1: AP Endowment Officer Priority Feedback */}
              <ApEndowmentFeedbackSection />

              {/* Dynamic Surveys */}
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center text-slate-500 shadow-2xs">
                  <span className="inline-block animate-spin mr-2">⏳</span> Loading surveys…
                </div>
              ) : (
                sortedSurveys.map((survey, index) => {
                  const surveyNumber = index + 2;
                  const isEditing = editingSurveyId === survey.id;
                  const settings = survey.settings;

                  return (
                    <div
                      key={survey.id}
                      className="flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition"
                    >
                      {/* Top Row: Badges & Primary Action CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                            Survey {surveyNumber}
                          </span>
                          {survey.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                              Draft
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 px-2.5 py-0.5 text-xs font-medium">
                            {survey.response_count || 0}{" "}
                            {survey.response_count === 1 ? "response" : "responses"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                            {settings?.targetUserType === "new_users"
                              ? "New Users (0 Tests)"
                              : settings?.targetUserType === "returning_users"
                              ? `Active (≥${settings?.minMockTestsTaken || 1} Tests)`
                              : settings?.targetUserType === "specific_users"
                              ? "Specific Users"
                              : settings?.targetAudience === "ap_endowment"
                              ? "AP Endowment"
                              : settings?.targetAudience === "tg_police"
                              ? "TG Police"
                              : "All Students"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                            {settings?.displayMode === "side_button"
                              ? "🔘 Side Button"
                              : settings?.displayMode === "popup_modal"
                              ? "💬 Modal Popup"
                              : settings?.displayMode === "page_only"
                              ? "🔗 Page Link"
                              : "🔘 Side Button + Modal"}
                          </span>
                          {settings?.rewardType && settings.rewardType !== "none" && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                              🎁 {settings.rewardTitle || "Reward Offered"}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 touch-manipulation text-center whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                          Edit Questions &amp; Responses ({survey.response_count || 0}) &rarr;
                        </Link>
                      </div>

                      {/* Title & Description */}
                      {isEditing ? (
                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                          <label className="block text-xs font-bold text-slate-800">Survey Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
                            required
                          />
                          <label className="block text-xs font-bold text-slate-800">Survey Description</label>
                          <textarea
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                            placeholder="Optional description shown to students"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(survey.id)}
                              disabled={isSavingEdit}
                              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs cursor-pointer"
                            >
                              {isSavingEdit ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSurveyId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 sm:text-xl break-words tracking-tight">
                            {survey.title}
                          </h3>
                          {survey.description && (
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                              {survey.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bottom Row: Metadata & Actions */}
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

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(survey.id, survey.is_active)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap cursor-pointer"
                            title="Copy link to share with students"
                          >
                            {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(survey.id, survey.is_active)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap cursor-pointer"
                          >
                            {survey.is_active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => (isEditing ? setEditingSurveyId(null) : startEdit(survey))}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap cursor-pointer"
                            title="Edit title and description"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenSettingsSurveyId((prev) => (prev === survey.id ? null : survey.id))
                            }
                            className={`inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-medium shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap cursor-pointer ${
                              openSettingsSurveyId === survey.id
                                ? "bg-slate-100 border-slate-300 text-slate-900"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                            title="Survey display rules and conditions"
                          >
                            {openSettingsSurveyId === survey.id ? "✕ Settings" : "⚙️ Settings"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                            disabled={deletingId === survey.id}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50/60 hover:border-red-200 disabled:opacity-40 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap cursor-pointer"
                            title="Delete entire survey and its responses"
                          >
                            {deletingId === survey.id ? "Deleting…" : "🗑️ Delete"}
                          </button>
                        </div>
                      </div>

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
      )}

      {/* TAB 2: HELP US GROW & CONTRIBUTIONS (ACCOUNT OF MONEY & VALIDITY PERKS) */}
      {activeTab === "growth" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-emerald-900">
                🌱 Voluntary Contributions &amp; Validity Bonus Setup
              </p>
              <p className="mt-0.5 text-emerald-800">
                Manage candidate voluntary support, UPI accounts, suggested amounts, and automatic validity extension perks for contributing students.
              </p>
            </div>
            <Link
              href="/help-us-to-grow"
              target="_blank"
              className="rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 transition shrink-0"
            >
              Preview Live Page ↗
            </Link>
          </div>

          <GrowthSettingsForm initialSettings={growthSettings} />

          {/* Interactions and student clicks */}
          <div className="pt-4">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Student Contribution &amp; Click Analytics
            </h3>
            <GrowthAnalyticsTab interactions={growthInteractions} />
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE TARGETING MATRIX & WHO CAN SEE */}
      {activeTab === "targeting" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-blue-800 font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">New Users (0 Mock Tests)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target students who registered but haven&apos;t taken a mock test yet. Ask what syllabus, exams, or features they are looking for to help them start practicing.
              </p>
              <span className="inline-block text-[11px] font-semibold text-[#0055a2]">
                Min Tests = 0 • Max Tests = 0
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Active Students (1+ or 5+ Tests)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target experienced students who wrote multiple tests. Ask for test difficulty calibration, syllabus coverage accuracy, and question quality feedback.
              </p>
              <span className="inline-block text-[11px] font-semibold text-emerald-800">
                Min Tests = 1 or 5 • Upper limit = Unlimited
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-800 font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Specific Candidates &amp; Whitelists</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target specific candidates by mobile number or email address for personalized follow-up, beta features, or tailored coaching support.
              </p>
              <span className="inline-block text-[11px] font-semibold text-amber-800">
                Target Whitelist: Comma-separated
              </span>
            </div>
          </div>

          {/* Audience Rules Matrix Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            <div className="border-b border-slate-200/80 p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900">
                Audience &amp; Rewards Targeting Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of who can see each survey form and what incentives they receive upon completion.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Survey Form</th>
                    <th className="p-3.5">Target Audience</th>
                    <th className="p-3.5">Mock Tests Written</th>
                    <th className="p-3.5">Target Exam / State</th>
                    <th className="p-3.5">Incentive / Reward</th>
                    <th className="p-3.5">Display Mode</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">
                      AP Endowment Officer — Priority Subject Feedback
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex rounded-md bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                        Attended AP Exam
                      </span>
                    </td>
                    <td className="p-3.5">≥ 1 Test Attended</td>
                    <td className="p-3.5">AP Endowment • Andhra Pradesh</td>
                    <td className="p-3.5 text-slate-500">Voluntary Feedback</td>
                    <td className="p-3.5">Popup Modal</td>
                    <td className="p-3.5 text-right">
                      <Link
                        href="#ap-endowment-section"
                        className="text-[#0055a2] font-semibold hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>

                  {surveys.map((s) => {
                    const settings = s.settings;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">{s.title}</td>
                        <td className="p-3.5">
                          <span className="inline-flex rounded-md bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                            {settings?.targetUserType === "new_users"
                              ? "New Users Only"
                              : settings?.targetUserType === "returning_users"
                              ? "Active Students"
                              : settings?.targetUserType === "specific_users"
                              ? `${settings?.specificTargetUsers?.length || 0} Specific Users`
                              : "All Candidates"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {settings?.maxMockTestsTaken === 0
                            ? "0 Tests (Strictly New)"
                            : `≥ ${settings?.minMockTestsTaken || 0} Tests`}
                        </td>
                        <td className="p-3.5">
                          {settings?.targetExamSlug && settings.targetExamSlug !== "all"
                            ? settings.targetExamSlug
                            : "All Exams"}{" "}
                          • {settings?.targetState || "All States"}
                        </td>
                        <td className="p-3.5">
                          {settings?.rewardType && settings.rewardType !== "none" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                              <span>🎁</span> {settings.rewardTitle || settings.rewardType}
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {settings?.displayMode === "side_button"
                            ? "🔘 Side Button"
                            : settings?.displayMode === "popup_modal"
                            ? "💬 Modal Popup"
                            : settings?.displayMode === "page_only"
                            ? "🔗 Page Link"
                            : "🔘 Side Button + Modal"}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("surveys");
                              setOpenSettingsSurveyId(s.id);
                            }}
                            className="text-[#0055a2] font-semibold hover:underline cursor-pointer"
                          >
                            Configure &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIDE BUTTON & POPUP PREVIEW (ADMIN SIMULATOR) */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-indigo-900">
                🎨 Admin Presentation Simulator (Side Button &amp; Popup)
              </p>
              <p className="mt-0.5 text-indigo-800">
                Test and interact with the floating side button or popup drawer directly in this sandbox. No pop-ups are shown to public users.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-900 px-3 py-1 text-xs font-bold">
                Admin Safe Sandbox
              </span>
            </div>
          </div>

          {/* Simulator Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Form to Simulate:</label>
              <select
                value={previewSurveyId}
                onChange={(e) => setPreviewSurveyId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
              >
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Display Style:</span>
              <button
                type="button"
                onClick={() => setPreviewMode("side_button")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  previewMode === "side_button"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🔘 Floating Side Button
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("popup_modal")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  previewMode === "popup_modal"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                💬 Center Pop-up Modal
              </button>
            </div>
          </div>

          {/* Virtual Browser Mockup Frame */}
          <div className="relative min-h-[500px] overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 p-6 shadow-sm">
            {/* Browser Header Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 rounded-t-xl mb-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 pl-2">
                https://varadhiprep.in/dashboard (Student View Simulation)
              </span>
            </div>

            {/* Simulated Candidate Background Content */}
            <div className="space-y-4 max-w-xl opacity-60">
              <div className="h-7 w-48 rounded-lg bg-slate-300" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-xl bg-slate-200" />
                <div className="h-20 rounded-xl bg-slate-200" />
                <div className="h-20 rounded-xl bg-slate-200" />
              </div>
              <div className="h-40 rounded-xl bg-slate-200" />
            </div>

            {/* Mode 1: Floating Side Button (Discrete Pill) */}
            {previewMode === "side_button" && (
              <>
                {/* The Floating Pill in bottom right */}
                <div className="absolute bottom-6 right-6 z-10">
                  <button
                    type="button"
                    onClick={() => setSideDrawerOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full bg-[#0055a2] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#004080] transition transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{activePreviewSurvey?.settings?.sideButtonLabel || "💬 1-Min Feedback"}</span>
                    {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                        🎁 PERK
                      </span>
                    )}
                  </button>
                </div>

                {/* The Side Drawer Slide-out */}
                {sideDrawerOpen && (
                  <div className="absolute top-12 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl p-5 z-20 flex flex-col justify-between animate-in slide-in-from-right duration-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-[#0055a2] uppercase tracking-wider">
                          Quick Candidate Feedback
                        </span>
                        <button
                          type="button"
                          onClick={() => setSideDrawerOpen(false)}
                          className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {activePreviewSurvey?.title || "Sample Survey Title"}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {activePreviewSurvey?.description || "Your input directly shapes the next batch of mock tests."}
                      </p>

                      {/* Reward Badge */}
                      {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                          <span className="text-base">🎁</span>
                          <span>
                            <strong>Reward:</strong> {activePreviewSurvey.settings.rewardTitle || "Bonus Validity Extension"}
                          </span>
                        </div>
                      )}

                      {/* Sample Questions Mockup */}
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            1. Which paper or subject do you need more mock tests for?
                          </label>
                          <input
                            type="text"
                            placeholder="Type subject name…"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            2. How would you rate the current test difficulty?
                          </label>
                          <div className="flex gap-2">
                            {["Easy", "Moderate", "Exam-Standard", "Hard"].map((lvl) => (
                              <span
                                key={lvl}
                                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                              >
                                {lvl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSideDrawerOpen(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Maybe Later
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert("Demo response submitted in simulation environment!");
                          setSideDrawerOpen(false);
                        }}
                        className="rounded-xl bg-[#0055a2] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#004080] cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mode 2: Center Modal Popup */}
            {previewMode === "popup_modal" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#0055a2] uppercase tracking-wider">
                        Varadhi Prep Feedback
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">
                        {activePreviewSurvey?.title || "Survey Title"}
                      </h4>
                    </div>
                    <span className="text-slate-400 text-xs">✕</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activePreviewSurvey?.description || "Help us tailor our upcoming mock series to your exact syllabus."}
                  </p>

                  {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                      <span className="text-base">🎁</span>
                      <span>
                        <strong>Incentive:</strong> {activePreviewSurvey.settings.rewardTitle || "Bonus Validity Extension"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 cursor-pointer">Skip</span>
                    <button
                      type="button"
                      onClick={() => alert("Simulated modal CTA click")}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
                    >
                      Complete 1-Min Survey
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SUBMISSIONS & RESPONSES */}
      {activeTab === "responses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                All Recorded Student Submissions ({filteredResponses.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect what candidates submitted, contact details, and their question responses.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportResponsesCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer self-start sm:self-auto"
            >
              📥 Export All Responses (CSV)
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <input
                type="text"
                placeholder="Search by student name, phone, email, or answer text…"
                value={responseSearchTerm}
                onChange={(e) => setResponseSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={responseSurveyFilter}
              onChange={(e) => setResponseSurveyFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none"
            >
              <option value="all">All Surveys</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Responses Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            {loadingResponses ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <span className="inline-block animate-spin mr-2">⏳</span> Loading submissions…
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No survey responses found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Submission Time</th>
                      <th className="p-3.5">Candidate Name</th>
                      <th className="p-3.5">Mobile / Contact</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Survey Form</th>
                      <th className="p-3.5">Answers Preview</th>
                      <th className="p-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredResponses.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 whitespace-nowrap text-slate-500">
                          {new Date(r.submitted_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{r.respondentName}</td>
                        <td className="p-3.5 font-mono text-slate-800">
                          {r.respondentPhone || r.respondentContact || "—"}
                        </td>
                        <td className="p-3.5 text-slate-600">{r.respondentEmail || "—"}</td>
                        <td className="p-3.5 font-semibold text-[#0055a2]">
                          {r.survey_title || "Dynamic Survey"}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-slate-600">
                          {r.answers.map((a) => a.answer_text).join(" • ") || "No answers recorded"}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedResponseDetail(r)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            View Full &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Response Detail Modal */}
          {selectedResponseDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055a2]">
                      Response Details
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      {selectedResponseDetail.respondentName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Submitted on {new Date(selectedResponseDetail.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedResponseDetail(null)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedResponseDetail.respondentPhone || selectedResponseDetail.respondentContact || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                    <span className="text-slate-800">{selectedResponseDetail.respondentEmail || "Not provided"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Question Answers
                  </h4>
                  {selectedResponseDetail.answers.map((a, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Question #{idx + 1}</span>
                      <p className="text-xs font-semibold text-slate-900">{a.answer_text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedResponseDetail(null)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
