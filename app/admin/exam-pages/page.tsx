import { createClient } from "@/lib/supabase/server";
import { ExamPageFaqManager } from "./ExamPageFaqManager";

const DEFAULT_PRIMARY_PAGES = [
  {
    id: "ts-police-constable-2026",
    title: "Telangana Police Constable Notification 2026",
    teluguTitle: "తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్",
    state: "Telangana",
    status: "live" as const,
    statusCode: "200 OK",
    publishedDate: "14 Nov 2026",
    lastUpdated: "15 Nov 2026",
    url: "https://varadhiprep.in/news/telangana-police-constable-notification-2026",
    vacancies: "7,112 Posts",
    description: "Official recruitment breakdown for Post Codes 21–28, revised pay scale (₹24,280–₹72,850), 100-mark PMT/PET events, complete syllabus weightage, and 58 bilingual mock tests.",
    highlights: ["Post Codes 21–28", "₹24,280 – ₹72,850 Scale", "58 Free Mock Tests", "Official PDF Mirror (748 KB)"],
  },
  {
    id: "ap-police-constable-2026",
    title: "Andhra Pradesh Police Constable Notification 2026",
    teluguTitle: "ఆంధ్రప్రదేశ్ పోలీస్ కానిస్టేబుల్ రిక్రూట్‌మెంట్ నోటిఫికేషన్",
    state: "Andhra Pradesh",
    status: "live" as const,
    statusCode: "200 OK",
    publishedDate: "15 Nov 2026",
    lastUpdated: "15 Nov 2026",
    url: "https://varadhiprep.in/news/andhra-police-constable-notification-2026",
    vacancies: "6,100+ Posts",
    description: "APSLPRB Constable civil & armed reserve cadre breakdown, age criteria, physical efficiency standards, syllabus marks-wise distribution, and practice test series.",
    highlights: ["APSLPRB Cadre", "Physical Efficiency Standards", "Bilingual Mock Tests", "State-Specific Syllabus"],
  },
  {
    id: "ap-endowment-officer-2026",
    title: "AP Endowment Officer Notification 2026",
    teluguTitle: "ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ నోటిఫికేషన్ 2026",
    state: "Andhra Pradesh",
    status: "live" as const,
    statusCode: "200 OK",
    publishedDate: "15 Nov 2026",
    lastUpdated: "15 Nov 2026",
    url: "https://varadhiprep.in/news/ap-endowment-officer-notification-2026",
    vacancies: "104 Posts",
    description: "APSSC Executive Officer Grade-III Notification No. 23/2026, Paper-I GS & Paper-II Hindu Philosophy weightage, Act 30/1987, and official Gazette PDF download.",
    highlights: ["APPSC Cadre-III", "Hindu Philosophy Paper-II", "Timed Mock Tests", "Official Gazette PDF"],
  },
];

export default async function ExamPagesPage() {
  const supabase = await createClient();
  const [statesResult, boardsResult, examsResult, faqsResult, primaryPagesResult] = await Promise.all([
    supabase.from("exam_states").select("id, name, code, slug").order("display_order"),
    supabase.from("exams").select("id, state_id, name").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name, slug, description, seo_title, seo_description").order("display_order"),
    supabase.from("exam_page_faqs").select("id, exam_group_id, question, answer, display_order").order("display_order"),
    supabase.from("primary_exam_pages").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
  ]);
  const error = statesResult.error || boardsResult.error || examsResult.error || faqsResult.error;
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">Unable to load exam-page content: {error.message}</p>;

  const primaryPages = (primaryPagesResult.data && primaryPagesResult.data.length > 0)
    ? primaryPagesResult.data.map((item) => ({
        id: item.id,
        title: item.title,
        teluguTitle: item.telugu_title || "",
        state: item.state,
        status: (item.status === "upcoming" ? "upcoming" : "live") as "live" | "upcoming",
        statusCode: item.status_code || (item.status === "live" ? "200 OK" : "Upcoming Pipeline"),
        publishedDate: item.published_date || "",
        lastUpdated: item.last_updated || "",
        url: item.url,
        vacancies: item.vacancies || "",
        description: item.description || "",
        highlights: Array.isArray(item.highlights) ? item.highlights : [],
      }))
    : DEFAULT_PRIMARY_PAGES;

  return (
    <ExamPageFaqManager
      states={statesResult.data ?? []}
      boards={(boardsResult.data ?? []).map((item) => ({ id: item.id, stateId: item.state_id, name: item.name }))}
      exams={(examsResult.data ?? []).map((item) => ({ id: item.id, boardId: item.exam_id, name: item.name, slug: item.slug, description: item.description, seoTitle: item.seo_title, seoDescription: item.seo_description }))}
      faqs={faqsResult.data ?? []}
      primaryPages={primaryPages}
    />
  );
}
