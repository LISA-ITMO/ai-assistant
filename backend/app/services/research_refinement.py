from app.services.chat import ChatService
from app.schemas.chat import LLMProvider


class ResearchRefinementService:
    @staticmethod
    def refine_research_topic(topic: str, provider: LLMProvider) -> tuple[str, str]:
        prompt = f"""
        Вы являетесь экспертным консультантом по исследованиям. Ваша задача — взять заданную тему исследования и уточнить её, сделав более конкретной, привлекательной и инновационной. Уточнённая тема должна:
        - Быть ясной и сфокусированной.
        - Внести новую перспективу или направление.
        - Подходить для углублённого исследования.
        - Оставаться лаконичной (одно предложение).

        Исходная тема: {topic}

        Представьте уточнённую тему в формате:
        Уточнённая тема: [Ваша уточнённая тема]
        """

        response, provider_name, _ = ChatService.generate_response(
            prompt, provider)

        lines = response.strip().split("\n")
        refined_topic = ""

        for line in lines:
            line = line.strip()
            if line.startswith("Уточнённая тема:"):
                refined_topic = line.replace("Уточнённая тема:", "").strip()
                break

        if not refined_topic:
            raise ValueError("Failed to parse refined topic from LLM response")

        return refined_topic, provider_name
