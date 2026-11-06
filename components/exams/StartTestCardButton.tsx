"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function StartTestCardButton({
  href,
  label = "Start test",
}: {
  href: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={() => {
        setClicked(true);
        startTransition(() => {
          router.push(href);
        });
      }}
      className={`inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] ${
        clicked || isPending ? "opacity-90 cursor-wait bg-teal-900" : ""
      }`}
    >
      <span>{clicked || isPending ? "Starting…" : label}</span>
      <span
        aria-hidden="true"
        className={clicked || isPending ? "inline-block animate-pulse" : ""}
      >
        →
      </span>
    </Link>
  );
}
