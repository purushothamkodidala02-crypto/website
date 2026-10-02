"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createAdminSurvey,
  toggleSurveyStatus,
  getAdminSurveysWithCounts,
} from "@/app/actions/surveys-admin";
import { useRouter } from "next/navigation";

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
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const refreshSurveys = useCallback(async () => {
    setLoading(true);
    const data = await getAdminSurveysWithCounts();
    setSurveys(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
    void (async () => {
      const data = await getAdminSurveysWithCounts();
      if (!ignore) {
        setSurveys(data || []);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setErrorMsg("");
    const res = await createAdminSurvey(newTitle.trim());
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

  const activeSurvey = surveys.find((s) => s.is_active);

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Student Surveys</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create surveys, share public links with students, and collect feedback directly here.
          </p>
        </div>
      </div>

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
              <p className="mt-0.5 text-xs text-slate-600 break-words">
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
        {errorMsg && (
          <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row">
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
            className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation text-center justify-center inline-flex items-center shrink-0"
          >
            Create Survey
          </button>
        </form>
      </div>

      {/* Survey List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center text-slate-500">
          Loading surveys...
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
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
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Created {new Date(survey.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyLink(survey.id, survey.is_active)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 touch-manipulation"
                  title="Copy link to share with students"
                >
                  {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(survey.id, survey.is_active)}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 touch-manipulation ${
                    survey.is_active
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {survey.is_active ? "Deactivate" : "Activate"}
                </button>
                <Link
                  href={`/admin/surveys/${survey.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation text-center"
                >
                  Edit & View Responses ({survey.response_count || 0})
                </Link>
              </div>
            </div>
          ))}

          {surveys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center text-slate-500">
              No surveys created yet. Create your first survey above!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
