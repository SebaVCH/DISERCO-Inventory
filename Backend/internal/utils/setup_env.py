import os
from dotenv import load_dotenv

load_dotenv()
FrontendURL = os.getenv("FRONTEND_URL")
JWTSecret = os.getenv("JWT_SECRET")
JWTAlgorithm = os.getenv("JWT_ALGORITHM")
SMTPServer = os.getenv("SMTP_SERVER")
SMTPPort = os.getenv("SMTP_PORT")
SMTPUser = os.getenv("SMTP_USER")
SMTPPassword = os.getenv("SMTP_PASSWORD")
DBURL = os.getenv("DATABASE_URL")

def SetupEnv():
    load_dotenv()