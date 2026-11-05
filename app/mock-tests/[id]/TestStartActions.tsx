"use client";

import Link from "next/link";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { beginMockTest } from "./start-actions";
import { isBigScreen, isCurrentlyFullscreen, isFullscreenSupported, requestFullscreenSafely } from "@/lib/fullscreen";

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
  const handleFullscreenOnStart = () => {
    if (isBigScreen() && isFullscreenSupported() && !isCurrentlyFullscreen()) {
      void requestFullscreenSafely();
    }
  };

  if (!isLoggedIn) {
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

  if (!hasResumableSession) {
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
