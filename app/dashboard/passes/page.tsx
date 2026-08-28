import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { BuyExamPassForm } from "./BuyExamPassForm";
import { isPaidSalesEnabled } from "@/lib/paid-sales";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  duration_days: number;
  access_product_exam_groups: { exam_groups: { name: string } | null }[] | null;
};

type EntitlementRow = {
  id: string;
  product_id: string;
  starts_at: string;
  expires_at: string;
  access_products: { name: string } | null;
};

type PaymentRow = {
  id: string;
  merchant_order_id: string;
  amount_paise: number;
  status: string;
  created_at: string;
  access_products: { name: string } | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

const paymentErrors: Record<string, string> = {
  already_active: "You already have active access to this exam series.",
  unavailable: "This exam series is not currently available for purchase.",
  phone_required: "Enter a valid 10-digit Indian mobile number to continue.",
  invalid_referral: "This referral code is invalid or has expired.",
  referral_used: "This referral code has reached its usage limit.",
  cashfree: "The secure payment service could not be opened. Please try again.",
  order: "We could not create your payment order. No payment was taken.",
  invalid_order: "We could not find that payment order.",
};

export default async function ExamPassesPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; payment_error?: string }>;
}) {
  const [query, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/passes");
  if (!(await isPaidSalesEnabled())) redirect("/dashboard");

  const now = new Date();
  const [productsResult, entitlementsResult, paymentsResult] = await Promise.all([
    supabase
      .from("access_products")
      .select("id, name, description, price_inr, duration_days, access_product_exam_groups(exam_groups(name))")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("student_entitlements")
      .select("id, product_id, starts_at, expires_at, access_products(name)")
      .eq("user_id", user.id)
      .order("expires_at", { ascending: false }),
    supabase
      .from("payment_orders")
      .select("id, merchant_order_id, amount_paise, status, created_at, access_products(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const products = (productsResult.data ?? []) as unknown as ProductRow[];
  const entitlements = (entitlementsResult.data ?? []) as unknown as EntitlementRow[];
  const payments = (paymentsResult.data ?? []) as unknown as PaymentRow[];
  const activeProductIds = new Set(
    entitlements
      .filter((item) => new Date(item.starts_at) <= now && new Date(item.expires_at) > now)
      .map((item) => item.product_id),
  );

  return (
    <main className="student-page min-h-screen bg-slate-50">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/dashboard" className="text-sm font-bold text-teal-700 hover:underline">
          ← Back to dashboard
        </Link>

        <section className="mt-7 overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">My purchases</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Exam series and payments</h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                View your active access, available exam series, expiry dates, and payment history.
              </p>
            </div>
            <div className="w-fit rounded-2xl bg-white/10 px-5 py-3 text-center">
              <p className="text-2xl font-black text-teal-300">{activeProductIds.size}</p>
              <p className="text-xs font-bold text-slate-300">Active series</p>
            </div>
          </div>
        </section>

        {query.payment === "success" && (
          <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            Payment confirmed. Your exam series is now active.
          </p>
        )}
        {query.payment_error && (
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            {paymentErrors[query.payment_error] ?? "We could not complete this payment. No access was granted. Please try again."}
          </p>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Access</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Purchased exam series</h2>
            </div>
            <Link href="/mock-tests" className="text-sm font-bold text-teal-700 hover:underline">Browse mock tests</Link>
          </div>
          {entitlements.length ? (
            <div className="student-stagger mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entitlements.map((item) => {
                const active = new Date(item.starts_at) <= now && new Date(item.expires_at) > now;
                return (
                  <article key={item.id} className="student-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {active ? "Active" : "Expired"}
                    </span>
                    <h3 className="mt-4 text-lg font-black text-slate-950">{item.access_products?.name ?? "Exam series"}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {active ? "Access available until" : "Access expired on"} {dateFormatter.format(new Date(item.expires_at))}
                    </p>
                    {active && (
                      <Link href="/mock-tests" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">
                        View unlocked tests
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              You have not purchased an exam series yet. Choose a plan below or open a paid mock test to continue.
            </div>
          )}
        </section>

        <section className="mt-12">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Plans</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Available exam series</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            One secure payment unlocks every paid mock test included in the selected series for the stated access period. There is no automatic renewal.
          </p>
          {products.length ? (
            <div className="student-stagger mt-5 grid gap-5 md:grid-cols-2">
              {products.map((product) => {
                const active = activeProductIds.has(product.id);
                const exams = product.access_product_exam_groups
                  ?.map((item) => item.exam_groups?.name)
                  .filter((name): name is string => Boolean(name)) ?? [];
                return (
                  <article key={product.id} className="student-card flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Exam series</p>
                        <h3 className="mt-2 text-2xl font-black text-slate-950">{product.name}</h3>
                      </div>
                      {active && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Already active</span>}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {product.description ?? "Access every paid mock test included in this exam series."}
                    </p>
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-3xl font-black text-slate-950">₹{Number(product.price_inr).toFixed(0)}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">One-time payment · {product.duration_days} days access</p>
                    </div>
                    <div className="mt-5 flex-1">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Included exams</p>
                      <ul className="mt-2 space-y-2 text-sm font-semibold text-slate-700">
                        {(exams.length ? exams : ["Selected exam mock tests"]).map((exam) => (
                          <li key={exam} className="flex gap-2"><span className="text-teal-600">✓</span>{exam}</li>
                        ))}
                      </ul>
                    </div>
                    {active ? (
                      <Link href="/mock-tests" className="mt-5 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-teal-700">
                        View unlocked tests
                      </Link>
                    ) : (
                      <BuyExamPassForm
                        productId={product.id}
                        price={Number(product.price_inr)}
                        returnTo="/dashboard/passes"
                        phone={typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : ""}
                        buttonLabel="Proceed to secure payment"
                      />
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              No exam series are currently available for purchase. Existing access remains valid until its expiry date.
            </p>
          )}
        </section>

        <section className="mt-12">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Transactions</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Payment history</h2>
          {payments.length ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-black text-slate-950">{payment.access_products?.name ?? "Exam series"}</p>
                      <p className="mt-1 text-xs text-slate-500">Order {payment.merchant_order_id} · {dateFormatter.format(new Date(payment.created_at))}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                      <p className="font-black text-slate-950">₹{(Number(payment.amount_paise) / 100).toFixed(0)}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${payment.status === "paid" ? "bg-emerald-100 text-emerald-800" : payment.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No payment history yet.</p>
          )}
        </section>

        <p className="mt-10 text-center text-sm text-slate-500">
          Need help with a payment? <a href="mailto:support@varadhiprep.in" className="font-bold text-teal-700 hover:underline">Contact support</a>.
        </p>
      </div>
    </main>
  );
}
