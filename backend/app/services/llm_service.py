from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from typing import Dict, Optional
import json

from backend.app.core.config import settings


class LLMService:
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-3.5-turbo-instruct"):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model_name = model_name
        self.llm = OpenAI(model_name=self.model_name, api_key=self.api_key)

    def _create_chain(self, template: str) -> any:
        prompt_template = PromptTemplate.from_template(template)
        return prompt_template | self.llm

    def improve_research_topic(self, topic: str) -> str:
        template = """
            Исходная тема исследования: "{research_topic}"

            Задача:
            Уточнить и переформулировать тему исследования в одно предложение, 
            чтобы она была максимально понятна и удобна для дальнейшего изучения.
        """

        try:
            chain = self._create_chain(template)
            response = chain.invoke({"research_topic": topic})
            return response
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            return "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."

    async def generate_research_goals(self, topic: str) -> Dict[str, list]:
        template = """
            Исходная тема исследования: "{research_topic}"

            Задача:
            Сгенерировать список из 3 целей и 3 задач для исследования.
            
            ВАЖНО: Ответ должен быть строго в формате JSON без дополнительного текста.
            
            Пример формата:
            {{
                "goals": [
                    "Провести анализ существующих методов",
                    "Разработать новый подход",
                    "Оценить эффективность предложенного решения"
                ],
                "tasks": [
                    "Выполнить обзор литературы",
                    "Создать прототип решения",
                    "Провести экспериментальную проверку"
                ]
            }}
        """

        try:
            chain = self._create_chain(template)
            response = chain.invoke({"research_topic": topic})

            if isinstance(response, str):
                start = response.find('{')
                end = response.rfind('}') + 1
                if start >= 0 and end > start:
                    response = response[start:end]

                try:
                    parsed_response = json.loads(response)
                except json.JSONDecodeError as e:
                    print(
                        f"JSON parsing error: {str(e)}\nResponse: {response}")
                    raise

            else:
                parsed_response = response

            return {
                "goals": parsed_response.get("goals", []),
                "tasks": parsed_response.get("tasks", [])
            }
        except Exception as e:
            print(f"Error generating research goals: {str(e)}")
            return {
                "goals": [],
                "tasks": [],
                "error": "Произошла ошибка при генерации целей и задач"
            }


llm_service = LLMService()
