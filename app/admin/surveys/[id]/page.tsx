"use client";

import { useState, useEffect, useCallback, use } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  saveSurveyQuestion,
  deleteSurveyQuestion,
  getAdminSurveyResponses,
  type AdminSurveyResponse,
} from "@/app/actions/surveys-admin";
import { BackButton } from "@/components/admin/BackButton";

type SurveyDetail = {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
};

type SurveyQuestionItem = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  display_order: number;
};

export default function AdminSurveyEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id: surveyId } = use(params);
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestionItem[]>([]);
  const [responses, setResponses] = useState<AdminSurveyResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Question Form
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const supabase = createClient();

  const loadResponses = useCallback(async () => {
    setLoadingResponses(true);
    const rData = await getAdminSurveyResponses(surveyId);
    setResponses(rData || []);
    setLoadingResponses(false);
  }, [surveyId]);

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

  const fetchData = useCallback(async () => {
    const [sRes, qRes, rData] = await Promise.all([
      supabase.from("dynamic_surveys").select("*").eq("id", surveyId).single(),
      supabase.from("dynamic_survey_questions").select("*").eq("survey_id", surveyId).order("display_order"),
      getAdminSurveyResponses(surveyId),
    ]);
    setSurvey(sRes.data);
    setQuestions(qRes.data || []);
    setResponses(rData || []);
  }, [surveyId, supabase]);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
    Promise.all([
      supabase.from("dynamic_surveys").select("*").eq("id", surveyId).single(),
      supabase.from("dynamic_survey_questions").select("*").eq("survey_id", surveyId).order("display_order"),
      getAdminSurveyResponses(surveyId),
    ]).then(([sRes, qRes, rData]) => {
      if (!ignore) {
        setSurvey(sRes.data);
        setQuestions(qRes.data || []);
        setResponses(rData || []);
      }
    });
    return () => {
      ignore = true;
    };
  }, [surveyId, supabase]);

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

    await saveSurveyQuestion(surveyId, qText.trim(), qType, optionsArray, questions.length);
    setQText("");
    setQOptions("");
    setIsSavingQuestion(false);
    fetchData();
  };

  const handleDelete = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteSurveyQuestion(questionId, surveyId);
      fetchData();
    }
  };

  const getSurveyUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return survey?.is_active ? `${origin}/survey` : `${origin}/survey?id=${surveyId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSurveyUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!survey) return <div className="p-8 text-slate-500">Loading survey details...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <BackButton
        fallbackHref="/admin/surveys"
        label="← Back to Surveys"
        className="mb-4 inline-block text-sm font-bold text-teal-600 hover:underline"
      />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{survey.title}</h1>
          {survey.description && (
            <p className="mt-1 text-sm text-slate-600">{survey.description}</p>
          )}
        </div>
        <div>
          {survey.is_active ? (
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              Active (Live on /survey & Dashboard)
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              Draft Status
            </span>
          )}
        </div>
      </div>

      {/* Shareable Link Box */}
      <div className="mb-8 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900">
              Shareable Public Survey Link
            </h2>
            <p className="mt-1 font-mono text-xs text-teal-950 sm:text-sm break-all">
              {getSurveyUrl()}
            </p>
            <p className="mt-1 text-xs text-teal-700">
              {survey.is_active
                ? "This survey is active. Students visiting /survey will see this survey directly."
                : "This survey is currently in draft. Use this link with ?id= to test or share directly."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
            >
              {copiedLink ? "✓ Copied Link!" : "📋 Copy Survey Link"}
            </button>
            <a
              href={survey.is_active ? "/survey" : `/survey?id=${surveyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-teal-300 bg-white px-3.5 py-2.5 text-xs font-bold text-teal-900 shadow-sm hover:bg-teal-50 transition"
            >
              Open Survey ↗
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor Side: Questions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Survey Questions ({questions.length})
            </h2>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-red-500 font-bold transition"
                  title="Delete Question"
                >
                  ✕
                </button>
                <p className="font-bold text-slate-900 pr-8">
                  {i + 1}. {q.question_text}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                  Type: {q.question_type}
                </p>
                {q.options && q.options.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                    {q.options.map((opt: string, idx: number) => (
                      <li key={idx}>{opt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {questions.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No questions added yet. Add your first question below!
              </p>
            )}
          </div>

          {/* Add Question Form */}
          <form
            onSubmit={handleAddQuestion}
            className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-6"
          >
            <h3 className="mb-4 font-bold text-teal-900">Add New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-teal-900">Question Text</label>
                <input
                  required
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                  placeholder="e.g. Which exam are you primarily preparing for?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-teal-900">Input Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                >
                  <option value="text">Short Text (Single line)</option>
                  <option value="textarea">Long Text (Multi-line paragraph)</option>
                  <option value="radio">Multiple Choice (Single select radio)</option>
                </select>
              </div>

              {qType === "radio" && (
                <div>
                  <label className="block text-sm font-bold text-teal-900">
                    Options (comma separated)
                  </label>
                  <input
                    required
                    type="text"
                    value={qOptions}
                    onChange={(e) => setQOptions(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Subject-wise mocks, Full mock tests, Both"
                  />
                  <p className="mt-1 text-xs text-teal-700">
                    Separate multiple choices with commas.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingQuestion}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70 transition"
              >
                {isSavingQuestion ? "Saving..." : "Add Question"}
              </button>
            </div>
          </form>
        </section>

        {/* Responses Side */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Collected Responses ({responses.length})
            </h2>
            <div className="flex items-center gap-2.5">
              {responses.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition"
                  title="Download all responses as a CSV spreadsheet"
                >
                  📥 Export CSV
                </button>
              )}
              <button
                type="button"
                onClick={loadResponses}
                disabled={loadingResponses}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
              >
                {loadingResponses ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          <div className="max-h-[800px] space-y-4 overflow-y-auto pr-1">
            {responses.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
              >
                {/* Respondent Info Header */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-800">
                        👤
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-950">
                            {r.respondentName}
                          </p>
                          {r.user_id && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Student
                            </span>
                          )}
                        </div>
                        {r.user_id ? (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ✓ Registered Student Account
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-500">
                            Public Link Submission
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(r.submitted_at).toLocaleString()}
                    </span>
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
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/90 px-2.5 py-1 font-semibold text-teal-900 shadow-2xs">
                            📱 Mobile: {phone.startsWith("+") ? phone : `+91 ${phone}`}
                          </span>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:text-teal-700 transition"
                            title="Click to send email"
                          >
                            ✉️ Email: {email}
                          </a>
                        )}
                        {extraContact && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
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
                        <p className="font-semibold text-slate-700">
                          {q?.question_text || "Question"}:
                        </p>
                        <p className="mt-1 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 font-medium text-slate-900 whitespace-pre-wrap">
                          {ans.answer_text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {responses.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                <p className="text-base font-semibold text-slate-700">No responses yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Share the public survey link above with students to collect responses. They will appear here in real time.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
