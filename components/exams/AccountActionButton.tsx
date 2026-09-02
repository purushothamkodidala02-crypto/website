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
      <div className="inline-flex rounded-xl border border-slate-700 px-5 py-3.5 font-black opacity-0">
        Go to my progress
      </div>
    );
  }

  return (
    <Link href={action.href} className="inline-flex rounded-xl border border-slate-700 px-5 py-3.5 font-black text-white hover:bg-white/5">
      {action.label}
    </Link>
  );
}
