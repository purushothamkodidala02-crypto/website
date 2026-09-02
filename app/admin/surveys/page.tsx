"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createAdminSurvey, toggleSurveyStatus } from "@/app/actions/surveys-admin";
import { useRouter } from "next/navigation";

export default function AdminSurveysList() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const { data } = await supabase.from("dynamic_surveys").select("*").order("created_at", { ascending: false });
    setSurveys(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setErrorMsg("");
    const res = await createAdminSurvey(newTitle);
    if (res.id) {
      router.push(`/admin/surveys/${res.id}`);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    await toggleSurveyStatus(id, !currentlyActive);
    fetchSurveys();
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Surveys</h1>
          <p className="mt-1 text-slate-500">Create popup surveys that appear on the student dashboard.</p>
        </div>
      </div>

      <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Create New Survey</h2>
        {errorMsg && <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{errorMsg}</div>}
        <form onSubmit={handleCreate} className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="e.g. Exam Preparation Survey"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            required
          />
          <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Create Survey
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading surveys...</p>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div key={survey.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{survey.title}</h3>
                  {survey.is_active ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Draft</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">Created {new Date(survey.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleToggle(survey.id, survey.is_active)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${survey.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                >
                  {survey.is_active ? "Deactivate" : "Activate"}
                </button>
                <Link href={`/admin/surveys/${survey.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Edit & View Responses
                </Link>
              </div>
            </div>
          ))}
          {surveys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              No surveys created yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
