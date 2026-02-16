from fastapi import FastAPI

from internal.api.routes.report_router import lifespan
from internal.api.routes.routes import api_router
from internal.infrastructure.database.db import StartDB, SessionLocal
from internal.utils.setup_env import SetupEnv, DBURL

from internal.api.middleware.cors import SetupCORS


def StartBackend() -> FastAPI:
    StartDB()

    db = SessionLocal()
    db.close()

    app = FastAPI(lifespan=lifespan)
    SetupCORS(app)

    app.include_router(api_router)
    SetupEnv()

    return app