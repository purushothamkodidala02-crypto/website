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

  const loadSurveys = useCallback(async () => {
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
    getAdminSurveysWithCounts().then((data) => {
      if (!ignore) {
        setSurveys(data || []);
        setLoading(false);
      }
    });
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
    loadSurveys();
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
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Surveys</h1>
          <p className="mt-1 text-slate-500">
            Create surveys, share public links with students, and collect feedback directly here.
          </p>
        </div>
      </div>

      {/* Active Public Survey Banner */}
      {activeSurvey && (
        <div className="mb-8 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Live Public Survey
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activeSurvey.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Active on student dashboard and shareable link:{" "}
                <code className="rounded bg-teal-100/70 px-1.5 py-0.5 font-mono text-teal-900">
                  /survey
                </code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(activeSurvey.id, true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
              >
                {copiedId === activeSurvey.id ? "✓ Copied Link!" : "📋 Copy Survey Link"}
              </button>
              <a
                href="/survey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-bold text-teal-900 shadow-sm hover:bg-teal-50 transition"
              >
                View Public Page ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Create Survey Form */}
      <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Create New Survey</h2>
        {errorMsg && (
          <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleCreate} className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="e.g. APPSC Group 2 Feedback Survey"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
          >
            Create Survey
          </button>
        </form>
      </div>

      {/* Survey List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading surveys...
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{survey.title}</h3>
                  {survey.is_active ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      Active (Live)
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Draft
                    </span>
                  )}
                  <span className="rounded-full bg-teal-50 border border-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {survey.response_count || 0}{" "}
                    {survey.response_count === 1 ? "response" : "responses"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Created {new Date(survey.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(survey.id, survey.is_active)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  title="Copy link to share with students"
                >
                  {copiedId === survey.id ? "✓ Copied!" : "🔗 Copy Link"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(survey.id, survey.is_active)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    survey.is_active
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {survey.is_active ? "Deactivate" : "Activate"}
                </button>
                <Link
                  href={`/admin/surveys/${survey.id}`}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Edit & View Responses ({survey.response_count || 0})
                </Link>
              </div>
            </div>
          ))}

          {surveys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              No surveys created yet. Create your first survey above!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
