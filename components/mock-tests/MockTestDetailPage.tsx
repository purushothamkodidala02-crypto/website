import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { displayMockTestHeading, formatFullMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { absoluteUrl } from "@/lib/site";
import { paperUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { formatMarkValue, resolveMockTestScoring, type MockTestStatsSummary } from "@/lib/scoring";
import { isPaidSalesEnabled } from "@/lib/paid-sales";
import { TestStartActions } from "@/app/mock-tests/[id]/TestStartActions";
import { AutoExitFullscreen } from "@/components/feedback/AutoExitFullscreen";
import { BuyExamPassForm } from "@/app/dashboard/passes/BuyExamPassForm";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

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
  subject_section_id?: string | null;
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

    const paperLabel = paperDisplay?.shortLabel ?? paper.name ?? "Paper";
    const examName = exam?.name ?? cachedTest.title;
    const section = cachedTest.subject_section_id
      ? catalog.sections.find((s) => s.id === cachedTest.subject_section_id)
      : null;

    const automaticTitle = formatFullMockTestTitle({
      stateCode: state?.code,
      examName,
      paperLabel,
      subjectName: subject?.name,
      sectionName: section?.name,
      testScope: cachedTest.test_scope,
      seriesNumber: Number(cachedTest.series_number ?? 1),
    });
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
      "id, paper_id, series_number, title, description, seo_title, seo_description, duration_minutes, subject_id, subject_section_id, test_scope",
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

  const [examResult, siblingPapersResult, subjectResult, sectionResult] = await Promise.all([
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

    test.subject_section_id
      ? supabase
          .from("subject_sections")
          .select("id, name")
          .eq("id", test.subject_section_id)
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

  const paperLabel = paperDisplay?.shortLabel ?? paper.name ?? "Paper";
  const examName = exam?.name ?? test.title;

  const automaticTitle = formatFullMockTestTitle({
    stateCode: state?.code,
    examName,
    paperLabel,
    subjectName: subjectResult.data?.name,
    sectionName: sectionResult.data?.name,
    testScope: test.test_scope,
    seriesNumber: Number(test.series_number ?? 1),
  });

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

const getCachedMockTestSupplementary = unstable_cache(
  async (testId: string) => {
    try {
      const hasServiceRole = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
      );
      const client = hasServiceRole ? createAdminClient() : createPublicClient();
      const { data: testData } = await client
        .from("mock_tests")
        .select("instructions, status")
        .eq("id", testId)
        .maybeSingle();

      const isPublished = testData?.status === "published";
      let mq: { marks: number; negative_marks: number }[] = [];

      if (hasServiceRole && isPublished) {
        const { data: mqData } = await client
          .from("mock_test_questions")
          .select(
            "marks, negative_marks, question:questions!inner(is_active, content_lifecycle, expires_on)",
          )
          .eq("mock_test_id", testId)
          .eq("question.is_active", true);

        const todayIst = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date());

        mq = ((mqData ?? []) as unknown as {
          marks: number;
          negative_marks: number;
          question: {
            is_active: boolean;
            content_lifecycle?: string | null;
            expires_on?: string | null;
          } | null;
        }[])
          .filter((row) => {
            const q = row.question;
            if (!q || !q.is_active) return false;
            if (q.content_lifecycle !== "expires") return true;
            return Boolean(q.expires_on && q.expires_on >= todayIst);
          })
          .map((row) => ({
            marks: Number(row.marks),
            negative_marks: Number(row.negative_marks),
          }));
      }

      return {
        instructions: testData?.instructions ?? null,
        status: testData?.status ?? "published",
        mq,
      };
    } catch {
      return {
        instructions: null,
        status: "published",
        mq: [],
      };
    }
  },
  ["mock-test-supplementary-v4"],
  { revalidate: 300 }
);

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
  const cookieStore = await cookies();
  const hasAuthToken = cookieStore.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"),
  );

  const catalogPromise = getMockTestCatalogData();
  const supplementaryPromise = getCachedMockTestSupplementary(id);
  const supabase = await createClient();

  const userPromise = hasAuthToken
    ? supabase.auth
        .getUser()
        .then((res) => res?.data?.user ?? null)
        .catch(() => null)
    : Promise.resolve(null);

  const sessionPromise = hasAuthToken
    ? userPromise
        .then(async (user) => {
          if (!user) return null;
          try {
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
            return data ?? null;
          } catch {
            return null;
          }
        })
        .catch(() => null)
    : Promise.resolve(null);

  const attemptPromise = hasAuthToken
    ? userPromise
        .then(async (user) => {
          if (!user) return null;
          try {
            const { data } = await supabase
              .from("test_attempts")
              .select("id")
              .eq("user_id", user.id)
              .eq("mock_test_id", id)
              .order("submitted_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            return data ?? null;
          } catch {
            return null;
          }
        })
        .catch(() => null)
    : Promise.resolve(null);

  const [catalog, supplementary, user] = await Promise.all([
    catalogPromise,
    supplementaryPromise,
    userPromise,
  ]);

  const cachedTest = catalog.tests.find((t) => t.id === id);

  let test: MockTestDetailData | null = null;
  let mq = supplementary.mq;

  if (cachedTest) {
    const paperItem = catalog.papers.find((p) => p.id === cachedTest.paper_id);
    const specItem = paperItem?.specialization_id
      ? (catalog.specializations.find((s) => s.id === paperItem.specialization_id) ?? null)
      : null;
    const examItem = paperItem
      ? catalog.exams.find((e) => e.id === paperItem.exam_group_id)
      : null;
    const catItem = examItem
      ? catalog.categories.find((c) => c.id === examItem.exam_id)
      : null;
    const stateItem = catItem
      ? catalog.states.find((s) => s.id === catItem.state_id)
      : null;
    const subjectItem = cachedTest.subject_id
      ? (catalog.subjects.find((s) => s.id === cachedTest.subject_id) ?? null)
      : null;

    test = {
      id: cachedTest.id,
      paper_id: cachedTest.paper_id,
      subject_id: cachedTest.subject_id,
      subject_section_id: cachedTest.subject_section_id,
      test_scope: cachedTest.test_scope,
      series_number: cachedTest.series_number,
      title: cachedTest.title,
      description: cachedTest.description,
      instructions: supplementary.instructions,
      duration_minutes: cachedTest.duration_minutes,
      status: supplementary.status,
      access_type: cachedTest.access_type,
      target_question_count: cachedTest.target_question_count,
      subject: subjectItem,
      paper: paperItem
        ? {
            id: paperItem.id,
            exam_group_id: paperItem.exam_group_id,
            specialization_id: paperItem.specialization_id,
            name: paperItem.name,
            slug: paperItem.slug,
            display_order: paperItem.display_order,
            question_count: paperItem.question_count,
            default_correct_marks: paperItem.default_correct_marks,
            default_negative_marks: paperItem.default_negative_marks ?? null,
            specialization: specItem,
            exam_group: examItem
              ? {
                  id: examItem.id,
                  exam_id: examItem.exam_id,
                  name: examItem.name,
                  slug: examItem.slug,
                  exam: catItem
                    ? {
                        id: catItem.id,
                        state_id: catItem.state_id,
                        name: catItem.name,
                        slug: catItem.slug,
                        state: stateItem,
                      }
                    : null,
                }
              : null,
          }
        : null,
    };
  } else {
    const [testResult, mqResult] = await Promise.all([
      supabase
        .from("mock_tests")
        .select(`
          id, paper_id, subject_id, subject_section_id, test_scope, series_number, title, description, instructions, duration_minutes, status, access_type, target_question_count,
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
      supabase
        .from("mock_test_questions")
        .select("marks, negative_marks")
        .eq("mock_test_id", id),
    ]);
    test = testResult.data as unknown as MockTestDetailData | null;
    mq = mqResult.data && mqResult.data.length > 0 ? mqResult.data : supplementary.mq;
  }

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

  const siblingPapers: OrderedPaper[] = paper
    ? (catalog.papers.filter((p) => p.exam_group_id === paper.exam_group_id && p.is_active) as OrderedPaper[])
    : [];

  const paidSalesStatus = await isPaidSalesEnabled();
  const paidSalesEnabled = paidSalesStatus;

  const [accessResult, resumableSessionResult, previousAttemptResult, fallbackPapers] = await Promise.all([
    test.access_type === "paid" && examGroup
      ? (async () => {
          try {
            const [products, canAccess] = await Promise.all([
              paidSalesEnabled
                ? supabase
                    .from("access_product_exam_groups")
                    .select("access_products!inner(id, name, price_inr, duration_days, is_active)")
                    .eq("exam_group_id", examGroup.id)
                    .eq("access_products.is_active", true)
                    .then((res) => res)
                    .catch(() => ({ data: [] }))
                : Promise.resolve({ data: [] }),
              isLoggedIn
                ? supabase
                    .rpc("can_access_mock_test", { requested_mock_test_id: id })
                    .then((res) => res)
                    .catch(() => ({ data: false }))
                : Promise.resolve({ data: false }),
            ]);
            return { products, canAccess };
          } catch {
            return { products: { data: [] }, canAccess: { data: false } };
          }
        })()
      : Promise.resolve({ products: { data: [] }, canAccess: { data: true } }),

    sessionPromise,
    attemptPromise,

    paper && siblingPapers.length === 0
      ? supabase
          .from("papers")
          .select("id, exam_group_id, specialization_id, name, display_order")
          .eq("exam_group_id", paper.exam_group_id)
          .eq("is_active", true)
          .then(({ data }) => (data && data.length > 0 ? (data as OrderedPaper[]) : []))
          .catch(() => [] as OrderedPaper[])
      : Promise.resolve([] as OrderedPaper[]),
  ]);

  const allSiblingPapers = siblingPapers.length > 0 ? siblingPapers : fallbackPapers;
  const paperDisplay = paper
    ? buildPaperDisplayMap(allSiblingPapers).get(paper.id)
    : undefined;

  const catalogStats = cachedTest
    ? ((catalog.stats as (MockTestStatsSummary & { mock_test_id: string })[] | undefined) ?? []).find(
        (s) => s.mock_test_id === id,
      )
    : undefined;

  const measuredQuestionCount =
    mq.length > 0
      ? mq.length
      : catalogStats !== undefined
        ? Number(catalogStats.question_count ?? 0)
        : null;

  const isTestReady = measuredQuestionCount === null ? true : measuredQuestionCount > 0;

  const scoring = resolveMockTestScoring({
    questions: mq,
    stats: catalogStats,
    targetQuestionCount: test.target_question_count,
    paperQuestionCount: paper?.question_count,
    defaultCorrectMarks: paper?.default_correct_marks,
    defaultNegativeMarks: paper?.default_negative_marks,
  });
  const {
    questionCount,
    totalMarks,
    negativeMarks,
    hasNegativeMarking,
    negativeSummaryLabel,
    markingPairLabel,
  } = scoring;

  const questionCountLabel = questionCount ? String(questionCount) : "Shown when started";
  const totalMarksLabel = totalMarks ? formatMarkValue(totalMarks) : "Shown when started";

  const languageMode = subject?.content_language_mode ?? "bilingual";
  const languageLabel =
    languageMode === "bilingual"
      ? "English + Telugu"
      : languageMode === "telugu"
        ? "Telugu"
        : "English";

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
      negativeSummaryLabel,
    ],
    ["Language", languageLabel],
    ...(hasResumableSession
      ? [["Progress", "Saved — ready to resume"]]
      : []),
  ];

  const seriesNum = Number(test.series_number ?? 1);
  const section = test.subject_section_id
    ? (catalog.sections.find((s) => s.id === test.subject_section_id) ?? null)
    : null;

  const displayTitle = displayMockTestHeading({
    subjectName: subject?.name,
    sectionName: section?.name,
    testScope: test.test_scope,
    seriesNumber: seriesNum,
  });

  const resourceName = formatFullMockTestTitle({
    stateCode: state?.code,
    examName: examGroup?.name ?? "Exam",
    paperLabel: paperDisplay?.shortLabel ?? "Paper",
    subjectName: subject?.name,
    sectionName: section?.name,
    testScope: test.test_scope,
    seriesNumber: seriesNum,
  });

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
    <main className="student-page min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      <JsonLd data={jsonLd} />
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        {query.start_error && (
          <>
            <AutoExitFullscreen />
            <aside
              role="alert"
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 shadow-2xs"
            >
              {query.start_error === "no_questions"
                ? "This mock test does not have active questions available yet. Our team is updating the questions. Please try again shortly or select another test."
                : query.start_error === "count_mismatch"
                  ? "This test's question count is being updated by administrators. Please try again shortly."
                  : query.start_error === "not_available"
                    ? "This mock test is temporarily unavailable. Please check back shortly."
                    : query.start_error === "no_access"
                      ? "You do not have access to this test. Please check your exam series pass or sign in."
                      : "This test could not be started because its setup is incomplete. The administrator needs to verify its active questions and Paper count."}
            </aside>
          </>
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
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:text-teal-950 transition"
        >
          ← {resolvedBackLabel}
        </Link>

        {/* Test Overview Hero Box */}
        <section className="mt-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

              {section && (
                <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
                  {section.name}
                </span>
              )}
            </div>

            {hasResumableSession && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Attempt in progress
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800 leading-relaxed break-words">
                {state?.code ?? "State"} ·{" "}
                {exam?.name ?? "Board"} ·{" "}
                {examGroup?.name ?? "Exam"} ·{" "}
                {paperDisplay?.shortLabel ?? "Paper"}
              </p>

              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                {displayTitle}
              </h1>

              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
                {test.description ??
                  (test.test_scope === "subject" && subject?.name
                    ? `Dedicated ${subject.name} practice test aligned with the official examination pattern. Practise under timed conditions with instant scoring, bilingual solutions, and comprehensive analysis.`
                    : hasNegativeMarking
                      ? `Complete syllabus mock test prepared according to the latest official examination pattern. Practise under timed conditions with -${formatMarkValue(negativeMarks)} negative marking and instant detailed solutions.`
                      : "Complete syllabus mock test prepared according to the latest official examination pattern. Practise under timed conditions with no negative marking and instant detailed solutions.")}
              </p>
            </div>

            {/* Top Primary Start Action (Appears on top of page) */}
            <div className="w-full sm:w-auto sm:min-w-[220px] lg:min-w-[250px] shrink-0">
              {isUnlocked ? (
                <div className="space-y-1.5">
                  <TestStartActions testId={id} testPath={canonicalPath} isLoggedIn={isLoggedIn} hasResumableSession={hasResumableSession} hasPreviousAttempt={hasPreviousAttempt} />
                  <p className="text-center text-[11px] font-medium text-slate-500">
                    {hasResumableSession
                      ? "Resume to keep your saved progress"
                      : "Official timing · Auto-saved"}
                  </p>
                </div>
              ) : paidSalesEnabled && purchaseProduct ? (
                <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-center">
                  <p className="text-xs font-bold text-teal-950">{purchaseProduct.name}</p>
                  <p className="mt-0.5 text-[11px] text-teal-800">₹{purchaseProduct.price_inr} · {purchaseProduct.duration_days} days</p>
                  <div className="mt-2">
                    <BuyExamPassForm
                      productId={purchaseProduct.id}
                      price={Number(purchaseProduct.price_inr)}
                      returnTo={canonicalPath}
                      phone={typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : ""}
                      buttonLabel="Unlock exam series"
                      pendingLabel="Opening checkout..."
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                  Temporarily unavailable
                </div>
              )}
            </div>
          </div>

          {/* Key Exam Specifications Strip */}
          <div className="student-stagger mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 border-t border-slate-100 pt-5">
            {testSummaryMetrics.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-900 sm:text-base break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions and Start Action Station */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
          <section className="min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
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

          {/* Clean Action Card - Candidate Portal and CBT badges removed */}
          <aside className="min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs lg:sticky lg:top-24">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Ready to begin?
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
              {hasResumableSession
                ? "You have an ongoing attempt. Resume to continue with your saved time and answers."
                : "Simulate real exam conditions. The countdown timer begins as soon as you select Start Test."}
            </p>

            {/* Content & Parameter Grid */}
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Questions</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {isTestReady ? (questionCount ?? "—") : "Being prepared"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duration</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{test.duration_minutes} min</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Marking</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {markingPairLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Access</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                        test.access_type === "free"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isUnlocked
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {test.access_type === "free"
                        ? "Free"
                        : isUnlocked
                          ? "Series active"
                          : "Paid series"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Assurance Strip */}
              <div className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">✓</span>
                  <span className="font-medium text-slate-800">Bilingual questions (English & తెలుగు)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">✓</span>
                  <span className="font-medium text-slate-800">Auto-saves every selected answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">✓</span>
                  <span className="font-medium text-slate-800">Instant detailed solutions upon submit</span>
                </div>
              </div>

              {/* Action Area */}
              <div>
                {isUnlocked ? (
                  <TestStartActions
                    testId={id}
                    testPath={canonicalPath}
                    isLoggedIn={isLoggedIn}
                    hasResumableSession={hasResumableSession}
                    hasPreviousAttempt={hasPreviousAttempt}
                    isReady={isTestReady}
                  />
                ) : paidSalesEnabled && purchaseProduct ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm font-bold text-slate-900">
                      This mock test is part of <span className="text-teal-900">{`${purchaseProduct.name}`}</span>.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      Buy once to unlock all paid mock tests in this exam series for {purchaseProduct.duration_days} days.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">✓</span> Access every paid test under this exam
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">✓</span> Start immediately after payment
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">✓</span> Keep full answer review and result history
                      </li>
                    </ul>
                    <div className="mt-4">
                      <BuyExamPassForm
                        productId={purchaseProduct.id}
                        price={Number(purchaseProduct.price_inr)}
                        returnTo={canonicalPath}
                        phone={typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : ""}
                        buttonLabel="Proceed to secure payment"
                        pendingLabel="Opening secure checkout..."
                      />
                    </div>
                  </div>
                ) : paidSalesEnabled ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm leading-6 text-slate-700">
                    Purchases for this exam series are temporarily unavailable. Existing purchases remain valid.{" "}
                    <Link href="/dashboard/passes"
                      prefetch={true} className="font-semibold text-teal-800 underline hover:text-teal-950">
                      View My Purchases
                    </Link>.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm leading-6 text-slate-700">
                    This premium mock test is not currently available. Please check again later.
                  </div>
                )}
              </div>

              {/* Guiding Microcopy */}
              <p className="text-center text-xs leading-relaxed text-slate-500">
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
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
