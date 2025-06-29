from pydantic import BaseModel
from typing import List
from app.schemas.chat import LLMProvider


class RetrievalRequest(BaseModel):
    query: str
    provider: LLMProvider = LLMProvider.CHATGPT
    top_k: int = 5


class RetrievalResponse(BaseModel):
    chunks: List[str]
    provider: str
