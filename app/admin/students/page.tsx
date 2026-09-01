import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PaidOrder = { id: string; user_id: string; product_id: string; amount_paise: number; created_at: string };
type ActiveEntitlement = { user_id: string; product_id: string };
type RecentOrder = PaidOrder & { merchant_order_id: string; status: string; paid_at: string | null };
type Product = { id: string; name: string; is_active: boolean };
type Student = { id: string; full_name: string | null; phone: string | null; created_at: string };

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

async function loadAllPaidOrders() {
  const admin = createAdminClient();
  const rows: PaidOrder[] = [];
  for (let page = 0; page < 100; page += 1) {
    const { data, error } = await admin
      .from("payment_orders")
      .select("id, user_id, product_id, amount_paise, created_at")
      .eq("status", "paid")
      .order("id")
      .range(page * 1000, page * 1000 + 999);
    if (error) return { rows: [] as PaidOrder[], error };
    const batch = (data ?? []) as PaidOrder[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return { rows, error: null };
}

async function loadAllActiveEntitlements(now: string) {
  const admin = createAdminClient();
  const rows: ActiveEntitlement[] = [];
  for (let page = 0; page < 100; page += 1) {
    const { data, error } = await admin
      .from("student_entitlements")
      .select("user_id, product_id")
      .gt("expires_at", now)
      .order("id")
      .range(page * 1000, page * 1000 + 999);
    if (error) return { rows: [] as ActiveEntitlement[], error };
    const batch = (data ?? []) as ActiveEntitlement[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return { rows, error: null };
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
  const [studentsResult, productsResult, recentOrdersResult, paidOrdersResult, activeResult] = await Promise.all([
    admin.from("profiles").select("id, full_name, phone, created_at", { count: "exact" }).eq("role", "student").order("created_at", { ascending: false }).limit(50),
    admin.from("access_products").select("id, name, is_active").order("display_order"),
    admin.from("payment_orders").select("id, user_id, product_id, merchant_order_id, amount_paise, status, paid_at, created_at").order("created_at", { ascending: false }).limit(50),
    loadAllPaidOrders(),
    loadAllActiveEntitlements(new Date().toISOString()),
  ]);

  const students = (studentsResult.data ?? []) as Student[];
  const products = (productsResult.data ?? []) as Product[];
  const recentOrders = (recentOrdersResult.data ?? []) as RecentOrder[];
  const paidOrders = paidOrdersResult.rows;
  const activeEntitlements = activeResult.rows;
  const visibleUserIds = [...new Set([...students.map((item) => item.id), ...recentOrders.map((item) => item.user_id)])];
  const [{ data: visibleProfiles }, emailResult] = visibleUserIds.length
    ? await Promise.all([
        admin.from("profiles").select("id, full_name").in("id", visibleUserIds),
        supabase.rpc("get_admin_user_emails", { requested_user_ids: visibleUserIds }),
      ])
    : [{ data: [] as { id: string; full_name: string | null }[] }, { data: [] as { user_id: string; email: string }[], error: null }];
  const names = new Map((visibleProfiles ?? []).map((item) => [item.id, item.full_name?.trim() || "Student"]));
  const emails = new Map(((emailResult.data ?? []) as { user_id: string; email: string }[]).map((item) => [item.user_id, item.email ?? ""]));
  const productNames = new Map(products.map((item) => [item.id, item.name]));
  const paidStudentIds = new Set(paidOrders.map((item) => item.user_id));
  const totalRevenuePaise = paidOrders.reduce((total, item) => total + Number(item.amount_paise), 0);
  const paymentsByStudent = new Map<string, number>();
  for (const order of paidOrders) paymentsByStudent.set(order.user_id, (paymentsByStudent.get(order.user_id) ?? 0) + 1);

  const seriesSales = products.map((product) => {
    const orders = paidOrders.filter((item) => item.product_id === product.id);
    const activeStudents = new Set(activeEntitlements.filter((item) => item.product_id === product.id).map((item) => item.user_id));
    return {
      ...product,
      buyers: new Set(orders.map((item) => item.user_id)).size,
      payments: orders.length,
      activeStudents: activeStudents.size,
      revenuePaise: orders.reduce((total, item) => total + Number(item.amount_paise), 0),
    };
  });
  const hasError = Boolean(studentsResult.error || productsResult.error || recentOrdersResult.error || paidOrdersResult.error || activeResult.error || emailResult.error);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Registrations</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black text-slate-950">Registration and purchase overview</h1><p className="mt-2 max-w-3xl text-slate-600">See how many students registered, which Exam Series they purchased, active access, and payment status.</p></div>
        <Link href="/admin/access" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-teal-700">Manage Exam Series</Link>
      </div>

      {hasError && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">Some student or payment information could not be loaded. Refresh this page to try again.</p>}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Registered students" value={studentsResult.count ?? 0} detail="All student accounts" />
        <SummaryCard label="Paid students" value={paidStudentIds.size} detail="Unique successful buyers" />
        <SummaryCard label="Successful payments" value={paidOrders.length} detail="Completed transactions" />
        <SummaryCard label="Active access" value={new Set(activeEntitlements.map((item) => item.user_id)).size} detail="Students with current access" />
        <SummaryCard label="Gross sales" value={`₹${(totalRevenuePaise / 100).toLocaleString("en-IN")}`} detail="Before gateway charges or refunds" />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Series performance</p><h2 className="mt-1 text-xl font-black text-slate-950">Who paid for each Exam Series</h2></div><p className="text-xs font-semibold text-slate-500">Successful payments only</p></div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Exam Series</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Paid students</th><th className="px-4 py-3">Payments</th><th className="px-4 py-3">Active now</th><th className="px-4 py-3">Gross sales</th></tr></thead>
            <tbody>
              {seriesSales.map((series) => <tr key={series.id} className="border-b last:border-0"><td className="px-4 py-4 font-black text-slate-950">{series.name}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${series.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{series.is_active ? "Selling" : "Paused"}</span></td><td className="px-4 py-4 font-bold">{series.buyers}</td><td className="px-4 py-4">{series.payments}</td><td className="px-4 py-4">{series.activeStudents}</td><td className="px-4 py-4 font-black">₹{(series.revenuePaise / 100).toLocaleString("en-IN")}</td></tr>)}
              {!seriesSales.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No Exam Series have been created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Recent registrations</h2><p className="mt-1 text-sm text-slate-600">Latest student accounts and their successful purchase count.</p>
          <div className="mt-5 divide-y divide-slate-100">{students.slice(0, 20).map((student) => <div key={student.id} className="flex items-center justify-between gap-4 py-4 first:pt-0"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{student.full_name?.trim() || "Student"}</p><p className="mt-1 truncate text-xs text-slate-500">{emails.get(student.id) || "Email unavailable"}</p><p className="mt-1 text-xs font-semibold text-slate-600">{student.phone ? `+91 ${student.phone}` : "Mobile number unavailable"}</p><p className="mt-1 text-xs text-slate-500">Joined {dateFormatter.format(new Date(student.created_at))}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{paymentsByStudent.get(student.id) ?? 0} paid</span></div>)}{!students.length && <p className="py-8 text-center text-sm text-slate-500">No students have registered yet.</p>}</div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Recent payment activity</h2><p className="mt-1 text-sm text-slate-600">Successful, pending, failed, and cancelled orders.</p>
          <div className="mt-5 divide-y divide-slate-100">{recentOrders.slice(0, 20).map((order) => <div key={order.id} className="py-4 first:pt-0"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{names.get(order.user_id) ?? "Student"}</p><p className="mt-1 truncate text-xs text-slate-500">{emails.get(order.user_id) || "Email unavailable"}</p><p className="mt-1 truncate text-xs text-slate-500">{productNames.get(order.product_id) ?? "Exam Series"} · {order.merchant_order_id}</p></div><div className="shrink-0 text-right"><p className="font-black">₹{(Number(order.amount_paise) / 100).toLocaleString("en-IN")}</p><PaymentStatus status={order.status} /></div></div><p className="mt-2 text-xs text-slate-500">{dateFormatter.format(new Date(order.paid_at ?? order.created_at))}</p></div>)}{!recentOrders.length && <p className="py-8 text-center text-sm text-slate-500">No payment activity yet.</p>}</div>
        </section>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-600">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p><p className="mt-2 text-xs font-semibold text-slate-500">{detail}</p></div>;
}

function PaymentStatus({ status }: { status: string }) {
  const style = status === "paid" ? "bg-emerald-100 text-emerald-800" : status === "pending" || status === "created" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  return <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${style}`}>{status}</span>;
}
