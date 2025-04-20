import os
from typing import List, ClassVar, Optional, Dict, Any
from pathlib import Path

try:
    from pydantic_settings import BaseSettings
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip",
                          "install", "pydantic-settings"])
    from pydantic_settings import BaseSettings

from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Настройки приложения."""

    BASE_DIR: ClassVar[Path] = BASE_DIR

    OPENAI_API_KEY: Optional[str] = None
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3001"]

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    VECTOR_STORE_DIR: Path = BASE_DIR / "vector_store"

    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "doc", "docx", "txt"]

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    VECTOR_MODEL: str = "all-MiniLM-L6-v2"

    MAX_CONTEXT_TOKENS: int = 4000
    DEFAULT_TOP_K: int = 5

    DEFAULT_LLM_MODEL: str = "gpt-3.5-turbo"

    APP_NAME: str = "AI Research Assistant"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()

if not settings.OPENAI_API_KEY:
    raise ValueError("Не удалось найти переменную окружения 'OPENAI_API_KEY'")

settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.VECTOR_STORE_DIR.mkdir(exist_ok=True)
