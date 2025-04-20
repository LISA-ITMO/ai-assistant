from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from typing import Dict, Optional, List, Any
import json
import requests
import asyncio
import logging

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.openai_client = OpenAI(api_key=self.api_key)

    def _create_chain(self, template: str) -> any:
        prompt_template = PromptTemplate.from_template(template)
        return prompt_template | self.openai_client

    def improve_research_topic(self, topic: str) -> str:
        template = """
            Исходная тема исследования: "{research_topic}"

            Задача:
            Уточнить и переформулировать тему исследования в одно предложение, 
            чтобы она была максимально понятна и удобна для дальнейшего изучения.

            В качестве ответа предоставь только улучшенную тему исследования, без дополнительных комментариев.
        """

        try:
            chain = self._create_chain(template)
            response = chain.invoke({"research_topic": topic})
            return response
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            return "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."

    async def generate_research_goals(self, topic: str) -> Dict[str, List[str]]:
        prompt = f"""
        Ты - опытный исследователь и методолог. Помоги сформулировать цели и задачи для исследования на тему: "{topic}".
        
        Сформулируй 1 конкретную цель исследования и 3-5 задач, которые помогут достичь этой цели.
        
        Цели должны быть конкретными, измеримыми и достижимыми.
        Задачи должны быть практическими шагами для достижения целей.
        
        Ответ предоставь в формате JSON:
        {{
            "goals": ["Цель 1", "Цель 2", ...],
            "tasks": ["Задача 1", "Задача 2", ...]
        }}
        """

        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }

            data = {
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": "Ты - опытный исследователь и методолог, который помогает формулировать цели и задачи исследований."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }

            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data
            )

            if response.status_code != 200:
                raise Exception(
                    f"Ошибка API: {response.status_code}, {response.text}")

            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"]

            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]

            result = json.loads(json_str)
            return result
        except Exception as e:
            raise Exception(f"Ошибка при генерации целей и задач: {str(e)}")

    async def generate_research_recommendations(self, topic: str) -> List[str]:
        prompt = f"""
        Ты - опытный исследователь и методолог. Помоги составить практические рекомендации для проведения исследования на тему: "{topic}".
        
        Предоставь 5-7 конкретных рекомендаций, которые помогут эффективно провести исследование по данной теме.
        
        Рекомендации должны быть:
        - Практичными и применимыми
        - Специфичными для данной темы исследования
        - Полезными для исследователя любого уровня
        
        Ответ предоставь в формате JSON:
        {{
            "recommendations": ["Рекомендация 1", "Рекомендация 2", ...]
        }}
        """

        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }

            data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "Ты - опытный исследователь и методолог, который помогает составлять рекомендации для проведения исследований."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }

            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data
            )

            if response.status_code != 200:
                error_message = f"Ошибка API: {response.status_code}, {response.text}"
                print(error_message)
                raise Exception(error_message)

            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"]

            try:
                result = json.loads(response_text)
                if "recommendations" in result:
                    return result["recommendations"]

                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1

                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    result = json.loads(json_str)
                    if "recommendations" in result:
                        return result["recommendations"]

                lines = [line.strip()
                         for line in response_text.split('\n') if line.strip()]
                recommendations = [line.lstrip(
                    '- ').lstrip('* ').lstrip('1234567890. ') for line in lines]
                recommendations = [rec for rec in recommendations if len(
                    rec) > 10 and not rec.startswith('#')]

                if recommendations:
                    return recommendations

                return [
                    "Использовать разнообразные источники информации по теме " + topic,
                    "Регулярно делать заметки в процессе изучения материалов",
                    "Структурировать собранную информацию по ключевым аспектам",
                    "Выделять противоречивые точки зрения для дальнейшего анализа",
                    "Формулировать собственные выводы на основе изученного материала"
                ]

            except Exception as e:
                print(f"Ошибка при парсинге ответа: {str(e)}")
                print(f"Полученный ответ: {response_text}")
                return [
                    "Использовать разнообразные источники информации по теме " + topic,
                    "Регулярно делать заметки в процессе изучения материалов",
                    "Структурировать собранную информацию по ключевым аспектам",
                    "Выделять противоречивые точки зрения для дальнейшего анализа",
                    "Формулировать собственные выводы на основе изученного материала"
                ]
        except Exception as e:
            print(f"Ошибка при генерации рекомендаций: {str(e)}")
            raise Exception(f"Ошибка при генерации рекомендаций: {str(e)}")

    async def chat_with_assistant(
        self,
        message: str,
        research_topic: str,
        chat_history: List[Dict[str, str]],
        context: str = ""
    ) -> str:
        try:
            system_prompt = (
                "Ты - исследовательский ассистент, который помогает проводить научные исследования. "
                "Ты должен давать четкие, структурированные ответы, основанные на научном подходе. "
                f"Текущая тема исследования: {research_topic}\n\n"
            )

            if context:
                system_prompt += (
                    "У тебя есть доступ к следующей информации из загруженных документов:\n"
                    f"{context}\n\n"
                    "Используй эту информацию при ответе на вопросы, если она релевантна."
                )

            formatted_history = []
            for msg in chat_history:
                formatted_history.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            formatted_history.append({
                "role": "user",
                "content": message
            })

            data = {
                "model": "gpt-4",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    *formatted_history
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            }

            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json=data
            )

            if response.status_code != 200:
                raise Exception(
                    f"Ошибка API: {response.status_code}, {response.text}")

            response_data = response.json()
            assistant_message = response_data["choices"][0]["message"]["content"]

            return assistant_message

        except Exception as e:
            raise Exception(f"Ошибка при обработке диалога: {str(e)}")

    async def generate_annotation(self, topic: str, context: str = "") -> str:
        try:
            system_prompt = """Ты - исследовательский ассистент. Твоя задача - создать краткую, но информативную аннотацию для научного исследования.
            Аннотация должна отражать основные аспекты исследования, его цели и предполагаемые результаты."""

            user_prompt = f"Тема исследования: {topic}\n"
            if context:
                user_prompt += f"\nКонтекст из документов:\n{context}\n"
            user_prompt += "\nСоздай аннотацию для этого исследования."

            response = await self._make_request(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )

            return response.strip()
        except Exception as e:
            logger.error(f"Ошибка при генерации аннотации: {str(e)}")
            raise


llm_service = LLMService()
