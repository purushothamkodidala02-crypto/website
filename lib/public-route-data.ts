import { getMockTestCatalogData } from "@/lib/catalog-data";
import { createPublicClient } from "@/lib/supabase/public";

type SlugEntity = { id: string; slug: string };
type EntityType = "state" | "category" | "exam" | "specialization" | "paper" | "subject" | "mock_test";

async function resolveEntity<T extends SlugEntity>(
  catalogItems: T[],
  slug: string,
  entityType: EntityType,
  belongs: (item: T) => boolean,
) {
  const current = catalogItems.find((item) => item.slug === slug && belongs(item));
  if (current) return { item: current, usedAlias: false };

  const supabase = createPublicClient();
  const { data: aliases } = await supabase
    .from("public_slug_aliases")
    .select("entity_id")
    .eq("entity_type", entityType)
    .eq("slug", slug);
  const aliasIds = new Set((aliases ?? []).map((alias) => alias.entity_id));
  const aliased = catalogItems.find((item) => aliasIds.has(item.id) && belongs(item));
  return aliased ? { item: aliased, usedAlias: true } : null;
}

export type PublicRouteRequest = {
  stateSlug: string;
  categorySlug?: string;
  examSlug?: string;
  specializationSlug?: string;
  paperSlug?: string;
  subjectSlug?: string;
  mockTestSlug?: string;
};

export async function resolvePublicRoute(request: PublicRouteRequest) {
  const catalog = await getMockTestCatalogData();
  let usedAlias = false;
  const stateMatch = await resolveEntity(catalog.states, request.stateSlug, "state", () => true);
  if (!stateMatch) return null;
  const state = stateMatch.item;
  usedAlias ||= stateMatch.usedAlias;

  const categoryIds = new Set(catalog.categories.filter((category) => category.state_id === state.id).map((category) => category.id));
  const categoryMatch = request.categorySlug
    ? await resolveEntity(catalog.categories, request.categorySlug, "category", (category) => category.state_id === state.id)
    : null;
  if (request.categorySlug && !categoryMatch) return null;
  const category = categoryMatch?.item;
  usedAlias ||= Boolean(categoryMatch?.usedAlias);

  const examMatch = request.examSlug
    ? await resolveEntity(catalog.exams, request.examSlug, "exam", (exam) => category ? exam.exam_id === category.id : categoryIds.has(exam.exam_id))
    : null;
  if (request.examSlug && !examMatch) return null;
  const exam = examMatch?.item;
  usedAlias ||= Boolean(examMatch?.usedAlias);

  const specializationMatch = request.specializationSlug && exam
    ? await resolveEntity(catalog.specializations, request.specializationSlug, "specialization", (specialization) => specialization.exam_group_id === exam.id)
    : null;
  if (request.specializationSlug && !specializationMatch) return null;
  const specialization = specializationMatch?.item;
  usedAlias ||= Boolean(specializationMatch?.usedAlias);

  const paperMatch = request.paperSlug && exam
    ? await resolveEntity(catalog.papers, request.paperSlug, "paper", (paper) => paper.exam_group_id === exam.id)
    : null;
  if (request.paperSlug && !paperMatch) return null;
  const paper = paperMatch?.item;
  usedAlias ||= Boolean(paperMatch?.usedAlias);

  const subjectMatch = request.subjectSlug && paper
    ? await resolveEntity(catalog.subjects, request.subjectSlug, "subject", (subject) => subject.paper_id === paper.id)
    : null;
  if (request.subjectSlug && !subjectMatch) return null;
  const subject = subjectMatch?.item;
  usedAlias ||= Boolean(subjectMatch?.usedAlias);

  const mockTestMatch = request.mockTestSlug && paper
    ? await resolveEntity(catalog.tests, request.mockTestSlug, "mock_test", (test) => test.paper_id === paper.id)
    : null;
  if (request.mockTestSlug && !mockTestMatch) return null;
  const mockTest = mockTestMatch?.item;
  usedAlias ||= Boolean(mockTestMatch?.usedAlias);

  return { catalog, state, category, exam, specialization, paper, subject, mockTest, usedAlias };
}

export type PublicRouteContext = NonNullable<Awaited<ReturnType<typeof resolvePublicRoute>>>;

export async function getMockTestPublicContextById(mockTestId: string) {
  const catalog = await getMockTestCatalogData();
  const mockTest = catalog.tests.find((test) => test.id === mockTestId);
  if (!mockTest) return null;
  const paper = catalog.papers.find((item) => item.id === mockTest.paper_id);
  const exam = paper ? catalog.exams.find((item) => item.id === paper.exam_group_id) : undefined;
  const category = exam ? catalog.categories.find((item) => item.id === exam.exam_id) : undefined;
  const state = category ? catalog.states.find((item) => item.id === category.state_id) : undefined;
  if (!paper || !exam || !category || !state) return null;
  const subject = mockTest.subject_id ? catalog.subjects.find((item) => item.id === mockTest.subject_id) : undefined;
  return { catalog, state, category, exam, paper, subject, mockTest };
}

export async function getMockTestFastContextById(
  mockTestId: string,
  client?: ReturnType<typeof createPublicClient>,
) {
  const supabase = client ?? createPublicClient();
  const selectQuery =
    "id, title, slug, status, access_type, test_scope, subject:subjects(id, name, slug), paper:papers!inner(id, name, slug, exam_group:exam_groups!inner(id, name, slug, exam:exams!inner(id, name, slug, state:exam_states!inner(id, name, code, slug))))";

  const { data: test } = await (supabase as unknown as ReturnType<typeof createPublicClient>)
    .from("mock_tests")
    .select(selectQuery)
    .eq("id", mockTestId)
    .eq("status", "published")
    .maybeSingle();

  if (!test) return null;

  const rawPaper = test.paper as unknown as {
    id: string;
    name: string;
    slug: string;
    exam_group: {
      id: string;
      name: string;
      slug: string;
      exam: {
        id: string;
        name: string;
        slug: string;
        state: {
          id: string;
          name: string;
          code: string;
          slug: string;
        };
      };
    };
  };

  const rawSubject = test.subject as unknown as { id: string; name: string; slug: string } | null;

  const examGroup = rawPaper.exam_group;
  const category = examGroup.exam;
  const state = category.state;

  return {
    mockTest: {
      id: test.id,
      title: test.title,
      slug: test.slug,
      status: test.status,
      access_type: test.access_type,
      test_scope: test.test_scope,
    },
    paper: {
      id: rawPaper.id,
      name: rawPaper.name,
      slug: rawPaper.slug,
    },
    exam: {
      id: examGroup.id,
      name: examGroup.name,
      slug: examGroup.slug,
    },
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    state: {
      id: state.id,
      name: state.name,
      code: state.code,
      slug: state.slug,
    },
    subject: rawSubject ? { id: rawSubject.id, name: rawSubject.name, slug: rawSubject.slug } : null,
  };
}
