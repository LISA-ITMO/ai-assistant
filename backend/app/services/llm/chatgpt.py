from langchain_openai import ChatOpenAI
from app.services.llm.base import BaseLLMService
from app.core.config import settings


class ChatGPTService(BaseLLMService):
    def get_llm(self):
        return ChatOpenAI(
            model="gpt-3.5-turbo",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )
