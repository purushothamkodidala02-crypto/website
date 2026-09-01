import Image from "next/image";

type BrandMarkProps = { className?: string; preload?: boolean };

export function BrandMark({ className = "h-11 w-11", preload = false }: BrandMarkProps) {
  return (
    <Image
      src="/varadhi-v-logo.png"
      alt=""
      aria-hidden="true"
      width={48}
      height={48}
      sizes="48px"
      preload={preload}
      className={className}
    />
  );
}

type BrandLockupProps = { context?: "public" | "admin"; markClassName?: string };

export function BrandLockup({ context = "public", markClassName }: BrandLockupProps) {
  const admin = context === "admin";
  return (
    <span className="flex items-center gap-3">
      <BrandMark preload className={markClassName ?? "h-11 w-11 shrink-0 drop-shadow-[0_8px_12px_rgba(7,18,37,0.18)]"} />
      <span className="leading-none">
        <span className={`font-brand block text-[1.08rem] font-bold tracking-[-0.035em] sm:text-[1.28rem] ${admin ? "text-white" : "text-slate-950"}`}>Varadhi Prep</span>
        <span className={`mt-1.5 hidden text-[8px] font-black uppercase tracking-[0.18em] sm:block ${admin ? "text-teal-200" : "text-teal-700"}`}>{admin ? "Admin workspace" : "Smart mock tests for career growth"}</span>
      </span>
    </span>
  );
}
