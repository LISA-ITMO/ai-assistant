from pydantic import BaseModel
from typing import List
from app.schemas.chat import LLMProvider


class ChunkingRequest(BaseModel):
    filename: str
    provider: LLMProvider = LLMProvider.CHATGPT


class ChunkingResponse(BaseModel):
    filename: str
    chunk_count: int
