type FormattedQuestionTextProps = {
  text: string;
  className?: string;
};

const labelledSection =
  /^(Assertion(?:\s*\([A-Za-z\d]+\))?|(?:నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన)(?:\s*\([A-Za-z\d]+\))?|Reason(?:\s*\([A-Za-z\d]+\))?|(?:కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ)(?:\s*\([A-Za-z\d]+\))?|(?:(?:Statement|Conclusion|Assumption|ప్రకటన|వాక్యం|తీర్మానం|ఊహ|భావన)(?:\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+|\([A-Za-z\d]+\))(?:\s*\([^)]+\))?)?|(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+|\([A-Za-z\d]+\)))(?:\s*\([^)]+\))?)\s*[:—–-]\s*(.+)$/i;

const instructionStart =
  /^(?:(?:Choose|Select|Which|How\s+many\s+of|Pick|Identify|In\s+the\s+light\s+of)\b|(?:సరైన|సరికాని|కింది|క్రింది|పై|ఇచ్చిన).*(?:ఎంచుకోండి|గుర్తించండి|తెల్పండి|ఎన్నుకోండి|పరిశీలించండి))/i;

const numberedSection =
  /^((?:\((?:[a-zA-Z]|\d{1,2}|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|V|VI|i|ii|iii|iv|v|vi|[a-zA-Z]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)]))\s+(.*)$/i;

const sectionHeading =
  /^(?:Statements?|Conclusions?|Assumptions?|Directions?|Codes?|Passage|Comprehension|Matching\s+Sets?|Matching\s+Pairs?|ప్రకటనలు?|తీర్మానాలు?|ఊహలు?|భావనలు?|సూచనలు?|గద్యం)\s*:?$/i;

const dataRow = /^(.{1,40}?)\s+—\s+([\d౦-౯].*)$/;

export function containsTeluguText(text: string) {
  if (!text || typeof text !== "string") return false;
  return /[\u0c00-\u0c7f]/.test(text);
}

const isExplicitHeader = (line: string | undefined) =>
  Boolean(line) &&
  /^(?:(?:List|Column|Group|Set)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI)(?:\s*\([^)]+\))?|(?:జాబితా|కాలమ్|కాలం|గ్రూప్|సెట్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+)(?:\s*\([^)]+\))?|Traveler|Country|Leaders|Contribution|నాయకులు|కృషి):?$/i.test(
    line!.trim(),
  );
const romanMap: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
};

const teluguAlphaMap: Record<string, number> = {
  'ఎ': 1, 'బి': 2, 'సి': 3, 'డి': 4, 'ఈ': 5, 'ఎఫ్': 6, 'జి': 7, 'హెచ్': 8,
};

const teluguNumMap: Record<string, number> = {
  '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9,
};

function getMarkerInfo(marker: string) {
  const isParenthesized = /^\(.*\)$/.test(marker.trim());
  const clean = marker.replace(/[().]/g, '').trim();

  if (/^\d+$/.test(clean)) {
    return { type: 'num', val: parseInt(clean, 10), isParenthesized, clean };
  }
  const lower = clean.toLowerCase();
  if (lower.length > 1 && romanMap[lower]) {
    return { type: 'roman', val: romanMap[lower], isParenthesized, clean };
  }
  if (/^[a-zA-Z]$/.test(clean)) {
    if (lower === 'i') {
      return { type: 'roman', val: 1, isParenthesized, clean };
    }
    const val = clean.toUpperCase().charCodeAt(0) - 64;
    return { type: 'alpha', val, isParenthesized, clean };
  }
  if (romanMap[lower]) {
    return { type: 'roman', val: romanMap[lower], isParenthesized, clean };
  }
  if (teluguAlphaMap[clean]) {
    return { type: 'telugu-alpha', val: teluguAlphaMap[clean], isParenthesized, clean };
  }
  if (teluguNumMap[clean]) {
    return { type: 'telugu-num', val: teluguNumMap[clean], isParenthesized, clean };
  }
  return { type: 'unknown', val: -1, isParenthesized, clean };
}

function findValidListIndices(matches: RegExpMatchArray[]): Set<number> {
  const validIndices = new Set<number>();
  const byType: Record<string, Array<{ idx: number; val: number; isParenthesized: boolean; type: string }>> = {};

  matches.forEach((m, idx) => {
    const info = getMarkerInfo(m[2]);
    if (info.type === 'unknown') return;
    if (!byType[info.type]) byType[info.type] = [];
    byType[info.type].push({ idx, ...info });
  });

  for (const type of Object.keys(byType)) {
    const items = byType[type];
    if (items.length < 2) continue;

    let currentRun = [items[0]];

    const evaluateRun = (run: typeof items) => {
      if (run.length < 2) return;

      const isUnparenthesizedAlpha = run.some(r => r.type === 'alpha' && !r.isParenthesized);
      if (isUnparenthesizedAlpha) {
        // Unparenthesized letters (e.g. A., B.) must start with A (1) and be strictly consecutive
        if (run[0].val !== 1) return;
        for (let i = 1; i < run.length; i++) {
          if (run[i].val !== run[i - 1].val + 1) return;
        }
      } else {
        // For other types, markers must be strictly increasing without duplicates
        for (let i = 1; i < run.length; i++) {
          if (run[i].val <= run[i - 1].val) return;
        }
        const isConsecutive = run.every((item, i) => i === 0 || item.val === run[i - 1].val + 1);
        if (!isConsecutive && run[0].val !== 1) return;
      }

      run.forEach(r => validIndices.add(r.idx));
    };

    for (let i = 1; i < items.length; i++) {
      const prev = currentRun[currentRun.length - 1];
      const curr = items[i];

      if (curr.val > prev.val) {
        currentRun.push(curr);
      } else {
        evaluateRun(currentRun);
        currentRun = [curr];
      }
    }
    evaluateRun(currentRun);
  }

  return validIndices;
}

function splitInlineLists(text: string): string {
  // Fix OCR split 4-digit years (e.g. 200 9 -> 2009) and split words (e.g. Prades h -> Pradesh)
  text = text
    .replace(/\b(18\d|19\d|20\d)\s+(\d)(?=\.|\b)/g, "$1$2")
    .replace(/\b(Prades)\s+(h)\b/gi, "$1$2")
    // Fix missing space after period before sentence starting with capital letter (e.g. "thesides.A sits" -> "thesides. A sits")
    .replace(/(?<=[a-z0-9])\.([A-Z]\s)/g, ". $1");

  const inlineListRegex = /(?<!(?:\b(?:Assertion|Reason|Option|Vitamin|Grade|Group|Column|List|Table|Figure|Class|Rs|Re|No|Nos|Fig|Thus|Therefore|Hence|So|Consequently|Because|Since|Statement|Statements)|(?:వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన|కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ|నిశ్చితార్థం|నిశ్చితార్థము|రూ|కాబట్టి|కావున|అందువల్ల|అందుచేత|దీని\s*ప్రకారం|ప్రకారం|స్టేట్‌మెంట్|స్టేట్మెంట్|స్టేట్‌మెంట్లు|వాక్యం|వాక్యాలు|తీర్మానం|తీర్మానాలు))[ \t]*)([,;.]|[ \t]+)\s*((?:\((?:[a-zA-Z]|[1-9]|[౧-౯]|[ivxIVX]{1,5}|(?:[ఎ-హ]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)))\)|(?<![\d౦-౯]\s*:[ \t]*)\b(?:[1-9]|[౧-౯]|[a-hA-H]|I{1,4}|VI{0,2}|[ivxIVX]{1,5}|(?:\b[ఎ-హ]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)))[.)]))\s+(?!(?:(?:and|&|or|is|was|are|were|refers|means|denotes|to|represents|follows|holds|implies|indicates|stands)\b|(?:మరియు|లేదా|తప్పు|సత్యం|నిజం|సరైనది|సరియైనది|సరికానిది|సరికాదు|కాదు|చెల్లదు|వర్తిస్తుంది|అనగా|అంటే|అవుతుంది|అగును)[ \t]))([A-Za-z0-9\u0c00-\u0c7f"'])/g;

  // Separate uppercase letter markers glued to words or punctuation (e.g. "CommitteeC. Conduct", "HyderabadD. Formation")
  text = text.replace(
    /(?<=[a-z\u0c00-\u0c7f][.?!;:]?)(?=[A-H]\.\s+[A-Za-z0-9\u0c00-\u0c7f"'])/g,
    " ",
  );
  // Separate digit markers glued to punctuation (e.g. "year.3. The" -> "year. 3. The", but NEVER inside numbers like "2009. 2.")
  text = text.replace(
    /(?<=[a-zA-Z\u0c00-\u0c7f][.?!;:)\]])(?<!\d)(?=[1-9]\.\s+[A-Za-z0-9\u0c00-\u0c7f"'])/g,
    " ",
  );
  // Separate roman numeral markers glued to punctuation (e.g. "R.ii. T is" -> "R. ii. T is", but NEVER inside roman numerals)
  text = text.replace(
    /(?<=[a-zA-Z\d\u0c00-\u0c7f][.?!;:)\]])(?<![ivxIVX])(?=(?:I{1,4}|VI{0,2}|[ivxIVX]{1,5})\.\s+[A-Za-z0-9\u0c00-\u0c7f"'])/g,
    " ",
  );

  const matches = Array.from(text.matchAll(inlineListRegex));
  if (matches.length === 0) return text;

  const validIndices = findValidListIndices(matches);
  if (validIndices.size === 0) return text;

  let matchIndex = 0;
  return text.replace(inlineListRegex, (match, p1, marker, p3) => {
    const isCurrentValid = validIndices.has(matchIndex++);
    if (isCurrentValid) {
      return `${p1 === "." ? "." : ""}\n${marker} ${p3}`;
    }
    return match;
  });
}


function questionLines(rawText: string) {
  if (!rawText || typeof rawText !== "string") return [];
  let text = rawText
    .replace(/\u00a0/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\b(18\d|19\d|20\d)\s+(\d)(?=\.|\b)/g, "$1$2")
    .replace(/\b(Prades)\s+(h)\b/gi, "$1$2")
    // Fix missing space after period before sentence starting with capital letter (e.g. "thesides.A sits" -> "thesides. A sits")
    .replace(/(?<=[a-z0-9])\.([A-Z]\s)/g, ". $1")
    // Repair split roman numerals (e.g. "i i." -> "ii.", "i i i." -> "iii.")
    .replace(/\b([ivxIVX])\s+([ivxIVX])\s+([ivxIVX])\.\s+/g, "$1$2$3. ")
    .replace(/\b([ivxIVX])\s+([ivxIVX])\.\s+/g, "$1$2. ")
    // Break after introductory clause before quoted code expression (e.g. "In a certain code language,‘A @ B’")
    .replace(
      /(?<=(?:code language|కోడ్\s*భాషలో|నిర్దిష్ట\s*కోడ్\s*భాషలో|నిరి\s*ష\s*కోడ్\s*భాషలో|భాషలో))[ \t]*[,:]?[ \t]*(?=[‘'"“])/gi,
      ":\n",
    )
    // Break between consecutive quoted definitions (e.g. ...husband of B’‘A # B’ or ...భర ’ ‘A # B’)
    .replace(/(?<=[’'"”])[ \t]*(?=[‘'"“])/g, "\n")
    // Break before conditional prompt (e.g. ...mother of B’If ‘P % Q... or ...తలి ’ ఒకవేళ...)
    .replace(/(?<=[’'"”])[ \t]*(?=(?:If|Where|Then)\b|ఒకవేళ(?:[\s,.]|$))/gi, "\n")
    // Protect currency and reference abbreviations (e.g. "Rs. 2", "Re. 1", "No. 1", "Fig. 1")
    // so that abbreviation dots are not mistaken for sentence ends before numbered list items.
    .replace(
      /\b(Rs|Re|No|Nos|Fig|Vol|Sec|Art|approx|Dr|Mr|Mrs|Prof)\.[ \t]*(?=[\d౦-౯])/gi,
      "__$1_DOT__ ",
    )
    .replace(/(రూ)\.[ \t]*(?=[\d౦-౯])/g, "__$1_DOT__ ")
    // Protect Telugu era markers (e.g. "క్రీ.శ.", "క్రీ.పూ.", "శా.శ.", "హి.శ.", "వి.శ.")
    // so that the dot after "క్రీ." is not mistaken for a sentence end before "శ." as a bullet marker.
    .replace(
      /(?<=^|[^\u0c00-\u0c7f])(క్రీ|శా|హి|వి)\.([ \t]*)(శ|పూ)\./gu,
      "__TEL_ERA_1_$1__$2__TEL_ERA_2_$3__",
    )
    .replace(
      /(?<=^|[^\u0c00-\u0c7f])(క్రీ|శా|హి|వి)\.([ \t]*)(శ|పూ)(?=[ \t\d౦-౯)\]]|$)/gu,
      "__TEL_ERA_1_$1__$2$3",
    )
    // Protect Telugu titles and abbreviations (e.g. "డా. బి.ఆర్. అంబేద్కర్", "ప్రొ. జయశంకర్", "సం. 2024", "నెం. 5")
    .replace(
      /(?<=^|[^\u0c00-\u0c7f])(డా|ప్రొ|శ్రీ|చి|కు|సం|నెం|పు|రూ)\.([ \t]*)(?=[\d౦-౯\u0c00-\u0c7f])/gu,
      "__TEL_ABBR_$1__$2",
    )
    // Join accidental linebreaks in legal citations (e.g. "Suraj Bhan\nv. Financial Commissioner")
    .replace(
      /(?<=(?:[A-Za-z0-9\u0c00-\u0c7f'"\)]|\b(?:Ltd|Co|Govt|Inc|Corp|Anr|Ors)\.))[ \t]*\r?\n[ \t]*(?=(?:v|vs)\.[ \t]+[A-Za-z0-9\u0c00-\u0c7f'"])/gi,
      " ",
    )
    // Join accidental linebreaks inside initials (e.g. "K.\nV." -> "K. V.", "కె.\nవి." -> "కె. వి.", "B.\nR." -> "B. R.")
    .replace(/(?<=(?:\b[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))\.)[ \t]*\r?\n[ \t]*(?=(?:[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))\.[ \t]+)/g, " ")
    // Join accidental linebreaks between initial and capitalized name (e.g. "K.\nViswanathan" -> "K. Viswanathan", "వి.\nవిశ్వనాథన్" -> "వి. విశ్వనాథన్")
    .replace(/(?<=(?:\b[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))\.)[ \t]*\r?\n[ \t]*(?=[A-Za-z\u0C00-\u0C7F]{2,})/g, " ")
    // Join accidental linebreaks after titles (e.g. "Justice\nK." -> "Justice K.", "జస్టిస్\nకె." -> "జస్టిస్ కె.")
    .replace(/(?<=(?:\b(?:Justice|Chief Justice|Judge|Dr|Mr|Mrs|Prof|Shri|Smt|Sir|Lord)\b|(?:జస్టిస్|న్యాయమూర్తి|ప్రధాన\s*న్యాయమూర్తి|డాక్టర్|డా|ప్రొఫెసర్|ప్రొ|శ్రీ|శ్రీమతి))(?:\s+(?:[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))\.)*)[ \t]*\r?\n[ \t]*(?=[A-Za-z\u0C00-\u0C7F])/gi, " ")
    // Protect person initials (e.g. "Justice K. V. Viswanathan", "C. V. Raman", "P. V. Narasimha Rao")
    // so that single-letter initials like "K." or "V." are not mistaken for sentence ends or Roman numeral list markers.
    .replace(
      /\b([A-Z])\.([ \t]+)([A-Z])\.(?=[ \t]+[A-Za-z])/g,
      "__INIT_1_$1__$2__INIT_2_$3__",
    )
    .replace(
      /(?<=\b(?:Justice|Chief Justice|Judge|Dr|Mr|Mrs|Prof|Shri|Smt|Sir|Lord)\s+)([A-Z])\.(?=[ \t]+[A-Za-z])/gi,
      "__INIT_TITLE_$1__",
    )
    .replace(
      /(?<=\b(?:Justice|Chief Justice|Judge|Dr|Mr|Mrs|Prof|Shri|Smt|Sir|Lord)\s+(?:[A-Za-z]\.(?:__INIT_[A-Za-z0-9_]+__)?|[A-Za-z]\.|__INIT_[A-Za-z0-9_]+__)[ \t]+)([A-Z])\.(?=[ \t]+[A-Z][a-z]+)/gi,
      "__INIT_TITLE_$1__",
    )
    // Protect Telugu person initials (e.g. "జస్టిస్ కె. వి. విశ్వనాథన్", "పి. వి. నరసింహారావు", "సి. వి. రామన్")
    // so that single-syllable Telugu initials like "కె." or "వి." are not mistaken for sentence ends or list markers.
    .replace(
      /(?<=^|[^\u0C00-\u0C7F])([ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.([ \t]+)([ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.(?=[ \t]+[\u0C00-\u0C7F])/g,
      "__TEL_INIT_1_$1__$2__TEL_INIT_2_$3__",
    )
    .replace(
      /(?<=(?:జస్టిస్|న్యాయమూర్తి|ప్రధాన\s*న్యాయమూర్తి|డాక్టర్|డా|ప్రొఫెసర్|ప్రొ|శ్రీ|శ్రీమతి)[ \t]+)([ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.(?=[ \t]+[\u0C00-\u0C7F])/g,
      "__TEL_INIT_TITLE_$1__",
    )
    .replace(
      /(?<=(?:జస్టిస్|న్యాయమూర్తి|ప్రధాన\s*న్యాయమూర్తి|డాక్టర్|డా|ప్రొఫెసర్|ప్రొ|శ్రీ|శ్రీమతి)[ \t]+(?:__TEL_INIT_[^\s]+__|([ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.)[ \t]+)([ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.(?=[ \t]+[\u0C00-\u0C7F]{2,})/g,
      "__TEL_INIT_TITLE_$1__",
    )
    // Join accidental linebreaks inside Latin abbreviations (e.g. "E.\ng." -> "E.g.", "i.\ne." -> "i.e.")
    .replace(/(?<=\b[EeIi]\.)[ \t]*\r?\n[ \t]*(?=[GgEe]\.[ \t]+)/g, "")
    // Protect Latin abbreviations like "e.g.", "E.g.", "i.e.", "I.e."
    // so that "E." is not split before "g." as a lettered list item.
    .replace(
      /\b(e|i)\.([ \t]*)(g|e)\./gi,
      "__LATIN_ABBR_1_$1__$2__LATIN_ABBR_2_$3__",
    )
    .replace(
      /\b(e|i)\.([ \t]*)(g|e)(?=[ \t\d౦-౯)\]]|$)/gi,
      "__LATIN_ABBR_1_$1__$2$3",
    )
    // Protect legal case citations (e.g. "Suraj Bhan v. Financial Commissioner" or "A vs. B")
    // so that 'v.' or 'vs.' is not mistaken for Roman numeral 'v.' (5) or split onto a new line.
    .replace(
      /(?<=(?:[A-Za-z0-9\u0c00-\u0c7f'"\)]|\b(?:Ltd|Co|Govt|Inc|Corp|Anr|Ors)\.))[ \t]+(v|vs)\.[ \t]+(?=[A-Za-z0-9\u0c00-\u0c7f'"])/gi,
      " __$1_DOT__ ",
    )
    // Break before Note clauses (e.g. "...logic?(NOTE : Operations..." -> "...logic?\n(NOTE : Operations...")
    .replace(
      /(?<=[.?!;:])\s*(?=\(?(?:NOTE|Note|సూచన|గమనిక)\s*:)/gi,
      "\n",
    )
    .replace(/[ \t]*:\s*;+[ \t]*/g, ":\n")
    .replace(/[ \t]*\.\s*;+[ \t]*/g, ".\n")
    .replace(/[ \t]*;;+[ \t]*/g, "\n")
    .replace(/[ \t]*;\s*(?=(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)[.)]\s)/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(
      /((?:Statements?|ప్రకటనలు?)\s*:)[ \t]*(.*?)(?=[ \t]+(?:Conclusions?|తీర్మానాలు?)\s*:|$)/gim,
      (_match, heading: string, body: string) =>
        `${heading}\n${body.trim().replace(/\.\s+/g, ".\n")}`,
    )
    .replace(
      /(?<=[.?!;:\)])[ \t]*(?=(?:Statements?|Conclusions?|Assumptions?|Directions?|Codes?|Passage|Comprehension|ప్రకటనలు?|తీర్మానాలు?|ఊహలు?|భావనలు?|సూచనలు?|గద్యం)\s*:)/gi,
      "\n",
    )
    .replace(
      /(?<=[.?!;:\)]\s*|^)((?:Statements|Conclusions|Assumptions|Directions?|Codes?|Passage|Comprehension|ప్రకటనలు|తీర్మానాలు|ఊహలు|భావనలు|సూచనలు?|గద్యం)\s*:)[ \t]*/gi,
      "$1\n",
    )
    .replace(
      /(?<=[.?!;:\)])[ \t]*(?=(?:Assertion(?:\s*\([A-Za-z\d]+\))?|(?:నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన)(?:\s*\([A-Za-z\d]+\))?|Reason(?:\s*\([A-Za-z\d]+\))?|(?:కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ)(?:\s*\([A-Za-z\d]+\))?|(?:Statement|Conclusion|List|Column|Group|ప్రకటన|వాక్యం|తీర్మానం|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+|\([A-Za-z\d]+\))(?:\s*\([^)]+\))?)\s*[:—–-])/gi,
      "\n",
    )
    .replace(
      /[ \t]*;+[ \t]*(?=(?:Assertion|Reason|నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన|కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ|Statement|Conclusion|List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\b|(?:\((?:[A-Za-z\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|[a-zA-Z]|I{1,4}|VI{0,2}|[ivxIVX]{1,5}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s)/gi,
      "\n",
    )
    .replace(
      /[ \t]*;+[ \t]*(?=(?:\((?:[a-hA-H\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:[a-hA-H\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s)/gi,
      "\n",
    )
    .replace(
      /[ \t]*;+[ \t]*(?=(?:(?:Choose|Select|Pick|Identify|Which\s+of|How\s+many\s+of)\b|(?:(?:సరైన|సరికాని)\s+(?:ఐచ్ఛికాన్ని|సమాధానాన్ని|జవాబును|జతను|కోడ్|కోడ్‌ను|కోడ్ను|వాక్యాన్ని)|(?:కింది|క్రింది|పై|ఇచ్చిన)\s+(?:వాటిలో|ఐచ్ఛికాల|కోడ్ల|కోడ్‌ల|వాక్యాల|ప్రకటనల|నుండి|నుంచి|ఇచ్చిన|సరైన)?.*(?:ఎంచుకోండి|గుర్తించండి|తెల్పండి|ఎన్నుకోండి|పరిశీలించండి):?)|సరైన\s+కోడ్ను\s+ఎంచుకోండి))/gi,
      "\n",
    )
    .replace(
      /(?<!(?:\b(?:and|&|or|as|is|of|in|with|to|from|between|for|into)|మరియు|లోని|తో|నుండి|మధ్య)[ \t.]*)[ \t.]+(?=(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్|Traveler|Country)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+)?(?:\s*\([^)]+\))?\s*:)/gi,
      "\n",
    )
    .replace(
      /((?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్|Traveler|Country)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+)?(?:\s*\([^)]+\))?\s*:)[ \t]*(?=(?:\([a-hA-H\d]\)|\([ivxIVX]+\)|(?:[a-hA-H\d]|[ivxIVX]+)[.)])\s)/gi,
      "$1\n",
    )
    .replace(
      /(:)[ \t]*(?=\((?:[a-hA-H\d]|[1-9]|[౧-౯]|[ivxIVX]{1,5}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)\s+[A-Za-z0-9\u0c00-\u0c7f"'])/gi,
      "$1\n",
    )
    .replace(
      /(?<=(?:[A-Za-z\)\]]|[\d౦-౯]{4}))(:)[ \t]*(?=(?:[1-9]|[౧-౯]|[a-hA-H]|I{1,4}|VI{0,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్))[.)]\s+[A-Za-z0-9\u0c00-\u0c7f"'])/gi,
      "$1\n",
    );

  text = splitInlineLists(text);

  const hasRomanNumeralContext = /\b(?:I{1,4}|IV|VI)\.\s/i.test(text);

  const lines = text
    .replace(
      /(?<!\b(?:and|or|to|in order to)\s*)(?<!,)[ \t]+(?=(?:Choose|Select|Pick)\s+(?:the|a)?\s*(?:correct|incorrect|most appropriate|suitable)?\s*(?:code|answer|option|pair|match)\b)/gi,
      "\n",
    )
    .replace(
      /(?<!\b(?:మరియు)\s*)(?<!,)[ \t]+(?=(?:(?:సరైన|సరికాని)\s+(?:ఐచ్ఛికాన్ని|సమాధానాన్ని|జవాబును|జతను|కోడ్|కోడ్‌ను|కోడ్ను|వాక్యాన్ని)|సరైన\s+కోడ్ను|సరైన\s+జవాబును|సరైన\s+సమాధానాన్ని)\s*(?:ఎంచుకోండి|గుర్తించండి|తెల్పండి|ఎన్నుకోండి|పరిశీలించండి))/gi,
      "\n",
    )
    .replace(
      /(?<=[.?!;:\)])[ \t]+(?=(?:Which\s+(?:one\s+)?of\s+(?:the\s+)?(?:above|following)|How\s+many\s+of\s+(?:the\s+)?(?:above|following))\b)/gi,
      "\n",
    )
    .replace(
      /(?<=[.?!;:\)])[ \t]*(?=(?:(?:Choose|Select|Pick|Identify|Which\s+of|How\s+many\s+of)\b|(?:(?:సరైన|సరికాని)\s+(?:ఐచ్ఛికాన్ని|సమాధానాన్ని|జవాబును|జతను|కోడ్|కోడ్‌ను|కోడ్ను|వాక్యాన్ని)|(?:కింది|క్రింది|పై|ఇచ్చిన)\s+(?:వాటిలో|ఐచ్ఛికాల|కోడ్ల|కోడ్‌ల|వాక్యాల|ప్రకటనల|నుండి|నుంచి|ఇచ్చిన|సరైన)?.*(?:ఎంచుకోండి|గుర్తించండి|తెల్పండి|ఎన్నుకోండి|పరిశీలించండి):?)))/gi,
      "\n",
    )
    .replace(
      new RegExp(
        "(?<!\\b[A-Za-z]\\.)(?<=[.?!;:\\)])[ \\t]+(?=(?:I{1,3}|IV" +
          (hasRomanNumeralContext ? "|V" : "") +
          ")\\.\\s)",
        "gi",
      ),
      "\n",
    )
    .replace(
      /(?<=[.?!;:\)])[ \t]+(?=Which\s+(?:conclusion|statement|assumption)s?\b)/gi,
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
    .replace(
      /(?<!(?:\b[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)|\b(?:Rs|Re|No|Nos|Fig|Vol|Sec|Art|approx|Dr|Mr|Mrs|Prof|vs|v|e\.g|i\.e|etc)|(?:రూ|క్రీ|శా|హి|వి|పూ|శ|డా|ప్రొ|శ్రీ|చి|కు|సం|నెం|పు))\s*)([.?]|(?<![\d౦-౯]\s*):)\s*(?=(?:Assertion(?:\s*\([A-Za-z\d]+\))?|(?:నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన)(?:\s*\([A-Za-z\d]+\))?|Reason(?:\s*\([A-Za-z\d]+\))?|(?:కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ)(?:\s*\([A-Za-z\d]+\))?|(?:\((?:[a-hA-H]|[1-9]|[౧-౯]|[ivxIVX]{1,5}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:(?:\b[1-9]|\b[౧-౯]|\b[a-hA-H]|I{1,4}|VI{0,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])))\s+[A-Za-z0-9\u0c00-\u0c7f"'])/gi,
      "$1\n",
    )
    .replace(/([^\s—–-])\s*[—–-]\s*(?=(?:[A-Ha-h]|I{1,4}|V|VI|\d{1,2}|ఎ|బి|సి|డి)\.\s)/g, "$1 — ")
    .replace(/([^\d\s—–-])\s*[—–-]\s*(?=[\d౦-౯])/g, "$1 — ")
    .split(/\n+/)
    .map((line) => line.trim().replace(/^;+|;+$/g, "").trim())
    .filter(Boolean);

  return lines
    .reduce<string[]>((merged, line) => {
      if (/^(?:\((?:[a-zA-Z\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|[a-zA-Z]|I{1,4}|V|VI|i|ii|iii|iv|v|vi|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])$/i.test(line)) {
        merged.push(line);
        return merged;
      }
      const previous = merged.at(-1);
      if (/^(?:\((?:[a-zA-Z\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|[a-zA-Z]|I{1,4}|V|VI|i|ii|iii|iv|v|vi|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])$/i.test(previous || "")) {
        merged[merged.length - 1] = `${previous} ${line}`;
      } else if (previous && /\b(?:Rs|Re|రూ)\.?$/i.test(previous) && /^(\d{1,2})[.)]\s*(.*)$/.test(line)) {
        merged[merged.length - 1] = `${previous.replace(/\.?$/, ".")} ${line}`;
      } else if (previous && /^(?:Statement|Conclusion|Assumption|ప్రకటన|తీర్మానం|ఊహ|భావన)\s*:$/i.test(previous) && !/^(?:\([a-zA-Z\d]|[1-9]|I{1,4}|[౧-౯]|Statements?|Conclusions?|Assumptions?|ప్రకటనలు?|తీర్మానాలు?|ఊహలు?)/i.test(line)) {
        merged[merged.length - 1] = `${previous} ${line}`;
      } else if (
        previous &&
        /\b(?:Justice|Chief Justice|Judge|Dr|Mr|Mrs|Prof|Shri|Smt|Sir|Lord|జస్టిస్|న్యాయమూర్తి|ప్రధాన\s*న్యాయమూర్తి|డాక్టర్|డా|ప్రొఫెసర్|ప్రొ|శ్రీ|శ్రీమతి|[A-Za-z]\.|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్)\.)\s*$/i.test(previous) &&
        /^(?:[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))\.\s+[A-Za-z\u0C00-\u0C7F]/.test(line)
      ) {
        merged[merged.length - 1] = `${previous} ${line}`;
      } else if (
        previous &&
        /\b(?:right of|left of|next to|opposite to|neighbor of|facing|beside|between|and|or|in|with|of|for|to|the|a|an|from|by|at|is|was|are|were|మరియు|యొక్క|లో|తో|నుండి|ద్వారా)\s*$/i.test(previous) &&
        (!/^(?:\((?:[a-zA-Z\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|[a-zA-Z]|I{1,4}|V|VI|i|ii|iii|iv|v|vi|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])/i.test(line) ||
          /^[A-Za-z]\.\s+/.test(line))
      ) {
        merged[merged.length - 1] = `${previous} ${line}`;
      } else {
        merged.push(line);
      }
      return merged;
    }, [])
    .map((line) =>
      line
        .replace(/__(v|vs)_DOT__/gi, "$1.")
        .replace(/__(Rs|Re|No|Nos|Fig|Vol|Sec|Art|approx|Dr|Mr|Mrs|Prof|రూ)_DOT__[ \t]*/gi, "$1. ")
        .replace(/__TEL_ERA_1_(క్రీ|శా|హి|వి)__/gu, "$1.")
        .replace(/__TEL_ERA_2_(శ|పూ)__/gu, "$1.")
        .replace(/__TEL_ABBR_(డా|ప్రొ|శ్రీ|చి|కు|సం|నెం|పు|రూ)__/gu, "$1.")
        .replace(/__LATIN_ABBR_1_(e|i)__/gi, "$1.")
        .replace(/__LATIN_ABBR_2_(g|e)__/gi, "$1.")
        .replace(/__INIT_1_([A-Za-z])__/g, "$1.")
        .replace(/__INIT_2_([A-Za-z])__/g, "$1.")
        .replace(/__INIT_TITLE_([A-Za-z])__/g, "$1.")
        .replace(/__TEL_INIT_1_([^_]+)__/g, "$1.")
        .replace(/__TEL_INIT_2_([^_]+)__/g, "$1.")
        .replace(/__TEL_INIT_TITLE_([^_]+)__/g, "$1.")
    );
}

function normalizedSectionLabel(label: string) {
  const trimmed = label.trim();
  if (/^Assertion$/i.test(trimmed)) return "Assertion (A)";
  if (/^Reason$/i.test(trimmed)) return "Reason (R)";
  if (/^వాదన$/i.test(trimmed)) return "వాదన (A)";
  if (/^నిశ్చితార్థం$/i.test(trimmed)) return "నిశ్చితార్థం (A)";
  if (/^నిశ్చితార్థము$/i.test(trimmed)) return "నిశ్చితార్థము (A)";
  if (/^నిశ్చితం$/i.test(trimmed)) return "నిశ్చితం (A)";
  if (/^ప్రతిపాదన$/i.test(trimmed)) return "ప్రతిపాదన (A)";
  if (/^దృఢ\s*ప్రకటన$/i.test(trimmed)) return "దృఢ ప్రకటన (A)";
  if (/^కారణం$/i.test(trimmed)) return "కారణం (R)";
  if (/^కారణము$/i.test(trimmed)) return "కారణము (R)";
  if (/^హేతువు$/i.test(trimmed)) return "హేతువు (R)";
  if (/^సమర్థన$/i.test(trimmed)) return "సమర్థన (R)";
  if (/^సమర్థనము$/i.test(trimmed)) return "సమర్థనము (R)";
  if (/^వివరణ$/i.test(trimmed)) return "వివరణ (R)";
  return trimmed;
}

const numericListItem = /^(?:\([1-9]\d?\)\s*|(?:[1-9]\d?|[౧-౯])[.)]\s+)/;
const alphabeticListItem = /^(?:\([a-zA-Z]\)\s*|[a-zA-Z][.)]\s+)/;
const teluguAlphabeticListItem = /^(?:\((?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)\)\s*|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)[.)]\s+)/;
const romanListItem = /^(?:\([ivxIVX]{1,5}\)\s*|(?:I|II|III|IV|V|VI|VII|VIII|i|ii|iii|iv|v|vi|vii|viii)[.)]\s+)/;
const codeDefinitionItem =
  /^(?:[‘'"“][^'"]+?[’'"”]|[A-Za-z0-9]\s*[@#$%^&*+=<>_~/-]\s*[A-Za-z0-9])\s*(?:\b(?:means|denotes|stands for)|(?:అంటే|సూచిస్తుంది)(?:[\s,.]|$))/i;

function renderListItem(line: string) {
  const match = line.match(
    /^(\((?:[a-zA-Z\d\u0c00-\u0c7f]+|[ivxIVX]{1,5})\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|V|VI|[a-zA-Z]|[ivxIVX]{1,5}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s*(.*)$/,
  );
  if (match) {
    return (
      <p key={line} className="break-normal whitespace-normal">
        <span className="font-bold text-slate-950 mr-1.5">{match[1]}</span>
        <span>{match[2]}</span>
      </p>
    );
  }
  return (
    <p key={line} className="break-normal whitespace-normal">
      {line}
    </p>
  );
}

function parseMatchingHeaders(headingLines: string[], isTelugu: boolean) {
  let leftTitle = isTelugu ? "జాబితా I" : "List I";
  let rightTitle = isTelugu ? "జాబితా II" : "List II";
  const cleanedHeading = [...headingLines];

  if (cleanedHeading.length > 0) {
    const lastIdx = cleanedHeading.length - 1;
    const lastLine = cleanedHeading[lastIdx].trim();

    // Pattern 1: Heading ends with "... : LeftHeader    RightHeader" or "... : LeftHeader RightHeader"
    const colonMultiMatch =
      lastLine.match(
        /^(.*?:)\s*([A-Za-z\u0c00-\u0c7f]+(?:\s+[A-Za-z\u0c00-\u0c7f]+)?)\s{2,}([A-Za-z\u0c00-\u0c7f]+(?:\s+[A-Za-z\u0c00-\u0c7f]+)?)$/,
      ) ||
      lastLine.match(
        /^(.*?:)\s*([A-Za-z\u0c00-\u0c7f]{2,20})\s+([A-Za-z\u0c00-\u0c7f]{2,20})$/,
      );

    if (colonMultiMatch) {
      cleanedHeading[lastIdx] = colonMultiMatch[1].trim();
      leftTitle = colonMultiMatch[2].trim();
      rightTitle = colonMultiMatch[3].trim();
    } else {
      // Pattern 2: Standalone header line e.g. "Leaders    Contribution" or "నాయకులు కృషి"
      const standaloneMatch =
        lastLine.match(
          /^([A-Za-z\u0c00-\u0c7f]+(?:\s+[A-Za-z\u0c00-\u0c7f]+)?)\s{2,}([A-Za-z\u0c00-\u0c7f]+(?:\s+[A-Za-z\u0c00-\u0c7f]+)?)$/,
        ) ||
        (cleanedHeading.length > 1 &&
          lastLine.match(/^([A-Za-z\u0c00-\u0c7f]{2,20})\s+([A-Za-z\u0c00-\u0c7f]{2,20})$/));
      if (standaloneMatch) {
        cleanedHeading.pop();
        leftTitle = standaloneMatch[1].trim();
        rightTitle = standaloneMatch[2].trim();
      } else if (cleanedHeading.length >= 2) {
        // Pattern 3: Two separate lines e.g. Line N-1: "Leaders", Line N: "Contribution"
        const prevLine = cleanedHeading[cleanedHeading.length - 2].trim().replace(/:$/, "");
        const currLine = lastLine.replace(/:$/, "");
        if (
          prevLine.length >= 2 &&
          prevLine.length <= 25 &&
          currLine.length >= 2 &&
          currLine.length <= 25 &&
          !/[.?!]/.test(prevLine) &&
          !/[.?!]/.test(currLine) &&
          (isExplicitHeader(prevLine) || /^[A-Za-z\u0c00-\u0c7f\s-]{2,25}$/.test(prevLine)) &&
          (isExplicitHeader(currLine) || /^[A-Za-z\u0c00-\u0c7f\s-]{2,25}$/.test(currLine)) &&
          cleanedHeading.length >= 3
        ) {
          cleanedHeading.splice(cleanedHeading.length - 2, 2);
          leftTitle = prevLine;
          rightTitle = currLine;
        }
      }
    }
  }

  // Fallback: Check if heading text has "Match X with Y"
  if (leftTitle === (isTelugu ? "జాబితా I" : "List I")) {
    const headingText = cleanedHeading.join(" ");
    const titleMatch = headingText.match(
      /Match\s+(?:the\s+)?(.*?)\s+(?:with|to)\s+(?:the\s+)?(.*?)(?::|$)/i,
    );
    if (titleMatch && titleMatch[1] && titleMatch[2]) {
      const l = titleMatch[1].trim();
      const r = titleMatch[2].trim();
      if (l.length < 30 && r.length < 30) {
        leftTitle = l.charAt(0).toUpperCase() + l.slice(1);
        rightTitle = r.charAt(0).toUpperCase() + r.slice(1);
      }
    } else if (/\b(?:Matching\s+Sets?|Sets?|సెట్లు|సెట్)\b/i.test(headingText)) {
      leftTitle = isTelugu ? "సెట్ I" : "Set I";
      rightTitle = isTelugu ? "సెట్ II" : "Set II";
    }
  }

  return { cleanedHeading, leftTitle, rightTitle };
}

function cleanItem(item: string, leftTitle?: string, rightTitle?: string) {
  let cleaned = item.trim().replace(/[,;]$/, "");
  if (
    leftTitle &&
    rightTitle &&
    leftTitle !== "List I" &&
    leftTitle !== "జాబితా I" &&
    leftTitle !== "Set I" &&
    leftTitle !== "సెట్ I"
  ) {
    const lEsc = leftTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rEsc = rightTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const headerRegex = new RegExp(`[.\\s]*(?:${lEsc}\\s*${rEsc}|${rEsc}\\s*${lEsc})\\s*$`, "i");
    cleaned = cleaned.replace(headerRegex, "").trim();
  }
  cleaned = cleaned
    .replace(
      /[.\s]*(?:నాయకులు\s*కృషి|Leaders\s*Contribution|జాబితా\s*[-–]?\s*[I1]\s*జాబితా\s*[-–]?\s*[II2]|List\s*[-–]?\s*[I1]\s*List\s*[-–]?\s*[II2])\s*$/i,
      "",
    )
    .trim();
  return cleaned;
}

function matchingListLayout(lines: string[]) {
  const isTelugu = lines.some(containsTeluguText);

  // Approach 1: Paired Rows on each line (e.g. 1. Item — A. Item or (i) Item (W) Item)
  const pairRowRegex =
    /^((?:\((?:[a-zA-Z]|\d{1,2}|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|VI{0,2}|[a-zA-Z]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s+.*?)(?:\s*[—–-]\s*|(?<!\b(?:Thus|Therefore|Hence|So|Consequently|Because|Since|Statement|Statements)\b|కాబట్టి|కావున|అందువల్ల|అందుచేత|ప్రకారం)\s+(?=(?:\((?:[a-zA-Z]|\d{1,2}|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|VI{0,2}|[a-zA-Z]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s(?!(?:is|was|are|were|refers|means|denotes|to|represents|follows|holds|implies|indicates|stands)\b|మరియు|లేదా|తప్పు|సత్యం|నిజం|సరైనది|సరియైనది|సరికానిది|సరికాదు|కాదు|చెల్లదు|వర్తిస్తుంది)))((?:\((?:[a-zA-Z]|\d{1,2}|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|VI{0,2}|[a-zA-Z]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)])\s+.*)$/;

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

  if (
    pairedIndices.length >= 2 &&
    pairedIndices.length === (pairedIndices[pairedIndices.length - 1] - pairedIndices[0] + 1)
  ) {
    const firstPairIdx = pairedIndices[0];
    const lastPairIdx = pairedIndices[pairedIndices.length - 1];
    const rawHeading = lines
      .slice(0, firstPairIdx)
      .reduce<string[]>((acc, curr) => {
        const prev = acc.at(-1);
        if (
          prev &&
          (/\b(?:in|with|to|from|between|and|of|for|into)\s*$/i.test(prev) ||
            /^(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+):?$/i.test(
              curr,
            ))
        ) {
          acc[acc.length - 1] = `${prev} ${curr}`.replace(/\s+/g, " ");
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
    const instruction = lines.slice(lastPairIdx + 1);

    const { cleanedHeading, leftTitle, rightTitle } = parseMatchingHeaders(rawHeading, isTelugu);

    return {
      heading: cleanedHeading.length ? cleanedHeading : [isTelugu ? "జతపరచండి:" : "Match the following:"],
      leftTitle,
      rightTitle,
      leftItems: leftPairs.map((item) => cleanItem(item, leftTitle, rightTitle)),
      rightItems: rightPairs.map((item) => cleanItem(item, leftTitle, rightTitle)),
      instruction,
    };
  }

  // Schemes for matching pairs
  const schemes = [
    { left: alphabeticListItem, right: numericListItem },
    { left: numericListItem, right: alphabeticListItem },
    { left: teluguAlphabeticListItem, right: numericListItem },
    { left: numericListItem, right: teluguAlphabeticListItem },
    { left: alphabeticListItem, right: romanListItem },
    { left: romanListItem, right: alphabeticListItem },
    { left: teluguAlphabeticListItem, right: romanListItem },
    { left: romanListItem, right: teluguAlphabeticListItem },
  ];

  // Approach 3: Interleaved / Alternating items (e.g. A. Item, 1. Item, B. Item, 2. Item...)
  let bestInterleaved: {
    firstLeft: number;
    endIdx: number;
    leftItems: string[];
    rightItems: string[];
  } | null = null;

  for (const scheme of schemes) {
    const firstLeft = lines.findIndex((line) => scheme.left.test(line));
    if (firstLeft >= 0 && firstLeft + 1 < lines.length && scheme.right.test(lines[firstLeft + 1])) {
      const leftItems: string[] = [];
      const rightItems: string[] = [];
      let idx = firstLeft;

      while (idx < lines.length) {
        if (
          /^(?:Leaders\s+Contribution|నాయకులు\s+కృషి|List\s*[-–]?\s*[I1]\s+List\s*[-–]?\s*[II2]|జాబితా\s*[-–]?\s*[I1]\s+జాబితా\s*[-–]?\s*[II2])$/i.test(
            lines[idx].trim(),
          )
        ) {
          idx++;
          continue;
        }

        if (scheme.left.test(lines[idx])) {
          leftItems.push(lines[idx]);
          idx++;

          if (
            idx < lines.length &&
            /^(?:Leaders\s+Contribution|నాయకులు\s+కృషి|List\s*[-–]?\s*[I1]\s+List\s*[-–]?\s*[II2]|జాబితా\s*[-–]?\s*[I1]\s+జాబితా\s*[-–]?\s*[II2])$/i.test(
              lines[idx].trim(),
            )
          ) {
            idx++;
          }

          if (idx < lines.length && scheme.right.test(lines[idx])) {
            rightItems.push(lines[idx]);
            idx++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      while (idx < lines.length && scheme.right.test(lines[idx])) {
        rightItems.push(lines[idx]);
        idx++;
      }

      if (leftItems.length >= 2 && rightItems.length >= 2) {
        if (
          !bestInterleaved ||
          firstLeft < bestInterleaved.firstLeft ||
          leftItems.length > bestInterleaved.leftItems.length
        ) {
          bestInterleaved = { firstLeft, endIdx: idx, leftItems, rightItems };
        }
      }
    }
  }

  if (bestInterleaved) {
    const rawHeading = lines
      .slice(0, bestInterleaved.firstLeft)
      .reduce<string[]>((acc, curr) => {
        const prev = acc.at(-1);
        if (
          prev &&
          (/\b(?:in|with|to|from|between|and|of|for|into)\s*$/i.test(prev) ||
            /^(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+):?$/i.test(
              curr,
            ))
        ) {
          acc[acc.length - 1] = `${prev} ${curr}`.replace(/\s+/g, " ");
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

    const { cleanedHeading, leftTitle, rightTitle } = parseMatchingHeaders(rawHeading, isTelugu);
    const instruction = lines.slice(bestInterleaved.endIdx);

    return {
      heading: cleanedHeading.length
        ? cleanedHeading
        : [isTelugu ? "జతపరచండి:" : "Match the following:"],
      leftTitle,
      rightTitle,
      leftItems: bestInterleaved.leftItems.map((item) => cleanItem(item, leftTitle, rightTitle)),
      rightItems: bestInterleaved.rightItems.map((item) => cleanItem(item, leftTitle, rightTitle)),
      instruction,
    };
  }

  // Approach 2: Separate lists (with or without column headers like "List-A:" and "List-B:")
  for (const scheme of schemes) {
    const leftStart = lines.findIndex((line) => scheme.left.test(line));
    const rightStart = lines.findIndex(
      (line, index) => index > leftStart && scheme.right.test(line),
    );

    if (leftStart >= 0 && rightStart > leftStart) {
      let leftTitle = isTelugu ? "జాబితా I" : "List I";
      let rightTitle = isTelugu ? "జాబితా II" : "List II";
      let headingEnd = leftStart;

      if (leftStart > 0 && isExplicitHeader(lines[leftStart - 1])) {
        leftTitle = lines[leftStart - 1].replace(/:$/, "").trim();
        headingEnd = leftStart - 1;
      }

      if (rightStart > 0 && isExplicitHeader(lines[rightStart - 1])) {
        rightTitle = lines[rightStart - 1].replace(/:$/, "").trim();
      }

      const rawHeading = lines
        .slice(0, headingEnd)
        .reduce<string[]>((acc, curr) => {
          const prev = acc.at(-1);
          if (
            prev &&
            (/\b(?:in|with|to|from|between|and|of|for|into)\s*$/i.test(prev) ||
              /^(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+):?$/i.test(
                curr,
              ))
          ) {
            acc[acc.length - 1] = `${prev} ${curr}`.replace(/\s+/g, " ");
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
      const leftItems = lines
        .slice(leftStart, rightStart)
        .filter((line) => scheme.left.test(line))
        .map((line) => line.trim().replace(/[,;]$/, ""));

      const rightEnd = lines.findIndex(
        (line, index) => index > rightStart && !scheme.right.test(line),
      );
      const rightItems = lines
        .slice(rightStart, rightEnd === -1 ? undefined : rightEnd)
        .filter((line) => scheme.right.test(line))
        .map((line) => line.trim().replace(/[,;]$/, ""));

      if (leftItems.length >= 2 && rightItems.length >= 2) {
        let finalLeftTitle = leftTitle;
        let finalRightTitle = rightTitle;
        let cleanedHeading = rawHeading;

        if (leftTitle === (isTelugu ? "జాబితా I" : "List I")) {
          const parsed = parseMatchingHeaders(rawHeading, isTelugu);
          finalLeftTitle = parsed.leftTitle;
          finalRightTitle = parsed.rightTitle;
          cleanedHeading = parsed.cleanedHeading;
        }

        const instruction = rightEnd === -1 ? [] : lines.slice(rightEnd);

        return {
          heading: cleanedHeading.length ? cleanedHeading : [isTelugu ? "జతపరచండి:" : "Match the following:"],
          leftTitle: finalLeftTitle,
          rightTitle: finalRightTitle,
          leftItems: leftItems.map((item) => cleanItem(item, finalLeftTitle, finalRightTitle)),
          rightItems: rightItems.map((item) => cleanItem(item, finalLeftTitle, finalRightTitle)),
          instruction,
        };
      }
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
    const rawPassage = lines.slice(1, promptIndex);
    const passage = rawPassage
      .map((p) => p.replace(/^(?:Passage|Questions?|గద్యం|ప్రశ్న)\s*:\s*/i, "").trim())
      .filter(Boolean);
    const questionPrompt = lines.slice(promptIndex);
    return { heading, passage, questionPrompt };
  } else if (lines.length >= 2) {
    const heading = [lines[0]];
    const rawPassage = lines.slice(1, lines.length - 1);
    const passage = rawPassage
      .map((p) => p.replace(/^(?:Passage|Questions?|గద్యం|ప్రశ్న)\s*:\s*/i, "").trim())
      .filter(Boolean);
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
  if (!text || typeof text !== "string") return null;
  const lines = questionLines(text);
  const isTelugu = containsTeluguText(text);
  const matchingLayout = matchingListLayout(lines);
  const passageLayout = !matchingLayout ? passageListLayout(lines) : null;

  if (matchingLayout) {
    const { heading, leftTitle, rightTitle, leftItems, rightItems, instruction } =
      matchingLayout;

    return (
      <div lang={isTelugu ? "te" : "en"} className={`@container font-medium ${isTelugu ? "font-telugu" : ""} ${className}`}>
        <div className="space-y-2">
          {heading.map((line, index) => <p key={`${index}-${line}`} className="font-semibold text-slate-950 leading-relaxed sm:leading-8">{line}</p>)}
        </div>
        <div className="mt-4 grid grid-cols-1 @[460px]:grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 shadow-sm [overflow-wrap:anywhere]">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{leftTitle}</p>
            <div className="space-y-2.5 text-[15px] sm:text-base leading-relaxed sm:leading-7 break-normal">{leftItems.map((line) => renderListItem(line))}</div>
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 shadow-sm [overflow-wrap:anywhere]">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{rightTitle}</p>
            <div className="space-y-2.5 text-[15px] sm:text-base leading-relaxed sm:leading-7 break-normal">{rightItems.map((line) => renderListItem(line))}</div>
          </div>
        </div>
        {instruction.length > 0 && <div className="mt-4 space-y-2 leading-relaxed sm:leading-7 text-slate-900">{instruction.map((line) => <p key={line}>{line}</p>)}</div>}
      </div>
    );
  }

  if (passageLayout) {
    const { heading, passage, questionPrompt } = passageLayout;
    return (
      <div lang={isTelugu ? "te" : "en"} className={`font-medium break-words ${isTelugu ? "font-telugu" : ""} ${className}`}>
        {heading.length > 0 && (
          <div className="space-y-1">
            {heading.map((line, index) => (
              <p key={`${index}-${line}`} className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
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
          <div className="space-y-3.5 text-base sm:text-[17px] text-slate-800 font-normal leading-relaxed sm:leading-8">
            {passage.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
        {questionPrompt.length > 0 && (
          <div className="mt-4 space-y-2 leading-relaxed sm:leading-8 text-slate-950 text-base sm:text-lg">
            {questionPrompt.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderBlocks = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const numbered = line.match(numberedSection);
      const isCaseCitation =
        numbered &&
        /^(?:v|vs)[.)]$/i.test(numbered[1]) &&
        /^(?:Financial|State|Union|Commissioner|Collector|Govt|Government|Board|Council|Secretary|Inspector|Municipal|High\s+Court|Supreme\s+Court)\b/i.test(
          numbered[2],
        );
      const isTeluguAbbrOrEra =
        numbered &&
        /^(?:రూ|క్రీ|శా|హి|వి|పూ|శ|డా|ప్రొ|శ్రీ|చి|కు|సం|నెం|పు)[.)]$/.test(
          numbered[1].replace(/[()]/g, ""),
        );
      const isPersonInitial =
        numbered &&
        /^(?:[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))[.)]$/.test(numbered[1]) &&
        /^[A-Za-z\u0c00-\u0c7f]+(?:\s|[?.!,]|$)/.test(numbered[2]);

      if (numbered && !isCaseCitation && !isTeluguAbbrOrEra && !isPersonInitial) {
        const group: Array<{ index: number; line: string; marker: string; content: string }> = [];
        while (i < lines.length) {
          const currLine = lines[i];
          const currMatch = currLine.match(numberedSection);
          const currIsCase =
            currMatch &&
            /^(?:v|vs)[.)]$/i.test(currMatch[1]) &&
            /^(?:Financial|State|Union|Commissioner|Collector|Govt|Government|Board|Council|Secretary|Inspector|Municipal|High\s+Court|Supreme\s+Court)\b/i.test(
              currMatch[2],
            );
          const currIsTeluguAbbrOrEra =
            currMatch &&
            /^(?:రూ|క్రీ|శా|హి|వి|పూ|శ|డా|ప్రొ|శ్రీ|చి|కు|సం|నెం|పు)[.)]$/.test(
              currMatch[1].replace(/[()]/g, ""),
            );
          const currIsPersonInitial =
            currMatch &&
            /^(?:[A-Za-z]|(?:[ఎ-హ]|[\u0C05-\u0C39][\u0C3E-\u0C4D]?|ఎఫ్|హెచ్|జెడ్|ఆర్|ఎస్|ఎల్|ఎం|ఎన్|క్యూ|డబ్ల్యూ|ఎక్స్))[.)]$/.test(currMatch[1]) &&
            /^[A-Za-z\u0c00-\u0c7f]+(?:\s|[?.!,]|$)/.test(currMatch[2]);
          if (currMatch && !currIsCase && !currIsTeluguAbbrOrEra && !currIsPersonInitial) {
            group.push({
              index: i,
              line: currLine,
              marker: currMatch[1],
              content: currMatch[2],
            });
            i++;
          } else {
            break;
          }
        }

        if (
          group.length === 1 &&
          !/^\(/.test(group[0].marker) &&
          !/^[\d౦-౯]/.test(group[0].marker)
        ) {
          elements.push(
            <p
              key={`${group[0].index}-${group[0].line}`}
              className="leading-relaxed sm:leading-8 text-slate-950"
            >
              {group[0].line}
            </p>,
          );
          continue;
        }

        elements.push(
          <div key={`group-${group[0].index}`} className="my-2 sm:my-2.5 space-y-1.5 sm:space-y-2">
            {group.map((item) => (
              <div
                key={`${item.index}-${item.line}`}
                className="flex items-start gap-2.5 sm:gap-3 leading-relaxed sm:leading-7 text-slate-950"
              >
                <strong className="font-bold text-slate-950 shrink-0 select-none min-w-[1.25rem] text-left">
                  {item.marker}
                </strong>
                <span className="text-slate-900 font-normal">
                  {item.content}
                </span>
              </div>
            ))}
          </div>,
        );
        continue;
      }

      const isCodeDef = codeDefinitionItem.test(line);
      if (isCodeDef) {
        const group: { line: string; index: number }[] = [];
        while (i < lines.length) {
          if (codeDefinitionItem.test(lines[i])) {
            group.push({ line: lines[i], index: i });
            i++;
          } else {
            break;
          }
        }

        elements.push(
          <div
            key={`code-group-${group[0].index}`}
            className="my-2 sm:my-2.5 space-y-1 sm:space-y-1.5 pl-1 sm:pl-2"
          >
            {group.map((item) => (
              <p key={item.index} className="leading-relaxed sm:leading-7 text-slate-900">
                {item.line}
              </p>
            ))}
          </div>,
        );
        continue;
      }

      const labelled = line.match(labelledSection);
      const data = line.match(dataRow);
      const isHeading = sectionHeading.test(line);
      const isInstruction = instructionStart.test(line);

      const isAssertionOrReason =
        labelled &&
        /^(?:Assertion(?:\s*\([A-Za-z\d]+\))?|Reason(?:\s*\([A-Za-z\d]+\))?|(?:నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన)(?:\s*\([A-Za-z\d]+\))?|(?:కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ)(?:\s*\([A-Za-z\d]+\))?)$/i.test(
          labelled[1].trim(),
        );

      if (isAssertionOrReason) {
        const label = normalizedSectionLabel(labelled[1].trim());
        elements.push(
          <div
            key={`${i}-${line}`}
            className="my-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 sm:p-4"
          >
            <p className="leading-relaxed sm:leading-8 text-slate-950">
              <strong className="font-bold text-slate-950 mr-2">
                {label}:
              </strong>
              <span className="text-slate-900 font-normal">
                {labelled[2]}
              </span>
            </p>
          </div>,
        );
      } else if (isHeading) {
        elements.push(
          <p key={`${i}-${line}`} className="font-bold text-slate-950 leading-relaxed sm:leading-8">
            {line}
          </p>,
        );
      } else if (labelled) {
        elements.push(
          <p key={`${i}-${line}`} className="leading-relaxed text-slate-950">
            <strong className="font-bold text-slate-950 mr-1.5">
              {normalizedSectionLabel(labelled[1].trim())}:
            </strong>
            <span>{labelled[2]}</span>
          </p>,
        );
      } else if (data && !line.endsWith("?") && line.split(/\s+/).length <= 15) {
        elements.push(
          <p key={`${i}-${line}`} className="leading-relaxed text-slate-950">
            <strong className="font-bold text-slate-950">{data[1]}</strong>
            {" — "}
            <span>{data[2]}</span>
          </p>,
        );
      } else {
        elements.push(
          <p
            key={`${i}-${line}`}
            className={
              isInstruction && i > 0
                ? "pt-2 leading-relaxed sm:leading-8 text-slate-950 font-medium"
                : "leading-relaxed sm:leading-8 text-slate-950"
            }
          >
            {line}
          </p>,
        );
      }

      i++;
    }

    return elements;
  };

  return (
    <div
      lang={isTelugu ? "te" : "en"}
      className={`space-y-3 break-words ${isTelugu ? "font-telugu leading-[1.85]" : "leading-relaxed sm:leading-8"} ${className ?? ""}`}
    >
      {renderBlocks()}
    </div>
  );
}
