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
        className="mt-5 block w-full rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 py-3.5 text-center text-sm font-semibold shadow-xs transition hover:shadow active:scale-[0.99]"
      >
        Sign in to start
      </Link>
    );
  }

  if (!hasResumableSession) {
    const startAction = beginMockTest.bind(null, testId, testPath, "resume");
    return (
      <form action={startAction} className="mt-5">
        <PendingSubmitButton
          onClick={handleFullscreenOnStart}
          pendingLabel="Starting test…"
          className="block w-full rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 py-3.5 text-center text-sm font-semibold shadow-xs transition hover:shadow active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          Start test
        </PendingSubmitButton>
      </form>
    );
  }

  const resumeAction = beginMockTest.bind(null, testId, testPath, "resume");
  const restartAction = beginMockTest.bind(null, testId, testPath, "restart");

  return (
    <div className="mt-5 grid gap-2.5">
      <form action={resumeAction}>
        <PendingSubmitButton
          onClick={handleFullscreenOnStart}
          pendingLabel="Resuming test…"
          className="block w-full rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-5 py-3.5 text-center text-sm font-semibold shadow-xs transition hover:shadow active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          Resume test
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
          className="block w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 text-center text-xs sm:text-sm font-semibold shadow-2xs transition disabled:cursor-wait disabled:opacity-70"
        >
          Restart test
        </PendingSubmitButton>
      </form>
    </div>
  );
}
