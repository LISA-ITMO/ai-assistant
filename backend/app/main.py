import os
from typing import List

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import query, upload, healthcheck
from backend.app.core.config import settings  # Предполагаемый модуль настроек

# Создание экземпляра приложения FastAPI с метаданными
app = FastAPI(
    title="ARTHUR",
    version="0.0.1",
    description="API сервис для обработки запросов и управления данными"
)

# Настройка CORS - более безопасная конфигурация с разрешенными источниками
origins: List[str] = settings.ALLOWED_ORIGINS if hasattr(
    settings, "ALLOWED_ORIGINS") else ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Подключение роутеров
# Сначала healthcheck для более быстрых проверок
app.include_router(healthcheck.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

if __name__ == "__main__":
    # Получение настроек из переменных окружения или использование значений по умолчанию
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(
        "backend.app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
