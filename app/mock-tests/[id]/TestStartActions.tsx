"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { beginMockTest } from "./start-actions";
import { isBigScreen, isCurrentlyFullscreen, isFullscreenSupported, requestFullscreenSafely } from "@/lib/fullscreen";
import { createClient } from "@/lib/supabase/client";

export function TestStartActions({
  testId,
  testPath,
  isLoggedIn,
  hasResumableSession,
}: {
  testId: string;
  testPath: string;
  isLoggedIn: boolean;
  hasResumableSession: boolean;
}) {
  const [clientSignedIn, setClientSignedIn] = useState(false);
  const [clientResumable, setClientResumable] = useState(false);

  const signedIn = isLoggedIn || clientSignedIn;
  const resumable = hasResumableSession || clientResumable;

  useEffect(() => {
    if (isLoggedIn) return;
    let active = true;
    const supabase = createClient();
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || !session?.user) return;
      setClientSignedIn(true);
      const { data: activeSession } = await supabase
        .from("test_attempt_sessions")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("mock_test_id", testId)
        .is("submitted_at", null)
        .gt("remaining_seconds", 0)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active && activeSession) {
        setClientResumable(true);
      }
    });

    return () => {
      active = false;
    };
  }, [isLoggedIn, testId]);

  const handleFullscreenOnStart = () => {
    if (isBigScreen() && isFullscreenSupported() && !isCurrentlyFullscreen()) {
      void requestFullscreenSafely();
    }
  };

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(testPath)}`}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-teal-900/15 transition-all hover:from-teal-800 hover:to-emerald-900 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.99]"
      >
        <span>Sign in to start</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    );
  }

  if (!resumable) {
    const startAction = beginMockTest.bind(null, testId, testPath, "resume");
    return (
      <form action={startAction} className="mt-1">
        <PendingSubmitButton
          onClick={handleFullscreenOnStart}
          pendingLabel="Starting test…"
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-teal-900/15 transition-all hover:from-teal-800 hover:to-emerald-900 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          <span>Start test</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </PendingSubmitButton>
      </form>
    );
  }

  const resumeAction = beginMockTest.bind(null, testId, testPath, "resume");
  const restartAction = beginMockTest.bind(null, testId, testPath, "restart");

  return (
    <div className="mt-1 grid gap-2.5">
      <form action={resumeAction}>
        <PendingSubmitButton
          onClick={handleFullscreenOnStart}
          pendingLabel="Resuming test…"
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-teal-900/15 transition-all hover:from-teal-800 hover:to-emerald-900 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          <span>Resume test</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </PendingSubmitButton>
      </form>
      <form
        action={restartAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Restart this test? Your unfinished answers and saved time will be cleared.",
            )
          ) {
            event.preventDefault();
          } else {
            handleFullscreenOnStart();
          }
        }}
      >
        <PendingSubmitButton
          pendingLabel="Restarting test…"
          className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 text-center text-xs sm:text-sm font-semibold shadow-2xs transition hover:border-slate-400 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          Restart test
        </PendingSubmitButton>
      </form>
    </div>
  );
}
