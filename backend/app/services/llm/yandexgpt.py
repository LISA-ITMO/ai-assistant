from langchain_community.llms import YandexGPT
from app.services.llm.base import BaseLLMService
from app.core.config import settings


class YandexGPTService(BaseLLMService):
    def get_llm(self):
        return YandexGPT(
            api_key=settings.YANDEX_API_KEY,
            folder_id=settings.YANDEX_FOLDER_ID,
            temperature=0.7
        )
