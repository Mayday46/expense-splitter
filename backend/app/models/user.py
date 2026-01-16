from pydantic import BaseModel, EmailStr

class User(BaseModel):
    """User model"""
    email: EmailStr
    name: str
    phone: str | None = None

class UserInDB(User):
    """User model with hashed password"""
    password_hash: str

class LoginRequest(BaseModel):
    """Login request payload"""
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    """Login response payload"""
    token: str
    user: User
