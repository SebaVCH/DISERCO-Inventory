import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List

from internal.domain.user import User
from internal.utils.setup_env import SMTPUser, SMTPPassword, SMTPServer, SMTPPort

sender = SMTPUser
receiver = None
subject = None
content = None

def send_mail(type: str, user_list: List[User], item_list: list = None):
    if type == "backup":
        subject = "Aviso de respaldo de base de datos"
        with open("backup_template.html", "r") as file:
            template = file.read()
            for user in user_list:
                content = template.format()
    if type == "critical_stock":
        subject = "Aviso de stock critico"
        with open("critical_stock_template.html", "r") as file:
            template = file.read()
            for user in user_list:
                content = template.format()

    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = SMTPUser
    msg["To"] = receiver
    msg.attach(MIMEText(content, "html"))
    context = ssl.create_default_context()

    try:
        with smtplib.SMTP(SMTPServer, SMTPPort, timeout=30) as smtp:
            smtp.set_debuglevel(1)
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()

            smtp.login(SMTPUser, SMTPPassword)
            smtp.send_message(msg)

    except smtplib.SMTPServerDisconnected:
        print("El servidor cerró la conexión.")
    except Exception as e:
        print(f"Error: {e}")

send_mail("backup")