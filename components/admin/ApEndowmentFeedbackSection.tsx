"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getApEndowmentFeedbackSummaryAction,
  deleteApEndowmentFeedbackAction,
  toggleApEndowmentStatusAction,
  updateApEndowmentMetaAction,
  clearAllApEndowmentResponsesAction,
  saveApEndowmentSurveyConditionsAction,
  type ApEndowmentFeedbackSummary,
} from "@/app/actions/ap-endowment-feedback";
import {
  AP_EO_CAMPAIGN_EXPIRY_MS,
  DEFAULT_SURVEY_CONDITIONS,
  type ApEndowmentSurveyConditions,
} from "@/lib/campaigns/ap-endowment";

export function ApEndowmentFeedbackSection({ surveyIndex = 1 }: { surveyIndex?: number } = {}) {
  const [data, setData] = useState<ApEndowmentFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  // Copy Link State
  const [copiedLink, setCopiedLink] = useState(false);

  // Active / Deactivate Status State
  const [isActive, setIsActive] = useState(true);

  // Edit Title State
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("AP Endowment Officer — Subject Priority Responses");
  const [editTitle, setEditTitle] = useState("AP Endowment Officer — Subject Priority Responses");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Zoho Survey Conditions State
  const [showSettings, setShowSettings] = useState(false);
  const [conditions, setConditions] = useState<ApEndowmentSurveyConditions>(DEFAULT_SURVEY_CONDITIONS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Delete State
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedbackSafely = useCallback(async (): Promise<ApEndowmentFeedbackSummary> => {
    const emptySummary: ApEndowmentFeedbackSummary = {
      totalResponses: 0,
      paper1Count: 0,
      paper2Count: 0,
      bothCount: 0,
      recentResponses: [],
    };

    // Strategy 1: Server Action
    try {
      const res = await getApEndowmentFeedbackSummaryAction();
      if (res && res.totalResponses !== undefined) {
        return res;
      }
    } catch (err) {
      console.warn("Server action getApEndowmentFeedbackSummaryAction failed:", err);
    }

    // Strategy 2: Dedicated HTTP GET API route
    try {
      const apiRes = await fetch("/api/admin/feedback", { cache: "no-store" });
      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        if (apiJson && apiJson.totalResponses !== undefined) {
          return apiJson;
        }
      }
    } catch (err) {
      console.warn("API /api/admin/feedback failed:", err);
    }

    return emptySummary;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFeedbackSafely();
      setData(res);
    } catch {
      setData({
        totalResponses: 0,
        paper1Count: 0,
        paper2Count: 0,
        bothCount: 0,
        recentResponses: [],
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFeedbackSafely]);

  useEffect(() => {
    setIsExpired(Date.now() > AP_EO_CAMPAIGN_EXPIRY_MS);
    if (typeof window !== "undefined") {
      const savedActive = localStorage.getItem("varadhi_ap_endowment_survey_active");
      if (savedActive !== null) {
        setIsActive(savedActive === "true");
      }
      const savedMeta = localStorage.getItem("varadhi_ap_endowment_survey_meta");
      if (savedMeta) {
        try {
          const parsed = JSON.parse(savedMeta);
          if (parsed.title) {
            setTitle(parsed.title);
            setEditTitle(parsed.title);
          }
        } catch {
          // ignore parsing error
        }
      }
      const savedDeleted = localStorage.getItem("varadhi_ap_endowment_survey_deleted");
      if (savedDeleted === "true") {
        setIsDeleted(true);
      }
      const savedConditions = localStorage.getItem("varadhi_ap_endowment_survey_conditions");
      if (savedConditions) {
        try {
          const parsedCond = JSON.parse(savedConditions);
          setConditions((prev) => ({ ...prev, ...parsedCond }));
        } catch {
          // ignore parsing error
        }
      }
    }

    let ignore = false;
    void (async () => {
      try {
        const res = await fetchFeedbackSafely();
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setData({
            totalResponses: 0,
            paper1Count: 0,
            paper2Count: 0,
            bothCount: 0,
            recentResponses: [],
          });
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchFeedbackSafely]);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = isActive ? `${origin}/survey` : `${origin}/survey?campaign=ap-endowment`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggle = async () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_ap_endowment_survey_active", String(nextActive));
    }
    await toggleApEndowmentStatusAction(nextActive);
  };

  const startEdit = () => {
    setEditTitle(title);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSavingEdit(true);
    const newTitle = editTitle.trim();
    setTitle(newTitle);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "varadhi_ap_endowment_survey_meta",
        JSON.stringify({ title: newTitle })
      );
    }
    await updateApEndowmentMetaAction(newTitle, "");
    setIsSavingEdit(false);
    setIsEditing(false);
  };

  const handleDeleteSurvey = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"?\n\nThis will remove all recorded responses for this survey.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    await clearAllApEndowmentResponsesAction();
    setIsDeleted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_ap_endowment_survey_deleted", "true");
    }
    setIsDeleting(false);
    await loadData();
  };

  const handleRestoreSurvey = () => {
    setIsDeleted(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("varadhi_ap_endowment_survey_deleted");
    }
  };

  const handleSaveConditions = async () => {
    setIsSavingSettings(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_ap_endowment_survey_conditions", JSON.stringify(conditions));
    }
    await saveApEndowmentSurveyConditionsAction(conditions);
    setIsSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleResetConditions = async () => {
    setConditions(DEFAULT_SURVEY_CONDITIONS);
    if (typeof window !== "undefined") {
      localStorage.removeItem("varadhi_ap_endowment_survey_conditions");
    }
    await saveApEndowmentSurveyConditionsAction(DEFAULT_SURVEY_CONDITIONS);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student feedback response?")) {
      return;
    }
    setDeletingId(id);
    await deleteApEndowmentFeedbackAction(id);
    await loadData();
    setDeletingId(null);
  };

  const filteredResponses = useMemo(() => {
    if (!data?.recentResponses) return [];
    if (!searchTerm.trim()) return data.recentResponses;
    const term = searchTerm.toLowerCase().trim();
    return data.recentResponses.filter((r) =>
      r.studentName.toLowerCase().includes(term) ||
      r.studentEmail.toLowerCase().includes(term) ||
      (r.studentPhone && r.studentPhone.toLowerCase().includes(term)) ||
      r.paperChoice.toLowerCase().includes(term) ||
      r.subjectFocus.toLowerCase().includes(term) ||
      (r.specificTopics && r.specificTopics.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const handleExportCSV = () => {
    if (!data || data.recentResponses.length === 0) return;

    const headers = [
      "Submitted At",
      "Student Name",
      "Email",
      "Phone",
      "Paper Choice",
      "Subject Focus Priority",
      "Specific Topics / Notes",
    ];

    const escapeCSV = (val: string | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = data.recentResponses.map((r) => [
      escapeCSV(new Date(r.createdAt).toLocaleString()),
      escapeCSV(r.studentName),
      escapeCSV(r.studentEmail),
      escapeCSV(r.studentPhone || ""),
      escapeCSV(r.paperChoice),
      escapeCSV(r.subjectFocus),
      escapeCSV(r.specificTopics || ""),
    ]);

    const csvContent = [headers.map(escapeCSV).join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ap_endowment_officer_subject_priorities_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isDeleted) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:p-5 text-xs text-slate-600 shadow-2xs">
        <div>
          <span className="font-semibold text-slate-800">Survey {surveyIndex}</span> (AP Endowment Officer — Subject Priority Responses) was deleted.
        </div>
        <button
          type="button"
          onClick={handleRestoreSurvey}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs self-start sm:self-auto"
        >
          ↺ Restore Survey {surveyIndex}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {isEditing ? (
            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <label className="block text-xs font-bold text-slate-800">Survey Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition shadow-2xs"
                >
                  {isSavingEdit ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Clean Tags Row - identical to Survey 2's clean horizontal flow */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  Survey {surveyIndex}
                </span>
                {isActive ? (
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
                  {loading ? "…" : data?.totalResponses ?? 0}{" "}
                  {(data?.totalResponses ?? 0) === 1 ? "response" : "responses"}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                  AP Endowment Officer
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                  {isExpired ? "Campaign Expired" : "Targeted 1-Week Campaign"}
                </span>
              </div>

              {/* Title without long text paragraph */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl break-words tracking-tight">
                  {title}
                </h3>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                <span>Created 9/2/2026</span>
                <span className="text-slate-300">•</span>
                <span>
                  Public link:{" "}
                  <code className="rounded-md bg-slate-50 border border-slate-200/90 px-1.5 py-0.5 font-mono text-slate-700">
                    {isActive ? "/survey" : "/survey?campaign=ap-endowment"}
                  </code>
                </span>
                {isActive && (
                  <a
                    href="/survey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 ml-1 transition"
                  >
                    Open public page ↗
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Buttons Row - all in the exact same size with whitespace-nowrap */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0 sm:self-center">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
            title="Copy link to share with students"
          >
            {copiedLink ? "✓ Copied!" : "🔗 Copy Link"}
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            onClick={() => (isEditing ? setIsEditing(false) : startEdit())}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
            title="Edit title"
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            onClick={handleDeleteSurvey}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50/60 hover:border-red-200 disabled:opacity-40 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
            title="Delete entire survey and its responses"
          >
            {isDeleting ? "Deleting…" : "🗑️ Delete"}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap ${
              showSettings
                ? "bg-slate-100 border-slate-300 text-slate-900"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
            title="Zoho-style survey display rules and conditions"
          >
            {showSettings ? "✕ Settings" : "⚙️ Settings"}
          </button>

          <button
            type="button"
            onClick={() => setShowResponses((prev) => !prev)}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 touch-manipulation text-center whitespace-nowrap"
          >
            {showResponses ? "Hide Responses" : `View Responses (${data?.totalResponses ?? 0})`}
          </button>
        </div>
      </div>

      {/* Zoho Survey Conditions Box */}
      {showSettings && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>⚙️</span> Survey Conditions & Re-appearance Rules (Zoho-style)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Control target audience and student re-trigger conditions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Condition 1: Once student filled form */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  1. Student already submitted the form
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Can this survey appear again to a student who has already completed and submitted it?
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reappearIfSubmitted"
                    checked={!conditions.reappearIfSubmitted}
                    onChange={() =>
                      setConditions((prev) => ({ ...prev, reappearIfSubmitted: false }))
                    }
                    className="text-slate-900 focus:ring-slate-400"
                  />
                  <span>No (Do not show again)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reappearIfSubmitted"
                    checked={conditions.reappearIfSubmitted}
                    onChange={() =>
                      setConditions((prev) => ({ ...prev, reappearIfSubmitted: true }))
                    }
                    className="text-slate-900 focus:ring-slate-400"
                  />
                  <span>Yes (Re-appear)</span>
                </label>
              </div>

              {conditions.reappearIfSubmitted && (
                <div className="pt-1 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Re-appearance Interval
                  </label>
                  <select
                    value={conditions.submittedIntervalDays}
                    onChange={(e) =>
                      setConditions((prev) => ({
                        ...prev,
                        submittedIntervalDays: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                  >
                    <option value={3}>After 3 days</option>
                    <option value={7}>After 7 days (1 week)</option>
                    <option value={14}>After 14 days (2 weeks)</option>
                    <option value={30}>After 30 days (1 month)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Condition 2: Once student skipped / dismissed */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  2. Student skipped / closed the form
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Should the survey popup appear again if the student clicked &ldquo;Skip for now&rdquo;?
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reappearIfSkipped"
                    checked={!conditions.reappearIfSkipped}
                    onChange={() =>
                      setConditions((prev) => ({ ...prev, reappearIfSkipped: false }))
                    }
                    className="text-slate-900 focus:ring-slate-400"
                  />
                  <span>No (Do not re-prompt)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reappearIfSkipped"
                    checked={conditions.reappearIfSkipped}
                    onChange={() =>
                      setConditions((prev) => ({ ...prev, reappearIfSkipped: true }))
                    }
                    className="text-slate-900 focus:ring-slate-400"
                  />
                  <span>Yes (Re-prompt student)</span>
                </label>
              </div>

              {conditions.reappearIfSkipped && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Max Times to Appear
                    </label>
                    <select
                      value={conditions.maxSkipAppearances}
                      onChange={(e) =>
                        setConditions((prev) => ({
                          ...prev,
                          maxSkipAppearances: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                    >
                      <option value={1}>1 time only</option>
                      <option value={2}>2 times</option>
                      <option value={3}>3 times</option>
                      <option value={5}>5 times</option>
                      <option value={0}>Unlimited</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Interval Between Prompts
                    </label>
                    <select
                      value={conditions.skipIntervalHours}
                      onChange={(e) =>
                        setConditions((prev) => ({
                          ...prev,
                          skipIntervalHours: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                    >
                      <option value={4}>After 4 hours</option>
                      <option value={12}>After 12 hours</option>
                      <option value={24}>After 24 hours (1 day)</option>
                      <option value={48}>After 48 hours (2 days)</option>
                      <option value={72}>After 72 hours (3 days)</option>
                      <option value={168}>After 7 days (1 week)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Save & Reset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleResetConditions}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Reset to Default Rules
            </button>

            <div className="flex items-center gap-2">
              {settingsSaved && (
                <span className="text-xs font-semibold text-emerald-700">✓ Conditions saved!</span>
              )}
              <button
                type="button"
                onClick={handleSaveConditions}
                disabled={isSavingSettings}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95"
              >
                {isSavingSettings ? "Saving…" : "Save Conditions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid - Light cement boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 text-center shadow-2xs hover:bg-slate-50 transition">
          <strong className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {loading ? "…" : data?.totalResponses ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Responses
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 text-center shadow-2xs hover:bg-slate-50 transition">
          <strong className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {loading ? "…" : data?.paper1Count ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Paper 1 Focus
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 text-center shadow-2xs hover:bg-slate-50 transition">
          <strong className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {loading ? "…" : data?.paper2Count ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Paper 2 Focus
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 text-center shadow-2xs hover:bg-slate-50 transition">
          <strong className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {loading ? "…" : data?.bothCount ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Both Papers
          </span>
        </div>
      </div>

      {/* Responses Table & Search */}
      {showResponses && (
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, email, phone, topic…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 pl-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                title="Refresh survey responses"
              >
                {loading ? "…" : "↻ Refresh"}
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={loading || !data || data.totalResponses === 0}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 shadow-2xs transition active:scale-95 touch-manipulation whitespace-nowrap"
                title="Export all responses as CSV"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs sm:text-sm font-semibold text-slate-500">
              Loading student responses…
            </p>
          ) : !data || data.recentResponses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No responses collected yet</p>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                When students who have attempted AP Endowment Officer mock tests visit the site, they will see the form. Their priorities will appear here.
              </p>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-xs sm:text-sm text-slate-500">
              No responses matching &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Paper Choice</th>
                    <th className="py-2.5 px-3">Priority Subject Focus</th>
                    <th className="py-2.5 px-3">Notes / Specific Topics</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="block font-semibold text-slate-900">{r.studentName}</span>
                        <span className="block text-xs text-slate-500">{r.studentEmail}</span>
                        {r.studentPhone && (
                          <span className="inline-block mt-0.5 rounded-md bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                            📱 {r.studentPhone.startsWith("+") ? r.studentPhone : `+91 ${r.studentPhone}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {r.paperChoice.includes("Paper 1")
                            ? "Paper 1"
                            : r.paperChoice.includes("Paper 2")
                            ? "Paper 2"
                            : "Both Papers"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 break-words">
                        {r.subjectFocus}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600 break-words">
                        {r.specificTopics || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition"
                          title="Delete feedback response"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

