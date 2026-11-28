import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Exam } from "@/types/exam";
import { EditExamForm } from "./EditExamForm";

type EditExamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExamPage({
  params,
}: EditExamPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data, error }, statesResult] = await Promise.all([
    supabase
      .from("exams")
      .select("id, state_id, name, slug, description, seo_title, seo_description, is_active, display_order, created_at, updated_at")
      .eq("id", id)
      .single(),
    supabase.from("exam_states").select("id, name, code").order("display_order"),
  ]);

  if (error || !data) {
    notFound();
  }

  const exam = data as Exam;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/exams"
          className="text-sm font-semibold text-teal-800 hover:underline"
        >
          ← Back to Recruiting Boards
        </Link>

        <div className="mt-3 border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Edit Recruiting Board</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update the selected board&apos;s details and status.
          </p>
        </div>
      </div>

      <EditExamForm exam={exam} states={statesResult.data ?? []} />
    </div>
  );
}
