import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { mockTestLabel } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { absoluteUrl } from "@/lib/site";
import { paperUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { isPaidSalesEnabled } from "@/lib/paid-sales";
import { TestStartActions } from "@/app/mock-tests/[id]/TestStartActions";
import { BuyExamPassForm } from "@/app/dashboard/passes/BuyExamPassForm";

type MockTestDetailsProps = {
  id: string;
  canonicalPath: string;
  backHref?: string;
  backLabel?: string;
};

type MockTestDetailPaper = {
  id: string;
  exam_group_id: string;
  specialization_id: string | null;
  name: string;
  slug: string;
  display_order: number;
  question_count: number | null;
  default_correct_marks: number | null;
  default_negative_marks: number | null;
  specialization?: { id: string; name: string } | { id: string; name: string }[] | null;
  exam_group?: {
    id: string;
    exam_id: string;
    name: string;
    slug: string;
    exam?: {
      id: string;
      state_id: string;
      name: string;
      slug: string;
      state?: { id: string; name: string; code: string; slug: string } | { id: string; name: string; code: string; slug: string }[] | null;
    } | {
      id: string;
      state_id: string;
      name: string;
      slug: string;
      state?: { id: string; name: string; code: string; slug: string } | { id: string; name: string; code: string; slug: string }[] | null;
    }[] | null;
  } | {
    id: string;
    exam_id: string;
    name: string;
    slug: string;
    exam?: unknown;
  }[] | null;
};

type MockTestDetailData = {
  id: string;
  paper_id: string;
  subject_id: string | null;
  test_scope: string;
  series_number: number | null;
  title: string;
  description: string | null;
  instructions: string | null;
  duration_minutes: number;
  status: string;
  access_type: string;
  target_question_count: number | null;
  subject: { id: string; name: string; content_language_mode?: string } | { id: string; name: string; content_language_mode?: string }[] | null;
  paper: MockTestDetailPaper | MockTestDetailPaper[] | null;
};

export async function generateMockTestMetadata({ id, canonicalPath }: MockTestDetailsProps): Promise<Metadata> {
  const catalog = await getMockTestCatalogData();
  const cachedTest = catalog.tests.find((t) => t.id === id);

  if (cachedTest) {
    const paper = catalog.papers.find((p) => p.id === cachedTest.paper_id);
    if (!paper) {
      const seo = resolveSeoFields(cachedTest, {
        title: cachedTest.title,
        description: cachedTest.description ?? "Take this free competitive exam mock test on Varadhi Prep.",
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

    const exam = catalog.exams.find((e) => e.id === paper.exam_group_id);
    const category = exam ? catalog.categories.find((c) => c.id === exam.exam_id) : undefined;
    const state = category ? catalog.states.find((s) => s.id === category.state_id) : undefined;
    const siblingPapers = catalog.papers.filter((p) => p.exam_group_id === paper.exam_group_id);
    const paperDisplay = buildPaperDisplayMap(siblingPapers).get(paper.id);
    const subject = cachedTest.subject_id ? catalog.subjects.find((s) => s.id === cachedTest.subject_id) : null;

    const testLabel = mockTestLabel(Number(cachedTest.series_number ?? 1));
    const paperLabel = paperDisplay?.shortLabel ?? paper.name ?? "Paper";
    const examName = exam?.name ?? cachedTest.title;
    const statePrefix =
      state?.code && !examName.toUpperCase().includes(state.code.toUpperCase())
        ? `${state.code} `
        : "";
    const automaticTitle = `${statePrefix}${examName} ${paperLabel} ${testLabel}`;
    const subjectText = subject?.name ? ` ${subject.name} practice included.` : "";

    const seo = resolveSeoFields(cachedTest, {
      title: automaticTitle,
      description:
        cachedTest.description ??
        `Take the free ${automaticTitle} on Varadhi Prep.${subjectText} Practice for ${cachedTest.duration_minutes} minutes with exam-focused questions and detailed result review.`,
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
  backHref,
  backLabel,
  searchParams,
}: MockTestDetailsProps & {
  searchParams: Promise<{ start_error?: string; payment_error?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createClient();

  // Eagerly initiate catalog loading and user session checking in parallel
  const catalogPromise = getMockTestCatalogData();
  const userPromise = supabase.auth.getUser().then(({ data }) => data.user ?? null);

  // Eagerly chain session and attempt lookups to run concurrently with the mock test query
  const sessionPromise = userPromise.then(async (user) => {
    if (!user) return null;
    const { data } = await supabase
      .from("test_attempt_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("mock_test_id", id)
      .is("submitted_at", null)
      .gt("remaining_seconds", 0)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

  const attemptPromise = userPromise.then(async (user) => {
    if (!user) return null;
    const { data } = await supabase
      .from("test_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("mock_test_id", id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

  // Parallelize primary test data fetching alongside user session & attempt checks
  const [testResult, user, mqResult] = await Promise.all([
    supabase
      .from("mock_tests")
      .select(`
        id, paper_id, subject_id, test_scope, series_number, title, description, instructions, duration_minutes, status, access_type, target_question_count,
        subject:subjects(id, name, content_language_mode),
        paper:papers(
          id, exam_group_id, specialization_id, name, slug, display_order, question_count, default_correct_marks, default_negative_marks,
          specialization:exam_specializations(id, name),
          exam_group:exam_groups(
            id, exam_id, name, slug,
            exam:exams(
              id, state_id, name, slug,
              state:exam_states(id, name, code, slug)
            )
          )
        )
      `)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),

    userPromise,

    supabase
      .from("mock_test_questions")
      .select("marks, negative_marks")
      .eq("mock_test_id", id),
  ]);

  const test = testResult.data as unknown as MockTestDetailData | null;

  if (!test) {
    notFound();
  }

  const paper = Array.isArray(test.paper) ? test.paper[0] : test.paper;
  const subject = test.subject ? (Array.isArray(test.subject) ? test.subject[0] : test.subject) : null;
  const examGroup = paper?.exam_group ? (Array.isArray(paper.exam_group) ? paper.exam_group[0] : paper.exam_group) : null;
  const exam = examGroup?.exam ? (Array.isArray(examGroup.exam) ? examGroup.exam[0] : examGroup.exam) : null;
  const state = exam?.state ? (Array.isArray(exam.state) ? exam.state[0] : exam.state) : null;
  const specialization = paper?.specialization ? (Array.isArray(paper.specialization) ? paper.specialization[0] : paper.specialization) : null;

  const isLoggedIn = Boolean(user);

  // Resolve sibling papers directly from the in-memory catalog cache (0ms)
  const catalog = await catalogPromise;
  let siblingPapers: OrderedPaper[] = paper
    ? (catalog.papers.filter((p) => p.exam_group_id === paper.exam_group_id && p.is_active) as OrderedPaper[])
    : [];

  // Await access verification and eager session/attempt queries
  const [accessResult, resumableSessionResult, previousAttemptResult] = await Promise.all([
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

    sessionPromise,
    attemptPromise,

    // If sibling papers were empty in catalog cache for any reason, fetch as fallback
    (async () => {
      if (paper && siblingPapers.length === 0) {
        const { data } = await supabase
          .from("papers")
          .select("id, exam_group_id, specialization_id, name, display_order")
          .eq("exam_group_id", paper.exam_group_id)
          .eq("is_active", true);
        if (data && data.length > 0) {
          siblingPapers = data as OrderedPaper[];
        }
      }
    })(),
  ]);

  const paperDisplay = paper
    ? buildPaperDisplayMap(siblingPapers).get(paper.id)
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

  const hasResumableSession = Boolean(resumableSessionResult);
  const hasPreviousAttempt = Boolean(previousAttemptResult);

  const testSummaryMetrics = [
    ["Questions", questionCountLabel],
    ["Duration", `${test.duration_minutes} minutes`],
    ["Total marks", totalMarksLabel],
    [
      "Negative marking",
      negativeMarks > 0 ? `${negativeMarks}` : "No negative marking",
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

  const fallbackBackHref =
    state?.slug && examGroup?.slug && paper?.slug
      ? paperUrl(state.slug, examGroup.slug, paper.slug)
      : "/mock-tests";
  const resolvedBackHref = backHref || fallbackBackHref;
  const paperTitle = paperDisplay?.shortLabel ?? paper?.name;
  const resolvedBackLabel = backLabel || "Back to mock tests";

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
        ...(resolvedBackHref && resolvedBackHref !== "/mock-tests"
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: paperTitle ?? "Paper",
                item: absoluteUrl(resolvedBackHref),
              },
              {
                "@type": "ListItem",
                position: 4,
                name: resourceName,
                item: absoluteUrl(canonicalPath),
              },
            ]
          : [
              {
                "@type": "ListItem",
                position: 3,
                name: resourceName,
                item: absoluteUrl(canonicalPath),
              },
            ]),
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
          href={resolvedBackHref}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:text-teal-950 transition"
        >
          ← {resolvedBackLabel}
        </Link>

        {/* Test Overview Hero Box */}
        <section className="mt-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              test.access_type === "free"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }`}>
              {test.access_type === "free" ? "Free" : "Paid series"}
            </span>

            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              {test.test_scope === "paper"
                ? "Full-length Paper test"
                : "Subject test"}
            </span>

            {specialization && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                {specialization.name}
              </span>
            )}

            {subject && (
              <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
                {subject.name}
              </span>
            )}
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-teal-800">
            {state?.code ?? "State"} ·{" "}
            {exam?.name ?? "Board"} ·{" "}
            {examGroup?.name ?? "Exam"} ·{" "}
            {paperDisplay?.shortLabel ?? "Paper"}
          </p>

          <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {resourceName}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
            {test.description ??
              "Complete syllabus mock test prepared according to the latest official examination pattern. Practise under timed CBT conditions with negative marking and instant detailed solutions."}
          </p>

          {/* Key Exam Specifications Strip */}
          <div className="student-stagger mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 border-t border-slate-100 pt-5">
            {testSummaryMetrics.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-900 sm:text-base truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions and Start Action Station */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
          <section className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Examination Instructions</h2>
                <p className="mt-0.5 text-xs text-slate-500">Read guidelines carefully before beginning the mock test.</p>
              </div>
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-100">
                Official Pattern
              </span>
            </div>

            {test.instructions ? (
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">
                {test.instructions}
              </div>
            ) : (
              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Timing & Countdown:</strong>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                      The test duration is {test.duration_minutes} minutes. The timer begins the moment you click Start Test and cannot be reset once expired.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Automatic Save:</strong>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                      Your answers and remaining time are saved automatically. If you pause, resume to keep your progress and complete your attempt.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Marking & Questions:</strong>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                      Navigate freely using the Question Palette. Use &quot;Mark for review&quot; to flag questions for double-checking before final submission.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900">Scorecard & Review:</strong>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                      After submission, review your instant scorecard, accuracy breakdown, and in-depth bilingual explanations for every question.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Clean Candidate Action Card */}
          <aside className="rounded-2xl sm:rounded-3xl border border-emerald-900/40 bg-[#071f1a] p-6 text-white shadow-sm lg:sticky lg:top-24">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Candidate Portal
            </span>

            <h2 className="mt-2 text-xl font-bold text-white">
              Ready to begin?
            </h2>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
              {hasResumableSession
                ? "You have an ongoing attempt. Resume to continue with your saved time and answers."
                : "Simulate real exam conditions. The countdown timer begins as soon as you select Start Test."}
            </p>

            <div className="mt-5 space-y-2.5 border-y border-emerald-800/60 py-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Questions</span>
                <strong className="text-white font-bold">{questionCount ?? "—"}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Duration</span>
                <strong className="text-white font-bold">{test.duration_minutes} min</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Access</span>
                <strong className="text-teal-300 font-bold">
                  {test.access_type === "free" ? "Free" : isUnlocked ? "Series active" : "Paid series"}
                </strong>
              </div>
            </div>

            <div className="mt-5">
              {isUnlocked ? (
                <TestStartActions testId={id} testPath={canonicalPath} isLoggedIn={isLoggedIn} hasResumableSession={hasResumableSession} />
              ) : paidSalesEnabled && purchaseProduct ? (
                <>
                  <p className="text-sm font-bold text-teal-200">This mock test is part of <span className="text-white">{purchaseProduct.name}</span>.</p>
                  <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-300">Buy once to unlock all paid mock tests in this exam series for {purchaseProduct.duration_days} days.</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <li>• Access every paid test under this exam</li>
                    <li>• Start immediately after payment</li>
                    <li>• Keep full answer review and result history</li>
                  </ul>
                  <div className="mt-4">
                    <BuyExamPassForm productId={purchaseProduct.id} price={Number(purchaseProduct.price_inr)} returnTo={canonicalPath} phone={typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : ""} buttonLabel="Proceed to secure payment" pendingLabel="Opening secure checkout..." />
                  </div>
                </>
              ) : paidSalesEnabled ? (
                <div className="rounded-xl border border-emerald-800/40 bg-[#071f1a]/80 p-3.5 text-xs sm:text-sm leading-6 text-emerald-100">
                  Purchases for this exam series are temporarily unavailable. Existing purchases remain valid. <Link href="/dashboard/passes" className="font-bold text-teal-300 underline">View My Purchases</Link>.
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-800/40 bg-[#071f1a]/80 p-3.5 text-xs sm:text-sm leading-6 text-emerald-100">
                  This premium mock test is not currently available. Please check again later.
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
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
