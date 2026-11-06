import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { generateMockTestMetadata, MockTestDetailsPage } from "@/components/mock-tests/MockTestDetailPage";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { mockTestUrl, paperUrl } from "@/lib/public-urls";
import { getMockTestCatalogData } from "@/lib/catalog-data";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  const catalog = await getMockTestCatalogData();
  const params: { id: string; exam: string; paper: string; test: string }[] = [];
  for (const test of catalog.tests) {
    const paper = catalog.papers.find((p) => p.id === test.paper_id);
    const exam = paper ? catalog.exams.find((e) => e.id === paper.exam_group_id) : null;
    const category = exam ? catalog.categories.find((c) => c.id === exam.exam_id) : null;
    const state = category ? catalog.states.find((s) => s.id === category.state_id) : null;
    if (state?.slug && exam?.slug && paper?.slug && test.slug) {
      params.push({
        id: state.slug,
        exam: exam.slug,
        paper: paper.slug,
        test: test.slug,
      });
    }
  }
  return params;
}

type Props = { params: Promise<{ id: string; exam: string; paper: string; test: string }>; searchParams: Promise<{ start_error?: string; payment_error?: string }> };
async function context(params: Props["params"]) { const p = await params; return { p, c: await resolvePublicRoute({ stateSlug: p.id, examSlug: p.exam, paperSlug: p.paper, mockTestSlug: p.test }) }; }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { c } = await context(params); if (!c?.exam || !c.paper || !c.mockTest) return { title: "Mock Test Not Found", robots: { index: false, follow: false } }; return generateMockTestMetadata({ id: c.mockTest.id, canonicalPath: mockTestUrl(c.state.slug, c.exam.slug, c.paper.slug, c.mockTest.slug) }); }
export default async function TestPage({ params, searchParams }: Props) {
  const { p, c } = await context(params);
  if (!c?.exam || !c.paper || !c.mockTest) notFound();
  const canonical = mockTestUrl(c.state.slug, c.exam.slug, c.paper.slug, c.mockTest.slug);
  if (c.usedAlias || p.id !== c.state.slug || p.exam !== c.exam.slug || p.paper !== c.paper.slug || p.test !== c.mockTest.slug) permanentRedirect(canonical);
  const backHref = paperUrl(c.state.slug, c.exam.slug, c.paper.slug);
  return MockTestDetailsPage({
    id: c.mockTest.id,
    canonicalPath: canonical,
    backHref,
    searchParams,
  });
}
