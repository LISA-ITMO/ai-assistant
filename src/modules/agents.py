from typing import List
import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY


class Agent:
    def __init__(self, role, role_prompt, temperature):
        self.role = role
        self.role_prompt = role_prompt
        self.temperature = temperature

    def generate_response(self, input_text: str, context=None, max_tokens=300) -> str:
        messages = [
            {"role": "system", "content": self.role_prompt},
            {"role": "user", "content": input_text},
        ]
        if context is not None:
            messages.insert(1, {"role": "system", "content": context})
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            max_tokens=max_tokens,
            temperature=self.temperature,
            messages=messages
        )
        return response.choices[0].message.content


class ReviewAgent(Agent):
    def __init__(self):
        super().__init__("Review",
                         "You are a review agent. Provide a review of the scientific article based on its content.",
                         temperature=0.5)

    def generate_review(self, article_text: str) -> str:
        response = self.generate_response(article_text)
        return response

    def summarize_chunk(self, chunk, model="gpt-4-turbo", max_tokens=300):
        response = openai.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a summarization agent. Provide a summary of the following text:"},
                      {"role": "user", "content": f":\n{chunk}"}],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content

    def summarize_large_text(self, text, chunk_size=4000, model="gpt-4-turbo"):
        chunks = [text[i:i+chunk_size]
                  for i in range(0, len(text), chunk_size)]
        summaries = [self.summarize_chunk(
            chunk, model=model) for chunk in chunks]
        final_summary = self.summarize_chunk("\n".join(summaries), model=model)
        return final_summary


class GoalAgent(Agent):
    def __init__(self):
        super().__init__("Goal",
                         "You are a goal agent. Provide a list of goals and tasks for further research.",
                         temperature=0.5)

    def generate_goals(self, topic: str) -> str:
        response = self.generate_response(topic)
        return response


class TopicAgent(Agent):
    def __init__(self):
        super().__init__("Topic",
                         "You are a topic agent. Your task is to slightly expand the topic of the scientific article without changing it too much.",
                         temperature=0.5)

    def generate_topic(self, article_text: str) -> str:
        response = self.generate_response(article_text, max_tokens=100)
        return response


class LitratureAgent(Agent):
    def __init__(self):
        super().__init__("Literature",
                         "You are a literature agent. Provide a literature review based on the collection of articles.",
                         temperature=0.5)

    def generate_literature_review(self, articles: List[str]) -> str:
        response = self.generate_response("\n".join(articles))
        return response


class ArticleAgent(Agent):
    def __init__(self):
        super().__init__("Article",
                         "You are an article agent. Provide a detailed and informative article on the given topic.",
                         temperature=0.5)

    def generate_article(self, topic: str, context: str) -> str:
        response = self.generate_response(topic, context=context)
        return response
