import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const ADMIN_TAXONOMY_TAG = "admin-taxonomy";

export type AdminTaxonomyData = {
  subjects: {
    id: string;
    paper_id: string;
    name: string;
    content_language_mode: string;
    display_order: number;
  }[];
  papers: {
    id: string;
    exam_group_id: string;
    specialization_id: string | null;
    name: string;
    duration_minutes: number;
    display_order: number;
  }[];
  groups: {
    id: string;
    exam_id: string;
    name: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
};

export const getAdminTaxonomy = unstable_cache(
  async (): Promise<AdminTaxonomyData> => {
    const admin = createAdminClient();
    const [subjectsResult, papersResult, groupsResult, categoriesResult] = await Promise.all([
      admin
        .from("subjects")
        .select("id, paper_id, name, content_language_mode, display_order")
        .order("display_order"),
      admin
        .from("papers")
        .select("id, exam_group_id, specialization_id, name, duration_minutes, display_order")
        .order("display_order"),
      admin.from("exam_groups").select("id, exam_id, name"),
      admin.from("exams").select("id, name"),
    ]);

    return {
      subjects: (subjectsResult.data ?? []) as AdminTaxonomyData["subjects"],
      papers: (papersResult.data ?? []) as AdminTaxonomyData["papers"],
      groups: (groupsResult.data ?? []) as AdminTaxonomyData["groups"],
      categories: (categoriesResult.data ?? []) as AdminTaxonomyData["categories"],
    };
  },
  ["admin-taxonomy-v1"],
  { tags: [ADMIN_TAXONOMY_TAG], revalidate: 300 },
);
