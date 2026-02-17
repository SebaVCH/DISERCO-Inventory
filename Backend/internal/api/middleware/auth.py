from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from internal.utils.auth_utils import security, validate_token

async def authentication(credentials: HTTPAuthorizationCredentials = Depends(security)) -> None:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales no encontradas")

    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")