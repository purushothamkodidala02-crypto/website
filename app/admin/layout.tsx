import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Administration | Varadhi Prep",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: assurance, error: assuranceError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  if (assuranceError || assurance?.currentLevel !== "aal2") {
    redirect("/admin-mfa");
  }

  return (
    <div className="admin-workspace">
      <AdminShell
        userEmail={user.email ?? ""}
        adminName={profile?.full_name ?? "Administrator"}
      >
        {children}
      </AdminShell>
    </div>
  );
}
