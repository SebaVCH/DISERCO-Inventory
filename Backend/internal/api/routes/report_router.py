from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from starlette.responses import StreamingResponse

from internal.domain.inventory_item import InventoryItem
from internal.domain.inventory_movement import InventoryMovement
from internal.domain.report import Report
from internal.domain.report_inventory_item import ReportInventoryItem
from internal.infrastructure.database.db import get_db
from internal.utils.export_report import export_report_to_excel

from internal.schemas.report_schema import ReportRead, ReportCreate

router = APIRouter(prefix="/report", tags=["report"])

@router.get("/", response_model=list[ReportRead])
def get_report(db: Session = Depends(get_db)):
    reports = db.query(Report).options(joinedload(Report.user)).all()
    return reports

@router.post("/")
def create_report(report_data: ReportCreate, db: Session = Depends(get_db)):
    new_report = Report(
        description= report_data.description,
        frequency= report_data.frequency,
        user_id= report_data.user_id,
        generated_at= datetime.now(ZoneInfo("America/Santiago")),
        period_start= report_data.period_start,
        period_end= report_data.period_end,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    initial_date = new_report.period_start
    final_date = new_report.period_end

    all_movements = db.query(InventoryMovement).filter(InventoryMovement.created_at >= initial_date, InventoryMovement.created_at <= final_date).options(joinedload(InventoryMovement.inventory_item)).all()
    if not all_movements:
        raise HTTPException(status_code=404, detail="No hay movimientos en el periodo seleccionado")

    post_movements = db.query(InventoryMovement).filter(InventoryMovement.created_at > final_date).options(joinedload(InventoryMovement.inventory_item)).all()
    if not post_movements:
        for movement in all_movements:
            new_report_item = ReportInventoryItem(
            report_id= new_report.id,
            inventory_item_id= movement.inventory_item.id,
            stock_at_generation = movement.inventory_item.current_stock
            )
            db.add(new_report_item)
            db.commit()
            db.refresh(new_report_item)
    else:
        map_data = {}
        for movement in post_movements:
            if movement.inventory_item.id in map_data and movement.movement_type == "Salida":
                map_data[movement.inventory_item.id] += movement.quantity
            elif  movement.inventory_item.id in map_data and movement.movement_type == "Entrada":
                map_data[movement.inventory_item.id] -= movement.quantity
            else:
                map_data[movement.inventory_item.id] = movement.quantity

        for movement in all_movements:
            if movement.inventory_item.id in map_data:
                new_report_item = ReportInventoryItem(
                    report_id= new_report.id,
                    inventory_item_id= movement.inventory_item.id,
                    stock_at_generation = movement.inventory_item.current_stock - map_data[movement.inventory_item.id]
                )
            else:
                new_report_item = ReportInventoryItem(
                    report_id= new_report.id,
                    inventory_item_id= movement.inventory_item.id,
                    stock_at_generation = movement.inventory_item.current_stock
                )
            db.add(new_report_item)
            db.commit()
            db.refresh(new_report_item)

    return new_report

@router.get("/{report_id}")
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).options(joinedload(Report.user)).first()
    items_in_report = db.query(ReportInventoryItem).filter(ReportInventoryItem.report_id == report_id).options(joinedload(ReportInventoryItem.inventory_item).joinedload(InventoryItem.section)).all()

    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    try:
        buffer = export_report_to_excel(report, items_in_report, db)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="reporte_{report_id}.xlsx"'},
    )

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    db.delete(report)
    db.commit()
    return {"Reporte eliminado exitosamente"}