# Question-bank CSV import format

Use `varadhi-question-bank-import-template.csv` as the master import sheet for previous papers, manually written questions, and bilingual question creation.

## How the importer will read a row

| Column | What it does |
| --- | --- |
| `import_key` | A unique ID you create. Never change it after importing. |
| `exam_categories` | The exam board/category: `TGPSC`, `APPSC`, later `TNPSC`, etc. Use `TGPSC|APPSC` when a verified question is reusable across both. |
| `availability_scope` | `all_exam_entries` makes it reusable in every Exam below the selected category. `only_selected_exam` limits it to `primary_exam`. |
| `primary_exam` | Always required. It identifies the existing Exam that owns the selected Subject, for example `Group 4` or `Endowment Officer`. |
| `subject` | Must exactly match a Subject already created in Varadhi under `primary_exam`. |
| `question_en` / `question_te` | English and Telugu versions displayed to students. Both should be filled and manually checked. |
| `option_*_en` / `option_*_te` | The bilingual text for the four answer choices. |
| `correct_options` | Use one letter: `A`, `B`, `C`, or `D`. Use `A|D` only for an officially ambiguous question; it remains inactive until multi-answer scoring is added. |
| `question_format` | `standard_mcq`, `assertion_reason`, `ordering_mcq`, `matching_mcq`, or `statement_mcq`. Every format still has four answer choices. |
| `source_*` | Keeps a reliable link to the original paper, page, and question number. |
| `content_lifecycle` | `permanent`, `review`, or `expires`. Current affairs should normally be `review` or `expires`. |
| `answer_key_status` | `official_verified`, `needs_review`, or `ambiguous`. Only verified rows should become active questions. |

## Matching questions

Do **not** create a separate row for every pair. Keep List I and List II in `question_en` and `question_te`; put the four complete answer codes in Options A–D. This works with the current four-option mock-test screen.

## Safe import rules

1. Import every row as inactive if `answer_key_status` is `needs_review` or `ambiguous`.
2. Detect duplicates using the English question plus Subject before creating a new question.
3. Never treat a candidate's `Chosen Option` in a downloaded result sheet as the correct answer.
4. Use the official key or manually verified answer before publishing a question.

## Current site upgrade needed

The present Question Bank stores one question text and one set of options. Before this CSV can be imported with bilingual student display, Varadhi needs bilingual database fields, a CSV upload page, duplicate preview, and support for `correct_options` when more than one answer is officially accepted.
