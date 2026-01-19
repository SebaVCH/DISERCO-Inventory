from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from internal.domain.user import User
from internal.infrastructure.database.db import get_db
from internal.utils.setup_env import JWTSecret, JWTAlgorithm

def create_token(user):
    expiration_time = datetime.now(ZoneInfo("America/Santiago")) + timedelta(hours=1)
    payload = {
        "email": user.email,
        "id": user.id,
        "exp": expiration_time
    }
    token = jwt.encode(payload,JWTSecret,algorithm=JWTAlgorithm)
    return token

def decode_token(token):
    return jwt.decode(token,JWTSecret,algorithms=[JWTAlgorithm])

security = HTTPBearer(auto_error=False)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Credenciales no encontradas")
    token = credentials.credentials
    try:
        payload = decode_token(token)
        email = payload.get("email")
        if not isinstance(email,str):
            raise HTTPException(status_code=401, detail="Token invalido")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalidooo")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def encrypt_password(password):
    secured_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return secured_password

def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password)