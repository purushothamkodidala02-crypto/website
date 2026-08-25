import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { BuyExamPassForm } from "./BuyExamPassForm";

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
  expires_at: string;
  access_products: { name: string } | null;
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

  const [productsResult, entitlementsResult] = await Promise.all([
    supabase
      .from("access_products")
      .select(
        "id, name, description, price_inr, duration_days, access_product_exam_groups(exam_groups(name))",
      )
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("student_entitlements")
      .select("id, expires_at, access_products(name)")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at"),
  ]);

  const products = (productsResult.data ?? []) as unknown as ProductRow[];
  const entitlements = (entitlementsResult.data ?? []) as unknown as EntitlementRow[];

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/dashboard" className="text-sm font-bold text-teal-700">
          ← Dashboard
        </Link>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.15em] text-teal-700">
          My purchases
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Your purchased exam series.
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Students should buy directly from the locked mock-test page. Use this page to
          check active access, expiry dates, and available exam series.
        </p>

        {query.payment === "success" && (
          <p
            role="status"
            className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"
          >
            Payment confirmed. Your exam series is active.
          </p>
        )}

        {query.payment_error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            We could not complete this payment. No access was granted. Please try again
            from the locked mock-test page.
          </p>
        )}

        {entitlements.length > 0 && (
          <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6">
            <h2 className="text-lg font-black">Active purchases</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {entitlements.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-4">
                  <p className="font-bold">{item.access_products?.name ?? "Exam series"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Active until{" "}
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                      new Date(item.expires_at),
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black text-slate-950">Available exam series</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              These offers also appear directly on locked mock tests, which should remain
              the main purchase flow for students.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {products.map((product) => {
                const exams =
                  product.access_product_exam_groups
                    ?.map((item) => item.exam_groups?.name)
                    .filter(Boolean)
                    .join(", ") || "Selected exam";

                return (
                  <article key={product.id} className="rounded-3xl border bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
                      {exams}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{product.name}</h2>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                      {product.description ?? "Access every paid mock test in this exam series."}
                    </p>
                    <p className="mt-5 text-2xl font-black">
                      ₹{Number(product.price_inr).toFixed(0)}{" "}
                      <span className="text-sm font-semibold text-slate-500">
                        for {product.duration_days} days
                      </span>
                    </p>
                    <BuyExamPassForm
                      productId={product.id}
                      price={Number(product.price_inr)}
                      returnTo="/dashboard/passes"
                      phone={typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : ""}
                      buttonLabel="Buy Exam Series"
                    />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!products.length && (
          <p className="mt-10 rounded-3xl border bg-white p-8 text-slate-600">
            No exam series are listed yet. Students can buy directly from a locked mock
            test as soon as an exam series is created for that exam.
          </p>
        )}
      </div>
    </main>
  );
}
