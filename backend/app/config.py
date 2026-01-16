from pydantic_settings import BaseSettings
from typing import Dict
import json

class Settings(BaseSettings):
    """Application settings and configuration"""

    # Environment
    ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 168  # 7 days

    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    DYNAMODB_TABLE_EXPENSES: str = "expenses"
    DYNAMODB_TABLE_USERS: str = "users"
    S3_BUCKET_NAME: str = ""

    # Users (manually added friends)
    USERS: str = '[]'

    @property
    def users_dict(self) -> Dict:
        """Parse USERS JSON string into dict keyed by email"""
        try:
            users_list = json.loads(self.USERS)
            return {user['email']: user for user in users_list}
        except json.JSONDecodeError:
            return {}

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
