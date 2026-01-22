import io
from pathlib import Path
from typing import List, Any

from openpyxl import load_workbook, Workbook
from sqlalchemy.orm import Session

from internal.domain.report import Report
from internal.domain.report_inventory_item import ReportInventoryItem

TEMPLATE_PATH = Path(__file__).resolve().parent / "Plantilla_Reporte_Abastecimiento.xlsx"

def export_report_to_excel(report: Report, items_report: List[ReportInventoryItem], db: Session) -> io.BytesIO:
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Plantilla no encontrada en {TEMPLATE_PATH}")

    workbook = load_workbook(TEMPLATE_PATH)
    sections = get_sections(items_report)
    replace_general_summary(report, workbook, items_report, db, sections)
    generate_details_for_section(items_report, report, workbook, sections)

    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    return buffer

def generate_details_for_section(items_report: list[ReportInventoryItem], report: Report, workbook: Workbook, sections: List[str]):

    for section in sections:
        sheet_detail = workbook["Detalle Sección"]
        workbook.copy_worksheet(sheet_detail)
        new_sheet_detail = workbook.worksheets[-1]
        new_sheet_detail.title = f"Detalle {section}"
        new_sheet_detail["B4"] = section
        new_sheet_detail["B5"] = f"{report.period_start} - {report.period_end}"

    workbook.remove(sheet_detail)

def get_sections(items_report: list[ReportInventoryItem]) -> list[Any]:
    sections = []
    for item in items_report:
        inventory_item = item.inventory_item
        section = inventory_item.section if inventory_item else None
        section_name = section.name if section else None
        if not section_name:
            if "Sin Sección" not in sections:
                sections.append("Sin Sección")
        elif section_name not in sections:
            sections.append(section_name)
    return sections

def replace_general_summary(report: Report, workbook: Workbook, items_report: List[ReportInventoryItem], db: Session, sections: List[str]):
    sheet = workbook["Resumen General"]

    sheet["E4"] = report.id
    sheet["B4"] = f"{report.period_start} - {report.period_end}"
    sheet["B5"] = report.generated_at
    sheet["B6"] = report.user.full_name
