import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { ExamSymbol, MockSymbol, PaperSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, mockTestUrl, paperUrl, specializationUrl, stateUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { absoluteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

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
  const paperIds = new Set(papers.map((paper) => paper.id));
  const tests = catalog.tests.filter((test) => paperIds.has(test.paper_id));
  const specializations = catalog.specializations.filter((item) => item.exam_group_id === context.exam!.id);
  const isPoliceConstable = context.state.slug === "telangana" && context.exam.slug === "police-constable";
  const seo = resolveSeoFields(context.exam, {
    title: `${context.exam.name} Mock Tests in ${context.state.name}`,
    description: `Practise ${context.exam.name} mock tests for ${context.state.name}. Explore papers, take timed tests and review every answer.`,
  });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const accountAction = user
    ? profile?.role === "admin"
      ? { href: "/admin", label: "Admin workspace" }
      : { href: "/dashboard", label: "Go to my progress" }
    : { href: `/login?next=${encodeURIComponent(canonical)}`, label: isPoliceConstable ? "Sign in" : "Student sign in" };
  const introduction = isPoliceConstable
    ? "Prepare for the 2026 TGPRB Police Constable examination with Varadhi Prep. Practise full-length Preliminary and Mains mock tests, strengthen every topic with focused practice, and review detailed solutions in Telugu and English. Timed tests, instant results, answer review, and performance insights help you identify weak areas and improve your score with every attempt."
    : context.exam.description?.trim() || seo.description;
  const freeTests = tests.filter((test) => test.access_type === "free").length;
  const questions = isPoliceConstable
    ? [
        { question: "Where can I take TG Police Constable mock tests?", answer: "You can take Telangana Police Constable mock tests on Varadhi Prep by choosing the paper name and opening any available test. Each test is arranged under the correct Police Constable exam stage, so students can practise in an organised way instead of searching through mixed exam content." },
        { question: "Are these Police Constable mock tests useful for the 2026 TGPRB exam?", answer: "Yes. These mock tests are designed for students preparing for the 2026 TGPRB Police Constable exam. They help you practise timed questions, improve accuracy, understand the exam pattern, and build confidence before the real exam. Regular practice also helps you find weak topics early and revise them before the final preparation stage." },
        { question: "How many Police Constable mock tests are available?", answer: tests.length > 0 ? `${tests.length} published Police Constable mock test${tests.length === 1 ? " is" : "s are"} currently available across ${papers.length} paper${papers.length === 1 ? "" : "s"}. More tests can be added as the course grows, and newly published mock tests will automatically appear on this page for students.` : "Police Constable mock tests are being prepared and will appear on this page after publication. Once tests are published, students will be able to practise them from this page and review their results after each attempt." },
        { question: "Can I review answers after submitting a Police Constable mock test?", answer: "Yes. After submitting a mock test, you can review your score, selected answers, correct answers, and available explanations from your student dashboard. This review is important because it shows where marks were lost and helps you prepare the next attempt with better accuracy." },
        { question: "Do the mock tests include Telugu and English support?", answer: "Varadhi Prep is built for Telangana students, so the Police Constable preparation experience supports Telugu and English where content is available. This helps students understand questions and solutions more comfortably while still practising in an exam-focused format." },
        { question: "How should I use Police Constable mock tests for best results?", answer: "Start with one full mock test to understand your current level. After that, review every wrong answer, note weak topics, practise those areas again, and then take the next mock test under timed conditions. Repeating this cycle improves speed, accuracy, and confidence much better than only reading notes." },
      ]
    : [
        { question: `Where can I take ${context.exam.name} mock tests?`, answer: "Choose a paper on this page, open an available mock test and start practising on Varadhi Prep." },
        { question: `How many ${context.exam.name} mock tests are available?`, answer: tests.length > 0 ? `${tests.length} published mock test${tests.length === 1 ? " is" : "s are"} currently available across ${papers.length} paper${papers.length === 1 ? "" : "s"}.` : "Mock tests are being prepared and will appear on this page after publication." },
        { question: `Can I review my ${context.exam.name} answers?`, answer: "Yes. After submitting a test, you can review your score, answers and available explanations from your student dashboard." },
      ];
  const structuredData = [
    ...collectionStructuredData(seo.title, seo.description, canonical, [
      { name: "Home", path: "/" },
      { name: "Mock tests", path: "/mock-tests" },
      { name: context.state.name, path: stateUrl(context.state.slug) },
      { name: context.exam.name, path: canonical },
    ]),
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: `${context.exam.name} mock tests`, numberOfItems: tests.length, itemListElement: tests.slice(0, 12).map((test, index) => { const paper = papers.find((item) => item.id === test.paper_id)!; return { "@type": "ListItem", position: index + 1, name: test.title, url: absoluteUrl(mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)) }; }) },
  ];

  return (
    <main className="student-page min-h-screen bg-[#f4f7f8] text-slate-950">
      <JsonLd data={structuredData} />
      <PublicHeader />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.2),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400"><Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span><Link href={stateUrl(context.state.slug)} className="hover:text-white">{context.state.name}</Link><span aria-hidden="true">/</span><span className="text-teal-200">{context.exam.name}</span></nav>
          <div className={`mt-7 grid gap-8 ${isPoliceConstable ? "" : "lg:grid-cols-[1fr_auto] lg:items-end"}`}>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-teal-200"><ExamSymbol name={context.exam.name} className="h-4 w-4" /> {context.state.code} exam preparation</p>
              <h1 className="font-display mt-5 max-w-4xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">{context.exam.name} Mock Tests</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{introduction}</p>
              <div className="mt-8 flex flex-wrap gap-3"><a href="#papers" className="rounded-xl bg-teal-300 px-5 py-3.5 font-black text-slate-950 hover:bg-teal-200">Choose a paper</a><Link href={accountAction.href} className="rounded-xl border border-slate-700 px-5 py-3.5 font-black text-white hover:bg-white/5">{accountAction.label}</Link></div>
            </div>
            {!isPoliceConstable && <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur sm:gap-3"><Stat value={papers.length} label="Papers" /><Stat value={tests.length} label="Tests" /><Stat value={freeTests} label="Free" /></dl>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        {specializations.length > 0 && <section aria-labelledby="specialisations-title"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Exam paths</p><h2 id="specialisations-title" className="font-display mt-2 text-3xl">Choose a specialisation</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{specializations.map((item) => { const count = papers.filter((paper) => paper.specialization_id === item.id).length; return <Link key={item.id} href={specializationUrl(context.state.slug, context.exam!.slug, item.slug)} className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"><span className="text-xs font-black uppercase tracking-wide text-teal-700">{count} paper{count === 1 ? "" : "s"}</span><h3 className="font-display mt-3 text-xl">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description || `View papers and mock tests for ${item.name}.`}</p><span className="mt-5 inline-block text-sm font-black text-teal-800">Explore specialisation →</span></Link>; })}</div></section>}

        <section id="papers" aria-labelledby="papers-title" className="scroll-mt-24">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">{isPoliceConstable ? "Choose paper" : "Syllabus structure"}</p><h2 id="papers-title" className="font-display mt-2 text-3xl">{isPoliceConstable ? "Police Constable practice papers" : "Papers and available practice"}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{isPoliceConstable ? "Select the paper name below to view available mock tests, topic practice, and answer review for that stage of the exam." : "Select the paper you are preparing for. Subject tests and full-paper mock tests remain organised inside their correct paper."}</p>
          {papers.length === 0 ? <EmptyState title="Papers are being prepared" detail="This exam landing page is ready. Its papers and mock tests will appear here after the administrator publishes them." /> : isPoliceConstable ? <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full table-auto text-left"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-4 text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Paper name</th><th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Practice</th></tr></thead><tbody className="divide-y divide-slate-200">{papers.map((paper) => <tr key={paper.id} className="transition hover:bg-teal-50/60"><td className="px-4 py-5 sm:px-6"><span className="font-display block break-words text-base text-slate-950 sm:text-lg">{paper.name}</span></td><td className="px-4 py-5 text-right sm:px-6"><Link href={paperUrl(context.state.slug, context.exam!.slug, paper.slug)} className="inline-flex whitespace-nowrap rounded-lg bg-teal-100 px-3 py-2 text-xs font-black text-teal-900 transition hover:bg-teal-200 sm:px-4 sm:text-sm">Open paper →</Link></td></tr>)}</tbody></table></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{papers.map((paper) => { const paperTests = tests.filter((test) => test.paper_id === paper.id); const specialization = specializations.find((item) => item.id === paper.specialization_id); return <Link key={paper.id} href={paperUrl(context.state.slug, context.exam!.slug, paper.slug)} className="group flex min-h-52 flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-slate-950/5"><div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-800"><PaperSymbol /></span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{paperTests.length} test{paperTests.length === 1 ? "" : "s"}</span></div>{specialization && <p className="mt-5 text-xs font-black uppercase tracking-wide text-teal-700">{specialization.name}</p>}<h3 className={`font-display text-xl ${specialization ? "mt-2" : "mt-5"}`}>{paper.name}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{paper.description || `Open ${paper.name} to view its subjects and mock tests.`}</p><span className="mt-5 text-sm font-black text-teal-800">View paper →</span></Link>; })}</div>}
        </section>

        <section aria-labelledby="tests-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Timed practice</p><h2 id="tests-title" className="font-display mt-2 text-3xl">Latest mock tests</h2></div>{tests.length > 6 && <Link href={`${canonical}?view=all`} className="text-sm font-black text-teal-800">View complete test list →</Link>}</div>{tests.length === 0 ? <EmptyState title="Mock tests are coming soon" detail="The exam page is active. Published mock tests will automatically appear here." /> : isPoliceConstable ? <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full table-auto text-left"><thead className="bg-slate-950 text-white"><tr><th className="px-4 py-4 text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Mock test name</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] md:table-cell">Paper</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] sm:table-cell">Duration</th><th className="hidden px-4 py-4 text-xs font-black uppercase tracking-[0.12em] lg:table-cell">Access</th><th className="px-4 py-4 text-right text-xs font-black uppercase tracking-[0.08em] sm:px-6 sm:tracking-[0.12em]">Practice</th></tr></thead><tbody className="divide-y divide-slate-200">{tests.slice(0, 6).map((test) => { const paper = papers.find((item) => item.id === test.paper_id)!; return <tr key={test.id} className="transition hover:bg-teal-50/60"><td className="px-4 py-5 sm:px-6"><Link href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)} className="font-display block break-words text-base text-slate-950 hover:text-teal-800 sm:text-lg">{test.title}</Link><p className="mt-1 text-xs text-slate-500 sm:hidden">{test.duration_minutes} minutes</p><p className="mt-1 text-xs text-slate-500 md:hidden">{paper.name}</p></td><td className="hidden px-4 py-5 text-sm font-semibold text-slate-700 md:table-cell">{paper.name}</td><td className="hidden px-4 py-5 text-sm text-slate-600 sm:table-cell">{test.duration_minutes} minutes</td><td className="hidden px-4 py-5 lg:table-cell"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${test.access_type === "free" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{test.access_type === "free" ? "Free" : "Included"}</span></td><td className="px-4 py-5 text-right sm:px-6"><Link href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)} className="inline-flex whitespace-nowrap rounded-lg bg-teal-100 px-3 py-2 text-xs font-black text-teal-900 transition hover:bg-teal-200 sm:px-4 sm:text-sm">Start →</Link></td></tr>; })}</tbody></table></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tests.slice(0, 6).map((test) => { const paper = papers.find((item) => item.id === test.paper_id)!; return <Link key={test.id} href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)} className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-teal-200"><MockSymbol /></span><span className={`rounded-full px-3 py-1 text-xs font-black ${test.access_type === "free" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{test.access_type === "free" ? "Free" : "Included with access"}</span></div><h3 className="font-display mt-5 text-xl">{test.title}</h3><p className="mt-2 text-sm text-slate-500">{paper.name} · {test.duration_minutes} minutes</p><span className="mt-5 inline-block text-sm font-black text-teal-800">View mock test →</span></Link>; })}</div>}</section>

        <section aria-labelledby="faq-title" className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-9"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">Common questions</p><h2 id="faq-title" className="font-display mt-2 text-3xl">About {context.exam.name} {isPoliceConstable ? "mock test" : "practice"}</h2><div className="mt-6 divide-y divide-slate-700">{questions.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none font-bold marker:hidden">{item.question}<span className="float-right text-teal-200 transition group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{item.answer}</p></details>)}</div></section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="min-w-20 rounded-xl bg-white/5 px-3 py-4"><dt className="text-xs font-bold text-slate-400">{label}</dt><dd className="font-display mt-1 text-2xl text-white">{value}</dd></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-display text-xl">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{detail}</p></div>;
}
