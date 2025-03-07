import os
from typing import List

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import llm_settings, query, upload, healthcheck
from backend.app.config import settings


app = FastAPI(
    title="ARTHUR",
    version="0.0.1"
)

origins: List[str] = llm_settings.ALLOWED_ORIGINS if hasattr(
    settings, "ALLOWED_ORIGINS") else ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(healthcheck.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(llm_settings.router, prefix="/api")
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
