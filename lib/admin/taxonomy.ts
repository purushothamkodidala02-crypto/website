import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

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
    try {
      const db = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : createPublicClient();
      const [subjectsResult, papersResult, groupsResult, categoriesResult] = await Promise.all([
        db
          .from("subjects")
          .select("id, paper_id, name, content_language_mode, display_order")
          .order("display_order"),
        db
          .from("papers")
          .select("id, exam_group_id, specialization_id, name, duration_minutes, display_order")
          .order("display_order"),
        db.from("exam_groups").select("id, exam_id, name"),
        db.from("exams").select("id, name"),
      ]);

      return {
        subjects: (subjectsResult.data ?? []) as AdminTaxonomyData["subjects"],
        papers: (papersResult.data ?? []) as AdminTaxonomyData["papers"],
        groups: (groupsResult.data ?? []) as AdminTaxonomyData["groups"],
        categories: (categoriesResult.data ?? []) as AdminTaxonomyData["categories"],
      };
    } catch (err) {
      console.warn("Failed to load admin taxonomy with primary client, falling back:", err);
      try {
        const publicClient = createPublicClient();
        const [subjectsResult, papersResult, groupsResult, categoriesResult] = await Promise.all([
          publicClient
            .from("subjects")
            .select("id, paper_id, name, content_language_mode, display_order")
            .order("display_order"),
          publicClient
            .from("papers")
            .select("id, exam_group_id, specialization_id, name, duration_minutes, display_order")
            .order("display_order"),
          publicClient.from("exam_groups").select("id, exam_id, name"),
          publicClient.from("exams").select("id, name"),
        ]);

        return {
          subjects: (subjectsResult.data ?? []) as AdminTaxonomyData["subjects"],
          papers: (papersResult.data ?? []) as AdminTaxonomyData["papers"],
          groups: (groupsResult.data ?? []) as AdminTaxonomyData["groups"],
          categories: (categoriesResult.data ?? []) as AdminTaxonomyData["categories"],
        };
      } catch (fallbackErr) {
        console.error("Critical: Public client fallback also failed for admin taxonomy:", fallbackErr);
        return { subjects: [], papers: [], groups: [], categories: [] };
      }
    }
  },
  ["admin-taxonomy-v1"],
  { tags: [ADMIN_TAXONOMY_TAG], revalidate: 300 },
);
