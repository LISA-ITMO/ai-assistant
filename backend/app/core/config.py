from pydantic import AnyUrl
from pydantic_settings import BaseSettings
import os
from pathlib import Path
from typing import ClassVar


class Settings(BaseSettings):
    PROJECT_NAME: str = "A.R.T.H.U.R."
    PROJECT_DESCRIPTION: str = "API для помощи научным исследованиям"
    PROJECT_VERSION: str = "1.0.1"

    PROJECT_ROOT: ClassVar[Path] = Path(__file__).parent.parent.parent.parent
    UPLOAD_DIR: str = str(PROJECT_ROOT / "uploads")

    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./test.db"
    OPENAI_API_KEY: str = ""
    YANDEX_API_KEY: str = ""
    YANDEX_FOLDER_ID: str = ""
    GIGACHAT_CLIENT_ID: str = ""
    GIGACHAT_SECRET: str = ""
    DEEPSEEK_API_KEY: str = ""

    VECTORIZE_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
