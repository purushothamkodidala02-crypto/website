import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExamGroup } from "@/types/group";
import { EditGroupForm } from "./EditGroupForm";
import { ExamPaperManager } from "./ExamPaperManager";

type EditGroupPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditGroupPage({
  params,
}: EditGroupPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [groupResult, examsResult, papersResult, specializationsResult] = await Promise.all([
    supabase
      .from("exam_groups")
      .select(
        "id, exam_id, name, slug, description, seo_title, seo_description, is_active, display_order, created_at, updated_at"
      )
      .eq("id", id)
      .single(),

    supabase
      .from("exams")
      .select("id, name")
      .order("display_order", { ascending: true }),

    supabase
      .from("papers")
      .select("id, specialization_id, name, slug, duration_minutes, question_count, is_active, display_order")
      .eq("exam_group_id", id)
      .order("display_order", { ascending: true }),

    supabase
      .from("exam_specializations")
      .select("id, exam_group_id, name, slug, description, seo_title, seo_description, is_active, display_order")
      .eq("exam_group_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (groupResult.error || !groupResult.data) {
    notFound();
  }

  const group = groupResult.data as ExamGroup;
  const exams = examsResult.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/groups"
          className="text-sm font-semibold text-teal-800 hover:underline"
        >
          ← Back to Exams
        </Link>

        <div className="mt-3 border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Edit Exam
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Set up Specialisations and their Papers from this Exam workspace.
          </p>
        </div>
      </div>

      <EditGroupForm group={group} exams={exams} />

      <ExamPaperManager
        examId={group.id}
        examName={group.name}
        specializations={(specializationsResult.data ?? []).map((item) => ({ id: item.id, name: item.name, slug: item.slug, description: item.description, seoTitle: item.seo_title, seoDescription: item.seo_description, isActive: item.is_active, displayOrder: item.display_order }))}
        papers={(papersResult.data ?? []).map((paper) => ({
          id: paper.id,
          specializationId: paper.specialization_id,
          name: paper.name,
          slug: paper.slug,
          durationMinutes: paper.duration_minutes,
          questionCount: paper.question_count,
          isActive: paper.is_active,
        }))}
      />
    </div>
  );
}
