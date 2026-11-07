import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, paperUrl, stateUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

type Props = { params: Promise<{ id: string; exam: string; paper: string }>; searchParams: Promise<Filters> };

function resolvePaperFallbacks(c: NonNullable<Awaited<ReturnType<typeof resolvePublicRoute>>>) {
  const isPolice =
    c.exam?.slug.includes("police") ||
    c.exam?.name.toLowerCase().includes("police") ||
    c.paper?.slug.includes("pwt");

  const title = isPolice
    ? `${c.state.name} Police Constable ${c.paper?.name} Free Mock Test | తెలంగాణ పోలీస్ కానిస్టేబుల్ ప్రాక్టీస్ పేపర్`
    : `${c.exam?.name} ${c.paper?.name} Mock Tests`;

  const description = isPolice
    ? `Free ${c.state.name} Police Constable ${c.paper?.name} mock tests in Telugu & English. Practise authentic questions with solutions, CBT timer, and negative marking.`
    : `Take free ${c.paper?.name} mock tests for ${c.exam?.name}. Practise authentic questions with solutions and timed scoring.`;

  const keywords = isPolice
    ? [
        `${c.state.name} police constable ${c.paper?.name} mock test`,
        "Telangana police constable PWT mock test",
        "TG police constable paper 1 mock test in telugu",
        "Telangana police constable preliminary written test",
        "TS police constable mock test free",
        "తెలంగాణ పోలీస్ కానిస్టేబుల్ పేపర్ 1 మాక్ టెస్ట్",
      ]
    : undefined;

  return { title, description, keywords };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const p = await params;
  const c = await resolvePublicRoute({ stateSlug: p.id, examSlug: p.exam, paperSlug: p.paper });
  if (!c?.exam || !c.paper) return { title: "Paper Not Found", robots: { index: false, follow: false } };
  const canonical = paperUrl(c.state.slug, c.exam.slug, c.paper.slug);

  const fallbacks = resolvePaperFallbacks(c);
  const seo = resolveSeoFields(c.paper, {
    title: fallbacks.title,
    description: fallbacks.description,
  });

  return publicCollectionMetadata({
    ...seo,
    keywords: fallbacks.keywords,
    canonical,
    indexable: isIndexableCollectionQuery(await searchParams),
  });
}

export default async function PaperPage({ params, searchParams }: Props) {
  const p = await params;
  const c = await resolvePublicRoute({ stateSlug: p.id, examSlug: p.exam, paperSlug: p.paper });
  if (!c?.exam || !c.paper) notFound();
  const canonical = paperUrl(c.state.slug, c.exam.slug, c.paper.slug);
  if (c.usedAlias || p.id !== c.state.slug || p.exam !== c.exam.slug || p.paper !== c.paper.slug) permanentRedirect(canonical);

  const fallbacks = resolvePaperFallbacks(c);
  const seo = resolveSeoFields(c.paper, {
    title: fallbacks.title,
    description: fallbacks.description,
  });

  return (
    <>
      <JsonLd
        data={collectionStructuredData(seo.title, seo.description, canonical, [
          { name: "Home", path: "/" },
          { name: "Mock tests", path: "/mock-tests" },
          { name: c.state.name, path: stateUrl(c.state.slug) },
          { name: c.exam.name, path: examUrl(c.state.slug, c.exam.slug) },
          { name: c.paper.name, path: canonical },
        ])}
      />
      {await MockTestsPage({
        searchParams: Promise.resolve({
          ...(await searchParams),
          state: c.state.slug,
          exam: c.exam.slug,
          paper: c.paper.slug,
        }),
        canonicalPath: canonical,
      })}
    </>
  );
}
