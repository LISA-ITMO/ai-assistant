import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Настройки приложения."""

    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY')
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3001"]

    # Дополнительные настройки для сервера
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True


# Создание экземпляра настроек
settings = Settings()

# Проверка, что ключ API существует
if not settings.OPENAI_API_KEY:
    raise ValueError("Не удалось найти переменную окружения 'OPENAI_API_KEY'")
