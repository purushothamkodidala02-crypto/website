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
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-2xs">
          <div className="flex flex-col items-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#0055a2]" />
            <p className="text-xs font-semibold text-slate-600">Loading Form &amp; Engagement Studio…</p>
          </div>
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

  // Primary Workspace Navigation
  const initialTab = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<
    "surveys" | "growth" | "targeting" | "preview" | "responses"
  >(
    ["surveys", "growth", "targeting", "preview", "responses"].includes(initialTab)
      ? initialTab
      : "surveys",
  );

  // Forms Repository State
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

  // Search & Filter within Forms
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  // Create Form Dialog State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Syllabus & Exam Demand");
  const [newRewardType, setNewRewardType] = useState<string>("none");
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit Metadata State
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Quick Action feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openSettingsSurveyId, setOpenSettingsSurveyId] = useState<string | null>(null);

  // Growth & Validity Fund State
  const [growthSettings, setGrowthSettings] = useState<GrowthPopupSettings>(DEFAULT_GROWTH_SETTINGS);
  const [growthInteractions, setGrowthInteractions] = useState<GrowthInteractionRecord[]>([]);

  // Submissions Explorer State
  const [allResponses, setAllResponses] = useState<AdminAggregatedResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseSearchTerm, setResponseSearchTerm] = useState("");
  const [responseSurveyFilter, setResponseSurveyFilter] = useState("all");
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<AdminAggregatedResponse | null>(null);

  // Presentation & Simulator State
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
        if (json.surveys && json.surveys.length > 0) return json.surveys;
      }
    } catch (err) {
      console.warn("API /api/admin/surveys fallback failed:", err);
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
      console.warn("Browser supabase fallback failed:", err);
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
      setErrorMsg("Failed to reload forms.");
    } finally {
      setLoading(false);
    }
  }, [fetchSurveysSafely]);

  // Initial Data Load & Last Seen Badge Refresh
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
          setLoading(false);
        }
      } catch {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchSurveysSafely, previewSurveyId]);

  // Fetch responses on demand
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
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
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
        `Are you sure you want to permanently delete "${title}"?\n\nThis will remove all associated questions and student submissions.`
      )
    ) {
      return;
    }
    setDeletingId(surveyId);
    await deleteAdminSurvey(surveyId);
    setDeletingId(null);
    refreshSurveys();
  };

  // Filtered and Sorted Forms
  const sortedSurveys = useMemo(() => {
    return surveys
      .filter((s) => !s.title.toLowerCase().includes("endowment"))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [surveys]);

  const displayedSurveys = useMemo(() => {
    return sortedSurveys.filter((s) => {
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "draft" && s.is_active) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q);
    });
  }, [sortedSurveys, statusFilter, searchQuery]);

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
      alert("No responses recorded yet.");
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
    link.setAttribute("download", `survey_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePreviewSurvey = useMemo(() => {
    return surveys.find((s) => s.id === previewSurveyId) || surveys[0] || null;
  }, [surveys, previewSurveyId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ========================================================
          1. ENTERPRISE STUDIO HEADER & BREADCRUMBS
      ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-[#0055a2]" />
                Studio Workspace
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-500">Candidate Experience &amp; Intelligence</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Student Surveys & Feedback
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Design dynamic feedback forms, set precise candidate targeting rules (new users, mock test count, exam, state, specific people), manage voluntary support &amp; validity extension perks, and analyze student submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0055a2] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#004280] active:scale-95 transition cursor-pointer"
            >
              <span className="text-sm">+</span>
              <span>Create New Form</span>
            </button>

            <button
              type="button"
              onClick={refreshSurveys}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer shadow-2xs"
            >
              <span>{loading ? "Refreshing…" : "↻ Refresh"}</span>
            </button>

            <Link
              href="/help-us-to-grow"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-white active:scale-95 transition shadow-2xs"
            >
              <span>Live Supporter Page ↗</span>
            </Link>
          </div>
        </div>

        {/* Studio Performance KPI Ribbon */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-5">
          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Form Inventory
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{1 + surveys.length}</span>
              <span className="text-[11px] font-semibold text-slate-500">campaigns</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-400">Targeted &amp; dynamic forms</p>
          </div>

          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Campaigns
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{1 + activeSurveysCount}</span>
              <span className="text-[11px] font-semibold text-emerald-800">live</span>
            </div>
            <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">Eligible for audience triggers</p>
          </div>

          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Candidate Responses
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalResponsesCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">verified</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-400">Recorded student submissions</p>
          </div>

          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Validity Extension
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0055a2]">
                +{growthSettings.validityDaysGranted || 30}d
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                ₹{growthSettings.validityMinContribution || 99}+
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">Supporter perk enabled</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ENTERPRISE SEGMENTED MODULE BAR (TABS)
      ======================================================== */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("surveys")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "surveys"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>📋 Survey Forms</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
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
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>🌱 Help Us Grow &amp; Contributions</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
            Validity Perks
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("targeting")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "targeting"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>🎯 Who Can See &amp; Rewards</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-900">
            Rules
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "preview"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>🎨 Side Button &amp; Pop-up Preview</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-900">
            Sandbox
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("responses")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ml-auto ${
            activeTab === "responses"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>📊 Submissions &amp; Feedback</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "responses" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-900"
            }`}
          >
            {totalResponsesCount}
          </span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: SURVEY FORMS (REPOSITORY & BUILDER LAUNCHER)
      ======================================================== */}
      {activeTab === "surveys" && (
        <div className="space-y-6">
          {/* Repository Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <input
                type="text"
                placeholder="Search forms by title, keywords or target…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({sortedSurveys.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-emerald-800 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Active ({activeSurveysCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Draft ({sortedSurveys.length - activeSurveysCount})
              </button>
            </div>
          </div>

          {/* Targeted Exam Campaigns Section */}
          <div className="overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-2xs">
            <div className="border-b border-purple-100 bg-purple-50/50 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-purple-800 text-white text-xs font-bold">
                  🎯
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-950">
                    Special Targeted Exam Campaign
                  </h3>
                  <p className="text-[11px] text-purple-700">
                    Pre-configured candidate feedback triggered after mock test attempt
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-900 border border-purple-200">
                Exam-Specific
              </span>
            </div>
            <div className="p-4 sm:p-5">
              <ApEndowmentFeedbackSection />
            </div>
          </div>

          {/* Dynamic Surveys Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Dynamic Forms Repository ({displayedSurveys.length})
              </h2>
              <span className="text-xs text-slate-400">Sorted by creation sequence</span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-2xs">
                <span className="inline-block animate-spin mr-2">⏳</span> Loading forms repository…
              </div>
            ) : displayedSurveys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <p className="font-bold text-slate-700">No survey forms found matching filter.</p>
                <p className="text-xs text-slate-400 mt-1">Create a new form to start gathering candidate feedback.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-xl bg-[#0055a2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#004280]"
                >
                  + Create Form
                </button>
              </div>
            ) : (
              displayedSurveys.map((survey, index) => {
                const surveyNumber = index + 2;
                const isEditing = editingSurveyId === survey.id;
                const sSettings = survey.settings;

                return (
                  <div
                    key={survey.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition"
                  >
                    {/* Top Row: Form Meta Pills & Primary Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider">
                          Form #{surveyNumber}
                        </span>

                        {/* Status Switch Chip */}
                        <button
                          type="button"
                          onClick={() => handleToggle(survey.id, survey.is_active)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition cursor-pointer border ${
                            survey.is_active
                              ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle Active / Draft"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              survey.is_active ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span>{survey.is_active ? "Active" : "Draft"}</span>
                        </button>

                        {/* Audience Pill */}
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-900 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold">
                          👤{" "}
                          {sSettings?.targetUserType === "new_users"
                            ? "New Users (0 Tests)"
                            : sSettings?.targetUserType === "returning_users"
                            ? `Active (≥${sSettings?.minMockTestsTaken || 1} Tests)`
                            : sSettings?.targetUserType === "specific_users"
                            ? "Specific Candidates"
                            : sSettings?.targetAudience === "ap_endowment"
                            ? "AP Endowment"
                            : sSettings?.targetAudience === "tg_police"
                            ? "TG Police"
                            : "All Students"}
                        </span>

                        {/* Launcher Format Pill */}
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                          {sSettings?.displayMode === "side_button"
                            ? "🔘 Floating Side Button"
                            : sSettings?.displayMode === "popup_modal"
                            ? "💬 Center Popup Modal"
                            : sSettings?.displayMode === "page_only"
                            ? "🔗 Standalone Page"
                            : "🔘 Side Button + Modal"}
                        </span>

                        {/* Incentive Pill */}
                        {sSettings?.rewardType && sSettings.rewardType !== "none" && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
                            🎁 {sSettings.rewardTitle || sSettings.rewardType}
                          </span>
                        )}

                        {/* Response Counter */}
                        <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 px-2.5 py-0.5 text-xs font-semibold">
                          {survey.response_count || 0}{" "}
                          {survey.response_count === 1 ? "response" : "responses"}
                        </span>
                      </div>

                      {/* Primary Builder Action */}
                      <Link
                        href={`/admin/surveys/${survey.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 text-center shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        <span>Manage Questions &amp; Builder &rarr;</span>
                      </Link>
                    </div>

                    {/* Middle: Title & Description */}
                    {isEditing ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Form Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Description</label>
                          <textarea
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(survey.id)}
                            disabled={isSavingEdit}
                            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shadow-2xs"
                          >
                            {isSavingEdit ? "Saving…" : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSurveyId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
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

                    {/* Bottom Toolbar: URL & Discrete Action Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <span>
                          Direct access:{" "}
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
                            {survey.is_active ? "/survey" : `/survey?id=${survey.id}`}
                          </code>
                        </span>
                        {survey.is_active && (
                          <a
                            href="/survey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#0055a2] hover:underline ml-1"
                          >
                            Open Public Form ↗
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(survey.id, survey.is_active)}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer shadow-2xs"
                          title="Copy direct sharing link"
                        >
                          {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                        </button>

                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingSurveyId(null) : startEdit(survey))}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer shadow-2xs"
                          title="Edit form title and details"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenSettingsSurveyId((prev) => (prev === survey.id ? null : survey.id))
                          }
                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-2xs ${
                            openSettingsSurveyId === survey.id
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                          title="Configure distribution rules, audience, and incentives"
                        >
                          {openSettingsSurveyId === survey.id ? "✕ Close Rules" : "⚙️ Targeting & Rules"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                          disabled={deletingId === survey.id}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 transition active:scale-95 cursor-pointer shadow-2xs"
                          title="Delete form and responses"
                        >
                          {deletingId === survey.id ? "Deleting…" : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>

                    {/* Integrated Settings Panel */}
                    {openSettingsSurveyId === survey.id && (
                      <div className="pt-2">
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
      )}

      {/* ========================================================
          TAB 2: HELP US GROW & CONTRIBUTIONS (SUPPORT FUND)
      ======================================================== */}
      {activeTab === "growth" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <p className="font-bold text-sm text-emerald-950">
                🌱 Voluntary Candidate Contributions &amp; Validity Bonus Setup
              </p>
              <p className="mt-0.5 text-emerald-900 leading-relaxed">
                Configure voluntary student financial support, official UPI account details, suggested amounts, and automatic mock series validity extension perks granted to contributing candidates.
              </p>
            </div>
            <Link
              href="/help-us-to-grow"
              target="_blank"
              className="rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 transition shrink-0"
            >
              Live Supporter Portal ↗
            </Link>
          </div>

          <GrowthSettingsForm initialSettings={growthSettings} />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Candidate Support &amp; Button Click Telemetry
            </h3>
            <GrowthAnalyticsTab interactions={growthInteractions} />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: AUDIENCE TARGETING MATRIX & WHO CAN SEE
      ======================================================== */}
      {activeTab === "targeting" && (
        <div className="space-y-6">
          {/* Visual Rules Logic Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100 text-blue-900 font-black text-xs">
                  01
                </span>
                <h3 className="text-sm font-bold text-slate-900">New Registered Users</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target candidates with 0 completed mock tests. Ask onboarding questions: which exam are they preparing for, and what syllabus topics do they need first?
              </p>
              <div className="rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                Condition: <span className="font-bold text-[#0055a2]">Mock Tests = 0</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
                  02
                </span>
                <h3 className="text-sm font-bold text-slate-900">Active Test Takers</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Target candidates who completed 1+ or 5+ mock tests. Gather feedback on question difficulty, syllabus coverage, and explanation quality.
              </p>
              <div className="rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                Condition: <span className="font-bold text-emerald-800">Mock Tests ≥ 1 or 5</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-900 font-black text-xs">
                  03
                </span>
                <h3 className="text-sm font-bold text-slate-900">Specific Candidates</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reach out to specific individual students by email or mobile number for custom beta features, error report follow-up, or personal coaching.
              </p>
              <div className="rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                Condition: <span className="font-bold text-amber-800">Target Whitelist</span>
              </div>
            </div>
          </div>

          {/* Matrix Overview Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Audience &amp; Rewards Targeting Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summary of targeting conditions, test limits, exam filters, and incentives across all forms.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Form / Campaign</th>
                    <th className="p-3.5">Target Audience</th>
                    <th className="p-3.5">Mock Test Gate</th>
                    <th className="p-3.5">Exam / State</th>
                    <th className="p-3.5">Incentive / Reward</th>
                    <th className="p-3.5">Launcher Mode</th>
                    <th className="p-3.5 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">
                      AP Endowment Officer — Subject Priority Feedback
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex rounded-md bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                        Attended AP Exam
                      </span>
                    </td>
                    <td className="p-3.5">≥ 1 Attempt</td>
                    <td className="p-3.5">AP Endowment • Andhra Pradesh</td>
                    <td className="p-3.5 text-slate-400">Voluntary</td>
                    <td className="p-3.5">Popup Modal</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab("surveys")}
                        className="text-[#0055a2] font-semibold hover:underline cursor-pointer"
                      >
                        Inspect &rarr;
                      </button>
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
                              ? `${settings?.specificTargetUsers?.length || 0} Whitelisted Candidates`
                              : "All Candidates"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          {settings?.maxMockTestsTaken === 0
                            ? "Strictly 0 Tests"
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
                            ? "💬 Popup Modal"
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
                            Edit Rule &rarr;
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

      {/* ========================================================
          TAB 4: SIDE BUTTON & POP-UP PREVIEW (ADMIN SIMULATOR)
      ======================================================== */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <p className="font-bold text-sm text-indigo-950">
                🎨 Admin Presentation Simulator (Side Button &amp; Popup)
              </p>
              <p className="mt-0.5 text-indigo-900 leading-relaxed">
                Test and interact with the discrete floating side button or popup modal directly in this sandbox. Public student sessions remain 100% clean and uninterrupted.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 text-xs font-bold shrink-0">
              Admin Safe Sandbox
            </span>
          </div>

          {/* Simulator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Preview Form:</label>
              <select
                value={previewSurveyId}
                onChange={(e) => setPreviewSurveyId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
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
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
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
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  previewMode === "popup_modal"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                💬 Center Pop-up Modal
              </button>
            </div>
          </div>

          {/* Virtual Browser Mockup */}
          <div className="relative min-h-[500px] overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 p-6 shadow-sm">
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

            {/* Background Content Skeleton */}
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
                <div className="absolute bottom-6 right-6 z-10">
                  <button
                    type="button"
                    onClick={() => setSideDrawerOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full bg-[#0055a2] px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#004280] transition transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>{activePreviewSurvey?.settings?.sideButtonLabel || "💬 1-Min Feedback"}</span>
                    {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                        🎁 PERK
                      </span>
                    )}
                  </button>
                </div>

                {sideDrawerOpen && (
                  <div className="absolute top-12 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl p-5 z-20 flex flex-col justify-between animate-in slide-in-from-right duration-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-[#0055a2] uppercase tracking-wider">
                          Candidate Feedback
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
                        {activePreviewSurvey?.title || "Form Title"}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {activePreviewSurvey?.description || "Your answers help us prepare the best test series for you."}
                      </p>

                      {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-950 flex items-center gap-2">
                          <span className="text-base">🎁</span>
                          <span>
                            <strong>Incentive:</strong> {activePreviewSurvey.settings.rewardTitle || "Validity Extension"}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            1. What mock test or paper do you need next?
                          </label>
                          <input
                            type="text"
                            placeholder="Type your response…"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            2. Test difficulty calibration:
                          </label>
                          <div className="flex gap-2">
                            {["Easy", "Moderate", "Standard", "Difficult"].map((lvl) => (
                              <span
                                key={lvl}
                                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
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
                          alert("Response recorded in sandbox environment.");
                          setSideDrawerOpen(false);
                        }}
                        className="rounded-xl bg-[#0055a2] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#004280] cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mode 2: Center Popup Modal */}
            {previewMode === "popup_modal" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#0055a2] uppercase tracking-wider">
                        Candidate Survey
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">
                        {activePreviewSurvey?.title || "Form Title"}
                      </h4>
                    </div>
                    <span className="text-slate-400 text-xs">✕</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activePreviewSurvey?.description || "Your input helps shape the syllabus coverage for upcoming mock exams."}
                  </p>

                  {activePreviewSurvey?.settings?.rewardType && activePreviewSurvey.settings.rewardType !== "none" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-950 flex items-center gap-2">
                      <span className="text-base">🎁</span>
                      <span>
                        <strong>Incentive:</strong> {activePreviewSurvey.settings.rewardTitle || "Bonus Validity Extension"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 cursor-pointer">Skip for now</span>
                    <button
                      type="button"
                      onClick={() => alert("Modal action simulated.")}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
                    >
                      Complete 1-Min Form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SUBMISSIONS & RESPONSES EXPLORER
      ======================================================== */}
      {activeTab === "responses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                All Recorded Student Submissions ({filteredResponses.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect what candidates submitted, contact information, and question responses.
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

          {/* Search & Form Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <input
                type="text"
                placeholder="Search submissions by candidate name, phone, email, or answer keyword…"
                value={responseSearchTerm}
                onChange={(e) => setResponseSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={responseSurveyFilter}
              onChange={(e) => setResponseSurveyFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">All Forms</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Submissions Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            {loadingResponses ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <span className="inline-block animate-spin mr-2">⏳</span> Loading submissions data…
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No candidate responses found matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Submission Time</th>
                      <th className="p-3.5">Candidate Name</th>
                      <th className="p-3.5">Mobile</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Form Name</th>
                      <th className="p-3.5">Answer Summary</th>
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
                          {r.survey_title || "Dynamic Form"}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-slate-600">
                          {r.answers.map((a) => a.answer_text).join(" • ") || "No answer text"}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedResponseDetail(r)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            View &rarr;
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
                      Candidate Submission
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
                    Recorded Answers
                  </h4>
                  {selectedResponseDetail.answers.map((a, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-white p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Item #{idx + 1}</span>
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

      {/* ========================================================
          CREATE NEW FORM MODAL DIALOG
      ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055a2]">
                  New Campaign
                </span>
                <h3 className="text-base font-black text-slate-900">Create New Survey Form</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gather student needs, syllabus demand, or test difficulty feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Form Title *</label>
                <input
                  type="text"
                  placeholder="e.g. APPSC Group 2 Core Subject Feedback"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Category / Purpose</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Syllabus & Exam Demand">Syllabus &amp; Exam Demand</option>
                  <option value="Question Quality & Difficulty">Question Quality &amp; Difficulty Feedback</option>
                  <option value="New User Onboarding">New User Onboarding (0 Mock Tests Taken)</option>
                  <option value="Experienced Student Deep Dive">Experienced Student Deep Dive (5+ Tests)</option>
                  <option value="Custom Research">Custom Information Request</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Description / Subtitle</label>
                <input
                  type="text"
                  placeholder="Optional prompt shown to students"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Incentive / Reward Offered</label>
                  <select
                    value={newRewardType}
                    onChange={(e) => setNewRewardType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="none">None (Standard Voluntary Feedback)</option>
                    <option value="validity_extension">⏳ Mock Test Validity Extension (+30 or +60 Days)</option>
                    <option value="free_pass">🎟️ Free Mock Test Pass</option>
                    <option value="study_notes">📚 Free Study Notes PDF</option>
                    <option value="discount_code">🏷️ Special Discount Code</option>
                  </select>
                </div>

                {newRewardType !== "none" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Reward Display Title</label>
                    <input
                      type="text"
                      placeholder="e.g. +30 Days Free Mock Pass Validity"
                      value={newRewardTitle}
                      onChange={(e) => setNewRewardTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-[#0055a2] px-5 py-2 text-xs font-bold text-white hover:bg-[#004280] disabled:opacity-60 transition cursor-pointer shadow-2xs"
                >
                  {isCreating ? "Creating…" : "Create & Open Builder →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
