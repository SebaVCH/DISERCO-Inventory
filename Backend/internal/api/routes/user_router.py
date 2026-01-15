from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from internal.domain.user import User
from internal.infrastructure.database.db import get_db
from internal.schemas import AppUserCreate, AppUserLogin
from internal.utils.auth_utils import encrypt_password, verify_password, create_token

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/login")
def login(user: AppUserLogin,db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user or not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")

    return {"Token": create_token(existing_user)}

@router.post("/register")
def register(user: AppUserCreate,db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    new_user = User(**user.model_dump())
    new_user.password_hash = encrypt_password(user.password_hash)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"Token": create_token(existing_user)}

@router.get("/profile")
def profile():
    return {"message": "Profile"}

@router.get("/logout")
def logout():
    return {"message": "Logout"}

@router.get("/get-users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/get-user/{user_id}")
def get_user(user_id: int):
    return {"message": f"Get user {user_id}"}

@router.delete("/delete-user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db.query(User).filter(User.id == user_id).update({"is_deleted": True})
    db.commit()
    return {"Usuario eliminado"}