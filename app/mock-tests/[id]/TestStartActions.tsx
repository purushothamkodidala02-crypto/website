"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { beginMockTest } from "./start-actions";
import { isBigScreen, isCurrentlyFullscreen, isFullscreenSupported, requestFullscreenSafely } from "@/lib/fullscreen";
import { createClient } from "@/lib/supabase/client";
import { addLocalAttemptedTestId, getLocalAttemptedTestIds } from "@/lib/storage/student-practice-storage";
import { getClientDeviceId } from "@/lib/auth/client-device";

export function TestStartActions({
  testId,
  testPath,
  isLoggedIn,
  hasResumableSession,
  hasPreviousAttempt = false,
}: {
  testId: string;
  testPath: string;
  isLoggedIn: boolean;
  hasResumableSession: boolean;
  hasPreviousAttempt?: boolean;
}) {
  const [clientSignedIn, setClientSignedIn] = useState(false);
  const [clientResumable, setClientResumable] = useState(false);
  const [clientHasAttempt, setClientHasAttempt] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const signedIn = isLoggedIn || clientSignedIn;
  const resumable = hasResumableSession || clientResumable;
  const hasAttempt = hasPreviousAttempt || clientHasAttempt;

  useEffect(() => {
    setDeviceId(getClientDeviceId());

    // Check localStorage cache for 0ms initial attempt status
    const localAttempted = getLocalAttemptedTestIds();
    if (localAttempted.includes(testId)) {
      setClientHasAttempt(true);
    }

    let active = true;
    const supabase = createClient();
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || !session?.user) return;
      setClientSignedIn(true);

      const [sessionRes, attemptRes] = await Promise.all([
        supabase
          .from("test_attempt_sessions")
          .select("id, remaining_seconds, expires_at")
          .eq("user_id", session.user.id)
          .eq("mock_test_id", testId)
          .is("submitted_at", null)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("test_attempts")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("mock_test_id", testId)
          .limit(1)
          .maybeSingle(),
      ]);

      if (active && sessionRes.data) {
        const remainingSec = sessionRes.data.remaining_seconds;
        const expiresAt = sessionRes.data.expires_at ? new Date(sessionRes.data.expires_at).getTime() : 0;
        const isStillValid = (typeof remainingSec === "number" && remainingSec > 0) || expiresAt > Date.now();
        if (isStillValid) {
          setClientResumable(true);
        }
      }
      if (active && attemptRes.data) {
        setClientHasAttempt(true);
        addLocalAttemptedTestId(testId);
      }
    });

    return () => {
      active = false;
    };
  }, [testId]);

  const handleFullscreenOnStart = () => {
    try {
      if (isBigScreen() && isFullscreenSupported() && !isCurrentlyFullscreen()) {
        void requestFullscreenSafely();
      }
    } catch {
      // Ignore fullscreen failure so form submission continues immediately
    }
  };

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(testPath)}`}
        prefetch={true}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-teal-900/15 transition-all hover:from-teal-800 hover:to-emerald-900 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.99]"
      >
        <span>Sign in to start</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    );
  }

  const effectiveDeviceId = deviceId || (typeof window !== "undefined" ? getClientDeviceId() : "");

  if (!resumable) {
    const startAction = beginMockTest.bind(null, testId, testPath, "resume", effectiveDeviceId);

    if (hasAttempt) {
      return (
        <form action={startAction} className="mt-1">
          <PendingSubmitButton
            onClick={handleFullscreenOnStart}
            pendingLabel="Preparing retake…"
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-md shadow-teal-900/15 transition-all hover:from-teal-800 hover:to-emerald-900 hover:shadow-lg hover:shadow-teal-900/25 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          >
            <span>Retake test</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </PendingSubmitButton>
        </form>
      );
    }

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

  const resumeAction = beginMockTest.bind(null, testId, testPath, "resume", effectiveDeviceId);
  const restartAction = beginMockTest.bind(null, testId, testPath, "restart", effectiveDeviceId);

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
