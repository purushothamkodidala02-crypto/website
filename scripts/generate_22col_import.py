import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load the questions data from the previous script
from generate_shankaracharya_mcqs import questions_data

headers_22 = [
    "import_key",
    "subject",
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
    "correct_answer",
    "explanation_en",
    "explanation_te",
    "source_reference",
    "source_exam_date",
    "difficulty",
    "content_lifecycle",
    "review_on",
    "expires_on",
    "is_active"
]

rows_22 = []
for q in questions_data:
    key = f"EO-AS-{q['q_num']:03d}"
    rows_22.append([
        key,
        "Hinduism & Philosophy",
        q["q_en"],
        q["opt_a_en"],
        q["opt_b_en"],
        q["opt_c_en"],
        q["opt_d_en"],
        q["q_te"],
        q["opt_a_te"],
        q["opt_b_te"],
        q["opt_c_te"],
        q["opt_d_te"],
        q["ans"],
        q["exp_en"],
        q["exp_te"],
        "TGPSC/APPSC Endowment Officer Paper-2 (Adi Shankaracharya)",
        "2026-09-30",
        q["difficulty"],
        "permanent",
        "",
        "",
        "true"
    ])

# 1. Save TSV
tsv_path = "Varadhi_Shankaracharya_22Col_Import.tsv"
with open(tsv_path, mode="w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f, delimiter="\t")
    writer.writerow(headers_22)
    writer.writerows(rows_22)
print(f"Generated TSV: {tsv_path}")

# 2. Save CSV
csv_path = "Varadhi_Shankaracharya_22Col_Import.csv"
with open(csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(headers_22)
    writer.writerows(rows_22)
print(f"Generated CSV: {csv_path}")

# 3. Save Excel Workbook (.xlsx)
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Varadhi_Questions"
ws.views.sheetView[0].showGridLines = True

header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
border_thin = Border(
    left=Side(style='thin', color='D1D5DB'),
    right=Side(style='thin', color='D1D5DB'),
    top=Side(style='thin', color='D1D5DB'),
    bottom=Side(style='thin', color='D1D5DB')
)

ws.append(headers_22)
ws.row_dimensions[1].height = 28
for col_idx in range(1, len(headers_22) + 1):
    cell = ws.cell(row=1, column=col_idx)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for r_idx, row_data in enumerate(rows_22, start=2):
    ws.append(row_data)
    row_fill = PatternFill(start_color="F8FAFC" if r_idx % 2 == 0 else "FFFFFF", fill_type="solid")
    for col_idx in range(1, len(row_data) + 1):
        c = ws.cell(row=r_idx, column=col_idx)
        c.font = Font(name="Segoe UI", size=9)
        c.fill = row_fill
        c.border = border_thin
        if col_idx in [1, 13, 17, 18, 19, 22]:
            c.alignment = Alignment(horizontal="center", vertical="center")
            if col_idx == 13:
                c.font = Font(name="Segoe UI", size=10, bold=True, color="1E3A8A")
        else:
            c.alignment = Alignment(vertical="center", wrap_text=True)

col_widths = {
    "A": 14,  # import_key
    "B": 22,  # subject
    "C": 42,  # question_en
    "D": 22,  # option_a_en
    "E": 22,  # option_b_en
    "F": 22,  # option_c_en
    "G": 22,  # option_d_en
    "H": 42,  # question_te
    "I": 22,  # option_a_te
    "J": 22,  # option_b_te
    "K": 22,  # option_c_te
    "L": 22,  # option_d_te
    "M": 14,  # correct_answer
    "N": 38,  # explanation_en
    "O": 38,  # explanation_te
    "P": 30,  # source_reference
    "Q": 16,  # source_exam_date
    "R": 14,  # difficulty
    "S": 18,  # content_lifecycle
    "T": 14,  # review_on
    "U": 14,  # expires_on
    "V": 12   # is_active
}
for col_letter, width in col_widths.items():
    ws.column_dimensions[col_letter].width = width

excel_path = "Varadhi_Shankaracharya_22Col_Import.xlsx"
wb.save(excel_path)
print(f"Generated Excel: {excel_path}")

# Also update the master file in docs/import-templates
docs_excel_path = os.path.join("docs", "import-templates", "Varadhi_Shankaracharya_22Col_Import.xlsx")
wb.save(docs_excel_path)
docs_csv_path = os.path.join("docs", "import-templates", "Varadhi_Shankaracharya_22Col_Import.csv")
with open(docs_csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(headers_22)
    writer.writerows(rows_22)
print("Updated docs/import-templates copies.")
