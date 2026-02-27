import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path

from sqlalchemy.orm import joinedload, Session

from internal.domain.inventory_item import InventoryItem
from internal.domain.notification_subscription import NotificationSubscription
from internal.infrastructure.database.db import SessionLocal
from internal.utils.setup_env import SMTPUser, SMTPPassword, SMTPServer, SMTPPort

sender = SMTPUser
subject = None
content = None

TEMPLATE_DIR = Path(__file__).resolve().parent
CRITICAL_TEMPLATE = TEMPLATE_DIR / "critical_stock_template.html"

def send_mail():
    db = SessionLocal()
    sub_list = db.query(NotificationSubscription).options(joinedload(NotificationSubscription.user)).all()
    critical_inventory = db.query(InventoryItem).options(joinedload(InventoryItem.section)).filter(
        (InventoryItem.has_critical_stock == True)
        & (InventoryItem.current_stock <= InventoryItem.critical_stock_quantity + 30)
        & (InventoryItem.is_deleted == False)
    ).all()

    subject = "Aviso de stock critico"
    with CRITICAL_TEMPLATE.open("r", encoding="utf-8") as file:
        template = file.read()
        item_rows = "".join(
            f"<tr><td>{item.name}</td><td>{item.current_stock}</td><td>{item.critical_stock_quantity}</td></tr>"
            for item in critical_inventory
        )
        content = template.replace("{CRITICAL_ITEMS_ROWS}", item_rows)
        smtp_sending_structure(content, subject, sub_list)


def smtp_sending_structure(content: str, subject: str, sub_list: list[Any]):
    context = ssl.create_default_context()

    for sub in sub_list:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = SMTPUser
        msg["To"] = sub.user.email
        msg.attach(MIMEText(content, "html"))
        try:
            with smtplib.SMTP(SMTPServer, SMTPPort, timeout=30) as smtp:
                smtp.ehlo()
                smtp.starttls(context=context)
                smtp.ehlo()
                smtp.login(SMTPUser, SMTPPassword)
                smtp.send_message(msg)

        except smtplib.SMTPServerDisconnected:
            print("El servidor cerró la conexión.")
        except Exception as e:
            print(f"Error: {e}")