from app.services.chat import ChatService
from app.schemas.chat import LLMProvider


class ResearchPlanService:
    @staticmethod
    def generate_research_plan(topic: str, provider: LLMProvider) -> dict:
        prompt = f"""
        Вы являетесь экспертным ассистентом по исследованиям. Опираясь на предоставленную тему исследования, создайте:
        1. Четкую и ёмкую цель исследования (одно предложение).
        2. Список из 3–5 конкретных задач для достижения этой цели.
        
        Тема: {topic}
        
        Отформатируйте ответ следующим образом:
        Цель: [Ваша цель исследования]
        Задачи:
        - [Задача 1]
        - [Задача 2]
        - [Задача 3]
        - [Задача 4]
        - [Задача 5]
        """

        response, provider_name, _ = ChatService.generate_response(
            prompt, provider)

        lines = response.strip().split("\n")
        goal = ""
        tasks = []
        is_tasks_section = False

        for line in lines:
            line = line.strip()
            if line.startswith("Цель:"):
                goal = line.replace("Цель:", "").strip()
            elif line.startswith("Задачи:"):
                is_tasks_section = True
            elif is_tasks_section and line.startswith("-"):
                tasks.append(line.replace("-", "").strip())

        return {
            "goal": goal,
            "tasks": tasks,
            "provider": provider_name
        }
