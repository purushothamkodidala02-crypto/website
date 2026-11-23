import Link from "next/link";
import { CopyExampleButton } from "@/components/admin/CopyExampleButton";
import { QUESTION_IMPORT_EXPORT_HEADERS, QUESTION_IMPORT_REQUIRED_HEADERS } from "@/lib/questions/import-format";

const TSV_HEADER_ROW = "import_key\tsubject\tquestion_en\toption_a_en\toption_b_en\toption_c_en\toption_d_en\tquestion_te\toption_a_te\toption_b_te\toption_c_te\toption_d_te\tcorrect_answer\texplanation_en\texplanation_te\tdifficulty";

const MASTER_AI_PROMPT = `You are an expert exam question creator for Varadhi Prep (competitive exam platform). Generate high-quality bilingual (English & Telugu) questions strictly in TSV (Tab-Separated Values) format.

Required TSV Header Row (Row 1):
import_key\tsubject\tquestion_en\toption_a_en\toption_b_en\toption_c_en\toption_d_en\tquestion_te\toption_a_te\toption_b_te\toption_c_te\toption_d_te\tcorrect_answer\texplanation_en\texplanation_te\tdifficulty

STRICT RULES:

1. Column Separator: Use real TAB (\\t) characters between columns. Never use commas as column separators.
2. Multiline Cells: Any cell with line breaks must be enclosed in double quotes ("...").
3. Question Formats:
- Standard MCQ: Direct single question text.
- Statement Questions:
  Line 1: Consider the following statements: (Telugu: కింది ప్రకటనలను పరిశీలించండి:)
  Lines 2+: 1. ..., 2. ..., 3. ...
  Last line: Which of the statements given above is/are correct? (Telugu: పై ప్రకటనలలో ఏవి సరైనవి?)
  (Options A-D: 1 only, 1 and 2 only, etc.)
- Assertion & Reason:
  Line 1: Assertion (A): ... (Telugu: నిశ్చితార్థం (A): ...)
  Line 2: Reason (R): ... (Telugu: కారణం (R): ...)
  Line 3: Select the correct answer using the code given below: (Telugu: కింద ఇచ్చిన కోడ్‌ను ఉపయోగించి సరైన సమాధానాన్ని ఎంచుకోండి:)
- Match the Following:
  Line 1: Match List I with List II: (Telugu: జాబితా I ను జాబితా II తో జతపరచండి:)
  Line 2: List I (Telugu: జాబితా I)
  Lines 3-6: A. ..., B. ..., C. ..., D. ...
  Line 7: List II (Telugu: జాబితా II)
  Lines 8-11: 1. ..., 2. ..., 3. ..., 4. ...
  Line 12: Choose the correct code: (Telugu: సరైన కోడ్‌ను ఎంచుకోండి:)
  (Options A-D: A-1, B-2, C-3, D-4)
- Reading Comprehension / Passage Sets:
  Question 1 (Anchor): Include the full passage!
  Line 1: Directions: Read the following passage and answer the questions (Questions 1 to 3):
  Middle: Full passage text.
  Last line: 1. [First question prompt ending with '?']
  Questions 2, 3, etc.: DO NOT repeat the passage!
  Line 1: Based on the passage above (Question 1): (Telugu: పై గద్యం ఆధారంగా (ప్రశ్న 1):)
  Line 2: 2. [Sub-question prompt ending with '?']
4. Correct Answer: Must be one letter: A, B, C, or D.
5. All 4 options in English and Telugu must be distinct.`;

const SAMPLE_TSV_DATA = `${TSV_HEADER_ROW}
varadhi-gs-mcq-001\tIndian Polity\tWho is known as the Father of the Indian Constitution?\tDr. B. R. Ambedkar\tDr. Rajendra Prasad\tJawaharlal Nehru\tSardar Vallabhbhai Patel\tభారత రాజ్యాంగ పితామహుడిగా ఎవరిని పేర్కొంటారు?\tడాక్టర్ బి. ఆర్. అంబేద్కర్\tడాక్టర్ రాజేంద్ర ప్రసాద్\tజవహర్‌లాల్ నెహ్రూ\tసర్దార్ వల్లభ్‌భాయ్ పటేల్\tA\tDr. B. R. Ambedkar served as the Chairman of the Drafting Committee and is acknowledged as the chief architect of the Constitution of India.\tడాక్టర్ బి. ఆర్. అంబేద్కర్ రాజ్యాంగ ముసాయిదా కమిటీ చైర్మన్‌గా వ్యవహరించారు మరియు భారత రాజ్యాంగ ప్రధాన శిల్పిగా గుర్తింపు పొందారు.\teasy
varadhi-gs-stmt-002\tIndian Polity\t"Consider the following statements:
1. The President of India is elected by an electoral college consisting of elected members of both Houses of Parliament and Legislative Assemblies.
2. Nominated members of Parliament can participate in the election of the President.
Which of the statements given above is/are correct?"\t1 only\t2 only\tBoth 1 and 2\tNeither 1 nor 2\t"కింది ప్రకటనలను పరిశీలించండి:
1. పార్లమెంటు మరియు రాష్ట్ర శాసనసభల ఎన్నికైన సభ్యులతో కూడిన ఎలక్టోరల్ కాలేజీ ద్వారా భారత రాష్ట్రపతి ఎన్నికవుతారు.
2. రాష్ట్రపతి ఎన్నికల్లో పార్లమెంటు నామినేటెడ్ సభ్యులు పాల్గొనవచ్చు.
పై ప్రకటనలలో ఏవి సరైనవి?"\t1 మాత్రమే\t2 మాత్రమే\t1 మరియు 2 రెండూ\tఏదీ కాదు\tA\tArticle 54 provides that only elected members of Parliament and State Legislative Assemblies can vote in the Presidential election. Nominated members cannot vote.\tఆర్టికల్ 54 ప్రకారం పార్లమెంటు మరియు రాష్ట్ర శాసనసభల ఎన్నికైన సభ్యులు మాత్రమే రాష్ట్రపతి ఎన్నికల్లో ఓటు వేయగలరు. నామినేటెడ్ సభ్యులకు ఓటు హక్కు ఉండదు.\tmedium
varadhi-gs-ar-003\tIndian Polity\t"Assertion (A): The Rajya Sabha is a permanent body and not subject to dissolution.
Reason (R): One-third of its members retire every second year.
Select the correct answer using the code given below:"\tBoth (A) and (R) are true and (R) is the correct explanation of (A)\tBoth (A) and (R) are true but (R) is not the correct explanation of (A)\t(A) is true but (R) is false\t(A) is false but (R) is true\t"నిశ్చితార్థం (A): రాజ్యసభ ఒక శాశ్వత సభ మరియు అది రద్దు కాదు.
కారణం (R): ప్రతి రెండేళ్లకు ఒకసారి రాజ్యసభలో మూడో వంతు సభ్యులు పదవీ విరమణ చేస్తారు.
కింద ఇచ్చిన కోడ్‌ను ఉపయోగించి సరైన సమాధానాన్ని ఎంచుకోండి:"\t(A) మరియు (R) రెండూ సరైనవి, మరియు (R) అనేది (A) కి సరైన వివరణ\t(A) మరియు (R) రెండూ సరైనవి, కానీ (R) అనేది (A) కి సరైన వివరణ కాదు\t(A) సరైనది కానీ (R) తప్పు\t(A) తప్పు కానీ (R) సరైనది\tA\tUnder Article 83(1) of the Indian Constitution, the Council of States is not subject to dissolution; one-third of members retire every second year.\tభారత రాజ్యాంగంలోని ఆర్టికల్ 83(1) ప్రకారం రాజ్యసభ శాశ్వత సభ మరియు రద్దు కాదు; ప్రతి రెండేళ్లకు మూడో వంతు సభ్యులు పదవీ విరమణ చేస్తారు.\tmedium
varadhi-gs-match-004\tIndian History\t"Match List I with List II:
List I
A. Slave Dynasty
B. Khilji Dynasty
C. Tughlaq Dynasty
D. Sayyid Dynasty
List II
1. Khizr Khan
2. Qutbuddin Aibak
3. Jalaluddin Khilji
4. Ghiyasuddin Tughlaq
Choose the correct code:"\tA-2, B-3, C-4, D-1\tA-3, B-2, C-1, D-4\tA-2, B-4, C-3, D-1\tA-4, B-3, C-2, D-1\t"జాబితా I ను జాబితా II తో జతపరచండి:
జాబితా I
A. బానిస వంశం
B. ఖిల్జీ వంశం
C. తుగ్లక్ వంశం
D. సయ్యద్ వంశం
జాబితా II
1. ఖిజర్ ఖాన్
2. కుతుబుద్దీన్ ఐబక్
3. జలాలుద్దీన్ ఖిల్జీ
4. ఘియాసుద్దీన్ తుగ్లక్
సరైన కోడ్‌ను ఎంచుకోండి:"\tA-2, B-3, C-4, D-1\tA-3, B-2, C-1, D-4\tA-2, B-4, C-3, D-1\tA-4, B-3, C-2, D-1\tA\tSlave Dynasty was founded by Qutbuddin Aibak (1206), Khilji Dynasty by Jalaluddin Khilji (1290), Tughlaq Dynasty by Ghiyasuddin Tughlaq (1320), and Sayyid Dynasty by Khizr Khan (1414).\tబానిస వంశ స్థాపకుడు కుతుబుద్దీన్ ఐబక్ (1206), ఖిల్జీ వంశ స్థాపకుడు జలాలుద్దీన్ ఖిల్జీ (1290), తుగ్లక్ వంశ స్థాపకుడు ఘియాసుద్దీన్ తుగ్లక్ (1320), మరియు సయ్యద్ వంశ స్థాపకుడు ఖిజర్ ఖాన్ (1414).\thard
varadhi-gs-rc-005\tGeneral Studies\t"Directions: Read the following passage and answer the questions (Questions 1 to 3):
The Kakatiya dynasty ruled the eastern Deccan region comprising present-day Telangana and Andhra Pradesh during the 12th and 14th centuries. Their capital was Orugallu (now Warangal). They were pioneer builders of an extensive irrigation network comprising thousands of chain tanks, including Ramappa Lake, Pakhal Lake, and Laknavaram Lake, which sustained rural agrarian prosperity. The dynasty produced remarkable rulers such as Ganapati Deva and Queen Rudrama Devi, who defended the kingdom against aggressive expansionist neighbors.
1. What was the capital city of the Kakatiya dynasty?"\tOrugallu (Warangal)\tGolconda\tRajahmundry\tDevarakonda\t"సూచనలు: కింది గద్యాన్ని చదివి ప్రశ్నలకు (ప్రశ్నలు 1 నుండి 3 వరకు) సమాధానాలు ఇవ్వండి:
కాకతీయ రాజవంశం 12 మరియు 14వ శతాబ్దాల మధ్య ప్రస్తుత తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌తో కూడిన తూర్పు దక్కన్ ప్రాంతాన్ని పాలించింది. వారి రాజధాని ఓరుగల్లు (ప్రస్తుత వరంగల్). వారు రామప్ప సరస్సు, పాఖాల సరస్సు, లక్నవరం సరస్సు వంటి గొలుసుకట్టు చెరువుల సమగ్ర నీటిపారుదల వ్యవస్థను నిర్మించి గ్రామీణ వ్యవసాయ అభివృద్ధికి బాటలు వేశారు. ఈ రాజవంశంలో గణపతి దేవుడు మరియు రాణి రుద్రమదేవి వంటి ప్రసిద్ధ పాలకులు రాజ్యం చేశారు.
1. కాకతీయ రాజవంశం యొక్క రాజధాని నగరం ఏది?"\tఓరుగల్లు (వరంగల్)\tగోల్కొండ\tరాజమండ్రి\tదేవరకొండ\tA\tThe Kakatiyas established their historic capital at Orugallu, which is modern-day Warangal.\tకాకతీయులు తమ చారిత్రాత్మక రాజధానిగా ఓరుగల్లు (నేటి వరంగల్) ను నిర్మించుకున్నారు.\teasy
varadhi-gs-rc-006\tGeneral Studies\t"Based on the passage above (Question 1):
2. Which agricultural innovation is highlighted as a hallmark of Kakatiya rule?"\tExtensive chain tank irrigation network\tDeep canal tube-wells\tDrip irrigation systems\tTerrace step cultivation\t"పై గద్యం ఆధారంగా (ప్రశ్న 1):
2. కాకతీయుల పరిపాలనలో ప్రత్యేకంగా నిలిచిన వ్యవసాయ ఆవిష్కరణ ఏది?"\tగొలుసుకట్టు చెరువుల నీటిపారుదల వ్యవస్థ\tలోతైన కాలువల గొట్టపు బావులు\tబిందు సేద్య పద్ధతులు\tమెట్ల పైరు సాగు పద్ధతి\tA\tAs highlighted in the passage, the Kakatiyas pioneered an extensive chain tank irrigation network including Ramappa, Pakhal, and Laknavaram lakes.\tగద్యంలో వివరించిన విధంగా, కాకతీయులు రామప్ప, పాఖాల, లక్నవరం సరస్సులతో సహా గొలుసుకట్టు చెరువుల సమగ్ర నీటిపారుదల వ్యవస్థను నిర్మించారు.\tmedium
varadhi-gs-rc-007\tGeneral Studies\t"Based on the passage above (Question 1):
3. Which of the following lakes is NOT mentioned in the passage as built by the Kakatiyas?"\tHussain Sagar\tRamappa Lake\tPakhal Lake\tLaknavaram Lake\t"పై గద్యం ఆధారంగా (ప్రశ్న 1):
3. పై గద్యంలో కాకతీయులు నిర్మించిన వాటిలో ప్రస్తావించబడని సరస్సు ఏది?"\tహుస్సేన్ సాగర్\tరామప్ప సరస్సు\tపాఖాల సరస్సు\tలక్నవరం సరస్సు\tA\tHussain Sagar is not mentioned in the passage; it was constructed in Hyderabad by Ibrahim Quli Qutb Shah in 1563.\tహుస్సేన్ సాగర్ గద్యంలో పేర్కొనబడలేదు; దీనిని 1563 లో కుతుబ్ షాహీ పాలకుడు ఇబ్రహీం కులీ కుతుబ్ షా నిర్మించారు.\tmedium`;

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

export default function ExcelImportGuidePage() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-7 text-slate-900 shadow-sm sm:p-9">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Question bank</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Excel & TSV Import Guide</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Generate bilingual questions using AI prompts in TSV format, or import directly through Excel (.xlsx, .xls) and CSV (.csv). Every row is strictly validated before saving.
            </p>
          </div>
          <Link
            href="/admin/questions#import-questions"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-slate-800"
          >
            Open Excel import →
          </Link>
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title="File type" detail="Excel (.xlsx, .xls) is recommended. CSV .csv also works." />
        <InfoCard title="TSV Workflow" detail="Generate with AI in TSV format → Copy and paste into Excel / Sheets → Save as .xlsx or .xls." />
        <InfoCard title="Import limit" detail="Up to 500 Questions and 2.5 MB per upload." />
      </section>

      {/* Step 1: Headings */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Step 1</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Keep these headings in row 1</h2>
          </div>
          <CopyExampleButton text={TSV_HEADER_ROW} label="Copy TSV Header Row" />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Headings are case-insensitive, but each heading must appear only once. For bilingual subjects, all 13 core columns are required. For English-only or Telugu-only subjects, you can omit the other language’s columns.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Standard TSV Header Row (Tab-Separated):</p>
          <code className="block min-w-[68rem] whitespace-nowrap text-sm font-mono font-semibold leading-7 text-slate-800">
            {TSV_HEADER_ROW}
          </code>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Supported columns:</span>
          {QUESTION_IMPORT_REQUIRED_HEADERS.map((h) => (
            <span key={h} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
              {h}
            </span>
          ))}
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700">+ explanation_en</span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700">+ explanation_te</span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700">+ difficulty</span>
        </div>
      </section>

      {/* Step 2: Master AI Question Creator Prompt */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">Step 2 • AI Generation</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">AI Question Creator Prompt (TSV Format)</h2>
          </div>
          <CopyExampleButton text={MASTER_AI_PROMPT} label="Copy AI Prompt" />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Copy and paste this prompt directly into <strong>ChatGPT, Claude, or Gemini</strong> along with your study material, syllabus topics, or textbook chapter. The AI will generate fully formatted, bilingual questions in tab-separated values (TSV) that paste cleanly into Excel or Google Sheets.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Master Prompt for ChatGPT / Claude / Gemini</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-teal-400">Strict TSV Rules Included</span>
          </div>
          <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">
            {MASTER_AI_PROMPT}
          </pre>
        </div>

        {/* Strict Rules Highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Rule 1</p>
            <h4 className="mt-1 font-bold text-slate-900">Real TAB (\t) Separator</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">Never use commas as separators. Real tabs ensure commas in question sentences never break columns.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Rule 2</p>
            <h4 className="mt-1 font-bold text-slate-900">Multiline Double Quotes</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">Any cell with line breaks or paragraphs must be enclosed in standard double quotes (<code className="rounded bg-slate-200 px-1 font-mono text-[11px]">&quot;...&quot;</code>).</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Rule 3</p>
            <h4 className="mt-1 font-bold text-slate-900">Single Letter Answer</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">The <code className="rounded bg-slate-200 px-1 font-mono text-[11px]">correct_answer</code> column must be exactly one uppercase letter: <strong>A, B, C, or D</strong>.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Rule 4</p>
            <h4 className="mt-1 font-bold text-slate-900">All 4 Options Distinct</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">Options A, B, C, and D must be distinct and non-empty in both English and Telugu columns.</p>
          </div>
        </div>
      </section>

      {/* Question Formats Reference */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Step 3</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Supported Question Formats</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Varadhi supports five standardized question formats. When generating questions with AI, each format follows strict line-by-line conventions for both English and Telugu.
        </p>

        <div className="mt-6 space-y-5">
          {/* 1. Standard MCQ */}
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">Format 1</span>
              <span className="text-xs font-semibold text-slate-500">Direct single question</span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Standard MCQ</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">Single question prompt text ending with a question mark. All 4 options are direct answers.</p>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">English prompt:</p>
                <p className="mt-1 text-slate-600">Who is known as the Father of the Indian Constitution?</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">Telugu prompt:</p>
                <p className="mt-1 text-slate-600">భారత రాజ్యాంగ పితామహుడిగా ఎవరిని పేర్కొంటారు?</p>
              </div>
            </div>
          </article>

          {/* 2. Statement Questions */}
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">Format 2</span>
              <span className="text-xs font-semibold text-slate-500">Numbered statements with verification line</span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Statement Questions</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Line 1 introduces the statements, followed by numbered statements, ending with the standard verification question line.
            </p>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">English Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`Consider the following statements:
1. The President is elected by an electoral college...
2. Nominated members of Parliament can participate...
Which of the statements given above is/are correct?`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options: <span className="font-normal text-slate-600">1 only | 2 only | Both 1 and 2 | Neither 1 nor 2</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">Telugu Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`కింది ప్రకటనలను పరిశీలించండి:
1. పార్లమెంటు మరియు రాష్ట్ర శాసనసభల ఎన్నికైన సభ్యులతో...
2. రాష్ట్రపతి ఎన్నికల్లో పార్లమెంటు నామినేటెడ్ సభ్యులు...
పై ప్రకటనలలో ఏవి సరైనవి?`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options: <span className="font-normal text-slate-600">1 మాత్రమే | 2 మాత్రమే | 1 మరియు 2 రెండూ | ఏదీ కాదు</span></p>
              </div>
            </div>
          </article>

          {/* 3. Assertion & Reason */}
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Format 3</span>
              <span className="text-xs font-semibold text-slate-500">Assertion (A) & Reason (R)</span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Assertion &amp; Reason</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Line 1 states Assertion (A), Line 2 states Reason (R), and Line 3 provides the selection instruction.
            </p>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">English Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`Assertion (A): The Rajya Sabha is a permanent body and not subject to dissolution.
Reason (R): One-third of its members retire every second year.
Select the correct answer using the code given below:`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options:</p>
                <p className="text-slate-600">A: Both (A) and (R) are true and (R) is the correct explanation of (A)</p>
                <p className="text-slate-600">B: Both (A) and (R) are true but (R) is not the correct explanation of (A)</p>
                <p className="text-slate-600">C: (A) is true but (R) is false</p>
                <p className="text-slate-600">D: (A) is false but (R) is true</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">Telugu Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`నిశ్చితార్థం (A): రాజ్యసభ ఒక శాశ్వత సభ మరియు అది రద్దు కాదు.
కారణం (R): ప్రతి రెండేళ్లకు ఒకసారి రాజ్యసభలో మూడో వంతు సభ్యులు పదవీ విరమణ చేస్తారు.
కింద ఇచ్చిన కోడ్‌ను ఉపయోగించి సరైన సమాధానాన్ని ఎంచుకోండి:`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options:</p>
                <p className="text-slate-600">A: (A) మరియు (R) రెండూ సరైనవి, మరియు (R) అనేది (A) కి సరైన వివరణ</p>
                <p className="text-slate-600">B: (A) మరియు (R) రెండూ సరైనవి, కానీ (R) అనేది (A) కి సరైన వివరణ కాదు</p>
                <p className="text-slate-600">C: (A) సరైనది కానీ (R) తప్పు</p>
                <p className="text-slate-600">D: (A) తప్పు కానీ (R) సరైనది</p>
              </div>
            </div>
          </article>

          {/* 4. Match the Following */}
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">Format 4</span>
              <span className="text-xs font-semibold text-slate-500">List I & List II paired matching</span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Match the Following</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Clear 12-line layout: Title line, List I with lettered items (A-D), List II with numbered items (1-4), followed by code selection line.
            </p>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">English Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`Match List I with List II:
List I
A. Slave Dynasty
B. Khilji Dynasty
C. Tughlaq Dynasty
D. Sayyid Dynasty
List II
1. Khizr Khan
2. Qutbuddin Aibak
3. Jalaluddin Khilji
4. Ghiyasuddin Tughlaq
Choose the correct code:`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options: <span className="font-normal text-slate-600">A: A-2, B-3, C-4, D-1 | B: A-3, B-2, C-1, D-4 ...</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-800">Telugu Structure:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-600">
{`జాబితా I ను జాబితా II తో జతపరచండి:
జాబితా I
A. బానిస వంశం
B. ఖిల్జీ వంశం
C. తుగ్లక్ వంశం
D. సయ్యద్ వంశం
జాబితా II
1. ఖిజర్ ఖాన్
2. కుతుబుద్దీన్ ఐబక్
3. జలాలుద్దీన్ ఖిల్జీ
4. ఘియాసుద్దీన్ తుగ్లక్
సరైన కోడ్‌ను ఎంచుకోండి:`}
                </pre>
                <p className="mt-2 font-semibold text-slate-700">Options: <span className="font-normal text-slate-600">A: A-2, B-3, C-4, D-1 | B: A-3, B-2, C-1, D-4 ...</span></p>
              </div>
            </div>
          </article>

          {/* 5. Reading Comprehension / Passage Sets */}
          <article className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">Format 5</span>
              <span className="text-xs font-semibold text-slate-500">Anchor passage &amp; Sub-questions</span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Reading Comprehension / Passage Sets</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              For question sets based on a single reading passage (e.g. Questions 1 to 3), the full passage is placed <strong>only in Question 1</strong>. Follow-up questions refer back to the anchor without repeating the passage text, saving space and preventing repetition.
            </p>
            <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-teal-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-teal-950">Question 1 (Anchor Question):</p>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">Includes Full Passage</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-slate-700">
{`Directions: Read the following passage and answer the questions (Questions 1 to 3):
[Insert Full Passage text here...]
1. What was the capital city of the Kakatiya dynasty?`}
                </pre>
                <p className="mt-3 text-[11px] font-semibold text-teal-700">Telugu:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-700">
{`సూచనలు: కింది గద్యాన్ని చదివి ప్రశ్నలకు (ప్రశ్నలు 1 నుండి 3 వరకు) సమాధానాలు ఇవ్వండి:
[పూర్తి గద్యం ఇక్కడ ఉంచండి...]
1. కాకతీయ రాజవంశం యొక్క రాజధాని నగరం ఏది?`}
                </pre>
              </div>

              <div className="rounded-xl border border-teal-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-teal-950">Questions 2, 3, etc. (Follow-up Questions):</p>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">DO NOT Repeat Passage</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-slate-700">
{`Based on the passage above (Question 1):
2. Which agricultural innovation is highlighted as a hallmark of Kakatiya rule?`}
                </pre>
                <p className="mt-3 text-[11px] font-semibold text-teal-700">Telugu:</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-slate-700">
{`పై గద్యం ఆధారంగా (ప్రశ్న 1):
2. కాకతీయుల పరిపాలనలో ప్రత్యేకంగా నిలిచిన వ్యవసాయ ఆవిష్కరణ ఏది?`}
                </pre>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Ready-to-Copy TSV Sample Dataset */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Step 4</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Ready-to-Copy TSV Sample Dataset</h2>
          </div>
          <CopyExampleButton text={SAMPLE_TSV_DATA} label="Copy Sample TSV (7 Questions)" />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This sample dataset contains 7 complete bilingual questions demonstrating all five formats (Standard MCQ, Statement Question, Assertion &amp; Reason, Match the Following, and a 3-question Reading Comprehension set). Click <strong>Copy</strong> above and paste directly into Excel or Google Sheets.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[110rem] text-left text-xs">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">import_key</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">subject</th>
                <th className="px-3 py-3 font-mono font-bold min-w-56">question_en</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_a_en</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_b_en</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_c_en</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_d_en</th>
                <th className="px-3 py-3 font-mono font-bold min-w-56">question_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_a_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_b_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_c_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">option_d_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">ans</th>
                <th className="px-3 py-3 font-mono font-bold min-w-44">explanation_en</th>
                <th className="px-3 py-3 font-mono font-bold min-w-44">explanation_te</th>
                <th className="px-3 py-3 font-mono font-bold whitespace-nowrap">diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              <tr className="align-top hover:bg-slate-50">
                <td className="px-3 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">varadhi-gs-mcq-001</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">Indian Polity</td>
                <td className="px-3 py-3">Who is known as the Father of the Indian Constitution?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">Dr. B. R. Ambedkar</td>
                <td className="px-3 py-3">Dr. Rajendra Prasad</td>
                <td className="px-3 py-3">Jawaharlal Nehru</td>
                <td className="px-3 py-3">Sardar Patel</td>
                <td className="px-3 py-3">భారత రాజ్యాంగ పితామహుడిగా ఎవరిని పేర్కొంటారు?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">డాక్టర్ బి. ఆర్. అంబేద్కర్</td>
                <td className="px-3 py-3">డాక్టర్ రాజేంద్ర ప్రసాద్</td>
                <td className="px-3 py-3">జవహర్‌లాల్ నెహ్రూ</td>
                <td className="px-3 py-3">సర్దార్ వల్లభ్‌భాయ్ పటేల్</td>
                <td className="px-3 py-3 font-bold text-emerald-800">A</td>
                <td className="px-3 py-3 text-slate-600">Dr. B. R. Ambedkar was Drafting Committee Chairman.</td>
                <td className="px-3 py-3 text-slate-600">అంబేద్కర్ రాజ్యాంగ ముసాయిదా కమిటీ చైర్మన్.</td>
                <td className="px-3 py-3 font-mono text-[11px]">easy</td>
              </tr>
              <tr className="align-top hover:bg-slate-50">
                <td className="px-3 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">varadhi-gs-stmt-002</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">Indian Polity</td>
                <td className="px-3 py-3 whitespace-pre-wrap">Consider the following statements:&#10;1. The President is elected by an electoral college...&#10;2. Nominated members can participate...&#10;Which of the statements given above is/are correct?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">1 only</td>
                <td className="px-3 py-3">2 only</td>
                <td className="px-3 py-3">Both 1 and 2</td>
                <td className="px-3 py-3">Neither 1 nor 2</td>
                <td className="px-3 py-3 whitespace-pre-wrap">కింది ప్రకటనలను పరిశీలించండి:&#10;1. పార్లమెంటు మరియు రాష్ట్ర శాసనసభల ఎన్నికైన సభ్యులతో...&#10;2. నామినేటెడ్ సభ్యులు పాల్గొనవచ్చు...&#10;పై ప్రకటనలలో ఏవి సరైనవి?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">1 మాత్రమే</td>
                <td className="px-3 py-3">2 మాత్రమే</td>
                <td className="px-3 py-3">1 మరియు 2 రెండూ</td>
                <td className="px-3 py-3">ఏదీ కాదు</td>
                <td className="px-3 py-3 font-bold text-emerald-800">A</td>
                <td className="px-3 py-3 text-slate-600">Article 54 provides elected members vote; nominated members do not.</td>
                <td className="px-3 py-3 text-slate-600">ఆర్టికల్ 54 ప్రకారం ఎన్నికైన సభ్యులు మాత్రమే ఓటు వేస్తారు.</td>
                <td className="px-3 py-3 font-mono text-[11px]">medium</td>
              </tr>
              <tr className="align-top hover:bg-slate-50">
                <td className="px-3 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">varadhi-gs-match-004</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">Indian History</td>
                <td className="px-3 py-3 whitespace-pre-wrap">Match List I with List II:&#10;List I (Dynasties)&#10;List II (Founders)&#10;Choose the correct code:</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">A-2, B-3, C-4, D-1</td>
                <td className="px-3 py-3">A-3, B-2, C-1, D-4</td>
                <td className="px-3 py-3">A-2, B-4, C-3, D-1</td>
                <td className="px-3 py-3">A-4, B-3, C-2, D-1</td>
                <td className="px-3 py-3 whitespace-pre-wrap">జాబితా I ను జాబితా II తో జతపరచండి:&#10;జాబితా I (వంశాలు)&#10;జాబితా II (స్థాపకులు)&#10;సరైన కోడ్‌ను ఎంచుకోండి:</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">A-2, B-3, C-4, D-1</td>
                <td className="px-3 py-3">A-3, B-2, C-1, D-4</td>
                <td className="px-3 py-3">A-2, B-4, C-3, D-1</td>
                <td className="px-3 py-3">A-4, B-3, C-2, D-1</td>
                <td className="px-3 py-3 font-bold text-emerald-800">A</td>
                <td className="px-3 py-3 text-slate-600">Slave: Aibak, Khilji: Jalaluddin, Tughlaq: Ghiyasuddin, Sayyid: Khizr Khan.</td>
                <td className="px-3 py-3 text-slate-600">బానిస: ఐబక్, ఖిల్జీ: జలాలుద్దీన్, తుగ్లక్: ఘియాసుద్దీన్, సయ్యద్: ఖిజర్ ఖాన్.</td>
                <td className="px-3 py-3 font-mono text-[11px]">hard</td>
              </tr>
              <tr className="align-top hover:bg-slate-50">
                <td className="px-3 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">varadhi-gs-rc-005</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">General Studies</td>
                <td className="px-3 py-3 whitespace-pre-wrap">Directions: Read the following passage...&#10;[Full passage included]&#10;1. What was the capital city of Kakatiyas?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">Orugallu (Warangal)</td>
                <td className="px-3 py-3">Golconda</td>
                <td className="px-3 py-3">Rajahmundry</td>
                <td className="px-3 py-3">Devarakonda</td>
                <td className="px-3 py-3 whitespace-pre-wrap">సూచనలు: కింది గద్యాన్ని చదివి...&#10;[పూర్తి గద్యం ఇక్కడ ఉంది]&#10;1. కాకతీయుల రాజధాని నగరం ఏది?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">ఓరుగల్లు (వరంగల్)</td>
                <td className="px-3 py-3">గోల్కొండ</td>
                <td className="px-3 py-3">రాజమండ్రి</td>
                <td className="px-3 py-3">దేవరకొండ</td>
                <td className="px-3 py-3 font-bold text-emerald-800">A</td>
                <td className="px-3 py-3 text-slate-600">Kakatiya capital was Orugallu.</td>
                <td className="px-3 py-3 text-slate-600">కాకతీయుల రాజధాని ఓరుగల్లు.</td>
                <td className="px-3 py-3 font-mono text-[11px]">easy</td>
              </tr>
              <tr className="align-top hover:bg-slate-50">
                <td className="px-3 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">varadhi-gs-rc-006</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">General Studies</td>
                <td className="px-3 py-3 whitespace-pre-wrap">Based on the passage above (Question 1):&#10;2. Which agricultural innovation is highlighted?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">Extensive chain tank network</td>
                <td className="px-3 py-3">Deep canal tube-wells</td>
                <td className="px-3 py-3">Drip irrigation systems</td>
                <td className="px-3 py-3">Terrace cultivation</td>
                <td className="px-3 py-3 whitespace-pre-wrap">పై గద్యం ఆధారంగా (ప్రశ్న 1):&#10;2. ఏ వ్యవసాయ ఆవిష్కరణ ప్రత్యేకంగా నిలిచింది?</td>
                <td className="px-3 py-3 font-semibold text-emerald-700">గొలుసుకట్టు చెరువుల వ్యవస్థ</td>
                <td className="px-3 py-3">లోతైన కాలువల గొట్టపు బావులు</td>
                <td className="px-3 py-3">బిందు సేద్య పద్ధతులు</td>
                <td className="px-3 py-3">మెట్ల పైరు సాగు పద్ధతి</td>
                <td className="px-3 py-3 font-bold text-emerald-800">A</td>
                <td className="px-3 py-3 text-slate-600">Built chain tanks like Ramappa and Pakhal.</td>
                <td className="px-3 py-3 text-slate-600">రామప్ప, పాఖాల వంటి గొలుసుకట్టు చెరువులు.</td>
                <td className="px-3 py-3 font-mono text-[11px]">medium</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Optional columns */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Optional columns</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Add more details when needed</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-black">Column</th>
                <th className="px-4 py-3 font-black">Accepted value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {optionalColumns.map(([column, detail]) => (
                <tr key={column}>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-slate-900">{column}</td>
                  <td className="px-4 py-4 leading-6 text-slate-600">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">All columns the system can read: {QUESTION_IMPORT_EXPORT_HEADERS.join(", ")}.</p>
      </section>

      {/* Accepted / Display note */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Accepted</p>
          <h2 className="mt-2 text-xl font-black text-emerald-950">Standard four-option MCQ</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-emerald-900">
            <li>All four options must be filled and different.</li>
            <li>Use a stable unique <code className="rounded bg-white px-1">import_key</code> per Subject. Re-uploading updates that Question.</li>
            <li>Use an Excel row image or an <code className="rounded bg-white px-1">image_url</code>, never both.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Workflow tip</p>
          <h2 className="mt-2 text-xl font-black text-amber-950">Seamless AI to Excel pasting</h2>
          <p className="mt-4 text-sm leading-6 text-amber-900">
            When ChatGPT or Claude generates questions using the TSV prompt, simply copy the code block and paste (<code className="rounded bg-white px-1 font-mono text-xs">Ctrl + V</code>) directly into Microsoft Excel or Google Sheets. The tab characters automatically populate every column cleanly without comma conflicts. Save as <code className="rounded bg-white px-1 font-mono text-xs">.xlsx</code> or <code className="rounded bg-white px-1 font-mono text-xs">.xls</code> and upload!
          </p>
        </div>
      </section>

      {/* Before you upload */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black text-slate-950">Before you upload</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
          <li><strong>1.</strong> Select Recruiting Board, Exam, and Paper.</li>
          <li><strong>2.</strong> Confirm the Subject names already exist in that Paper.</li>
          <li><strong>3.</strong> Keep the headings in row 1 and save as .xlsx or .xls.</li>
          <li><strong>4.</strong> Import into Question Bank, or open a draft Mock Test to import and assign Questions directly.</li>
        </ol>
      </section>
    </div>
  );
}

function InfoCard({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-500">{title}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{detail}</p>
    </article>
  );
}
