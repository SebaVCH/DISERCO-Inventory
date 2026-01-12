from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from internal.utils.setup_env import FrontendURL

def SetupCORS(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[FrontendURL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )