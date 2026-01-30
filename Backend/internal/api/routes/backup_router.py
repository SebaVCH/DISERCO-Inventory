from http.client import HTTPException
from fastapi import APIRouter
import os

from starlette.responses import FileResponse

router = APIRouter(prefix="/backup", tags=["backup"])
DB_PATH = "DISERCO-DB"

@router.get("/download")
def download_backup():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="BD no encontrado.")

    return FileResponse(
        path=DB_PATH,
        filename= "DISERCO-DB".upper(),
    )