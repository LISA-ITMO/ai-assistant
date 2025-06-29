from app.services.llm.base import BaseLLMService
from app.services.llm.chatgpt import ChatGPTService
from app.services.llm.yandexgpt import YandexGPTService
from app.services.llm.gigachat import GigaChatService
from app.services.llm.deepseek import DeepSeekService
from app.schemas.chat import LLMProvider
from app.services.rag.retrieval import RetrievalService


class ChatService:
    @staticmethod
    def get_llm_service(provider: LLMProvider) -> BaseLLMService:
        services = {
            LLMProvider.CHATGPT: ChatGPTService(),
            LLMProvider.YANDEXGPT: YandexGPTService(),
            LLMProvider.GIGACHAT: GigaChatService(),
            LLMProvider.DEEPSEEK: DeepSeekService(),
        }
        return services.get(provider, ChatGPTService())

    @staticmethod
    def generate_response(prompt: str, provider: LLMProvider, use_rag: bool = False, top_k: int = 5) -> tuple[str, str, list[str] | None]:
        llm_service = ChatService.get_llm_service(provider)

        context = None
        if use_rag:
            context = RetrievalService.retrieve_relevant_chunks(
                prompt, top_k, provider)
            context_text = "\n\nContext:\n" + \
                "\n".join([f"- {chunk}" for chunk in context]
                          ) if context else ""
            augmented_prompt = f"{prompt}\n{context_text}"
        else:
            augmented_prompt = prompt

        response = llm_service.generate_response(augmented_prompt)

        return response, provider, context
