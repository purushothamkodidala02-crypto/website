import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SendUserEmailModal } from "./SendUserEmailModal";

type PaidOrder = { id: string; user_id: string; product_id: string; amount_paise: number; created_at: string };
type RecentOrder = PaidOrder & { merchant_order_id: string; status: string; paid_at: string | null };
type Product = { id: string; name: string; is_active: boolean };
type Student = { id: string; full_name: string | null; phone: string | null; created_at: string };

type RegistrationAnalytics = {
  total_paid_orders: number;
  unique_paid_students: number;
  gross_revenue_paise: number;
  active_access_count: number;
  series_stats: {
    product_id: string;
    payments: number;
    buyers: number;
    revenue_paise: number;
    active_students: number;
  }[];
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

async function loadFallbackOrdersAndEntitlements(now: string) {
  const admin = createAdminClient();
  const [ordersRes, entitlementsRes] = await Promise.all([
    admin
      .from("payment_orders")
      .select("id, user_id, product_id, amount_paise, created_at")
      .eq("status", "paid")
      .limit(5000),
    admin
      .from("student_entitlements")
      .select("user_id, product_id")
      .gt("expires_at", now)
      .limit(5000),
  ]);
  return {
    paidOrders: (ordersRes.data ?? []) as PaidOrder[],
    activeEntitlements: (entitlementsRes.data ?? []) as { user_id: string; product_id: string }[],
    hasError: Boolean(ordersRes.error || entitlementsRes.error),
  };
}

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: assurance }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (profile?.role !== "admin") redirect("/dashboard");
  if (assurance?.currentLevel !== "aal2") redirect("/admin-mfa");

  const admin = createAdminClient();
  const [studentsResult, productsResult, recentOrdersResult, analyticsResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, phone, created_at", { count: "exact" })
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(50),
    admin.from("access_products").select("id, name, is_active").order("display_order"),
    admin
      .from("payment_orders")
      .select("id, user_id, product_id, merchant_order_id, amount_paise, status, paid_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    admin.rpc("get_admin_registration_analytics"),
  ]);

  const students = (studentsResult.data ?? []) as Student[];
  const products = (productsResult.data ?? []) as Product[];
  const recentOrders = (recentOrdersResult.data ?? []) as RecentOrder[];

  let totalSuccessfulPayments = 0;
  let uniquePaidStudents = 0;
  let totalRevenuePaise = 0;
  let activeAccessCount = 0;
  const seriesStatsMap = new Map<string, { buyers: number; payments: number; activeStudents: number; revenuePaise: number }>();
  let fallbackError = false;

  const analytics = analyticsResult.data as RegistrationAnalytics | null;
  if (analytics && !analyticsResult.error) {
    totalSuccessfulPayments = Number(analytics.total_paid_orders ?? 0);
    uniquePaidStudents = Number(analytics.unique_paid_students ?? 0);
    totalRevenuePaise = Number(analytics.gross_revenue_paise ?? 0);
    activeAccessCount = Number(analytics.active_access_count ?? 0);
    for (const stat of analytics.series_stats ?? []) {
      seriesStatsMap.set(stat.product_id, {
        buyers: Number(stat.buyers ?? 0),
        payments: Number(stat.payments ?? 0),
        activeStudents: Number(stat.active_students ?? 0),
        revenuePaise: Number(stat.revenue_paise ?? 0),
      });
    }
  } else {
    // Graceful fast fallback if RPC is not yet present on remote DB
    const fallback = await loadFallbackOrdersAndEntitlements(new Date().toISOString());
    fallbackError = fallback.hasError;
    const paidStudentIds = new Set(fallback.paidOrders.map((item) => item.user_id));
    uniquePaidStudents = paidStudentIds.size;
    totalSuccessfulPayments = fallback.paidOrders.length;
    totalRevenuePaise = fallback.paidOrders.reduce((total, item) => total + Number(item.amount_paise), 0);
    activeAccessCount = new Set(fallback.activeEntitlements.map((item) => item.user_id)).size;

    for (const product of products) {
      const orders = fallback.paidOrders.filter((item) => item.product_id === product.id);
      const activeStudents = new Set(
        fallback.activeEntitlements.filter((item) => item.product_id === product.id).map((item) => item.user_id),
      );
      seriesStatsMap.set(product.id, {
        buyers: new Set(orders.map((item) => item.user_id)).size,
        payments: orders.length,
        activeStudents: activeStudents.size,
        revenuePaise: orders.reduce((total, item) => total + Number(item.amount_paise), 0),
      });
    }
  }

  // Fast targeted lookup for the visible 50 students
  const visibleStudentIds = students.map((item) => item.id);
  const visibleUserIds = [...new Set([...visibleStudentIds, ...recentOrders.map((item) => item.user_id)])];
  const existingNames = new Map(students.map((item) => [item.id, item.full_name?.trim() || "Student"]));
  const missingNameUserIds = recentOrders.map((item) => item.user_id).filter((id) => !existingNames.has(id));

  const [studentPaymentsResult, extraProfilesResult, emailResult] = await Promise.all([
    visibleStudentIds.length
      ? admin.from("payment_orders").select("user_id").eq("status", "paid").in("user_id", visibleStudentIds)
      : Promise.resolve({ data: [] as { user_id: string }[], error: null }),
    missingNameUserIds.length
      ? admin.from("profiles").select("id, full_name").in("id", missingNameUserIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[], error: null }),
    visibleUserIds.length
      ? admin.rpc("get_admin_user_emails", { requested_user_ids: visibleUserIds })
      : Promise.resolve({ data: [] as { user_id: string; email: string }[], error: null }),
  ]);

  const names = new Map(existingNames);
  for (const item of extraProfilesResult.data ?? []) {
    names.set(item.id, item.full_name?.trim() || "Student");
  }

  const emails = new Map(((emailResult.data ?? []) as { user_id: string; email: string }[]).map((item) => [item.user_id, item.email ?? ""]));
  const productNames = new Map(products.map((item) => [item.id, item.name]));

  const paymentsByStudent = new Map<string, number>();
  for (const item of studentPaymentsResult.data ?? []) {
    paymentsByStudent.set(item.user_id, (paymentsByStudent.get(item.user_id) ?? 0) + 1);
  }

  const seriesSales = products.map((product) => {
    const stat = seriesStatsMap.get(product.id) ?? { buyers: 0, payments: 0, activeStudents: 0, revenuePaise: 0 };
    return {
      ...product,
      ...stat,
    };
  });

  const hasError = Boolean(
    studentsResult.error ||
      productsResult.error ||
      recentOrdersResult.error ||
      (analyticsResult.error && fallbackError) ||
      emailResult.error,
  );

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Registrations</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Registration and purchase overview</h1>
          <p className="mt-2 max-w-3xl text-slate-600">See how many students registered, which Exam Series they purchased, active access, and payment status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SendUserEmailModal triggerLabel="Compose Email" />
          <Link href="/admin/access" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-teal-700">Manage Exam Series</Link>
        </div>
      </div>

      {hasError && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Some student or payment information could not be loaded. Refresh this page to try again.</p>}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Registered students" value={studentsResult.count ?? 0} detail="All student accounts" />
        <SummaryCard label="Paid students" value={uniquePaidStudents} detail="Unique successful buyers" />
        <SummaryCard label="Successful payments" value={totalSuccessfulPayments} detail="Completed transactions" />
        <SummaryCard label="Active access" value={activeAccessCount} detail="Students with current access" />
        <SummaryCard label="Gross sales" value={`₹${(totalRevenuePaise / 100).toLocaleString("en-IN")}`} detail="Before gateway charges or refunds" />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Series performance</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Who paid for each Exam Series</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500">Successful payments only</p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Exam Series</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid students</th>
                <th className="px-4 py-3">Payments</th>
                <th className="px-4 py-3">Active now</th>
                <th className="px-4 py-3">Gross sales</th>
              </tr>
            </thead>
            <tbody>
              {seriesSales.map((series) => (
                <tr key={series.id} className="border-b last:border-0">
                  <td className="px-4 py-4 font-black text-slate-950">{series.name}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${series.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {series.is_active ? "Selling" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold">{series.buyers}</td>
                  <td className="px-4 py-4">{series.payments}</td>
                  <td className="px-4 py-4">{series.activeStudents}</td>
                  <td className="px-4 py-4 font-black">₹{(series.revenuePaise / 100).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {!seriesSales.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No Exam Series have been created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">Recent registrations</h2>
              <p className="mt-1 text-sm text-slate-600">Latest student accounts and their successful purchase count.</p>
            </div>
            <SendUserEmailModal triggerLabel="Email Any User" triggerClassName="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 transition hover:bg-teal-100" />
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {students.slice(0, 20).map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950">{student.full_name?.trim() || "Student"}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{emails.get(student.id) || "Email unavailable"}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{student.phone ? `+91 ${student.phone}` : "Mobile number unavailable"}</p>
                  <p className="mt-1 text-xs text-slate-500">Joined {dateFormatter.format(new Date(student.created_at))}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{paymentsByStudent.get(student.id) ?? 0} paid</span>
                  <SendUserEmailModal initialEmail={emails.get(student.id) || ""} initialName={student.full_name?.trim() || "Student"} triggerVariant="row-action" triggerLabel="Mail" />
                </div>
              </div>
            ))}
            {!students.length && <p className="py-8 text-center text-sm text-slate-500">No students have registered yet.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Recent payment activity</h2>
          <p className="mt-1 text-sm text-slate-600">Successful, pending, failed, and cancelled orders.</p>
          <div className="mt-5 divide-y divide-slate-100">
            {recentOrders.slice(0, 20).map((order) => (
              <div key={order.id} className="py-4 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">{names.get(order.user_id) ?? "Student"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{emails.get(order.user_id) || "Email unavailable"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{productNames.get(order.product_id) ?? "Exam Series"} · {order.merchant_order_id}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black">₹{(Number(order.amount_paise) / 100).toLocaleString("en-IN")}</p>
                    <PaymentStatus status={order.status} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{dateFormatter.format(new Date(order.paid_at ?? order.created_at))}</p>
              </div>
            ))}
            {!recentOrders.length && <p className="py-8 text-center text-sm text-slate-500">No payment activity yet.</p>}
          </div>
        </section>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return (
    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const style = status === "paid" ? "bg-emerald-100 text-emerald-800" : status === "pending" || status === "created" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  return <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${style}`}>{status}</span>;
}
