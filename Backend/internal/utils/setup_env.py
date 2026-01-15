import os
from dotenv import load_dotenv

FrontendURL = os.getenv("FRONTEND_URL")
JWTSecret = os.getenv("JWT_SECRET")
JWTAlgorithm = os.getenv("JWT_ALGORITHM")

def SetupEnv():
    load_dotenv()