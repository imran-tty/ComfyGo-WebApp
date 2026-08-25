import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres@localhost:5432/comfygo_db"
    )


    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "comfygo-super-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24


    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"


settings = Settings()
