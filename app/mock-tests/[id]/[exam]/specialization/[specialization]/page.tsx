import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, specializationUrl, stateUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

type Props = { params: Promise<{ id: string; exam: string; specialization: string }>; searchParams: Promise<Filters> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id, exam, specialization } = await params;
  const c = await resolvePublicRoute({ stateSlug: id, examSlug: exam, specializationSlug: specialization });
  if (!c?.exam || !c.specialization) return { title: "Specialization Not Found", robots: { index: false, follow: false } };
  const canonical = specializationUrl(c.state.slug, c.exam.slug, c.specialization.slug);
  const seo = resolveSeoFields(c.specialization, {
    title: `${c.specialization.name} Mock Tests for ${c.exam.name}`,
    description: `Free ${c.specialization.name} mock tests for ${c.exam.name}. Practise authentic questions with instant answers and performance analytics.`,
  });
  return publicCollectionMetadata({ ...seo, canonical, indexable: isIndexableCollectionQuery(await searchParams) });
}

export default async function SpecializationPage({ params, searchParams }: Props) {
  const { id, exam, specialization } = await params;
  const c = await resolvePublicRoute({ stateSlug: id, examSlug: exam, specializationSlug: specialization });
  if (!c?.exam || !c.specialization) notFound();
  const canonical = specializationUrl(c.state.slug, c.exam.slug, c.specialization.slug);
  if (c.usedAlias || id !== c.state.slug || exam !== c.exam.slug || specialization !== c.specialization.slug) {
    permanentRedirect(canonical);
  }
  const seo = resolveSeoFields(c.specialization, {
    title: `${c.specialization.name} Mock Tests for ${c.exam.name}`,
    description: `Free ${c.specialization.name} mock tests for ${c.exam.name}. Practise authentic questions with instant answers and performance analytics.`,
  });
  return (
    <>
      <JsonLd
        data={collectionStructuredData(seo.title, seo.description, canonical, [
          { name: "Home", path: "/" },
          { name: "Mock tests", path: "/mock-tests" },
          { name: c.state.name, path: stateUrl(c.state.slug) },
          { name: c.exam.name, path: examUrl(c.state.slug, c.exam.slug) },
          { name: c.specialization.name, path: canonical },
        ])}
      />
      {await MockTestsPage({
        searchParams: Promise.resolve({
          ...(await searchParams),
          state: c.state.slug,
          exam: c.exam.slug,
          specialization: c.specialization.slug,
        }),
        canonicalPath: canonical,
      })}
    </>
  );
}
