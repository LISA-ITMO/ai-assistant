from abc import ABC, abstractmethod
from langchain_core.prompts import ChatPromptTemplate


class BaseLLMService(ABC):
    def __init__(self):
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Answer the user's question concisely and accurately."),
            ("user", "{prompt}")
        ])

    @abstractmethod
    def get_llm(self):
        pass

    def generate_response(self, prompt: str) -> str:
        llm = self.get_llm()
        chain = self.prompt_template | llm
        response = chain.invoke({"prompt": prompt})
        return response.content
