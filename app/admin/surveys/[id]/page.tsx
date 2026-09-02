"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveSurveyQuestion, deleteSurveyQuestion } from "@/app/actions/surveys-admin";
import Link from "next/link";

export default function AdminSurveyEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id: surveyId } = use(params);
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  
  // New Question Form
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [surveyId]);

  const fetchData = async () => {
    const { data: s } = await supabase.from("dynamic_surveys").select("*").eq("id", surveyId).single();
    setSurvey(s);

    const { data: q } = await supabase.from("dynamic_survey_questions").select("*").eq("survey_id", surveyId).order("display_order");
    setQuestions(q || []);

    // Fetch responses and answers
    const { data: rData } = await supabase
      .from("dynamic_survey_responses")
      .select(`
        id, submitted_at,
        users:user_id ( email, raw_user_meta_data ),
        answers:dynamic_survey_answers(question_id, answer_text)
      `)
      .eq("survey_id", surveyId)
      .order("submitted_at", { ascending: false });
    
    setResponses(rData || []);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    
    const optionsArray = qType === 'radio' ? qOptions.split(",").map(s => s.trim()).filter(Boolean) : [];
    
    await saveSurveyQuestion(surveyId, qText, qType, optionsArray, questions.length);
    setQText("");
    setQOptions("");
    fetchData();
  };

  const handleDelete = async (questionId: string) => {
    if (confirm("Are you sure?")) {
      await deleteSurveyQuestion(questionId, surveyId);
      fetchData();
    }
  };

  if (!survey) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href="/admin/surveys" className="mb-4 inline-block text-sm font-bold text-teal-600 hover:underline">← Back to Surveys</Link>
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">{survey.title}</h1>
        {survey.is_active ? (
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">Active (Live on Dashboard)</span>
        ) : (
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Draft Status</span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor Side */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Survey Questions</h2>
          
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <button onClick={() => handleDelete(q.id)} className="absolute right-4 top-4 text-slate-400 hover:text-red-500">✕</button>
                <p className="font-bold text-slate-900">{i + 1}. {q.question_text}</p>
                <p className="mt-1 text-xs uppercase text-slate-500">Type: {q.question_type}</p>
                {q.options && (
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                    {q.options.map((opt: string, idx: number) => <li key={idx}>{opt}</li>)}
                  </ul>
                )}
              </div>
            ))}
            {questions.length === 0 && <p className="text-sm text-slate-500">No questions added yet.</p>}
          </div>

          <form onSubmit={handleAddQuestion} className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-6">
            <h3 className="mb-4 font-bold text-teal-900">Add New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-teal-800">Question Text</label>
                <input required type="text" value={qText} onChange={(e) => setQText(e.target.value)} className="mt-1 block w-full rounded-lg border border-teal-200 p-2 text-sm" placeholder="e.g. Which exam?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-teal-800">Input Type</label>
                <select value={qType} onChange={(e) => setQType(e.target.value)} className="mt-1 block w-full rounded-lg border border-teal-200 p-2 text-sm">
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text (Paragraph)</option>
                  <option value="radio">Multiple Choice (Radio)</option>
                </select>
              </div>
              {qType === 'radio' && (
                <div>
                  <label className="block text-sm font-bold text-teal-800">Options (comma separated)</label>
                  <input required type="text" value={qOptions} onChange={(e) => setQOptions(e.target.value)} className="mt-1 block w-full rounded-lg border border-teal-200 p-2 text-sm" placeholder="e.g. Option A, Option B, Option C" />
                </div>
              )}
              <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">Add Question</button>
            </div>
          </form>
        </section>

        {/* Responses Side */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Student Responses ({responses.length})</h2>
          <div className="max-h-[800px] space-y-4 overflow-y-auto">
            {responses.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500">
                  {new Date(r.submitted_at).toLocaleString()} • {r.users?.raw_user_meta_data?.name || r.users?.email || "Anonymous"}
                </p>
                <div className="mt-3 space-y-3">
                  {r.answers.map((ans: any) => {
                    const q = questions.find(q => q.id === ans.question_id);
                    return (
                      <div key={ans.question_id} className="text-sm">
                        <p className="font-bold text-slate-700">{q?.question_text || "Unknown Question"}</p>
                        <p className="text-slate-900">{ans.answer_text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {responses.length === 0 && <p className="text-sm text-slate-500">No responses yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
