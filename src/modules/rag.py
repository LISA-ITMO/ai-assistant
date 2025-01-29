from src.modules.agents import Agent
from src.modules.vector_database import VectorDatabase


class RAG:
    def __init__(self, vector_database: VectorDatabase):
        self.vector_database = vector_database

    def retrieve_articles(self, query: str, num_articles: int):
        vectorstore = self.vector_database.load_vectorstore()
        query_embedding = vectorstore.embed(query)
        articles = vectorstore.retrieve(query_embedding, num_articles)
        return articles
