from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.config import settings
from app.models.user import LoginRequest, LoginResponse, User
from app.middleware.auth import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Authenticate user and return JWT token

    Users are manually added to the USERS environment variable.
    """
    # Load users from .env file
    users = settings.users_dict
    user = users.get(credentials.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not pwd_context.verify(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT token
    expiration = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    token_data = {
        "sub": user['email'],
        "name": user['name'],
        "exp": expiration
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Return token and user info
    return LoginResponse(
        token=token,
        user=User(
            email=user['email'],
            name=user['name'],
            phone=user.get('phone')
        )
    )

@router.get("/me", response_model=User)
def get_current_user_info(user=Depends(get_current_user)):
    """Get current authenticated user info"""
    return User(email=user['email'], name=user['name'])

@router.get("/debug-config")
def debug_config():
    """Debug endpoint to see what backend loaded"""
    users = settings.users_dict
    return {
        "total_users": len(users),
        "user_emails": list(users.keys()),
        "users_env_length": len(settings.USERS),
        "users_env_preview": settings.USERS[:100] if settings.USERS else "EMPTY"
    }
