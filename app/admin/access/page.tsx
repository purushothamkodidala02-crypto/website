import Link from "next/link";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { createClient } from "@/lib/supabase/server";
import { CreateExamSeriesForm } from "./CreateExamSeriesForm";
import { RemoveExamSeriesButton } from "./RemoveExamSeriesButton";
import { PaidSalesToggle } from "./PaidSalesToggle";
import { createReferralCode, toggleAccessProduct, togglePaidSales } from "./actions";

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
  const [groupsResult, productsResult, referralResult, salesSettingResult] = await Promise.all([
    supabase.from("exam_groups").select("id, name, exams(id, name, state_id, exam_states(id, name))").order("display_order"),
    supabase.from("access_products").select("id, name, slug, price_inr, duration_days, is_active, access_product_exam_groups(exam_groups(id, name))").order("display_order"),
    supabase.from("referral_codes").select("id, code, discount_type, discount_value, is_active, access_products(name)").order("created_at", { ascending: false }).limit(25),
    supabase.from("site_settings").select("enabled").eq("key", "paid_sales").maybeSingle(),
  ]);
  const products = (productsResult.data ?? []) as unknown as Product[];
  const examGroups = (groupsResult.data ?? []).flatMap((group) => {
    const board = group.exams as unknown as { id: string; name: string; state_id: string; exam_states: { id: string; name: string } | null } | null;
    const state = board?.exam_states;
    return board && state ? [{ id: group.id, name: group.name, boardId: board.id, boardName: board.name, stateId: state.id, stateName: state.name }] : [];
  });
  const activeCount = products.filter((product) => product.is_active).length;
  const paidSalesEnabled = salesSettingResult.data?.enabled === true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
              Commercial Operations & Access
            </p>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Exam Series & Passes
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Configure free and paid mock test series, sales visibility, pricing in INR, access durations, and discount promotional codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/students"
            prefetch={true}
            className="rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs hover:bg-teal-50 hover:border-teal-300 transition"
          >
            View Registrations & Revenue
          </Link>
        </div>
      </div>

      {/* Global Sales Banner */}
      <section
        className={`rounded-3xl border p-6 shadow-xs transition ${
          paidSalesEnabled
            ? "border-emerald-200/90 bg-emerald-50/60"
            : "border-amber-200/90 bg-amber-50/60"
        }`}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  paidSalesEnabled ? "bg-emerald-600" : "bg-amber-600"
                }`}
              />
              <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                Student Purchase Visibility
              </p>
            </div>
            <h2 className="text-xl font-black text-slate-950">
              Paid sales are {paidSalesEnabled ? "ON" : "OFF"}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              {paidSalesEnabled
                ? "Students can see purchase banners, pricing, and buy active Exam Series through Razorpay. All transactions are logged in Registrations."
                : "Purchases, prices, and Buy buttons are hidden across the entire student portal. Existing access records and historical payments are preserved."}
            </p>
          </div>
          <div className="shrink-0">
            <PaidSalesToggle enabled={paidSalesEnabled} action={togglePaidSales} />
          </div>
        </div>
      </section>

      {/* How it works 2-card step overview */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">
            Step 1 · Free or Paid Access
          </p>
          <h2 className="mt-1.5 text-lg font-black text-slate-950">
            Configure access on each Mock Test
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            <strong className="text-slate-900">Free:</strong> Any registered student can attempt immediately.{" "}
            <strong className="text-slate-900">Paid:</strong> Candidates must purchase an active exam series covering that recruiting exam.
          </p>
          <div className="mt-5">
            <Link
              href="/admin/mock-tests"
              className="inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-teal-800 transition"
            >
              Manage Mock Tests
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">
            Step 2 · Price & Exam Coverage
          </p>
          <h2 className="mt-1.5 text-lg font-black text-slate-950">
            Create bundles & series
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            One series can cover a single exam, such as TSPSC Group 2, or multiple related exams, such as all Telangana Police exams.
          </p>
          <p className="mt-4 text-xs font-bold text-teal-900">
            {activeCount} active series for sale · {products.length - activeCount} paused
          </p>
          <Link href="/admin/students" className="mt-4 inline-flex text-xs sm:text-sm font-bold text-teal-700 hover:underline">
            View registrations &rarr;
          </Link>
        </div>
      </section>

      {/* Series Creation & List */}
      <section className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <CreateExamSeriesForm examGroups={examGroups} />

        <section className="overflow-hidden rounded-3xl border border-teal-100 bg-white p-6 shadow-xs">
          <div className="border-b border-teal-50 pb-4">
            <h2 className="text-lg font-black text-slate-950">Existing Exam Series</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only active series are displayed to students for purchase.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-teal-100/80 bg-slate-50/50 p-4 transition hover:bg-teal-50/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950 text-sm">{product.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          product.is_active
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {product.is_active ? "Selling" : "Paused"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      ₹{Number(product.price_inr).toFixed(0)} INR · {product.duration_days} days access
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Includes:</span>
                      {(product.access_product_exam_groups
                        ?.map((item) => item.exam_groups?.name)
                        .filter(Boolean) ?? []).length > 0 ? (
                        product.access_product_exam_groups
                          ?.map((item) => item.exam_groups?.name)
                          .filter((name): name is string => Boolean(name))
                          .map((examName) => (
                            <span
                              key={examName}
                              className="rounded-md border border-teal-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-teal-900 break-words"
                            >
                              {examName}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs font-medium text-slate-500">No exams selected</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                    <Link
                      href={`/admin/access/${product.id}/edit`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50"
                    >
                      Edit
                    </Link>

                    <form action={toggleAccessProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="active" value={String(product.is_active)} />
                      <PendingSubmitButton
                        pendingLabel="Updating…"
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
                      >
                        {product.is_active ? "Pause" : "Resume"}
                      </PendingSubmitButton>
                    </form>

                    <RemoveExamSeriesButton productId={product.id} productName={product.name} />
                  </div>
                </div>
              </div>
            ))}

            {!products.length && (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500">
                No exam series created yet. Create your first series on the left.
              </p>
            )}
          </div>
        </section>
      </section>

      {/* Referral Codes */}
      <section className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <form action={createReferralCode} className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-black text-slate-950">Promotional Referral Code</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Grant percentage discounts, fixed ₹ fee waivers, bonus days, or free access.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block text-xs font-bold text-slate-700">
              Coupon Code
              <input
                required
                name="code"
                maxLength={40}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm uppercase font-mono font-bold"
                placeholder="DISCOUNT20"
              />
            </label>

            <label className="block text-xs font-bold text-slate-700">
              Target Exam Series
              <select name="product_id" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">
                <option value="">Any exam series</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-700">
                Benefit Type
                <select name="discount_type" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="percent">Percentage Off (%)</option>
                  <option value="amount">Fixed ₹ Off</option>
                  <option value="free_pass">100% Free Pass</option>
                  <option value="bonus_days">Extra Days</option>
                </select>
              </label>

              <label className="block text-xs font-bold text-slate-700">
                Value
                <input
                  name="discount_value"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="0"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-xs font-bold text-slate-700">
              Max Usages <span className="font-normal text-slate-400">(optional)</span>
              <input
                name="max_redemptions"
                type="number"
                min="1"
                placeholder="Unlimited if blank"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
              />
            </label>

            <PendingSubmitButton
              pendingLabel="Creating code…"
              className="w-full rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-teal-800 transition disabled:opacity-60"
            >
              Generate Referral Code
            </PendingSubmitButton>
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-teal-100 bg-white p-6 shadow-xs">
          <div className="border-b border-teal-50 pb-4">
            <h2 className="text-lg font-black text-slate-950">Active Referral Codes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Recently created discounts and redemption codes.
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            {(referralResult.data ?? []).map((code) => (
              <div key={code.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div>
                  <p className="font-mono font-black text-sm text-slate-950">{code.code}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {code.discount_type.replace("_", " ")} · Value: {code.discount_value} ·{" "}
                    {(code.access_products as unknown as { name: string } | null)?.name ?? "Any Series"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Active
                </span>
              </div>
            ))}

            {!(referralResult.data ?? []).length && (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500">
                No referral codes created yet.
              </p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
