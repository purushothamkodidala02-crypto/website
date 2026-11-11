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
  if (title.includes("Varadhi Prep")) {
    metadataTitle = { absolute: title };
  } else if (title.includes("|")) {
    // Multi-part or bilingual title (e.g. English | Telugu).
    // Preserve all segments so search engines index both languages and keyphrases.
    if (title.length + brand.length <= 90) {
      metadataTitle = { absolute: `${title}${brand}` };
    } else {
      metadataTitle = { absolute: title };
    }
  } else if (title.length + brand.length <= 65) {
    metadataTitle = { absolute: `${title}${brand}` };
  } else {
    const trimmed = title.slice(0, 65 - brand.length).trim().replace(/[|,\-–]$/, "").trim();
    metadataTitle = { absolute: `${trimmed}${brand}` };
  }

  const safeDescription = trimMetaDescription(description, 160);

  return {
    title: metadataTitle,
    description: safeDescription,
    keywords,
    alternates: { canonical },
    robots: indexable ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } : { index: false, follow: true },
    openGraph: { type: "website", url: canonical, title, description: safeDescription, siteName: "Varadhi Prep", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description: safeDescription, images: ["/opengraph-image"] },
  };
}

export function trimMetaDescription(desc: string, max = 160): string {
  if (!desc || desc.length <= max) return desc;
  const sliced = desc.slice(0, max);
  const minPunctuationIndex = Math.floor(max * 0.7);
  const lastPunctuation = Math.max(
    sliced.lastIndexOf(". "),
    sliced.lastIndexOf("! "),
    sliced.lastIndexOf("? ")
  );
  if (lastPunctuation >= minPunctuationIndex) {
    return sliced.slice(0, lastPunctuation + 1).trim();
  }
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > minPunctuationIndex ? sliced.slice(0, lastSpace) : sliced).trim() + "...";
}

export function isIndexableCollectionQuery(filters: { q?: string; type?: string; page?: string; view?: string; section?: string }) {
  return !filters.q && !filters.view && !filters.section && (!filters.type || filters.type === "all") && (!filters.page || filters.page === "1");
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
