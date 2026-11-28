import { createClient } from "@/lib/supabase/server";
import type { ExamGroupWithExam } from "@/types/group";
import { ExamsWorkspace } from "./ExamsWorkspace";

export default async function AdminGroupsPage() {
  const supabase = await createClient();
  const [groupsResult, categoriesResult] = await Promise.all([
    supabase
      .from("exam_groups")
      .select(
        "id, exam_id, name, slug, description, is_active, display_order, created_at, updated_at, exams (name)",
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("exams").select("id, name").order("display_order", { ascending: true }),
  ]);

  const groups = (groupsResult.data ?? []) as unknown as ExamGroupWithExam[];
  const categories = categoriesResult.data ?? [];
  const sortedGroups = [...groups].sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200/80 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Exam structure</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Exams</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create an Exam under a Recruiting Board, then add optional Specialisations and Papers.
        </p>
      </div>

      {groupsResult.error ? (
        <>
          <ExamsWorkspace categories={categories} exams={[]} />
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">Unable to load Exams</p>
            <p className="mt-1 text-sm text-red-600">{groupsResult.error.message}</p>
          </div>
        </>
      ) : (
        <ExamsWorkspace
          categories={categories}
          exams={sortedGroups.map((group) => ({
            id: group.id,
            categoryId: group.exam_id,
            name: group.name,
            slug: group.slug,
            isActive: group.is_active,
            displayOrder: group.display_order,
          }))}
        />
      )}
    </div>
  );
}
