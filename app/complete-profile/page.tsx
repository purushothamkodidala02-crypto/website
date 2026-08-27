import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./CompleteProfileForm";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  robots: { index: false, follow: false },
};

function safeNextPath(value: string | string[] | undefined) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") redirect("/admin-mfa");
  if (profile?.phone) redirect(nextPath);

  const metadataName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name.trim()
    : typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicHeader compact />
      <div className="mx-auto max-w-xl px-5 py-12 sm:px-8 sm:py-16">
        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
            One final step
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Complete your student profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Google securely confirmed your name and email. Add your mobile number once to finish creating your Varadhi Prep profile.
          </p>
          <CompleteProfileForm
            initialName={profile?.full_name?.trim() || metadataName}
            nextPath={nextPath}
          />
        </section>
      </div>
    </main>
  );
}
