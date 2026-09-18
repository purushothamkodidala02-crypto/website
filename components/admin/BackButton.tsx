import Link from "next/link";

export function BackButton({ fallbackHref, label, className }: { fallbackHref: string; label: string; className?: string }) {
  return (
    <Link href={fallbackHref} className={className}>
      {label}
    </Link>
  );
}
