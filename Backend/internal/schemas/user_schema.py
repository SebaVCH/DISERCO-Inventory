from pydantic import BaseModel, EmailStr

class AppUserBase(BaseModel):
    email: EmailStr
    full_name: str

class AppUserCreate(AppUserBase):
    password_hash: str

class AppUserLogin(BaseModel):
    email: EmailStr
    password: str

class AppUserRead(AppUserBase):
    id: int
    pass

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"