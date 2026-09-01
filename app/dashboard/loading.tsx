import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";

export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="Loading your dashboard" className="student-page min-h-screen bg-[#f5f8f8]">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/15 sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-7">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                Student dashboard
              </p>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Keep your preparation moving.
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Review your progress, understand weaker subjects, and choose the next focused mock test.
              </p>
            </div>
            <Link href="/mock-tests" className="rounded-xl bg-teal-300 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/20">
              Find a mock test
            </Link>
          </div>
        </section>

        <section aria-label="Loading dashboard results" className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white motion-reduce:animate-none" />)}
        </section>
      </div>
    </main>
  );
}
