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

export default function AdminSurveysPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-2xs">
          <div className="flex flex-col items-center gap-3">
            <progress aria-label="Loading Surveys and Feedback" className="loading-spinner" />
            <p className="text-xs font-semibold text-slate-600">Loading Surveys &amp; Feedback…</p>
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

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"surveys" | "responses">(
    initialTab === "responses" ? "responses" : "surveys",
  );

  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openSettingsSurveyId, setOpenSettingsSurveyId] = useState<string | null>(null);

  const [allResponses, setAllResponses] = useState<AdminAggregatedResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseSearchTerm, setResponseSearchTerm] = useState("");
  const [responseSurveyFilter, setResponseSurveyFilter] = useState("all");
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<AdminAggregatedResponse | null>(null);

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
      setErrorMsg("Failed to reload surveys.");
    } finally {
      setLoading(false);
    }
  }, [fetchSurveysSafely]);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("varadhi_cached_surveys_list");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSurveys(parsed);
            setLoading(false);
          }
        }
      } catch {}
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }

    void (async () => {
      try {
        const surveysData = await fetchSurveysSafely();
        if (!ignore) {
          setSurveys(surveysData);
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
  }, [fetchSurveysSafely]);

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
        `Are you sure you want to permanently delete "${title}"?\n\nThis will remove all associated questions and student submissions.`,
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Compact Header & Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">
              Feedback &amp; Research
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Student Surveys & Feedback
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Create candidate feedback surveys, configure display rules, and review student submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="text-sm leading-none">+</span>
            <span>Create Survey</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Surveys
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="admin-stat text-2xl font-bold text-slate-950">{1 + surveys.length}</span>
              <span className="text-xs font-medium text-slate-500">
                {1 + surveys.length === 1 ? "survey" : "surveys"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Active Campaigns
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="admin-stat text-2xl font-bold text-emerald-800">{1 + activeSurveysCount}</span>
              <span className="text-xs font-medium text-emerald-800">live</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Candidate Responses
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="admin-stat text-2xl font-bold text-slate-950">{totalResponsesCount}</span>
              <span className="text-xs font-medium text-slate-500">submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Focused 2-Tab Navigation Bar */}
      <div role="tablist" aria-label="Survey workspace sections" className="admin-tablist border-b border-slate-200 pb-1 gap-1">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "surveys"}
          onClick={() => setActiveTab("surveys")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "surveys"
              ? "border-teal-800 text-teal-950"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Survey Forms</span>
          <span
            className={`admin-stat rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
              activeTab === "surveys" ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-700"
            }`}
          >
            {1 + surveys.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "responses"}
          onClick={() => setActiveTab("responses")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "responses"
              ? "border-teal-800 text-teal-950"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Submissions &amp; Feedback</span>
          <span
            className={`admin-stat rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
              activeTab === "responses" ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-700"
            }`}
          >
            {totalResponsesCount}
          </span>
        </button>
      </div>

      {/* TAB 1: SURVEY FORMS */}
      {activeTab === "surveys" && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <input
                type="search"
                placeholder="Search surveys by title or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
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
                    ? "bg-teal-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                Draft ({Math.max(0, sortedSurveys.length - activeSurveysCount)})
              </button>
            </div>
          </div>

          {/* Targeted Exam Survey Card */}
          <ApEndowmentFeedbackSection />

          {/* Dynamic Surveys List */}
          <div className="space-y-3.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-2xs">
                <progress aria-label="Loading survey list" className="loading-spinner" />
                <span className="text-xs font-semibold text-slate-600">Loading surveys…</span>
              </div>
            ) : displayedSurveys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                <p className="font-bold text-slate-800 text-sm">No custom survey forms match this filter.</p>
                <p className="text-xs text-slate-500 mt-1">Create a survey form to gather targeted candidate feedback.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 cursor-pointer"
                >
                  + Create Survey
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
                    className="admin-card-deferred flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                          Survey {surveyNumber}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggle(survey.id, survey.is_active)}
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition cursor-pointer border ${
                            survey.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle Active / Draft"
                        >
                          {survey.is_active ? "Active" : "Draft"}
                        </button>

                        <span className="inline-flex items-center rounded-md bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-0.5 text-xs font-medium">
                          {sSettings?.targetUserType === "new_users"
                            ? "New Users"
                            : sSettings?.targetUserType === "returning_users"
                            ? `Active (${sSettings?.minMockTestsTaken || 1}+ Tests)`
                            : sSettings?.targetUserType === "specific_users"
                            ? "Specific Candidates"
                            : sSettings?.targetAudience === "ap_endowment"
                            ? "AP Endowment"
                            : sSettings?.targetAudience === "tg_police"
                            ? "TG Police"
                            : "All Students"}
                        </span>

                        <span className="admin-stat inline-flex items-center rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 px-2.5 py-0.5 text-xs font-medium">
                          {survey.response_count || 0}{" "}
                          {survey.response_count === 1 ? "response" : "responses"}
                        </span>
                      </div>

                      <Link
                        href={`/admin/surveys/${survey.id}`}
                        prefetch={false}
                        className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 shadow-2xs transition text-center whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        Manage Questions &amp; Responses &rarr;
                      </Link>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Form Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none"
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
                            className="rounded-lg bg-teal-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-900 cursor-pointer shadow-2xs"
                          >
                            {isSavingEdit ? "Saving…" : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSurveyId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold text-slate-950 sm:text-xl break-words tracking-tight">
                          {survey.title}
                        </h3>
                        {survey.description && (
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
                            {survey.description}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2.5 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                        <span className="text-slate-300" aria-hidden="true">&middot;</span>
                        <span>
                          Public link:{" "}
                          <code className="rounded bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 font-mono text-slate-700">
                            {survey.is_active ? "/survey" : `/survey?id=${survey.id}`}
                          </code>
                        </span>
                        {survey.is_active && (
                          <a
                            href="/survey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-teal-800 hover:underline ml-1"
                          >
                            Open public page ↗
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(survey.id, survey.is_active)}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                        >
                          {copiedId === survey.id ? "Copied" : "Copy Link"}
                        </button>

                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingSurveyId(null) : startEdit(survey))}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenSettingsSurveyId((prev) => (prev === survey.id ? null : survey.id))
                          }
                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer shadow-2xs ${
                            openSettingsSurveyId === survey.id
                              ? "bg-teal-50 text-teal-950 border-teal-300 font-semibold"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {openSettingsSurveyId === survey.id ? "Close Settings" : "Settings"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                          disabled={deletingId === survey.id}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-40 transition cursor-pointer shadow-2xs"
                        >
                          {deletingId === survey.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>

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

      {/* TAB 2: SUBMISSIONS & FEEDBACK */}
      {activeTab === "responses" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Recorded Student Submissions ({filteredResponses.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect candidate responses, phone numbers, email addresses, and export filtered CSV files.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportResponsesCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer self-start sm:self-auto"
            >
              Export All Responses (CSV)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="search"
              placeholder="Search submissions by candidate name, phone, email, or keyword…"
              value={responseSearchTerm}
              onChange={(e) => setResponseSearchTerm(e.target.value)}
              className="w-full sm:flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none"
            />
            <select
              value={responseSurveyFilter}
              onChange={(e) => setResponseSurveyFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-700 focus:outline-none"
            >
              <option value="all">All Surveys</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            {loadingResponses ? (
              <div className="flex items-center justify-center gap-2 p-10 text-center text-slate-500 text-xs">
                <progress aria-label="Loading submissions data" className="loading-spinner" />
                <span className="font-semibold text-slate-600">Loading submissions…</span>
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No candidate responses found matching this filter.
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
                      <th className="p-3.5">Survey</th>
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
                        <td className="p-3.5 font-semibold text-teal-800">
                          {r.survey_title || "Survey"}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-slate-600">
                          {r.answers.map((a) => a.answer_text).join(" · ") || "No answer text"}
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

          {selectedResponseDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      Candidate Submission
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
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
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mobile</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedResponseDetail.respondentPhone || selectedResponseDetail.respondentContact || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Email</span>
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

      {/* CREATE SURVEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  New Survey
                </span>
                <h3 className="text-base font-bold text-slate-900">Create Survey Form</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create a survey to gather syllabus priorities or student feedback.
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short prompt displayed at the top of the survey"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-teal-800 px-5 py-2 text-xs font-bold text-white hover:bg-teal-900 disabled:opacity-60 transition cursor-pointer shadow-2xs"
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
