from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from internal.utils.auth_utils import security, get_current_user
from internal.infrastructure.database.db import get_db

async def authentication(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> None:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales no encontradas")

    user = get_current_user(credentials, db)

    if user.is_deleted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autorizado")