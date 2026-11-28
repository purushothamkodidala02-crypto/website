import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SpecializationForm } from "../../SpecializationForm";

export default async function EditSpecializationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [specializationResult, examsResult] = await Promise.all([
    supabase.from("exam_specializations").select("id, exam_group_id, name, slug, description, seo_title, seo_description, display_order, is_active").eq("id", id).maybeSingle(),
    supabase.from("exam_groups").select("id, name").order("name"),
  ]);
  if (!specializationResult.data) notFound();
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/admin/groups/${specializationResult.data.exam_group_id}/edit`} className="text-sm font-semibold text-teal-800 hover:underline">← Back to Exam</Link>
        <div className="mt-3 border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Edit Specialisation</h1>
          <p className="mt-1 text-sm text-slate-600">Update student details, URL slug, and search metadata.</p>
        </div>
      </div>
      <SpecializationForm exams={(examsResult.data ?? []).map((exam) => ({ id: exam.id, label: exam.name }))} specialization={specializationResult.data} />
    </div>
  );
}
