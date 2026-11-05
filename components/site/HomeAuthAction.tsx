"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HomeAuthAction({
  className,
  loggedOutText = "Create account",
  loggedInText = "Go to my dashboard →",
}: {
  className?: string;
  loggedOutText?: string;
  loggedInText?: string;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setIsLoggedIn(Boolean(data.session?.user));
      }
    }).catch(() => {
      if (active) setIsLoggedIn(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoggedIn === true) {
    return (
      <Link href="/dashboard" className={className}>
        {loggedInText}
      </Link>
    );
  }

  return (
    <Link href="/signup" className={className}>
      {loggedOutText}
    </Link>
  );
}
