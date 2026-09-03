import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { mockTestLabel } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { absoluteUrl } from "@/lib/site";
import { resolveSeoFields } from "@/lib/seo-fields";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { isPaidSalesEnabled } from "@/lib/paid-sales";
import { TestStartActions } from "@/app/mock-tests/[id]/TestStartActions";
import { BuyExamPassForm } from "@/app/dashboard/passes/BuyExamPassForm";

type MockTestDetailsProps = {
  id: string;
  canonicalPath: string;
};

type MockTestStats = {
  mock_test_id: string;
  question_count: number;
  total_marks: number;
  maximum_negative_marks: number;
};

export async function generateMockTestMetadata({ id, canonicalPath }: MockTestDetailsProps): Promise<Metadata> {
  const supabase = createPublicClient();

  const { data: test } = await supabase
    .from("mock_tests")
    .select(
      "id, paper_id, series_number, title, description, seo_title, seo_description, duration_minutes, subject_id",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!test) {
    return {
      title: "Mock Test Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { data: paper } = await supabase
    .from("papers")
    .select(
      "id, exam_group_id, specialization_id, name, display_order",
    )
    .eq("id", test.paper_id)
    .maybeSingle();

  if (!paper) {
    const seo = resolveSeoFields(test, {
      title: test.title,
      description: test.description ?? "Take this free competitive exam mock test on Varadhi Prep.",
    });

    return {
      ...seo,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        type: "website",
        url: canonicalPath,
        title: seo.title,
        description: seo.description,
        siteName: "Varadhi Prep",
      },
      twitter: {
        card: "summary_large_image",
        title: seo.title,
        description: seo.description,
      },
    };
  }

  const [examResult, siblingPapersResult, subjectResult] = await Promise.all([
    supabase
      .from("exam_groups")
      .select("id, exam_id, name")
      .eq("id", paper.exam_group_id)
      .maybeSingle(),

    supabase
      .from("papers")
      .select(
        "id, exam_group_id, specialization_id, name, display_order",
      )
      .eq("exam_group_id", paper.exam_group_id)
      .eq("is_active", true),

    test.subject_id
      ? supabase
          .from("subjects")
          .select("id, name")
          .eq("id", test.subject_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const exam = examResult.data;

  const paperDisplay = buildPaperDisplayMap(
    (siblingPapersResult.data ?? []) as OrderedPaper[],
  ).get(paper.id);

  let category:
    | {
        id: string;
        state_id: string;
        name: string;
      }
    | null = null;

  let state:
    | {
        id: string;
        name: string;
        code: string;
        slug: string;
      }
    | null = null;

  if (exam) {
    const { data: categoryData } = await supabase
      .from("exams")
      .select("id, state_id, name")
      .eq("id", exam.exam_id)
      .maybeSingle();

    category = categoryData;

    if (category?.state_id) {
      const { data: stateData } = await supabase
        .from("exam_states")
        .select("id, name, code, slug")
        .eq("id", category.state_id)
        .maybeSingle();

      state = stateData;
    }
  }

  const testLabel = mockTestLabel(Number(test.series_number ?? 1));

  const paperLabel = paperDisplay?.shortLabel ?? paper.name ?? "Paper";

  const examName = exam?.name ?? test.title;

  const statePrefix =
    state?.code &&
    !examName.toUpperCase().includes(state.code.toUpperCase())
      ? `${state.code} `
      : "";

  const automaticTitle = `${statePrefix}${examName} ${paperLabel} ${testLabel}`;

  const subjectText = subjectResult.data?.name
    ? ` ${subjectResult.data.name} practice included.`
    : "";

  const seo = resolveSeoFields(test, {
    title: automaticTitle,
    description: test.description ?? `Take the free ${automaticTitle} on Varadhi Prep.${subjectText} Practice for ${test.duration_minutes} minutes with exam-focused questions and detailed result review.`,
  });

  return {
    title: seo.title,
    description: seo.description,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      url: canonicalPath,
      title: seo.title,
      description: seo.description,
      siteName: "Varadhi Prep",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${seo.title} on Varadhi Prep`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/opengraph-image"],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export async function MockTestDetailsPage({
  id,
  canonicalPath,
  searchParams,
}: MockTestDetailsProps & {
  searchParams: Promise<{ start_error?: string; payment_error?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createClient();

  // Parallelize the primary data fetching
  const [testResult, authResult, mqResult] = await Promise.all([
    supabase
      .from("mock_tests")
      .select(`
        id, paper_id, subject_id, test_scope, series_number, title, description, instructions, duration_minutes, status, access_type, target_question_count,
        subject:subjects(id, name, content_language_mode),
        paper:papers(
          id, exam_group_id, specialization_id, name, display_order, question_count, default_correct_marks, default_negative_marks,
          specialization:exam_specializations(id, name),
          exam_group:exam_groups(
            id, exam_id, name,
            exam:exams(
              id, state_id, name,
              state:exam_states(id, name, code, slug)
            )
          )
        )
      `)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),

    supabase.auth.getUser(),
    
    supabase
      .from("mock_test_questions")
      .select("marks, negative_marks")
      .eq("mock_test_id", id)
  ]);

  const test = testResult.data as any;

  if (!test) {
    notFound();
  }

  const paper = Array.isArray(test.paper) ? test.paper[0] : test.paper;
  const subject = test.subject ? (Array.isArray(test.subject) ? test.subject[0] : test.subject) : null;
  const examGroup = paper?.exam_group ? (Array.isArray(paper.exam_group) ? paper.exam_group[0] : paper.exam_group) : null;
  const exam = examGroup?.exam ? (Array.isArray(examGroup.exam) ? examGroup.exam[0] : examGroup.exam) : null;
  const state = exam?.state ? (Array.isArray(exam.state) ? exam.state[0] : exam.state) : null;
  const specialization = paper?.specialization ? (Array.isArray(paper.specialization) ? paper.specialization[0] : paper.specialization) : null;

  const isLoggedIn = Boolean(authResult.data.user);
  
  // Secondary parallel requests (siblings and access/session info)
  const [siblingPapersResult, accessResult, resumableSessionResult, previousAttemptResult] = await Promise.all([
    paper
      ? supabase
          .from("papers")
          .select("id, exam_group_id, specialization_id, name, display_order")
          .eq("exam_group_id", paper.exam_group_id)
          .eq("is_active", true)
      : Promise.resolve({ data: [] }),

    test.access_type === "paid" && examGroup
      ? (async () => {
          const paidSalesEnabled = await isPaidSalesEnabled();
          const [products, canAccess] = await Promise.all([
            paidSalesEnabled
              ? supabase.from("access_product_exam_groups").select("access_products!inner(id, name, price_inr, duration_days, is_active)").eq("exam_group_id", examGroup.id).eq("access_products.is_active", true)
              : Promise.resolve({ data: [] }),
            isLoggedIn ? supabase.rpc("can_access_mock_test", { requested_mock_test_id: id }) : Promise.resolve({ data: false }),
          ]);
          return { products, canAccess };
        })()
      : Promise.resolve({ products: { data: [] }, canAccess: { data: true } }),

    isLoggedIn && authResult.data.user
      ? supabase
          .from("test_attempt_sessions")
          .select("id")
          .eq("user_id", authResult.data.user.id)
          .eq("mock_test_id", id)
          .is("submitted_at", null)
          .gt("remaining_seconds", 0)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),

    isLoggedIn && authResult.data.user
      ? supabase
          .from("test_attempts")
          .select("id")
          .eq("user_id", authResult.data.user.id)
          .eq("mock_test_id", id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const paperDisplay = paper
    ? buildPaperDisplayMap(
        (siblingPapersResult.data ?? []) as OrderedPaper[],
      ).get(paper.id)
    : undefined;

  const mq = mqResult.data ?? [];
  const configuredQuestionCount = Number(test.target_question_count ?? paper?.question_count ?? 0);
  const questionCount = mq.length > 0 ? mq.length : (configuredQuestionCount > 0 ? configuredQuestionCount : null);
  
  const defaultCorrectMarks = Number(paper?.default_correct_marks ?? 0);
  const totalMarks = mq.length > 0 
    ? mq.reduce((sum, q) => sum + Number(q.marks), 0) 
    : (questionCount !== null && defaultCorrectMarks > 0 ? questionCount * defaultCorrectMarks : null);
    
  const defaultNegativeMarks = Number(paper?.default_negative_marks ?? 0);
  const negativeMarks = mq.length > 0 
    ? Math.max(0, ...mq.map(q => Number(q.negative_marks))) 
    : defaultNegativeMarks;

  const questionCountLabel = questionCount ? String(questionCount) : "Shown when started";
  const totalMarksLabel = totalMarks ? totalMarks.toFixed(2).replace(/\.00$/, "") : "Shown when started";

  const languageMode = subject?.content_language_mode ?? "bilingual";
  const languageLabel =
    languageMode === "bilingual"
      ? "English + Telugu"
      : languageMode === "telugu"
        ? "Telugu"
        : "English";

  const paidSalesEnabled = true; // handlded inside accessResult logic but we keep it true here to unblock UI if needed
  const paidProducts = ((accessResult.products.data ?? []) as unknown as { access_products: { id: string; name: string; price_inr: number; duration_days: number } | null }[])
    .map((item) => item.access_products).filter((product): product is { id: string; name: string; price_inr: number; duration_days: number } => Boolean(product));
  
  const isUnlocked = test.access_type === "free" || Boolean(accessResult.canAccess.data);
  const purchaseProduct = paidProducts[0] ?? null;

  const hasResumableSession = Boolean(resumableSessionResult.data);
  const hasPreviousAttempt = Boolean(previousAttemptResult.data);

  const testSummaryMetrics = [
    ["Questions", questionCountLabel],
    ["Duration", `${test.duration_minutes} minutes`],
    ["Total marks", totalMarksLabel],
    [
      "Negative marking",
      negativeMarks > 0
        ? `Up to ${negativeMarks} per wrong answer`
        : "No negative marking",
    ],
    ["Language", languageLabel],
    ...(hasResumableSession
      ? [["Progress", "Saved — ready to resume"]]
      : []),
  ];

  const testLabel = mockTestLabel(Number(test.series_number ?? 1));

  const resourceName = `${state?.code ?? "State"} ${
    examGroup?.name ?? "Exam"
  } ${paperDisplay?.shortLabel ?? "Paper"} ${testLabel}`;

  const resourceDescription =
    test.description ??
    `A ${test.access_type === "free" ? "free" : "premium"}, timed ${resourceName} for focused competitive-exam preparation.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: resourceName,
      description: resourceDescription,
      url: absoluteUrl(canonicalPath),
      isAccessibleForFree: test.access_type === "free",
      educationalUse: "Practice",
      learningResourceType: "Mock test",
      timeRequired: `PT${test.duration_minutes}M`,
      inLanguage:
        languageMode === "bilingual"
          ? ["en-IN", "te-IN"]
          : languageMode === "telugu"
            ? "te-IN"
            : "en-IN",
      provider: {
        "@type": "Organization",
        name: "Varadhi Prep",
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Mock tests",
          item: absoluteUrl("/mock-tests"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: resourceName,
          item: absoluteUrl(canonicalPath),
        },
      ],
    },
  ];

  return (
    <main className="student-page min-h-screen bg-slate-50">
      <JsonLd data={jsonLd} />
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {query.start_error === "1" && (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900">
            This test could not be started because its setup is incomplete.
            The administrator needs to verify its active questions and Paper
            count.
          </p>
        )}

        {query.payment_error && (
          <p
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-900"
          >
            {query.payment_error === "phone_required"
              ? "Enter a valid 10-digit Indian mobile number before continuing to payment."
              : query.payment_error === "sales_disabled"
                ? "Paid enrolment is currently unavailable. No payment was taken."
              : query.payment_error === "already_active"
                ? "This exam series is already active in your account. Open My Purchases to view your access."
              : query.payment_error === "unavailable"
                ? "Purchases for this exam series are temporarily paused. Existing access remains valid."
              : query.payment_error === "cashfree"
                ? "We could not open the secure payment page. Please try again shortly. If the problem continues, contact support."
                : "We could not start this purchase. Please review the exam-series details and try again."}
          </p>
        )}

        <Link
          href="/mock-tests"
          className="text-sm font-bold text-teal-700 hover:text-teal-800"
        >
          ← Back to mock tests
        </Link>

        <div className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {test.access_type === "free" ? "Free" : "Premium series"}
            </span>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              {test.test_scope === "paper"
                ? "Full-length Paper test"
                : "Subject test"}
            </span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            {state?.code ?? "State"} ·{" "}
            {exam?.name ?? "Board"} ·{" "}
            {examGroup?.name ?? "Exam"} ·{" "}
            {paperDisplay?.shortLabel ?? "Paper"}
          </p>

          <h1 className="font-display mt-3 text-3xl leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {resourceName}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            {test.description ??
              "A focused Varadhi Prep mock test designed to strengthen your exam preparation."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-600 sm:mt-7 sm:text-sm">
            {specialization && (
              <span className="rounded-lg border bg-white px-3 py-2">
                {specialization.name}
              </span>
            )}

            <span className="rounded-lg border bg-white px-3 py-2">
              {paperDisplay?.label ?? paper?.name ?? "Paper"}
            </span>

            {subject && (
              <span className="rounded-lg border bg-white px-3 py-2">
                {subject.name}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start">
          <section className="space-y-6 sm:space-y-8">
            <section className="student-card rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-xl font-black sm:text-2xl">Before you begin</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review the test rules now. The timer starts only after you
                select the start button.
              </p>

              <div className="student-stagger mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4">
                {testSummaryMetrics.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950 sm:mt-2 sm:text-base">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="student-card rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-xl font-black sm:text-2xl">Instructions</h2>

              {test.instructions ? (
                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 sm:mt-5">
                  {test.instructions}
                </div>
              ) : (
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 sm:mt-5">
                  <li className="flex gap-3">
                    <span className="font-black text-teal-700">01</span>
                    Answer each question before moving on, or return to it later
                    during the attempt.
                  </li>

                  <li className="flex gap-3">
                    <span className="font-black text-teal-700">02</span>
                    Your answers and remaining time are saved automatically.
                  </li>

                  <li className="flex gap-3">
                    <span className="font-black text-teal-700">03</span>
                    Select Pause to stop the timer, then Resume whenever you are
                    ready.
                  </li>

                  <li className="flex gap-3">
                    <span className="font-black text-teal-700">04</span>
                    After submission, review your result or retake the test for
                    more practice.
                  </li>
                </ul>
              )}
            </section>
          </section>

          <aside className="student-card rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
              Ready to begin?
            </p>

            <h2 className="mt-2 text-xl font-black sm:mt-3 sm:text-2xl">
              Take the test at your pace.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Pause when needed, resume with your saved time, and start again
              when you want a fresh attempt.
            </p>

            <div className="mt-6 space-y-3 border-y border-slate-700 py-5 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Questions</span>
                <strong>{questionCount ?? "—"}</strong>
              </p>

              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Duration</span>
                <strong>{test.duration_minutes} min</strong>
              </p>

              <p className="flex justify-between gap-3">
                <span className="text-slate-400">Access</span>
                <strong>{test.access_type === "free" ? "Free" : isUnlocked ? "Series active" : "Premium series"}</strong>
              </p>
            </div>

            {isUnlocked ? (
              <TestStartActions testId={id} testPath={canonicalPath} isLoggedIn={isLoggedIn} hasResumableSession={hasResumableSession} />
            ) : paidSalesEnabled && purchaseProduct ? (
              <>
                <p className="mt-6 text-sm font-bold text-teal-100">This mock test is part of <span className="text-white">{purchaseProduct.name}</span>.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Buy once to unlock all paid mock tests in this exam series for {purchaseProduct.duration_days} days.</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300"><li>• Access every paid test under this exam</li><li>• Start immediately after payment</li><li>• Keep full answer review and result history</li></ul>
                <BuyExamPassForm productId={purchaseProduct.id} price={Number(purchaseProduct.price_inr)} returnTo={canonicalPath} phone={typeof authResult.data.user?.user_metadata?.phone === "string" ? authResult.data.user.user_metadata.phone : ""} buttonLabel="Proceed to secure payment" pendingLabel="Opening secure checkout..." />
              </>
            ) : paidSalesEnabled ? (
              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
                Purchases for this exam series are temporarily unavailable. Existing purchases remain valid. <Link href="/dashboard/passes" className="font-bold text-teal-300 underline">View My Purchases</Link>.
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
                This premium mock test is not currently available. Please check again later.
              </div>
            )}

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              {!isUnlocked
                ? paidSalesEnabled
                  ? "Buy the exam series here to unlock this test and every other paid mock test in the same exam."
                  : "Paid enrolment is currently unavailable."
                : !isLoggedIn
                ? "Sign in or create an account, then return directly to this test."
                : hasResumableSession
                  ? "Resume to keep your progress, or restart after confirming that your unfinished answers can be cleared."
                  : hasPreviousAttempt
                    ? "Start a new attempt; your earlier submitted result remains saved."
                    : "Select Start test when you are ready."}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
