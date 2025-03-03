from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from backend.app.config import OPENAI_API_KEY


def call_openai(prompt: str) -> str:
    llm = OpenAI(model_name="gpt-3.5-turbo-instruct", api_key=OPENAI_API_KEY)
    template = """
                Исходная тема исследования: "{research_topic}"

                Задача:
                1. Уточнить и переформулировать тему исследования так, чтобы она была максимально понятна для дальнейшего изучения.
                2. Выделить основные аспекты, ключевые вопросы и цели исследования.
                3. Предложить возможные направления и методики для анализа темы.

                Ваше задание: переформулируйте и дополните тему исследования, руководствуясь указанными рекомендациями.
                """
    prompt = PromptTemplate.from_template(
        template
    )
    chain = prompt | llm
    response = chain.invoke(
        {
            "research_topic": prompt
        }
    )
    return response
