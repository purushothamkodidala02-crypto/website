import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { createClient } from "@/lib/supabase/server";
import { AdminMfaForm } from "./AdminMfaForm";

export const metadata: Metadata = {
  title: "Admin security verification",
  robots: { index: false, follow: false },
};

export default async function AdminMfaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [{ data: assurance }, { data: factorsData }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (assurance?.currentLevel === "aal2") redirect("/admin");

  const verifiedTotp = factorsData?.totp?.[0];
  const initialFactor = verifiedTotp
    ? {
        id: verifiedTotp.id,
        friendlyName: verifiedTotp.friendly_name || "Varadhi Admin",
      }
    : null;

  return (
    <main className="student-page min-h-screen bg-[#f6faf8] px-4 py-8 text-slate-950 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-center">
          <BrandLockup
            context="admin"
            markClassName="h-11 w-11 shrink-0 drop-shadow-[0_8px_14px_rgba(10,41,34,0.16)]"
          />
        </div>

        <div className="mt-7 grid overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[0.84fr_1.16fr]">
          <aside className="bg-gradient-to-br from-[#0a2922] via-[#0e3a30] to-[#144d40] p-7 text-white sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              Admin Workspace Security
            </p>
            <h1 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Two-Factor Verification
            </h1>
            <p className="mt-3 text-sm leading-6 text-teal-50/90">
              Verify your identity with a six-digit code from your authenticator app
              to open the Varadhi Prep administration workspace.
            </p>

            <ol className="mt-7 space-y-4 text-sm">
              <SecurityStep number="1" title="Signed in with your account" />
              <SecurityStep number="2" title="Enter your 6-digit authenticator code" />
              <SecurityStep number="3" title="Continue to Admin Workspace" />
            </ol>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs leading-5 text-teal-50">
              Compatible with Google Authenticator, Microsoft Authenticator, Authy,
              and 1Password.
            </div>
          </aside>

          <section className="p-6 sm:p-10">
            <AdminMfaForm
              email={user.email ?? "Administrator"}
              initialFactor={initialFactor}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function SecurityStep({ number, title }: { number: string; title: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 font-black">
        {number}
      </span>
      <span className="font-bold">{title}</span>
    </li>
  );
}
