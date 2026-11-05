import { PublicHeader } from "@/components/site/PublicHeader";

export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="Loading your dashboard" className="student-page min-h-screen bg-slate-50/70">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* Top Header Card Skeleton */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-32 rounded-md bg-slate-200 animate-pulse" />
                <div className="h-4 w-20 rounded-full bg-teal-100/60 animate-pulse" />
              </div>
              <div className="h-7 sm:h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-72 max-w-full rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-10 w-28 rounded-xl bg-teal-100/60 animate-pulse" />
              <div className="h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Stats Row Skeleton */}
        <section aria-label="Loading dashboard metrics" className="grid grid-cols-3 gap-2 sm:gap-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-xs animate-pulse motion-reduce:animate-none space-y-2"
            >
              <div className="h-3 w-16 sm:w-24 rounded bg-slate-200" />
              <div className="h-6 sm:h-8 w-12 sm:w-20 rounded bg-slate-200" />
              <div className="hidden sm:block h-3 w-28 rounded bg-slate-100" />
            </div>
          ))}
        </section>

        {/* Content Skeleton */}
        <section aria-label="Loading dashboard results" className="space-y-3">
          <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs animate-pulse motion-reduce:animate-none"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
