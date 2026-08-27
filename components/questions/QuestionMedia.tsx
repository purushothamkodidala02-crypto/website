"use client";

/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import { useState } from "react";

const QuestionImageViewer = dynamic(
  () => import("@/components/questions/QuestionImageViewer").then((module) => module.QuestionImageViewer),
  { ssr: false },
);

export function QuestionMedia({
  src,
  alt = "Reference image for this question",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  function showLargeImage() {
    setOpen(true);
  }

  return (
    <>
      <figure className={`rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-3 ${className}`}>
        <button
          type="button"
          onClick={showLargeImage}
          aria-label="Open a larger view of the Question image"
          className="group block w-full overflow-hidden rounded-xl bg-white outline-none ring-teal-500 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="mx-auto h-auto max-h-[14rem] max-w-full w-auto object-contain transition group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:max-h-[18rem]"
          />
        </button>
        <figcaption className="mt-2 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-600">
          <span aria-hidden="true">View larger</span>
          <span>Open the image for full-screen zoom controls.</span>
        </figcaption>
      </figure>

      {open && <QuestionImageViewer src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
