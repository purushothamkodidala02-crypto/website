type FormattedQuestionTextProps = {
  text: string;
  className?: string;
};

const labelledSection =
  /^(Assertion(?:\s*\([A]\))?|(?:వాదన|ప్రకటన|ప్రతిపాదన)(?:\s*\([A]\))?|Reason(?:\s*\([R]\))?|కారణం(?:\s*\([R]\))?|(?:Statement|Conclusion|List)\s+(?:I{1,4}|V|\d+)|(?:ప్రకటన|వాక్యం|తీర్మానం|జాబితా)\s+(?:I{1,4}|V|\d+|[౦-౯]+))\s*:\s*(.*)$/i;

const instructionStart =
  /^(?:(?:Choose|Select|Which|How\s+many\s+of|Pick)\b|(?:సరైన|సరికాని|కింది|క్రింది).*(?:ఎంచుకోండి|గుర్తించండి))/i;

const numberedSection =
  /^((?:(?:\d{1,2}|[౦-౯]{1,2})|I{1,3}|IV|V|[a-h])[.)])\s+(.*)$/i;

const sectionHeading =
  /^(?:Statements?|Conclusions?|Directions?|Codes?|Passage|Comprehension|Questions?|ప్రకటనలు?|తీర్మానాలు?|సూచనలు?|గద్యం|ప్రశ్న)\s*:?$/i;

const dataRow = /^(.{1,40}?)\s+—\s+([\d౦-౯].*)$/;

export function containsTeluguText(text: string) {
  return /[\u0c00-\u0c7f]/.test(text);
}

function questionLines(text: string) {
  const lines = text
    .replace(/\u00a0/g, " ")
    .replace(/\*\*/g, "")
    .replace(/;\s*(?=(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)[.)]\s)/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(
      /((?:Statements?|ప్రకటనలు?)\s*:)[ \t]*(.*?)(?=[ \t]+(?:Conclusions?|తీర్మానాలు?)\s*:|$)/gim,
      (_match, heading: string, body: string) =>
        `${heading}\n${body.trim().replace(/\.\s+/g, ".\n")}`,
    )
    .replace(
      /[ \t]+(?=(?:Statements?|Conclusions?|Directions?|Codes?|Passage|Comprehension|Questions?|ప్రకటనలు?|తీర్మానాలు?|సూచనలు?|గద్యం|ప్రశ్న)\s*:)/gi,
      "\n",
    )
    .replace(
      /((?:Statements?|Conclusions?|Directions?|Codes?|Passage|Comprehension|Questions?|ప్రకటనలు?|తీర్మానాలు?|సూచనలు?|గద్యం|ప్రశ్న)\s*:)[ \t]*/gi,
      "$1\n",
    )
    .replace(
      /[ \t]+(?=(?:Assertion(?:\s*\([A]\))?|(?:వాదన|ప్రకటన|ప్రతిపాదన)(?:\s*\([A]\))?|Reason(?:\s*\([R]\))?|కారణం(?:\s*\([R]\))?|(?:Statement|Conclusion|List)\s+(?:I{1,4}|V|\d+)|(?:ప్రకటన|వాక్యం|తీర్మానం|జాబితా)\s+(?:I{1,4}|V|\d+|[౦-౯]+))\s*:)/gi,
      "\n",
    )
    .replace(
      /;[ \t]*(?=(?:Assertion(?:\s*\([A]\))?|Reason(?:\s*\([R]\))?)\s*:)/gi,
      "\n",
    )
    .replace(
      /[ \t.]+(?=(?:Choose|Select|Pick)\s+(?:the|a)?\s*(?:correct|incorrect|most appropriate|suitable)?\s*(?:code|answer|option|pair|match)\b)/gi,
      "\n",
    )
    .replace(
      /[ \t]+(?=(?:Which\s+(?:one\s+)?of\s+(?:the\s+)?(?:above|following)|How\s+many\s+of\s+(?:the\s+)?(?:above|following))\b)/gi,
      "\n",
    )
    .replace(
      /[ \t]+(?=(?:(?:సరైన|సరికాని)\s+(?:సమాధానాన్ని|జవాబును|జతను)|(?:కింది|క్రింది)\s+వాటిలో).*(?:ఎంచుకోండి|గుర్తించండి))/g,
      "\n",
    )
    .replace(/[ \t]+(?=(?:I{1,3}|IV|V)\.\s)/gi, "\n")
    .replace(
      /[ \t]+(?=Which\s+(?:conclusion|statement)s?\b)/gi,
      "\n",
    )
    .replace(
      /:\s+(?=(?:(?:District|జిల్లా)\s+[A-Z]|[A-Z])\s*[—–-]\s*[\d౦-౯])/g,
      ":\n",
    )
    .replace(
      /;\s*(?=(?:(?:District|జిల్లా)\s+[A-Z]|[A-Z])\s*[—–-]\s*[\d౦-౯])/g,
      "\n",
    )
    .replace(/[ \t]+(?=Which\s+[A-Za-z])/g, "\n")
    .replace(
      /([.?:])\s+(?=(?:\d{1,2}|[౦-౯]{1,2}|[a-hA-H]|I{1,4}|V|ఎ|బి|సి|డి)[.)]\s)/gi,
      "$1\n",
    )
    .replace(
      /([:;]|[^\s:])\s+([A-Za-z\u0c00-\u0c7f\s-]{2,25}:)\s*(?=(?:[a-hA-H]|\d{1,2}|I{1,4}|V|ఎ|బి|సి|డి)[.)]\s)/gi,
      "$1\n$2\n",
    )
    .replace(/[,;]\s*(?=(?:\d{1,2}|[౦-౯]{1,2}|[a-hA-H]|I{1,4}|V|ఎ|బి|సి|డి)[.)]\s)/gi, "\n")
    .replace(/([^\s—–-])\s*[—–-]\s*(?=(?:[A-Ha-h]|I{1,4}|V|\d{1,2}|ఎ|బి|సి|డి)\.\s)/g, "$1 — ")
    .replace(/([^\s—–-])\s*[—–-]\s*(?=[\d౦-౯])/g, "$1 — ")
    .split(/\n+/)
    .map((line) => line.trim().replace(/;\s*$/, ""))
    .filter(Boolean);

  return lines.reduce<string[]>((merged, line) => {
    if (/^(?:\d{1,2}|[౦-౯]{1,2}|[a-h]|I{1,4}|V)[.)]$/i.test(line)) {
      merged.push(line);
      return merged;
    }
    const previous = merged.at(-1);
    if (previous && /^(?:\d{1,2}|[౦-౯]{1,2}|[a-h]|I{1,4}|V)[.)]$/i.test(previous)) {
      merged[merged.length - 1] = `${previous} ${line}`;
    } else {
      merged.push(line);
    }
    return merged;
  }, []);
}

function normalizedSectionLabel(label: string) {
  if (/^Assertion$/i.test(label)) return "Assertion (A)";
  if (/^Reason$/i.test(label)) return "Reason (R)";
  if (/^(?:వాదన|ప్రకటన|ప్రతిపాదన)$/i.test(label)) return `${label} (A)`;
  if (/^కారణం$/i.test(label)) return `${label} (R)`;
  return label;
}

const matchQuestion = /^(?:Match\b|.*\bmatch\b|జాబితా|జతపరచండి|.*జతపరచండి|.*\b(pairs|జతలు)\b)/i;
const numericListItem = /^(?:[1-9]|[౧-౯])[.)]\s+/;
const alphabeticListItem = /^[a-h][.)]\s+/i;
const teluguAlphabeticListItem = /^(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)[.)]\s+/;
const romanListItem = /^(?:I|II|III|IV|V)[.)]\s+/i;

function matchingListLayout(lines: string[]) {
  const isTelugu = lines.some(containsTeluguText);

  // Approach 1: Paired Rows on each line (e.g. 1. Item — A. Item)
  const pairRowRegex =
    /^((?:(?:\d{1,2}|[౦-౯]{1,2})|I{1,4}|V|[a-hA-H]|ఎ|బి|సి|డి)[.)]\s+.*?)\s*[—–-]\s*((?:(?:\d{1,2}|[౦-౯]{1,2})|I{1,4}|V|[a-hA-H]|ఎ|బి|సి|డి)[.)]\s+.*)$/;

  const pairedIndices: number[] = [];
  const leftPairs: string[] = [];
  const rightPairs: string[] = [];

  lines.forEach((line, idx) => {
    const match = line.match(pairRowRegex);
    if (match) {
      pairedIndices.push(idx);
      leftPairs.push(match[1].trim());
      rightPairs.push(match[2].trim().replace(/[.;]+$/, ""));
    }
  });

  if (pairedIndices.length >= 2) {
    const firstPairIdx = pairedIndices[0];
    const lastPairIdx = pairedIndices[pairedIndices.length - 1];
    const heading = lines.slice(0, firstPairIdx);
    const instruction = lines.slice(lastPairIdx + 1);

    let leftTitle = isTelugu ? "జాబితా I" : "List I";
    let rightTitle = isTelugu ? "జాబితా II" : "List II";

    const headingText = heading.join(" ");
    const titleMatch = headingText.match(
      /Match\s+(?:the\s+)?(.*?)\s+(?:with|to)\s+(?:the\s+)?(.*?)(?::|$)/i,
    );
    if (titleMatch && titleMatch[1] && titleMatch[2]) {
      const l = titleMatch[1].trim();
      const r = titleMatch[2].trim();
      if (l.length < 25 && r.length < 25) {
        leftTitle = l.charAt(0).toUpperCase() + l.slice(1);
        rightTitle = r.charAt(0).toUpperCase() + r.slice(1);
      }
    }

    return {
      heading: heading.length ? heading : ["Match the following:"],
      leftTitle,
      rightTitle,
      leftItems: leftPairs,
      rightItems: rightPairs,
      instruction,
    };
  }

  // Approach 2: Separate lists (with or without column headers like "Traveler:" and "Country:")
  const schemes = [
    { left: numericListItem, right: alphabeticListItem },
    { left: numericListItem, right: teluguAlphabeticListItem },
    { left: alphabeticListItem, right: romanListItem },
    { left: alphabeticListItem, right: numericListItem },
    { left: romanListItem, right: alphabeticListItem },
    { left: romanListItem, right: numericListItem },
    { left: teluguAlphabeticListItem, right: numericListItem },
    { left: teluguAlphabeticListItem, right: romanListItem },
  ];

  for (const scheme of schemes) {
    const leftStart = lines.findIndex((line) => scheme.left.test(line));
    const rightStart = lines.findIndex(
      (line, index) => index > leftStart && scheme.right.test(line),
    );

    if (leftStart > 0 && rightStart > leftStart) {
      let leftTitle = isTelugu ? "జాబితా I" : "List I";
      let rightTitle = isTelugu ? "జాబితా II" : "List II";
      let headingEnd = leftStart;

      if (
        leftStart > 0 &&
        /^[A-Za-z\u0c00-\u0c7f\s-]{2,25}:$/i.test(lines[leftStart - 1])
      ) {
        leftTitle = lines[leftStart - 1].replace(/:$/, "").trim();
        headingEnd = leftStart - 1;
      }

      if (
        rightStart > 0 &&
        /^[A-Za-z\u0c00-\u0c7f\s-]{2,25}:$/i.test(lines[rightStart - 1])
      ) {
        rightTitle = lines[rightStart - 1].replace(/:$/, "").trim();
      }

      const heading = lines.slice(0, headingEnd);
      const leftItems = lines
        .slice(leftStart, rightStart)
        .filter((line) => scheme.left.test(line));

      const rightEnd = lines.findIndex(
        (line, index) => index > rightStart && !scheme.right.test(line),
      );
      const rightItems = lines
        .slice(rightStart, rightEnd === -1 ? undefined : rightEnd)
        .filter((line) => scheme.right.test(line));

      const instruction = rightEnd === -1 ? [] : lines.slice(rightEnd);

      return {
        heading,
        leftTitle,
        rightTitle,
        leftItems,
        rightItems,
        instruction,
      };
    }
  }

  return null;
}

const passageHeaderRegex =
  /^(?:(?:Read\s+(?:the\s+)?(?:following\s+)?passage|Passage|Comprehension|Directions?\s*:\s*(?:Read|Study)|కింది\s+గద్యాన్ని\s+చదివి|గద్యం|కింది\s+పేరాను\s+చదివి).*)/i;

const questionPromptStart =
  /^(?:(?:Which\s+of\s+the\s+following|What\s+is|Why\s+did|How\s+does|According\s+to\s+the\s+passage|The\s+author|In\s+the\s+passage|Based\s+on\s+the\s+passage|Identify|Select\s+the|Choose\s+the|Question|ప్రశ్న|ఈ\s+గద్యం\s+ప్రకారం|కింది\s+వాటిలో|పై\s+గద్యం\s+ఆధారంగా).*|[^\n?]+\?)$/i;

function passageListLayout(lines: string[]) {
  if (lines.length < 2) return null;
  const firstLine = lines[0] ?? "";
  if (!passageHeaderRegex.test(firstLine)) return null;

  let promptIndex = -1;
  for (let i = lines.length - 1; i >= 1; i--) {
    if (questionPromptStart.test(lines[i])) {
      promptIndex = i;
    } else {
      break;
    }
  }

  if (promptIndex > 1) {
    const heading = [lines[0]];
    const passage = lines.slice(1, promptIndex);
    const questionPrompt = lines.slice(promptIndex);
    return { heading, passage, questionPrompt };
  } else if (lines.length >= 2) {
    const heading = [lines[0]];
    const passage = lines.slice(1, lines.length - 1);
    const questionPrompt = [lines[lines.length - 1]];
    if (passage.length > 0) {
      return { heading, passage, questionPrompt };
    }
  }
  return null;
}

export function FormattedQuestionText({
  text,
  className = "",
}: FormattedQuestionTextProps) {
  const lines = questionLines(text);
  const isTelugu = containsTeluguText(text);
  const matchingLayout =
    matchQuestion.test(lines[0] ?? "") ||
    lines.some((l) => /^[A-Za-z\u0c00-\u0c7f\s-]{2,25}:$/i.test(l))
      ? matchingListLayout(lines)
      : null;
  const passageLayout = !matchingLayout ? passageListLayout(lines) : null;

  if (matchingLayout) {
    const { heading, leftTitle, rightTitle, leftItems, rightItems, instruction } =
      matchingLayout;

    return (
      <div lang={isTelugu ? "te" : undefined} className={`font-medium break-words ${isTelugu ? "font-telugu" : ""} ${className}`}>
        <div className="space-y-1.5">
          {heading.map((line, index) => <p key={`${index}-${line}`} className="font-semibold text-slate-950">{line}</p>)}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{leftTitle}</p>
            <div className="space-y-2">{leftItems.map((line) => <p key={line}>{line}</p>)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{rightTitle}</p>
            <div className="space-y-2">{rightItems.map((line) => <p key={line}>{line}</p>)}</div>
          </div>
        </div>
        {instruction.length > 0 && <div className="mt-3 space-y-1.5 text-slate-700">{instruction.map((line) => <p key={line}>{line}</p>)}</div>}
      </div>
    );
  }

  if (passageLayout) {
    const { heading, passage, questionPrompt } = passageLayout;
    return (
      <div lang={isTelugu ? "te" : undefined} className={`font-medium break-words ${isTelugu ? "font-telugu" : ""} ${className}`}>
        {heading.length > 0 && (
          <div className="space-y-1">
            {heading.map((line, index) => (
              <p key={`${index}-${line}`} className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {line}
              </p>
            ))}
          </div>
        )}
        <div className="my-4 rounded-2xl border border-teal-100 bg-teal-50/40 p-5 sm:p-6 text-slate-800 shadow-sm leading-relaxed">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
            <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{isTelugu ? "పఠన గద్యం (Reading Passage)" : "Reading Passage"}</span>
          </div>
          <div className="space-y-3 text-base sm:text-[17px] text-slate-800 font-normal">
            {passage.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
        {questionPrompt.length > 0 && (
          <div className="mt-4 space-y-1.5 font-bold text-slate-950 text-base sm:text-lg">
            {questionPrompt.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      lang={isTelugu ? "te" : undefined}
      className={`space-y-2.5 font-medium break-words ${isTelugu ? "font-telugu" : ""} ${className}`}
    >
      {lines.map((line, index) => {
        const labelled = line.match(labelledSection);
        const numbered = line.match(numberedSection);
        const data = line.match(dataRow);
        const isHeading = sectionHeading.test(line);
        const isInstruction = instructionStart.test(line);

        return (
          <p
            key={`${index}-${line}`}
            className={isInstruction ? "pt-1 text-slate-700" : undefined}
          >
            {isHeading ? (
              <span className="font-bold text-slate-950">{line}</span>
            ) : labelled ? (
              <>
                <span className="text-slate-950">{normalizedSectionLabel(labelled[1])}:</span>{" "}
                {labelled[2]}
              </>
            ) : numbered ? (
              <>
                <span className="mr-1 text-slate-950">{numbered[1]}</span>{" "}
                {numbered[2]}
              </>
            ) : data ? (
              <>
                <span className="text-slate-950">{data[1]}</span>{" — "}
                {data[2]}
              </>
            ) : (
              line
            )}
          </p>
        );
      })}
    </div>
  );
}
