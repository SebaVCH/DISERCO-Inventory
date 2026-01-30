import calendar
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import APIRouter, Depends, HTTPException, FastAPI
from sqlalchemy.orm import Session, joinedload
from starlette.responses import StreamingResponse

from internal.domain.inventory_item import InventoryItem
from internal.domain.inventory_movement import InventoryMovement
from internal.domain.report import Report
from internal.domain.report_inventory_item import ReportInventoryItem
from internal.infrastructure.database.db import get_db, SessionLocal
from internal.schemas import ReportCreate
from internal.utils.export_report import export_report_to_excel

from internal.schemas.report_schema import ReportRead, ReportCreate
from internal.utils.send_mail import send_mail

router = APIRouter(prefix="/report", tags=["report"])

@router.get("/", response_model=list[ReportRead])
def get_report(db: Session = Depends(get_db)):
    reports = db.query(Report).options(joinedload(Report.user)).all()
    return reports

@router.post("/")
def create_report(report_data: ReportCreate, db: Session = Depends(get_db)):
    new_report = create_base_report(db, report_data, raise_if_empty=True)
    if not new_report:
        raise HTTPException(status_code=404, detail="No hay movimientos en el periodo seleccionado")
    return new_report

def create_base_report(db: Session, report_data: ReportCreate, raise_if_empty: bool = True) -> Report | None:
    try:
        initial_date = report_data.period_start
        final_date = report_data.period_end

        all_movements = db.query(InventoryMovement).filter(InventoryMovement.created_at >= initial_date, InventoryMovement.created_at <= final_date).options(joinedload(InventoryMovement.inventory_item)).all()
        if not all_movements:
            if raise_if_empty:
                raise HTTPException(status_code=404, detail="No hay movimientos en el periodo seleccionado")
            return None

        new_report = Report(
            description=report_data.description,
            frequency=report_data.frequency,
            user_id=report_data.user_id,
            generated_at=datetime.now(ZoneInfo("America/Santiago")),
            period_start=report_data.period_start,
            period_end=report_data.period_end,
        )
        db.add(new_report)
        db.flush()

        post_movements = db.query(InventoryMovement).filter(InventoryMovement.created_at > final_date).options(joinedload(InventoryMovement.inventory_item)).all()
        if not post_movements:
            for movement in all_movements:
                db.add(ReportInventoryItem(
                        report_id=new_report.id,
                        inventory_item_id=movement.inventory_item.id,
                        stock_at_generation=movement.inventory_item.current_stock,
                ))
        else:
            map_data = {}
            for movement in post_movements:
                if movement.inventory_item.id in map_data and movement.movement_type == "Salida":
                    map_data[movement.inventory_item.id] += movement.quantity
                elif movement.inventory_item.id in map_data and movement.movement_type == "Entrada":
                    map_data[movement.inventory_item.id] -= movement.quantity
                else:
                    map_data[movement.inventory_item.id] = movement.quantity

            for movement in all_movements:
                if movement.inventory_item.id in map_data:
                    stock_value = movement.inventory_item.current_stock - map_data[movement.inventory_item.id]
                else:
                    stock_value = movement.inventory_item.current_stock

                db.add(ReportInventoryItem(
                        report_id=new_report.id,
                        inventory_item_id=movement.inventory_item.id,
                        stock_at_generation=stock_value,
                ))

        db.flush()
        db.refresh(new_report)
        db.commit()
        return new_report
    except Exception:
        db.rollback()
        raise

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
    item_report = db.query(ReportInventoryItem).filter(ReportInventoryItem.report_id == report_id).all()
    if not item_report:
        raise HTTPException(status_code=404, detail="No hay movimientos asociados al reporte")
    db.delete(report)
    for item in item_report:
        db.delete(item)
    db.commit()
    return {"Reporte eliminado exitosamente"}

def validate_existing_report():
    db = SessionLocal()
    actual_date = datetime.now(ZoneInfo("America/Santiago"))
    monday_last_week = (actual_date - timedelta(days=actual_date.weekday() + 7)).replace(hour=0, minute=0, second=0,microsecond=0)
    sunday_last_week = (monday_last_week + timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=0)

    first_day_this_month = actual_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_day_last_month = (first_day_this_month - timedelta(days=1)).replace(hour=23, minute=59, second=59)
    first_day_last_month = last_day_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    report_last_week = db.query(Report).filter(Report.period_start == monday_last_week, Report.period_end == sunday_last_week).first()
    if not report_last_week:
        create_base_report(
            db,
            ReportCreate(
                user_id=0,
                frequency="Semanal",
                description="Reporte Semanal automático",
                period_start=monday_last_week,
                period_end=sunday_last_week,
                generated_at=datetime.now(ZoneInfo("America/Santiago")),
            ),
            raise_if_empty=False,
        )

    report_last_month = db.query(Report).filter(Report.period_start == first_day_last_month, Report.period_end == last_day_last_month).first()
    if not report_last_month:
        create_base_report(
            db,
            ReportCreate(
                user_id=0,
                frequency="Mensual",
                description="Reporte Mensual automático",
                period_start=first_day_last_month,
                period_end=last_day_last_month,
                generated_at=datetime.now(ZoneInfo("America/Santiago")),
            ),
            raise_if_empty=False,
        )

scheduler = BackgroundScheduler()
scheduler.add_job(func=validate_existing_report, trigger=CronTrigger(hour=8, minute=30, day='*'), id="validate_reports", misfire_grace_time=16200)
scheduler.add_job(func=send_mail, trigger=CronTrigger(hour=8, minute=30, day_of_week=1), id="send_important_mails", misfire_grace_time=16200)

@asynccontextmanager
async def lifespan(app: FastAPI):

    validate_existing_report()
    scheduler.start()
    yield
    scheduler.shutdown()
