import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateMockTestMetadata } from "@/components/mock-tests/MockTestDetailPage";
import { getMockTestPublicContextById, resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { mockTestUrl, stateUrl, UUID_PATTERN } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  return [
    { id: "telangana" },
    { id: "andhra-pradesh" },
  ];
}

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Filters> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  if (UUID_PATTERN.test(id)) {
    const context = await getMockTestPublicContextById(id);
    if (!context) return { title: "Mock Test Not Found", robots: { index: false, follow: false } };
    const canonical = mockTestUrl(context.state.slug, context.exam.slug, context.paper.slug, context.mockTest.slug);
    return generateMockTestMetadata({ id, canonicalPath: canonical });
  }
  const context = await resolvePublicRoute({ stateSlug: id });
  if (!context) return { title: "State Mock Tests Not Found", robots: { index: false, follow: false } };
  const canonical = stateUrl(context.state.slug);

  const isTelangana = context.state.slug === "telangana" || context.state.slug === "tg";
  const defaultFallbackTitle = isTelangana
    ? "Telangana Competitive Exams Free Mock Tests 2026 - Police, TGPSC & TET | తెలంగాణ మాక్ టెస్ట్"
    : `${context.state.name} Mock Tests`;
  const defaultFallbackDesc = isTelangana
    ? "Take free Telangana competitive exam mock tests online. Practise TG Police Constable, TGPSC Group exams, TG TET 2026 with bilingual test papers in Telugu & English, CBT timer, and detailed solutions."
    : `Browse free ${context.state.name} competitive exam mock tests. Practise timed papers online with instant scoring, bilingual answers, and topic reviews on Varadhi Prep.`;

  const stateKeywords = isTelangana
    ? [
        "Telangana mock test",
        "Telangana police mock test",
        "Telangana police constable mock test",
        "Telangana police exam",
        "TG police constable mock test free",
        "TGPSC mock test online",
        "TG TET 2026 practice test",
        "Telangana competitive exams online test series",
        "తెలంగాణ మాక్ టెస్ట్",
        "తెలంగాణ పోలీస్ కానిస్టేబుల్ ఆన్‌లైన్ టెస్ట్",
        "టీజీ పోటీ పరీక్షల ప్రాక్టీస్ పేపర్స్",
      ]
    : undefined;

  const seo = resolveSeoFields(context.state, {
    title: defaultFallbackTitle,
    description: defaultFallbackDesc,
  });
  return publicCollectionMetadata({
    ...seo,
    keywords: stateKeywords,
    canonical,
    indexable: isIndexableCollectionQuery(await searchParams),
  });
}

export default async function StateOrLegacyTestPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (UUID_PATTERN.test(id)) {
    const context = await getMockTestPublicContextById(id);
    if (!context) notFound();
    permanentRedirect(mockTestUrl(context.state.slug, context.exam.slug, context.paper.slug, context.mockTest.slug));
  }
  const context = await resolvePublicRoute({ stateSlug: id });
  if (!context) notFound();
  const canonical = stateUrl(context.state.slug);
  if (context.usedAlias || id !== context.state.slug) permanentRedirect(canonical);

  const isTelangana = context.state.slug === "telangana" || context.state.slug === "tg";
  const defaultFallbackTitle = isTelangana
    ? "Telangana Competitive Exams Free Mock Tests 2026 - Police, TGPSC & TET | తెలంగాణ మాక్ టెస్ట్"
    : `${context.state.name} Mock Tests`;
  const defaultFallbackDesc = isTelangana
    ? "Take free Telangana competitive exam mock tests online. Practise TG Police Constable, TGPSC Group exams, TG TET 2026 with bilingual test papers in Telugu & English, CBT timer, and detailed solutions."
    : `Browse free ${context.state.name} competitive exam mock tests. Practise timed papers online with instant scoring, bilingual answers, and topic reviews on Varadhi Prep.`;

  const seo = resolveSeoFields(context.state, { title: defaultFallbackTitle, description: defaultFallbackDesc });
  return <><JsonLd data={collectionStructuredData(seo.title, seo.description, canonical, [{ name: "Home", path: "/" }, { name: "Mock tests", path: "/mock-tests" }, { name: context.state.name, path: canonical }])} />{await MockTestsPage({ searchParams: Promise.resolve({ ...(await searchParams), state: context.state.slug }), canonicalPath: canonical })}</>;
}
