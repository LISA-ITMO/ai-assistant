from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from backend.app.config import OPENAI_API_KEY


def call_openai(prompt: str, model_name: str = "gpt-3.5-turbo-instruct") -> str:
    """
    Calls OpenAI API to process research topic refinement.

    Args:
        prompt (str): The original research topic to be refined.
        model_name (str): The OpenAI model to use. Defaults to "gpt-3.5-turbo-instruct".

    Returns:
        str: The refined research topic with analysis and recommendations.
    """
    llm = OpenAI(model_name=model_name, api_key=OPENAI_API_KEY)

    template = """
                Исходная тема исследования: "{research_topic}"

                Задача:
                1. Уточнить и переформулировать тему исследования так, чтобы она была максимально понятна для дальнейшего изучения.
                2. Выделить основные аспекты, ключевые вопросы и цели исследования.
                3. Предложить возможные направления и методики для анализа темы.
                4. Определить потенциальные источники информации для исследования.
                5. Указать возможные ограничения и сложности в изучении данной темы.

                Ваше задание: переформулируйте и дополните тему исследования, руководствуясь указанными рекомендациями.
                Предоставьте структурированный ответ с четкими разделами.
                """

    prompt_template = PromptTemplate.from_template(template)
    chain = prompt_template | llm

    try:
        response = chain.invoke({"research_topic": prompt})
        return response
    except Exception as e:
        # Log the error and return a helpful message
        print(f"Error calling OpenAI API: {str(e)}")
        return "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."
