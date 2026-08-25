"use client";

import { useState, useTransition } from "react";
import { setQuestionBookmark } from "@/lib/actions/question-bookmarks";

export function BookmarkButton({ questionId, initialBookmarked }: { questionId: string; initialBookmarked: boolean }) {
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
      className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${bookmarked ? "border-teal-300 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"}`}
    >
      <span aria-hidden="true">{bookmarked ? "★" : "☆"}</span>
      {pending ? "Saving…" : bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
