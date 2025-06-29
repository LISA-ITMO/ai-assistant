from pydantic import BaseModel
from enum import Enum


class LLMProvider(str, Enum):
    CHATGPT = "chatgpt"
    YANDEXGPT = "yandexgpt"
    GIGACHAT = "gigachat"
    DEEPSEEK = "deepseek"


class ChatRequest(BaseModel):
    prompt: str
    provider: LLMProvider = LLMProvider.CHATGPT
    temperature: float = 0.7
    use_rag: bool = False
    top_k: int = 5


class ChatResponse(BaseModel):
    response: str
    provider: str
    context: list[str] | None = None
