from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/login", response_model="Pendiente")
def login():
    return {"message": "Login"}

@router.post("/register", response_model="Pendiente")
def register():
    return {"message": "Register"}

@router.get("/profile", response_model="Pendiente")
def profile():
    return {"message": "Profile"}

@router.get("/logout", response_model="Pendiente")
def logout():
    return {"message": "Logout"}

@router.get("/get-users", response_model="Pendiente")
def get_users():
    return {"message": "Get users"}

@router.get("/get-user/{user_id}", response_model="Pendiente")
def get_user(user_id: int):
    return {"message": f"Get user {user_id}"}

@router.delete("/delete-user/{user_id}", response_model="Pendiente")
def delete_user(user_id: int):
    return {"message": f"Delete user {user_id}"}