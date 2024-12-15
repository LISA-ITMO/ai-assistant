from langchain.prompts import PromptTemplate


class ResearchGoalsExtractor:
    """
    Модуль для извлечения целей и задач из загруженных статей по определенной теме.
    """

    def __init__(self, llm: object):
        """
        Инициализация ResearchGoalsExtractor с LLM-инстансом.
        Parameters:
        - llm: Ранее инициализированный LLM-инстанс.
        """
        self.llm = llm

    def extract_goals_and_objectives(self, topic: str, articles: list) -> dict:
        """
        Функция для выделения целей и задач из набора статей по определенной теме.

        Parameters:
        - topic: Тема исследования.
        - articles: Список статей.

        Returns:
        - Словарь, содержащий выделенные цели и задачи.
        """
        prompt_template = PromptTemplate(
            input_variables=["topic", "article"],
            template="""
            Пользователь задал следующую тему исследования: "{topic}".

            На основе текста статьи ниже, выделите ключевые цели и задачи, относящиеся к указанной теме:

            Текст статьи:
            {article}

            Пожалуйста, представьте ответ в формате:
            - Цели исследования:
              1. ...
              2. ...
            - Задачи исследования:
              1. ...
              2. ...

            Если статья не связана с темой, напишите: "Статья не содержит информации, связанной с темой."
            """
        )

        results = {}

        for idx, article in enumerate(articles):
            formatted_prompt = prompt_template.format(
                topic=topic, article=article)
            response = self.llm(formatted_prompt)

            results[f"Article_{idx + 1}"] = response

        return results
