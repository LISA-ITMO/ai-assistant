from langchain_openai import ChatOpenAI
from app.services.llm.base import BaseLLMService
from app.core.config import settings


class DeepSeekService(BaseLLMService):
    def get_llm(self):
        return ChatOpenAI(
            model="deepseek-chat",
            api_key=settings.DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com/v1",
            temperature=0.7
        )
