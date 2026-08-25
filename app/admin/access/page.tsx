import Link from "next/link";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { createClient } from "@/lib/supabase/server";
import { CreateExamSeriesForm } from "./CreateExamSeriesForm";
import { RemoveExamSeriesButton } from "./RemoveExamSeriesButton";
import { createReferralCode, toggleAccessProduct } from "./actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  duration_days: number;
  is_active: boolean;
  access_product_exam_groups: { exam_groups: { id: string; name: string } | null }[] | null;
};

export default async function AdminAccessPage() {
  const supabase = await createClient();
  const [groupsResult, productsResult, referralResult] = await Promise.all([
    supabase.from("exam_groups").select("id, name, exams(id, name, state_id, exam_states(id, name))").order("display_order"),
    supabase.from("access_products").select("id, name, slug, price_inr, duration_days, is_active, access_product_exam_groups(exam_groups(id, name))").order("display_order"),
    supabase.from("referral_codes").select("id, code, discount_type, discount_value, is_active, access_products(name)").order("created_at", { ascending: false }).limit(25),
  ]);
  const products = (productsResult.data ?? []) as unknown as Product[];
  const examGroups = (groupsResult.data ?? []).flatMap((group) => {
    const board = group.exams as unknown as { id: string; name: string; state_id: string; exam_states: { id: string; name: string } | null } | null;
    const state = board?.exam_states;
    return board && state ? [{ id: group.id, name: group.name, boardId: board.id, boardName: board.name, stateId: state.id, stateName: state.name }] : [];
  });
  const activeCount = products.filter((product) => product.is_active).length;

  return <div>
    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Payments and student access</p>
    <h1 className="mt-2 text-3xl font-black text-slate-950">Free and paid mock tests</h1>
    <p className="mt-2 max-w-3xl text-slate-600">Set each Mock Test as free or paid. Paid tests are sold as an exam series: students pay once and unlock all paid tests in the selected exam or exams.</p>

    <section className="mt-7 grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">Step 1 · Free or paid</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Choose access on each mock test</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Free:</strong> any student can start it. <strong>Paid:</strong> a student must buy an active exam series that includes its exam.</p>
        <Link href="/admin/mock-tests" className="mt-4 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-black text-white">Manage Mock Tests</Link>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Step 2 · Price and coverage</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Create one paid series</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">One series can cover a single exam, such as Police Constable, or many exams, such as all Telangana Police exams. You set one price and access period.</p>
        <p className="mt-4 text-sm font-bold text-slate-900">{activeCount} active series · {products.length - activeCount} paused</p>
        <Link href="/admin/students" className="mt-4 inline-flex text-sm font-black text-teal-700 hover:underline">View students and sales →</Link>
      </div>
    </section>

    <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
      <CreateExamSeriesForm examGroups={examGroups} />
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Your exam series</h2>
        <p className="mt-1 text-sm text-slate-600">Only active series are available for students to buy.</p>
        <div className="mt-5 grid gap-3">
          {products.map((product) => <div key={product.id} className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-950">{product.name}</p><span className={`rounded-full px-2.5 py-1 text-xs font-black ${product.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{product.is_active ? "Selling" : "Paused"}</span></div>
                <p className="mt-1 text-sm text-slate-600">₹{Number(product.price_inr).toFixed(0)} once · {product.duration_days} days</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">Includes: {product.access_product_exam_groups?.map((item) => item.exam_groups?.name).filter(Boolean).join(", ") || "No exams selected"}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1"><Link href={`/admin/access/${product.id}/edit`} className="rounded-lg px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50">Edit</Link><form action={toggleAccessProduct}><input type="hidden" name="id" value={product.id} /><input type="hidden" name="active" value={String(product.is_active)} /><PendingSubmitButton pendingLabel="Updating…" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900">{product.is_active ? "Pause sales" : "Start selling"}</PendingSubmitButton></form><RemoveExamSeriesButton productId={product.id} productName={product.name} /></div>
            </div>
          </div>)}
          {!products.length && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No paid series yet. Create one on the left, then set its related Mock Tests to Paid.</p>}
        </div>
      </section>
    </section>

    <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
      <form action={createReferralCode} className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Referral code</h2><p className="mt-1 text-sm text-slate-600">Give a discount, extra days, or free access to a selected paid series.</p>
        <div className="mt-5 grid gap-4"><label className="text-sm font-bold">Code<input required name="code" maxLength={40} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 uppercase" placeholder="POLICE10" /></label><label className="text-sm font-bold">Exam series<select name="product_id" className="mt-1.5 w-full rounded-xl border px-3 py-2.5"><option value="">Any exam series</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Benefit<select name="discount_type" className="mt-1.5 w-full rounded-xl border px-3 py-2.5"><option value="percent">Percentage off</option><option value="amount">₹ off</option><option value="free_pass">Free series</option><option value="bonus_days">Extra days</option></select></label><label className="text-sm font-bold">Value<input name="discount_value" type="number" min="0" step="1" defaultValue="0" className="mt-1.5 w-full rounded-xl border px-3 py-2.5" /></label></div><label className="text-sm font-bold">Maximum uses <span className="font-normal text-slate-500">(optional)</span><input name="max_redemptions" type="number" min="1" className="mt-1.5 w-full rounded-xl border px-3 py-2.5" /></label><PendingSubmitButton pendingLabel="Creating code…" className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Create referral code</PendingSubmitButton></div>
      </form>
      <section className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">Recent referral codes</h2><div className="mt-5 grid gap-3">{(referralResult.data ?? []).map((code) => <div key={code.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-mono font-black text-slate-950">{code.code}</p><p className="mt-1 text-sm text-slate-600">{code.discount_type.replace("_", " ")} · {code.discount_value} · {(code.access_products as unknown as { name: string } | null)?.name ?? "Any exam series"}</p></div>)}{!(referralResult.data ?? []).length && <p className="text-sm text-slate-600">No referral codes created yet.</p>}</div></section>
    </section>
  </div>;
}
