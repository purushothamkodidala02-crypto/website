import Link from "next/link";
import { CopyExampleButton } from "@/components/admin/CopyExampleButton";
import { QUESTION_IMPORT_EXPORT_HEADERS, QUESTION_IMPORT_REQUIRED_HEADERS } from "@/lib/questions/import-format";

const optionalColumns = [
  ["explanation_en / explanation_te", "Optional answer explanation in the matching language."],
  ["image_url", "Optional public HTTPS PNG, JPG, or WebP image link. In Excel, you may instead paste one PNG or JPG image into that Question row."],
  ["source_reference", "Optional source name, such as TSPSC Group 2, 2024."],
  ["source_exam_date", "Optional source exam date in YYYY-MM-DD format."],
  ["difficulty", "Optional: easy, medium, or hard. Blank uses medium."],
  ["is_active", "Optional: true, false, yes, no, 1, or 0. Blank means active."],
  ["content_lifecycle", "Optional: permanent, review, or expires. Blank uses permanent."],
  ["review_on / expires_on", "Required only when lifecycle is review or expires. Use YYYY-MM-DD."],
  ["question_order / marks / negative_marks", "Use only when importing into a draft Mock Test to set its question order and marking."],
] as const;

const bilingualExample = [
  "tg-eo-gs-001",
  "General Studies & General Abilities",
  "Who founded the Slave Dynasty?",
  "Qutbuddin Aibak",
  "Iltutmish",
  "Balban",
  "Razia Sultan",
  "బానిస వంశాన్ని ఎవరు స్థాపించారు?",
  "కుతుబుద్దీన్ ఐబక్",
  "ఇల్తుత్మిష్",
  "బల్బన్",
  "రజియా సుల్తానా",
  "A",
];

const matchExample = [
  "tg-eo-match-001", "General Studies & General Abilities",
  "Match the following:\n1. Slave Dynasty; 2. Khilji Dynasty; 3. Tughlaq Dynasty; A. Jalaluddin Firuz Khilji; B. Ghiyasuddin Tughlaq; C. Qutbuddin Aibak",
  "1–C, 2–A, 3–B", "1–A, 2–B, 3–C", "1–B, 2–C, 3–A", "1–C, 2–B, 3–A",
  "జతపరచండి:\n1. బానిస వంశం; 2. ఖిల్జీ వంశం; 3. తుగ్లక్ వంశం; ఎ. జలాలుద్దీన్ ఫిరోజ్ ఖిల్జీ; బి. ఘియాసుద్దీన్ తుగ్లక్; సి. కుతుబుద్దీన్ ఐబక్",
  "1–సి, 2–ఎ, 3–బ", "1–ఎ, 2–బి, 3–సి", "1–బి, 2–సి, 3–ఎ", "1–సి, 2–బి, 3–ఎ", "A",
];

const statementReasonExample = [
  "tg-eo-ar-001", "General Studies & General Abilities",
  "Statement: India has a parliamentary form of government.\nReason: The Council of Ministers is collectively responsible to the Lok Sabha.",
  "Both are true, and Reason correctly explains Statement.", "Both are true, but Reason does not explain Statement.", "Statement is true, but Reason is false.", "Statement is false, but Reason is true.",
  "ప్రకటన: భారతదేశంలో పార్లమెంటరీ ప్రభుత్వ విధానం ఉంది.\nకారణం: మంత్రిమండలి లోక్‌సభకు సమష్టిగా బాధ్యత వహిస్తుంది.",
  "రెండూ నిజం, మరియు కారణం ప్రకటనను సరిగ్గా వివరిస్తుంది.", "రెండూ నిజం, కానీ కారణం ప్రకటనను వివరించదు.", "ప్రకటన నిజం, కానీ కారణం తప్పు.", "ప్రకటన తప్పు, కానీ కారణం నిజం.", "A",
];

const copyRequiredFields = (row: string[]) => QUESTION_IMPORT_REQUIRED_HEADERS.map((heading, index) => `${heading}: ${row[index]}`).join("\n");

export default function ExcelImportGuidePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/15 sm:p-9">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-200">Question bank</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Excel import guide</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">Use this exact format when adding Questions through Excel or CSV. Every row is checked before anything is saved.</p>
          </div>
          <Link href="/admin/questions#import-questions" className="rounded-xl bg-teal-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-teal-200">Open Excel import →</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title="File type" detail="Excel .xlsx is recommended. CSV .csv also works." />
        <InfoCard title="Sheet name" detail="Use Varadhi Import, or the first worksheet in the file." />
        <InfoCard title="Import limit" detail="Up to 500 Questions and 2.5 MB per upload." />
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Step 1</p>
        <h2 className="mt-2 text-2xl font-black">Keep these headings in row 1</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Headings are case-insensitive, but each heading must appear only once. Do not remove a required heading, even if a language subject uses only one language.</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <code className="block min-w-[68rem] whitespace-nowrap text-sm font-semibold leading-7 text-slate-800">{QUESTION_IMPORT_REQUIRED_HEADERS.join(", ")}</code>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Step 2</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Ready-to-copy bilingual examples</h2><CopyExampleButton text={copyRequiredFields(bilingualExample)} label="Copy standard MCQ required fields" /></div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use one row per Question. The Subject name must already exist in the selected Paper. Correct answer must be A, B, C, or D.</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[104rem] text-left text-xs">
            <thead className="bg-slate-950 text-white"><tr>{QUESTION_IMPORT_REQUIRED_HEADERS.map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 font-black">{heading}</th>)}</tr></thead>
            <tbody><tr className="align-top bg-white text-slate-700">{bilingualExample.map((value, index) => <td key={`${value}-${index}`} className="max-w-52 border-t border-slate-200 px-3 py-3 leading-5">{value}</td>)}</tr></tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">For a bilingual subject, fill all English and Telugu fields. For an English-only or Telugu-only subject, fill only that subject’s language columns; keep the other required-language columns blank.</p>
        <div className="mt-8 border-t border-slate-200 pt-7">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">More required-field examples</p>
        <h2 className="mt-2 text-2xl font-black">Match the Following and Statement–Reason</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Use the same Excel columns as a standard MCQ. Put the matching lists or the statement and reason in the Question field, then put four answer combinations in options A–D. The student sees four answer choices, not a drag-and-match grid.</p>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <article className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Match the Following</p><CopyExampleButton text={copyRequiredFields(matchExample)} label="Copy Match the Following required fields" /></div>
            <h3 className="mt-2 font-black text-teal-950">Delhi Sultanate dynasties and founders</h3>
            <p className="mt-2 text-xs leading-5 text-teal-800">The copy button includes every required field: import key, subject, English Question and options, Telugu Question and options, and correct answer.</p>
            <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4 text-sm leading-6 text-teal-950">
              <p className="font-black">Copy this into the <code className="rounded bg-teal-50 px-1">question_en</code> cell</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{`Match the following:
1. Slave Dynasty; 2. Khilji Dynasty; 3. Tughlaq Dynasty; A. Jalaluddin Firuz Khilji; B. Ghiyasuddin Tughlaq; C. Qutbuddin Aibak`}</pre>
              <p className="mt-3 font-black">Copy this into the <code className="rounded bg-teal-50 px-1">question_te</code> cell</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{`జతపరచండి:
1. బానిస వంశం; 2. ఖిల్జీ వంశం; 3. తుగ్లక్ వంశం; ఎ. జలాలుద్దీన్ ఫిరోజ్ ఖిల్జీ; బి. ఘియాసుద్దీన్ తుగ్లక్; సి. కుతుబుద్దీన్ ఐబక్`}</pre>
              <p className="mt-3 text-xs text-teal-800">Start exactly with <strong>Match the following:</strong> in English and <strong>జతపరచండి:</strong> in Telugu. Semicolons separate every item; do not use commas. You may use <strong>Alt + Enter</strong> instead of a semicolon if you prefer separate Excel lines.</p>
            </div>
            <div className="mt-4 grid gap-4 text-sm leading-6 text-teal-950 sm:grid-cols-2">
              <div><p className="font-bold">English</p><p className="mt-1">Match the Delhi Sultanate dynasties with their founders.</p><p className="mt-2">1. Slave Dynasty<br />2. Khilji Dynasty<br />3. Tughlaq Dynasty</p><p className="mt-2">A. Jalaluddin Firuz Khilji<br />B. Ghiyasuddin Tughlaq<br />C. Qutbuddin Aibak</p></div>
              <div><p className="font-bold">Telugu</p><p className="mt-1">ఢిల్లీ సుల్తానేట్ వంశాలను వాటి స్థాపకులతో జతపరచండి.</p><p className="mt-2">1. బానిస వంశం<br />2. ఖిల్జీ వంశం<br />3. తుగ్లక్ వంశం</p><p className="mt-2">ఎ. జలాలుద్దీన్ ఫిరోజ్ ఖిల్జీ<br />బి. ఘియాసుద్దీన్ తుగ్లక్<br />సి. కుతుబుద్దీన్ ఐబక్</p></div>
            </div>
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-teal-900"><p className="font-bold">Put these in the Excel option columns:</p><p className="mt-1">A: 1–C, 2–A, 3–B &nbsp; <strong>(correct_answer: A)</strong><br />B: 1–A, 2–B, 3–C<br />C: 1–B, 2–C, 3–A<br />D: 1–C, 2–B, 3–A</p></div>
          </article>
          <article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-700">Statement–Reason</p><CopyExampleButton text={copyRequiredFields(statementReasonExample)} label="Copy Statement Reason required fields" /></div>
            <h3 className="mt-2 font-black text-indigo-950">Parliamentary government in India</h3>
            <p className="mt-2 text-xs leading-5 text-indigo-800">The copy button includes every required field: import key, subject, English Question and options, Telugu Question and options, and correct answer.</p>
            <div className="mt-4 grid gap-4 text-sm leading-6 text-indigo-950 sm:grid-cols-2">
              <div><p className="font-bold">English</p><p className="mt-1"><strong>Statement:</strong> India has a parliamentary form of government.</p><p className="mt-2"><strong>Reason:</strong> The Council of Ministers is collectively responsible to the Lok Sabha.</p></div>
              <div><p className="font-bold">Telugu</p><p className="mt-1"><strong>ప్రకటన:</strong> భారతదేశంలో పార్లమెంటరీ ప్రభుత్వ విధానం ఉంది.</p><p className="mt-2"><strong>కారణం:</strong> మంత్రిమండలి లోక్‌సభకు సమష్టిగా బాధ్యత వహిస్తుంది.</p></div>
            </div>
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-indigo-900"><p className="font-bold">Put these in the Excel option columns:</p><p className="mt-1">A: Both are true, and Reason correctly explains Statement. <strong>(correct_answer: A)</strong><br />B: Both are true, but Reason does not explain Statement.<br />C: Statement is true, but Reason is false.<br />D: Statement is false, but Reason is true.</p></div>
          </article>
        </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Optional columns</p>
        <h2 className="mt-2 text-2xl font-black">Add more details when needed</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="px-4 py-3 font-black">Column</th><th className="px-4 py-3 font-black">Accepted value</th></tr></thead><tbody className="divide-y divide-slate-200">{optionalColumns.map(([column, detail]) => <tr key={column}><td className="px-4 py-4 font-mono text-xs font-bold text-teal-800">{column}</td><td className="px-4 py-4 leading-6 text-slate-600">{detail}</td></tr>)}</tbody></table>
        </div>
        <p className="mt-4 text-xs text-slate-500">All columns the system can read: {QUESTION_IMPORT_EXPORT_HEADERS.join(", ")}.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Accepted</p><h2 className="mt-2 text-xl font-black text-emerald-950">Standard four-option MCQ</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-emerald-900"><li>All four options must be filled and different.</li><li>Use a stable unique <code className="rounded bg-white px-1">import_key</code> per Subject. Re-uploading it updates that Question.</li><li>Use an Excel row image or an <code className="rounded bg-white px-1">image_url</code>, never both.</li></ul></div>
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Display note</p><h2 className="mt-2 text-xl font-black text-amber-950">All imported Questions use MCQ options</h2><p className="mt-4 text-sm leading-6 text-amber-900">Excel can import Match the Following and Statement–Reason in the four-option format shown above. Use Question Bank only when you need a different custom or interactive display.</p></div>
      </section>

      <section className="rounded-3xl border border-teal-100 bg-teal-50 p-6 sm:p-8"><h2 className="text-xl font-black text-teal-950">Before you upload</h2><ol className="mt-4 grid gap-3 text-sm leading-6 text-teal-950 sm:grid-cols-2"><li><strong>1.</strong> Select Recruiting Board, Exam, and Paper.</li><li><strong>2.</strong> Confirm the Subject names already exist in that Paper.</li><li><strong>3.</strong> Keep the headings in row 1 and save as .xlsx.</li><li><strong>4.</strong> Import into Question Bank, or open a draft Mock Test to import and assign Questions directly.</li></ol></section>
    </div>
  );
}

function InfoCard({ title, detail }: { title: string; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.13em] text-teal-700">{title}</p><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{detail}</p></article>;
}
