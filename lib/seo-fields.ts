export const SEO_TITLE_MAX_LENGTH = 100;
export const SEO_DESCRIPTION_MAX_LENGTH = 320;

export type SeoFields = {
  seo_title?: string | null;
  seo_description?: string | null;
};

export function readSeoFields(formData: FormData): {
  value: { seo_title: string | null; seo_description: string | null };
  error: string | null;
} {
  const title = String(formData.get("seo_title") ?? "").trim();
  const description = String(formData.get("seo_description") ?? "").trim();

  if (title.length > SEO_TITLE_MAX_LENGTH) {
    return { value: { seo_title: null, seo_description: null }, error: `SEO title must be ${SEO_TITLE_MAX_LENGTH} characters or fewer.` };
  }
  if (description.length > SEO_DESCRIPTION_MAX_LENGTH) {
    return { value: { seo_title: null, seo_description: null }, error: `SEO description must be ${SEO_DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }

  return {
    value: {
      seo_title: title || null,
      seo_description: description || null,
    },
    error: null,
  };
}

export function resolveSeoFields(
  entity: SeoFields,
  fallback: { title: string; description: string },
) {
  const rawTitle = entity.seo_title?.trim();
  const rawDesc = entity.seo_description?.trim();

  const isLegacyTitle =
    rawTitle === "Telangana Police Constable Mock Test 2026 – Free Online Tests" ||
    rawTitle === "Telangana Police Constable Mock Test Series 2026";
  const isLegacyDesc =
    rawDesc?.startsWith("Take free Telangana Police Constable mock tests online for preliminary") ||
    rawDesc?.startsWith("Practice the latest Telangana Police Constable Mock Test 2026 for free");

  // If fallback title is bilingual (contains Telugu script \u0C00-\u0C7F) and entity title lacks Telugu,
  // prefer the rich bilingual fallback for optimal search visibility across English & Telugu queries.
  const hasTeluguInFallback = fallback.title && /[\u0C00-\u0C7F]/.test(fallback.title);
  const hasTeluguInDb = rawTitle && /[\u0C00-\u0C7F]/.test(rawTitle);

  const useFallbackTitle =
    !rawTitle || isLegacyTitle || (hasTeluguInFallback && !hasTeluguInDb);
  const useFallbackDesc = !rawDesc || isLegacyDesc;

  return {
    title: useFallbackTitle ? fallback.title : rawTitle,
    description: useFallbackDesc ? fallback.description : rawDesc,
  };
}
