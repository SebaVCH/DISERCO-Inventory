from fastapi import FastAPI

from internal.api.routes.routes import api_router
from internal.infrastructure.database.db import StartDB, SessionLocal
from internal.utils.setup_env import SetupEnv

def StartBackend() -> FastAPI:
    StartDB()

    db = SessionLocal()
    db.close()

    app = FastAPI()

    app.include_router(api_router)
    SetupEnv()

    return app