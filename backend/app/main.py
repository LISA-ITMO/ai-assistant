from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes import query, healthcheck, files

app = FastAPI(title="ARTHUR", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/api")
app.include_router(healthcheck.router, prefix="/api")
app.include_router(files.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
