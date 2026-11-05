import { PublicHeader } from "@/components/site/PublicHeader";

export default function AttemptReviewLoading() {
  return (
    <main aria-busy="true" aria-label="Loading your attempt review" className="student-page min-h-screen bg-[#f5f8f8]">
      <PublicHeader />
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="h-5 w-36 animate-pulse rounded-lg bg-slate-200" />

        {/* Score header card skeleton */}
        <section className="relative mt-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-72 sm:w-96 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-60 sm:w-80 animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="h-24 w-40 animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />
          </div>
        </section>

        {/* Metrics skeleton */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </section>

        {/* Navigator question & explanation skeleton */}
        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white lg:col-span-7" />
          <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white lg:col-span-5" />
        </section>
      </div>
    </main>
  );
}
