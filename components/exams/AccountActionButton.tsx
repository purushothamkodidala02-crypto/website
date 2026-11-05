"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AccountActionButton({ canonical }: { canonical: string }) {
  const [action, setAction] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAction({ href: `/login?next=${encodeURIComponent(canonical)}`, label: "Sign in" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        setAction({ href: "/admin", label: "Admin workspace" });
      } else {
        setAction({ href: "/dashboard", label: "Go to my progress" });
      }
    }
    
    checkAuth();
  }, [canonical]);

  if (!action) {
    // Show an invisible placeholder of the exact same size to prevent layout shift
    return (
      <div className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-xs sm:text-sm opacity-0">
        Go to my progress
      </div>
    );
  }

  return (
    <Link
      href={action.href}
      className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition shadow-xs"
    >
      {action.label}
    </Link>
  );
}
