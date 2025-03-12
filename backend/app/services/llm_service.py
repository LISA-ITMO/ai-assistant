from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from backend.app.config import settings


def improve_research_topic(original_topic: str, model_name: str = "gpt-3.5-turbo-instruct") -> str:
    llm = OpenAI(model_name=model_name, api_key=settings.OPENAI_API_KEY)

    template = """
                Исходная тема исследования: "{research_topic}"

                Задача:
                Уточнить и переформулировать тему исследования в одно предложение, 
                чтобы она была максимально понятна и удобна для дальнейшего изучения.
                """

    prompt_template = PromptTemplate.from_template(template)
    chain = prompt_template | llm

    try:
        response = chain.invoke({"research_topic": original_topic})
        return response
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."
