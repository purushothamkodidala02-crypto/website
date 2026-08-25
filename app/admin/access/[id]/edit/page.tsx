import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateExamSeriesForm, type ExamGroup } from "../../CreateExamSeriesForm";

export default async function EditExamSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [groupsResult, productResult] = await Promise.all([
    supabase.from("exam_groups").select("id, name, exams(id, name, state_id, exam_states(id, name))").order("display_order"),
    supabase.from("access_products").select("id, name, slug, description, price_inr, duration_days, access_product_exam_groups(exam_group_id)").eq("id", id).maybeSingle(),
  ]);
  const product = productResult.data;
  if (!product) notFound();
  const examGroups: ExamGroup[] = (groupsResult.data ?? []).flatMap((group) => {
    const board = group.exams as unknown as { id: string; name: string; state_id: string; exam_states: { id: string; name: string } | null } | null;
    const state = board?.exam_states;
    return board && state ? [{ id: group.id, name: group.name, boardId: board.id, boardName: board.name, stateId: state.id, stateName: state.name }] : [];
  });

  return <div><Link href="/admin/access" className="text-sm font-bold text-teal-700 hover:underline">← Back to Exam Passes</Link><div className="mt-6 max-w-3xl"><CreateExamSeriesForm examGroups={examGroups} product={{ id: product.id, name: product.name, slug: product.slug, description: product.description, priceInr: Number(product.price_inr), durationDays: product.duration_days, examGroupIds: (product.access_product_exam_groups ?? []).map((item) => item.exam_group_id) }} /></div></div>;
}
