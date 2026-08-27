import type { MetadataRoute } from "next";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { absoluteUrl } from "@/lib/site";
import { categoryUrl, examUrl, mockTestUrl, paperUrl, specializationUrl, stateUrl, subjectUrl } from "@/lib/public-urls";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getMockTestCatalogData();
  const paperById = new Map(catalog.papers.map((item) => [item.id, item]));
  const examById = new Map(catalog.exams.map((item) => [item.id, item]));
  const categoryById = new Map(catalog.categories.map((item) => [item.id, item]));
  const stateById = new Map(catalog.states.map((item) => [item.id, item]));
  const contexts = catalog.tests.flatMap((test) => {
    const paper = paperById.get(test.paper_id);
    const exam = paper ? examById.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    return paper && exam && category && state ? [{ test, paper, exam, category, state }] : [];
  });
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, priority: number, changeFrequency: "daily" | "weekly", lastModified?: string | null) => entries.set(path, { url: absoluteUrl(path), priority, changeFrequency, lastModified: lastModified ? new Date(lastModified) : undefined });
  add("/", 1, "weekly"); add("/mock-tests", 0.9, "daily");
  entries.set("/support", { url: absoluteUrl("/support"), priority: 0.5, changeFrequency: "yearly" });
  entries.set("/terms-and-conditions", { url: absoluteUrl("/terms-and-conditions"), priority: 0.3, changeFrequency: "yearly" });
  entries.set("/privacy-policy", { url: absoluteUrl("/privacy-policy"), priority: 0.3, changeFrequency: "yearly" });
  entries.set("/refunds-and-cancellations", { url: absoluteUrl("/refunds-and-cancellations"), priority: 0.3, changeFrequency: "yearly" });

  // Active catalogue entities have useful landing pages even before their
  // first mock test is published, so newly created exams are discoverable.
  for (const state of catalog.states) add(stateUrl(state.slug), 0.85, "daily");
  for (const category of catalog.categories) {
    const state = stateById.get(category.state_id);
    if (state) add(categoryUrl(state.slug, category.slug), 0.75, "weekly");
  }
  for (const exam of catalog.exams) {
    const category = categoryById.get(exam.exam_id);
    const state = category ? stateById.get(category.state_id) : undefined;
    if (state) add(examUrl(state.slug, exam.slug), 0.9, "daily");
  }
  for (const specialization of catalog.specializations) {
    const exam = examById.get(specialization.exam_group_id);
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    if (exam && state) add(specializationUrl(state.slug, exam.slug, specialization.slug), 0.72, "weekly");
  }
  for (const paper of catalog.papers) {
    const exam = examById.get(paper.exam_group_id);
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    if (exam && state) add(paperUrl(state.slug, exam.slug, paper.slug), 0.85, "daily");
  }
  for (const subject of catalog.subjects) {
    const paper = paperById.get(subject.paper_id);
    const exam = paper ? examById.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    if (paper && exam && state) add(subjectUrl(state.slug, exam.slug, paper.slug, subject.slug), 0.7, "weekly");
  }

  for (const { test, paper, exam, state } of contexts) {
    add(mockTestUrl(state.slug, exam.slug, paper.slug, test.slug), 0.8, "weekly", test.updated_at);
  }
  return [...entries.values()];
}
