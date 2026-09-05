import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { CatalogSteps } from "@/components/exams/CatalogSteps";
import { ExamSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, mockTestUrl, paperUrl, specializationUrl, stateUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { absoluteUrl } from "@/lib/site";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccountActionButton } from "@/components/exams/AccountActionButton";

type Props = { params: Promise<{ id: string; exam: string }>; searchParams: Promise<Filters> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id, exam } = await params;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) return { title: "Exam Mock Tests Not Found", robots: { index: false, follow: false } };
  const canonical = examUrl(context.state.slug, context.exam.slug);
  const seo = resolveSeoFields(context.exam, {
    title: `${context.exam.name} Mock Tests in ${context.state.name}`,
    description: `Practise ${context.exam.name} mock tests for ${context.state.name}. Explore papers, take timed tests and review every answer.`,
  });
  return publicCollectionMetadata({ ...seo, canonical, indexable: isIndexableCollectionQuery(await searchParams) });
}

const getCachedFaqs = unstable_cache(
  async (examId: string) => {
    const admin = createAdminClient();
    const { data } = await admin.from("exam_page_faqs").select("id, question, answer, display_order").eq("exam_group_id", examId).order("display_order");
    return data;
  },
  ["exam-faqs"],
  { revalidate: 300 }
);

export default async function ExamPage({ params, searchParams }: Props) {
  const { id, exam } = await params;
  const filters = await searchParams;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) notFound();

  const canonical = examUrl(context.state.slug, context.exam.slug);
  if (context.usedAlias || id !== context.state.slug || exam !== context.exam.slug) permanentRedirect(canonical);

  const hasListingQuery = Boolean(filters.view === "all" || filters.q || (filters.type && filters.type !== "all") || (filters.page && filters.page !== "1"));
  if (hasListingQuery) {
    return MockTestsPage({ searchParams: Promise.resolve({ ...filters, state: context.state.slug, exam: context.exam.slug }), canonicalPath: canonical });
  }

  const { catalog } = context;
  const papers = catalog.papers.filter((paper) => paper.exam_group_id === context.exam!.id);
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const paperIds = new Set(papers.map((paper) => paper.id));
  const tests = catalog.tests
    .filter((test) => paperIds.has(test.paper_id))
    .sort((a, b) => {
      const diff = Number(b.series_number ?? 0) - Number(a.series_number ?? 0);
      if (diff !== 0) return diff;
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return timeB - timeA;
    });
  const specializations = catalog.specializations.filter((item) => item.exam_group_id === context.exam!.id);
  const seo = resolveSeoFields(context.exam, {
    title: `${context.exam.name} Mock Tests in ${context.state.name}`,
    description: `Practise ${context.exam.name} mock tests for ${context.state.name}. Explore papers, take timed tests and review every answer.`,
  });
  
  const savedQuestions = await getCachedFaqs(context.exam!.id);
    
  const introduction = context.exam.description?.trim() || seo.description;
  const standardQuestions = [
    { question: `Where can I take ${context.exam.name} mock tests?`, answer: `Choose a paper on this page, open an available mock test and start practising ${context.exam.name} on Varadhi Prep.`, displayOrder: 0 },
    { question: `How many ${context.exam.name} mock tests are available?`, answer: tests.length > 0 ? `${tests.length} published mock test${tests.length === 1 ? " is" : "s are"} currently available across ${papers.length} paper${papers.length === 1 ? "" : "s"}. New published tests automatically appear on this page.` : "Mock tests are being prepared and will appear on this page after publication.", displayOrder: 1 },
    { question: `Can I review my ${context.exam.name} answers?`, answer: "Yes. After submitting a test, you can review your score, selected answers, correct answers and available explanations from your student dashboard.", displayOrder: 2 },
  ];
  const savedByOrder = new Map((savedQuestions ?? []).map((item) => [item.display_order, item]));
  const questions = [
    ...standardQuestions.map((item) => savedByOrder.get(item.displayOrder) ?? item),
    ...(savedQuestions ?? []).filter((item) => item.display_order >= standardQuestions.length),
  ].map((item) => ({ question: item.question, answer: item.answer }));
  const structuredData = [
    ...collectionStructuredData(seo.title, seo.description, canonical, [
      { name: "Home", path: "/" },
      { name: "Mock tests", path: "/mock-tests" },
      { name: context.state.name, path: stateUrl(context.state.slug) },
      { name: context.exam.name, path: canonical },
    ]),
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: `${context.exam.name} mock tests`, numberOfItems: tests.length, itemListElement: tests.slice(0, 12).map((test, index) => { const paper = papers.find((item) => item.id === test.paper_id)!; return { "@type": "ListItem", position: index + 1, name: studentTestTitle(test, context.exam!.name, paperDisplayById.get(paper.id)?.shortLabel ?? paper.name), url: absoluteUrl(mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)) }; }) },
  ];

  return (
    <main className="student-page min-h-screen bg-[#f4f7f8] text-slate-950">
      <JsonLd data={structuredData} />
      <PublicHeader />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.2),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400"><Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span><Link href={stateUrl(context.state.slug)} className="hover:text-white">{context.state.name}</Link><span aria-hidden="true">/</span><span className="text-teal-200">{context.exam.name}</span></nav>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-teal-200"><ExamSymbol name={context.exam.name} className="h-4 w-4" /> {context.state.code} exam preparation</p>
              <h1 className="font-display mt-5 max-w-4xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">{context.exam.name} Mock Tests</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{introduction}</p>
              <div className="mt-8 flex flex-wrap gap-3"><a href="#papers" className="rounded-xl bg-teal-300 px-5 py-3.5 font-black text-slate-950 hover:bg-teal-200">Choose a paper</a><AccountActionButton canonical={canonical} /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        <CatalogSteps
          state={{ value: context.state.name, href: "/mock-tests" }}
          exam={{ value: context.exam.name, href: stateUrl(context.state.slug) }}
        />
        {specializations.length > 0 && <section aria-labelledby="specialisations-title"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Exam paths</p><h2 id="specialisations-title" className="font-display mt-2 text-3xl">Choose a specialisation</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{specializations.map((item) => { return <Link key={item.id} href={specializationUrl(context.state.slug, context.exam!.slug, item.slug)} className="group flex flex-col justify-center rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"><h3 className="font-display text-xl">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description || `View papers and mock tests for ${item.name}.`}</p><span className="mt-5 inline-block text-sm font-black text-teal-800">Explore specialisation →</span></Link>; })}</div></section>}

        <section id="papers" aria-labelledby="papers-title" className="scroll-mt-24">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Choose paper</p><h2 id="papers-title" className="font-display mt-2 text-3xl">{context.exam.name} mock test papers</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Select a paper to view its mock tests, topic practice, and answer review.</p>
          {papers.length === 0 ? <EmptyState title="Papers are being prepared" detail="This exam landing page is ready. Its papers and mock tests will appear here after the administrator publishes them." /> : <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full table-auto text-left"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-4 text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Paper name</th><th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Practice</th></tr></thead><tbody className="divide-y divide-slate-200">{papers.map((paper) => <tr key={paper.id} className="transition hover:bg-teal-50/60"><td className="px-4 py-5 sm:px-6"><span className="font-display block break-words text-base text-slate-950 sm:text-lg">{paper.name}</span></td><td className="px-4 py-5 text-right sm:px-6"><Link href={paperUrl(context.state.slug, context.exam!.slug, paper.slug)} className="inline-flex whitespace-nowrap rounded-lg bg-teal-100 px-3 py-2 text-xs font-black text-teal-900 transition hover:bg-teal-200 sm:px-4 sm:text-sm">Open paper →</Link></td></tr>)}</tbody></table></div>}
        </section>

        <section aria-labelledby="tests-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Timed practice</p>
              <h2 id="tests-title" className="font-display mt-2 text-3xl">Latest mock tests</h2>
            </div>
          </div>
          {tests.length === 0 ? <EmptyState title="Mock tests are coming soon" detail="The exam page is active. Published mock tests will automatically appear here." /> : <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[30rem] overflow-auto">
                <table className="w-full table-auto text-left">
                  <thead className="sticky top-0 bg-slate-950 text-white">
                    <tr><th className="px-4 py-4 text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Mock test name</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] md:table-cell">Paper</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] sm:table-cell">Duration</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] lg:table-cell">Access</th><th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Practice</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tests.slice(0, 4).map((test) => { const paper = papers.find((item) => item.id === test.paper_id)!; return <tr key={test.id} className="transition hover:bg-teal-50/60"><td className="px-4 py-5 sm:px-6"><Link href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)} className="font-display block break-words text-base text-slate-950 hover:text-teal-800 sm:text-lg">{studentTestTitle(test, context.exam!.name, paperDisplayById.get(paper.id)?.shortLabel ?? paper.name)}</Link><p className="mt-1 text-xs text-slate-500 sm:hidden">{test.duration_minutes} minutes</p><p className="mt-1 text-xs text-slate-500 md:hidden">{paper.name}</p></td><td className="hidden px-4 py-5 text-sm font-semibold text-slate-700 md:table-cell">{paper.name}</td><td className="hidden px-4 py-5 text-sm text-slate-600 sm:table-cell">{test.duration_minutes} minutes</td><td className="hidden px-4 py-5 lg:table-cell"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${test.access_type === "free" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{test.access_type === "free" ? "Free" : "Included"}</span></td><td className="px-4 py-5 text-right sm:px-6"><Link href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)} className="inline-flex whitespace-nowrap rounded-lg bg-teal-100 px-3 py-2 text-xs font-black text-teal-900 transition hover:bg-teal-200 sm:px-4 sm:text-sm">Start →</Link></td></tr>; })}
                  </tbody>
                </table>
              </div>
            </div>
            {tests.length > 4 && <div className="mt-4 flex justify-center"><Link href={`${canonical}?view=all`} className="inline-flex rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-black text-teal-900 transition hover:bg-teal-100">View more mock tests →</Link></div>}
          </>}
        </section>

        <section aria-labelledby="faq-title" className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-9"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">Common questions</p><h2 id="faq-title" className="font-display mt-2 text-3xl">About {context.exam.name} mock tests</h2><div className="mt-6 divide-y divide-slate-700">{questions.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none font-bold marker:hidden">{item.question}<span className="float-right text-teal-200 transition group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{item.answer}</p></details>)}</div></section>
      </div>
    </main>
  );
}

function studentTestTitle(
  test: { series_number: number | null },
  examName: string,
  paperLabel: string,
) {
  return studentFacingMockTestTitle({
    examName,
    paperLabel,
    seriesNumber: Number(test.series_number ?? 1),
  });
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-display text-xl">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{detail}</p></div>;
}
