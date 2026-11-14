"use client";

import { useState, useEffect, useCallback, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminSurveyDetail,
  getAdminSurveyResponses,
  saveSurveyQuestion,
  updateSurveyQuestion,
  deleteSurveyQuestion,
  reorderSurveyQuestions,
  updateAdminSurvey,
  deleteAdminSurvey,
  toggleSurveyStatus,
  deleteSurveyResponse,
  clearAllSurveyResponses,
  type AdminSurveyResponse,
  type AdminSurveyDetail,
  type AdminSurveyQuestion,
} from "@/app/actions/surveys-admin";
import { BackButton } from "@/components/admin/BackButton";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export default function AdminSurveyEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id: surveyId } = use(params);
  const router = useRouter();

  const [survey, setSurvey] = useState<AdminSurveyDetail | null>(null);
  const [questions, setQuestions] = useState<AdminSurveyQuestion[]>([]);
  const [responses, setResponses] = useState<AdminSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Survey Title / Description State
  const [isEditingSurvey, setIsEditingSurvey] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);

  // Add Question Form State
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("");
  const [qRequired, setQRequired] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // Edit Question State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editQType, setEditQType] = useState("text");
  const [editQOptions, setEditQOptions] = useState("");
  const [editQRequired, setEditQRequired] = useState(false);
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);

  // Filter / Search Responses
  const [responseSearchTerm, setResponseSearchTerm] = useState("");

  // Action status indicators
  const [isDeletingSurvey, setIsDeletingSurvey] = useState(false);
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null);

  const fetchSurveySafely = useCallback(async (id: string) => {
    try {
      const data = await getAdminSurveyDetail(id);
      if (data.survey) return data;
    } catch (err) {
      console.warn("getAdminSurveyDetail failed, falling back to browser Supabase:", err);
    }

    try {
      const supabase = createBrowserClient();
      const [{ data: survey }, { data: questions }, { data: responses }] = await Promise.all([
        supabase
          .from("dynamic_surveys")
          .select("id, title, description, is_active, created_at")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("dynamic_survey_questions")
          .select("id, survey_id, question_text, question_type, options, display_order, is_required")
          .eq("survey_id", id)
          .order("display_order", { ascending: true }),
        supabase
          .from("dynamic_survey_responses")
          .select("id, submitted_at, user_id, answers:dynamic_survey_answers(question_id, answer_text)")
          .eq("survey_id", id)
          .order("submitted_at", { ascending: false }),
      ]);

      if (survey) {
        return {
          survey,
          questions: (questions as AdminSurveyQuestion[]) || [],
          responses: (responses as any[]) || [],
          error: null,
        };
      }
    } catch (err) {
      console.warn("Browser Supabase survey detail fallback failed:", err);
    }

    return {
      survey: null,
      questions: [],
      responses: [],
      error: "Survey not found.",
    };
  }, []);

  const fetchSurveyData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSurveySafely(surveyId);
      if (data.error || !data.survey) {
        setErrorMessage(data.error || "Survey not found.");
      } else {
        setSurvey(data.survey);
        setQuestions(data.questions);
        setResponses(data.responses);
        setEditTitle(data.survey.title);
        setEditDescription(data.survey.description || "");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load survey.");
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchSurveySafely]);

  const loadResponsesOnly = useCallback(async () => {
    setLoadingResponses(true);
    try {
      const rData = await getAdminSurveyResponses(surveyId);
      setResponses(rData || []);
    } catch (err) {
      console.error("Error refreshing responses:", err);
    } finally {
      setLoadingResponses(false);
    }
  }, [surveyId]);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
    void (async () => {
      try {
        const data = await fetchSurveySafely(surveyId);
        if (!ignore) {
          if (data.error || !data.survey) {
            setErrorMessage(data.error || "Survey not found.");
          } else {
            setSurvey(data.survey);
            setQuestions(data.questions);
            setResponses(data.responses);
            setEditTitle(data.survey.title);
            setEditDescription(data.survey.description || "");
          }
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load survey.");
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [surveyId, fetchSurveySafely]);

  // Survey Meta Handlers
  const handleToggleSurveyStatus = async () => {
    if (!survey) return;
    const nextStatus = !survey.is_active;
    await toggleSurveyStatus(survey.id, nextStatus);
    setSurvey((prev) => (prev ? { ...prev, is_active: nextStatus } : null));
  };

  const handleSaveSurveyMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !survey) return;
    setIsSavingSurvey(true);
    await updateAdminSurvey(survey.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    setSurvey((prev) =>
      prev
        ? {
            ...prev,
            title: editTitle.trim(),
            description: editDescription.trim() || null,
          }
        : null
    );
    setIsSavingSurvey(false);
    setIsEditingSurvey(false);
  };

  const handleDeleteSurvey = async () => {
    if (!survey) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete "${survey.title}"?\n\nThis will remove all questions and ${responses.length} response(s). This action cannot be undone.`
      )
    ) {
      return;
    }
    setIsDeletingSurvey(true);
    const res = await deleteAdminSurvey(survey.id);
    if (res.success) {
      router.push("/admin/surveys");
    } else {
      alert(res.error || "Failed to delete survey.");
      setIsDeletingSurvey(false);
    }
  };

  // Question Handlers
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    setIsSavingQuestion(true);
    const optionsArray =
      qType === "radio"
        ? qOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    await saveSurveyQuestion(
      surveyId,
      qText.trim(),
      qType,
      optionsArray,
      questions.length,
      qRequired
    );
    setQText("");
    setQOptions("");
    setQRequired(false);
    setIsSavingQuestion(false);
    fetchSurveyData();
  };

  const startEditQuestion = (q: AdminSurveyQuestion) => {
    setEditingQuestionId(q.id);
    setEditQText(q.question_text);
    setEditQType(q.question_type);
    setEditQOptions((q.options || []).join(", "));
    setEditQRequired(Boolean(q.is_required));
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestionId || !editQText.trim()) return;

    setIsUpdatingQuestion(true);
    const optionsArray =
      editQType === "radio"
        ? editQOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    await updateSurveyQuestion(editingQuestionId, surveyId, {
      questionText: editQText.trim(),
      questionType: editQType,
      options: optionsArray,
      isRequired: editQRequired,
    });

    setIsUpdatingQuestion(false);
    setEditingQuestionId(null);
    fetchSurveyData();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteSurveyQuestion(questionId, surveyId);
      fetchSurveyData();
    }
  };

  const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const questionOrders = reordered.map((q, idx) => ({
      id: q.id,
      display_order: idx,
    }));

    setQuestions(reordered.map((q, idx) => ({ ...q, display_order: idx })));
    await reorderSurveyQuestions(surveyId, questionOrders);
  };

  // Response Handlers
  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this student response?")) return;
    setDeletingResponseId(responseId);
    await deleteSurveyResponse(responseId, surveyId);
    setResponses((prev) => prev.filter((r) => r.id !== responseId));
    setDeletingResponseId(null);
  };

  const handleClearAllResponses = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ALL ${responses.length} responses for this survey?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }
    await clearAllSurveyResponses(surveyId);
    setResponses([]);
  };

  // Filtered responses based on search term
  const filteredResponses = useMemo(() => {
    if (!responseSearchTerm.trim()) return responses;
    const term = responseSearchTerm.toLowerCase().trim();
    return responses.filter((r) => {
      const matchName = r.respondentName.toLowerCase().includes(term);
      const matchEmail = (r.respondentEmail || "").toLowerCase().includes(term);
      const matchPhone = (r.respondentPhone || r.respondentContact || "")
        .toLowerCase()
        .includes(term);
      const matchAnswer = r.answers.some((a) =>
        a.answer_text.toLowerCase().includes(term)
      );
      return matchName || matchEmail || matchPhone || matchAnswer;
    });
  }, [responses, responseSearchTerm]);

  // URL helpers
  const getSurveyUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return survey?.is_active ? `${origin}/survey` : `${origin}/survey?id=${surveyId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSurveyUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = [
      "Submitted At",
      "Student Name",
      "Account Type",
      "Mobile / Phone",
      "Email",
      ...questions.map((q) => q.question_text),
    ];

    const escapeCSV = (val: string | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = responses.map((r) => {
      const phone =
        r.respondentPhone ||
        (r.respondentContact && !r.respondentContact.includes("@") ? r.respondentContact : "");
      const email =
        r.respondentEmail ||
        (r.respondentContact && r.respondentContact.includes("@") ? r.respondentContact : "");
      const accountType = r.user_id ? "Registered Student" : "Public Link";

      const answerMap = new Map(r.answers.map((a) => [a.question_id, a.answer_text]));
      const answerCols = questions.map((q) => answerMap.get(q.id) || "");

      return [
        escapeCSV(new Date(r.submitted_at).toLocaleString()),
        escapeCSV(r.respondentName),
        escapeCSV(accountType),
        escapeCSV(phone ? (phone.startsWith("+") ? phone : `+91 ${phone}`) : ""),
        escapeCSV(email),
        ...answerCols.map((ans) => escapeCSV(ans)),
      ].join(",");
    });

    const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (survey?.title || "survey").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    link.download = `${safeTitle}_responses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading State
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <BackButton fallbackHref="/admin/surveys" label="← Back to Surveys & Feedback" />
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <span className="inline-block animate-spin mr-2">⏳</span> Loading survey details…
        </div>
      </div>
    );
  }

  // Error State
  if (errorMessage || !survey) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <BackButton fallbackHref="/admin/surveys" label="← Back to Surveys & Feedback" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-red-900">Unable to load survey</h2>
          <p className="text-sm text-red-700">{errorMessage || "Survey could not be found."}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchSurveyData}
              className="rounded-xl bg-red-700 px-5 py-2 text-xs font-bold text-white hover:bg-red-800 transition"
            >
              ↻ Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/surveys")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Return to Survey List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      {/* Back button */}
      <BackButton
        fallbackHref="/admin/surveys"
        label="← Back to Surveys & Feedback"
        className="inline-flex items-center py-1 text-sm font-bold text-teal-600 hover:underline touch-manipulation"
      />

      {/* Survey Title & Status Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        {isEditingSurvey ? (
          <form onSubmit={handleSaveSurveyMeta} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Survey Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-base font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Survey Description / Instructions
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none"
                placeholder="Briefly explain what this survey is about and how students should answer…"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSavingSurvey}
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60 transition"
              >
                {isSavingSurvey ? "Saving…" : "Save Title & Description"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingSurvey(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl break-words">
                  {survey.title}
                </h1>
                {survey.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                    Active (Live)
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Draft Status
                  </span>
                )}
              </div>
              {survey.description ? (
                <p className="mt-1.5 text-sm text-slate-600 break-words">{survey.description}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400 italic">No description added yet.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingSurvey(true)}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-95 touch-manipulation"
              >
                ✏️ Edit Details
              </button>
              <button
                type="button"
                onClick={handleToggleSurveyStatus}
                className={`inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition active:scale-95 touch-manipulation ${
                  survey.is_active
                    ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {survey.is_active ? "Deactivate (Make Draft)" : "Activate (Make Live)"}
              </button>
              <button
                type="button"
                onClick={handleDeleteSurvey}
                disabled={isDeletingSurvey}
                className="inline-flex items-center rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-40 shadow-2xs transition active:scale-95 touch-manipulation"
              >
                {isDeletingSurvey ? "Deleting…" : "🗑️ Delete Survey"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shareable Link Box */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 sm:text-sm">
              Shareable Survey Link
            </h2>
            <p className="mt-1 font-mono text-xs sm:text-sm text-teal-950 break-all select-all">
              {getSurveyUrl()}
            </p>
            <p className="mt-1 text-xs text-teal-700">
              {survey.is_active
                ? "This survey is active. Students visiting /survey will see this survey directly."
                : "This survey is currently in draft. You and your team can test it using the link with ?id="}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition active:scale-95 touch-manipulation"
            >
              {copiedLink ? "✓ Copied Link!" : "📋 Copy Survey Link"}
            </button>
            <a
              href={survey.is_active ? "/survey" : `/survey?id=${surveyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-xl border border-teal-300 bg-white px-3.5 py-2.5 text-xs font-bold text-teal-900 shadow-sm hover:bg-teal-50 transition active:scale-95 touch-manipulation"
            >
              Open Survey ↗
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 min-w-0">
        {/* Left Side: Question Editor */}
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Survey Questions ({questions.length})
            </h2>
            <span className="text-xs text-slate-500">
              Arrange and configure questions
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const isEditingQ = editingQuestionId === q.id;

              if (isEditingQ) {
                return (
                  <form
                    key={q.id}
                    onSubmit={handleUpdateQuestion}
                    className="rounded-2xl border border-teal-300 bg-teal-50/50 p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                        Editing Question {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700">Question Text</label>
                      <input
                        type="text"
                        required
                        value={editQText}
                        onChange={(e) => setEditQText(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700">Input Type</label>
                      <select
                        value={editQType}
                        onChange={(e) => setEditQType(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="text">Short Text (Single line)</option>
                        <option value="textarea">Long Text (Multi-line paragraph)</option>
                        <option value="radio">Multiple Choice (Single select radio)</option>
                      </select>
                    </div>

                    {editQType === "radio" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Options (comma separated)
                        </label>
                        <input
                          type="text"
                          required
                          value={editQOptions}
                          onChange={(e) => setEditQOptions(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit_req_${q.id}`}
                        checked={editQRequired}
                        onChange={(e) => setEditQRequired(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor={`edit_req_${q.id}`} className="text-xs font-medium text-slate-700">
                        Require student to answer this question
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isUpdatingQuestion}
                        className="rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60 transition"
                      >
                        {isUpdatingQuestion ? "Saving…" : "Save Question"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(null)}
                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={q.id}
                  className="relative rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          #{i + 1}
                        </span>
                        {q.is_required && (
                          <span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                            Required
                          </span>
                        )}
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {q.question_type}
                        </span>
                      </div>

                      <p className="mt-1 font-bold text-slate-900 break-words text-sm sm:text-base">
                        {q.question_text}
                      </p>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Options:
                          </p>
                          <ul className="list-inside list-disc text-xs text-slate-600 space-y-0.5 pl-1">
                            {q.options.map((opt: string, idx: number) => (
                              <li key={idx} className="break-words">
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Question Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(i, "up")}
                        disabled={i === 0}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 transition"
                        title="Move question up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(i, "down")}
                        disabled={i === questions.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 transition"
                        title="Move question down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditQuestion(q)}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-teal-50 hover:text-teal-700 transition"
                        title="Edit Question"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 font-bold transition active:scale-95 touch-manipulation"
                        title="Delete Question"
                        aria-label={`Delete question ${i + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {questions.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 sm:p-8 text-center text-sm text-slate-500">
                No questions added yet. Add your first question below!
              </p>
            )}
          </div>

          {/* Add Question Form */}
          <form
            onSubmit={handleAddQuestion}
            className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4 sm:p-6 space-y-4"
          >
            <h3 className="font-bold text-teal-950 text-base sm:text-lg">Add New Question</h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-teal-900">Question Text</label>
              <input
                required
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                placeholder="e.g. Which exam or paper are you primarily preparing for?"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-teal-900">Input Type</label>
              <select
                value={qType}
                onChange={(e) => setQType(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
              >
                <option value="text">Short Text (Single line)</option>
                <option value="textarea">Long Text (Multi-line paragraph)</option>
                <option value="radio">Multiple Choice (Single select radio)</option>
              </select>
            </div>

            {qType === "radio" && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-teal-900">
                  Options (comma separated)
                </label>
                <input
                  required
                  type="text"
                  value={qOptions}
                  onChange={(e) => setQOptions(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                  placeholder="e.g. Subject-wise mocks, Full mock tests, Both"
                />
                <p className="mt-1 text-xs text-teal-700">Separate multiple choices with commas.</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add_is_required"
                checked={qRequired}
                onChange={(e) => setQRequired(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="add_is_required" className="text-xs font-semibold text-teal-900">
                Require student to answer this question
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingQuestion}
              className="w-full sm:w-auto rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70 transition active:scale-95 touch-manipulation inline-flex items-center justify-center"
            >
              {isSavingQuestion ? "Saving…" : "+ Add Question"}
            </button>
          </form>
        </section>

        {/* Right Side: Collected Responses */}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Collected Responses ({responses.length})
              </h2>
              <span className="text-xs text-slate-500">
                Real-time submissions from students
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {responses.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition active:scale-95 touch-manipulation"
                    title="Download all responses as a CSV spreadsheet"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllResponses}
                    className="inline-flex items-center rounded-xl border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                    title="Clear test submissions"
                  >
                    Clear All
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={loadResponsesOnly}
                disabled={loadingResponses}
                className="inline-flex items-center py-1 text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline touch-manipulation"
              >
                {loadingResponses ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>
          </div>

          {/* Search responses */}
          {responses.length > 0 && (
            <div className="relative">
              <input
                type="text"
                value={responseSearchTerm}
                onChange={(e) => setResponseSearchTerm(e.target.value)}
                placeholder="Search responses by student, phone, email, or answers…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
              {responseSearchTerm && (
                <button
                  type="button"
                  onClick={() => setResponseSearchTerm("")}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Response Cards List */}
          <div className="max-h-[850px] space-y-4 overflow-y-auto pr-1">
            {filteredResponses.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4 min-w-0"
              >
                {/* Respondent Info Header */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-3.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-800">
                        👤
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-slate-950 break-words">
                            {r.respondentName}
                          </p>
                          {r.user_id && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Student
                            </span>
                          )}
                        </div>
                        {r.user_id ? (
                          <span className="block text-[11px] font-semibold text-emerald-700">
                            ✓ Registered Student Account
                          </span>
                        ) : (
                          <span className="block text-[11px] font-medium text-slate-500">
                            Public Link Submission
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(r.submitted_at).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteResponse(r.id)}
                        disabled={deletingResponseId === r.id}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition disabled:opacity-30"
                        title="Delete this response"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const phone =
                      r.respondentPhone ||
                      (r.respondentContact && !r.respondentContact.includes("@") ? r.respondentContact : null);
                    const email =
                      r.respondentEmail ||
                      (r.respondentContact && r.respondentContact.includes("@") ? r.respondentContact : null);
                    const extraContact =
                      r.respondentContact && r.respondentContact !== phone && r.respondentContact !== email
                        ? r.respondentContact
                        : null;

                    return (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-2.5 text-xs">
                        {phone && (
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/90 px-2.5 py-1 font-semibold text-teal-900 shadow-2xs break-all">
                            📱 Mobile: {phone.startsWith("+") ? phone : `+91 ${phone}`}
                          </span>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:text-teal-700 transition break-all"
                            title="Click to send email"
                          >
                            ✉️ Email: {email}
                          </a>
                        )}
                        {extraContact && (
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-medium text-slate-700 break-all">
                            📝 Note: {extraContact}
                          </span>
                        )}
                        {!phone && !email && (
                          <span className="text-[11px] text-slate-400 italic">
                            {r.user_id
                              ? "Mobile and email not available on student profile"
                              : "No contact info provided by visitor"}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Question Answers */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Survey Answers:
                  </h4>
                  {r.answers.map((ans) => {
                    const q = questions.find((item) => item.id === ans.question_id);
                    return (
                      <div key={ans.question_id} className="text-sm">
                        <p className="font-semibold text-slate-700 break-words">
                          {q?.question_text || "Question"}:
                        </p>
                        <p className="mt-1 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 font-medium text-slate-900 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {ans.answer_text}
                        </p>
                      </div>
                    );
                  })}
                  {r.answers.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No survey answers submitted.</p>
                  )}
                </div>
              </div>
            ))}

            {responses.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 sm:p-10 text-center text-slate-500">
                <p className="text-base font-semibold text-slate-700">No responses yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Share the public survey link above with students to collect responses. They will appear here in real time.
                </p>
              </div>
            )}

            {responses.length > 0 && filteredResponses.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                No responses match your search &ldquo;{responseSearchTerm}&rdquo;.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
