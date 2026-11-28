"use client";

import { useState, useTransition } from "react";
import { setQuestionBookmark } from "@/lib/actions/question-bookmarks";

export function BookmarkButton({
  questionId,
  initialBookmarked,
  className = "",
}: {
  questionId: string;
  initialBookmarked: boolean;
  className?: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      const result = await setQuestionBookmark(questionId, next);
      if (!result.success) setBookmarked(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-busy={pending}
      className={`inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 py-2 text-xs font-bold transition disabled:cursor-wait disabled:opacity-70 sm:min-w-32 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm ${bookmarked ? "border-teal-300 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"} ${className}`}
    >
      <span aria-hidden="true">{bookmarked ? "★" : "☆"}</span>
      {pending ? "Saving…" : bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
