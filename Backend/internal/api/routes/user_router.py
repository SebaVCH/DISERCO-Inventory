from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from internal.domain.user import User
from internal.infrastructure.database.db import get_db
from internal.utils.auth_utils import encrypt_password, verify_password, create_token, get_current_user, get_admin_user
from internal.schemas.user_schema import TokenResponse, AppUserRead, AppUserCreate, AppUserLogin

router = APIRouter(prefix="/user", tags=["user"])

public_router = APIRouter(prefix="/user", tags=["user"])
private_router = APIRouter(prefix="/user", tags=["user"])

@public_router.post("/login", response_model=TokenResponse)
def login(user: AppUserLogin,db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email, User.is_deleted == False).first()
    if not existing_user or not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")

    token = create_token(existing_user)
    return {"access_token": token, "token_type": "bearer"}

@private_router.post("/register", response_model=AppUserRead)
def register(user: AppUserCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user.email == admin.email:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user_data = user.model_dump(exclude={'id'})
    new_user = User(**user_data)
    new_user.password_hash = encrypt_password(user.password_hash)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@private_router.get("/profile", response_model=AppUserRead)
def profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing_user = db.query(User).filter(User.id == user.id).first()
    return existing_user

@private_router.get("/get-users", response_model=List[AppUserRead])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.id != 0).all()
    return users