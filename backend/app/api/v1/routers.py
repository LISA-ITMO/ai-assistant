from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import ChatService
from app.api.endpoints.files import router as files_router
from app.api.endpoints.research import router as research_router
from app.api.endpoints.rag import router as rag_router
from app.api.endpoints.annotation import router as annotation_router
api_router = APIRouter()

api_router.include_router(research_router, prefix="/research", tags=["files"])
api_router.include_router(files_router, prefix="/files", tags=["files"])
api_router.include_router(rag_router, prefix="/rag", tags=["rag"])
api_router.include_router(
    annotation_router, prefix="/annotations", tags=["annotation"])
