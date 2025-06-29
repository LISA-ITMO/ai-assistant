from langchain_community.llms import GigaChat
from app.services.llm.base import BaseLLMService
from app.core.config import settings


class GigaChatService(BaseLLMService):
    def get_llm(self):
        return GigaChat(
            client_id=settings.GIGACHAT_CLIENT_ID,
            client_secret=settings.GIGACHAT_SECRET,
            model="GigaChat",
            temperature=0.7
        )
