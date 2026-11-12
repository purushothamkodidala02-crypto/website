import Link from "next/link";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { PublicAccountActions } from "@/components/site/PublicAccountActions";
import { PublicNavigationMenu } from "@/components/site/PublicNavigationMenu";

type PublicHeaderProps = {
  compact?: boolean;
};

export function PublicHeader({ compact = false }: PublicHeaderProps) {
  const navigation = [
    { href: "/", label: "Home", icon: "home" as const },
    { href: "/mock-tests", label: "Mock Tests", icon: "tests" as const },
    { href: "/support", label: "Support", icon: "support" as const },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div
        className={`mx-auto flex w-full max-w-[90rem] items-center justify-between gap-2 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:gap-4 sm:px-6 lg:px-8 ${
          compact ? "py-2.5 sm:py-3" : "py-2.5 sm:py-3.5"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <PublicNavigationMenu items={navigation} />
          <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 ml-2 pl-3 border-l border-slate-200/80">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-teal-50/70 hover:text-teal-900 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <PublicAccountActions />
      </div>
    </header>
  );
}
