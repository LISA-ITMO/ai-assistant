import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import llm_settings, query, files, healthcheck, refine_topic


app = FastAPI(
    title="Research Assistant API",
    description="API для помощи в проведении исследований",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(healthcheck.router)
app.include_router(query.router, prefix="/api")
app.include_router(refine_topic.router, prefix="/api")
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(llm_settings.router, prefix="/api", tags=["llm"])


if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(
        "backend.app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
