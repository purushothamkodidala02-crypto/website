import React from "react";
import type { ExamGuide } from "@/lib/exam-guides";

export function ExamLandingGuide({
  guide,
  canonicalUrl,
  hasTests = true,
}: {
  guide: ExamGuide;
  canonicalUrl: string;
  hasTests?: boolean;
}) {
  return (
    <div className="space-y-14">
      {/* What is Included in our Mock Test Series */}
      <section aria-labelledby="features-heading">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Series Overview</p>
        <h2 id="features-heading" className="font-display mt-2 text-2xl sm:text-3xl text-slate-950">
          {guide.featuresHeading}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Our online test series is crafted around the latest TGPRB syllabus and difficulty benchmarks, giving aspirants complete confidence on exam day.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guide.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
            >
              <div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-100/80 text-teal-900">
                  {feature.icon === "test" && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  {feature.icon === "pyp" && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {feature.icon === "analytics" && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {feature.icon === "bilingual" && (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  )}
                </div>
                <h3 className="font-display mt-4 text-lg text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Understanding the Exam Pattern */}
      <section id="exam-pattern" aria-labelledby="pattern-heading" className="scroll-mt-24">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Scheme of Examination</p>
        <h2 id="pattern-heading" className="font-display mt-2 text-2xl sm:text-3xl text-slate-950">
          {guide.patternHeading}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Comprehensive blueprint comparing Preliminary Written Test (PWT) and Final Written Examination (FWE) to help you allocate study hours strategically.
        </p>

        {/* Pattern overview pills */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Prelims Pattern</p>
            <p className="mt-1 font-display text-sm text-slate-950">{guide.patternSummary.prelimsTotal}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Mains Pattern</p>
            <p className="mt-1 font-display text-sm text-slate-950">{guide.patternSummary.mainsTotal}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Marking Scheme</p>
            <p className="mt-1 font-display text-sm text-slate-950">{guide.patternSummary.markingScheme}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Examination Mode</p>
            <p className="mt-1 font-display text-sm text-slate-950">{guide.patternSummary.mode}</p>
          </div>
        </div>

        {/* Sectional Weightage Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-black uppercase tracking-wider sm:px-6">Subject / Paper Section</th>
                  <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Prelims</th>
                  <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Mains</th>
                  <th className="hidden px-4 py-3.5 text-xs font-black uppercase tracking-wider md:table-cell">Weightage</th>
                  <th className="hidden px-4 py-3.5 text-xs font-black uppercase tracking-wider lg:table-cell">Key Syllabus Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {guide.patternRows.map((row, idx) => (
                  <tr key={idx} className="transition hover:bg-teal-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-950 sm:px-6">
                      {row.subject}
                      <p className="mt-1 text-xs font-normal text-slate-500 lg:hidden">{row.syllabusHighlights}</p>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-teal-800 whitespace-nowrap">{row.prelimsQuestions}</td>
                    <td className="px-3 py-3.5 font-semibold text-slate-700 whitespace-nowrap">{row.mainsQuestions}</td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black ${
                        row.weightage.includes("High")
                          ? "bg-amber-100 text-amber-900"
                          : "bg-teal-100 text-teal-900"
                      }`}>
                        {row.weightage}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-xs leading-5 text-slate-600 lg:table-cell">
                      {row.syllabusHighlights}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Telangana Police Constable Previous Year Papers */}
      <section id="previous-year-papers" aria-labelledby="pyp-heading" className="scroll-mt-24 rounded-3xl border border-teal-200 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white sm:p-9 shadow-lg">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">Previous Exam Analysis</p>
          <h2 id="pyp-heading" className="font-display mt-2 text-2xl sm:text-3xl text-white">
            {guide.pypHeading}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            {guide.pypDescription}
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guide.pypHighlights.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 backdrop-blur-xs">
              <span className="inline-block rounded-md bg-teal-500/20 px-2.5 py-1 text-xs font-black text-teal-300">
                {item.year}
              </span>
              <h3 className="font-display mt-3 text-base text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">{item.takeaway}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Practice all authentic previous year questions with step-by-step solutions on Varadhi Prep.
          </p>
          <a
            href="#tests"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-teal-200"
          >
            Practice Online Tests Now →
          </a>
        </div>
      </section>

      {/* 5. Tips to Ace the Exam & Prelims vs Mains Differences */}
      <section aria-labelledby="tips-heading">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Preparation Strategy</p>
        <h2 id="tips-heading" className="font-display mt-2 text-2xl sm:text-3xl text-slate-950">
          {guide.tipsHeading}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          To secure your post in Telangana Police Recruitment, combine structured subject study with disciplined mock test benchmarking.
        </p>

        {/* Prelims vs Mains Differences Subheading */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="font-display text-xl sm:text-2xl text-slate-950">
            {guide.prelimsMainsDiffHeading}
          </h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm leading-6 text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
              <h4 className="font-bold text-slate-950">Preliminary Written Test (PWT)</h4>
              <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
                <li><strong>Purpose:</strong> Screening test to qualify candidates for Physical Measurement Test (PMT) & Physical Efficiency Test (PET).</li>
                <li><strong>Strategy:</strong> Focus on clearing the cutoff thresholds while avoiding negative mark penalties. Accuracy in Arithmetic and General Studies ensures safe passage.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-teal-50/60 p-5 border border-teal-200">
              <h4 className="font-bold text-teal-950">Final Written Examination (FWE)</h4>
              <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-teal-900 list-disc list-inside">
                <li><strong>Purpose:</strong> Merit ranking test that directly determines your selection into Civil, AR, TSSP, or other constable cadres.</li>
                <li><strong>Strategy:</strong> Every single mark counts towards your state rank. Maximize score in high-weightage sections (Telangana Movement and Math).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tactical Tips Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guide.tips.map((tip, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-teal-300">
                0{idx + 1}
              </span>
              <h4 className="font-display mt-3 text-base text-slate-950">{tip.title}</h4>
              <p className="mt-2 text-xs leading-5 text-slate-600">{tip.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
