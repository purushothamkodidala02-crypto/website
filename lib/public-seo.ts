import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export function publicCollectionMetadata({
  title,
  description,
  canonical,
  indexable = true,
  keywords,
}: {
  title: string;
  description: string;
  canonical: string;
  indexable?: boolean;
  keywords?: string[];
}): Metadata {
  const brand = " | Varadhi Prep";
  let metadataTitle: Metadata["title"] = title;
  if (title.endsWith("Varadhi Prep")) {
    metadataTitle = { absolute: title };
  } else if (title.length + brand.length > 60) {
    const firstPart = title.split("|")[0].trim();
    if (firstPart && firstPart.length + brand.length <= 60) {
      metadataTitle = { absolute: `${firstPart}${brand}` };
    } else {
      const trimmed = title.slice(0, 60 - brand.length).trim().replace(/[|,\-–]$/, "").trim();
      metadataTitle = { absolute: `${trimmed}${brand}` };
    }
  }

  const safeDescription = trimMetaDescription(description, 155);

  return {
    title: metadataTitle,
    description: safeDescription,
    keywords,
    alternates: { canonical },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url: canonical, title, description: safeDescription, siteName: "Varadhi Prep", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description: safeDescription, images: ["/opengraph-image"] },
  };
}

export function trimMetaDescription(desc: string, max = 155): string {
  if (!desc || desc.length <= max) return desc;
  const sliced = desc.slice(0, max);
  const lastPunctuation = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf("! "), sliced.lastIndexOf("? "));
  if (lastPunctuation > 60) {
    return sliced.slice(0, lastPunctuation + 1).trim();
  }
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 50 ? sliced.slice(0, lastSpace) : sliced).trim() + "...";
}

export function isIndexableCollectionQuery(filters: { q?: string; type?: string; page?: string; view?: string }) {
  return !filters.q && (!filters.page || filters.page === "1");
}

export function collectionStructuredData(
  name: string,
  description: string,
  canonical: string,
  crumbs: Array<{ name: string; path: string }>,
) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      description,
      url: absoluteUrl(canonical),
      educationalUse: "Practice",
      isPartOf: { "@type": "WebSite", name: "Varadhi Prep", url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ];
}
