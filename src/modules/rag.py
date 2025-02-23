from src.modules.agents import Agent
from src.modules.vector_database import VectorDatabase


class RAG:
    """
    A class to represent a Retrieval-Augmented Generation (RAG) system.

    Attributes
    ----------
    vector_database : VectorDatabase
        An instance of the VectorDatabase class used for embedding and retrieving articles.

    Methods
    -------
    retrieve_articles(query: str, num_articles: int):
        Retrieves a specified number of articles based on the query.

    retrieve_articles_with_metadata(query: str, num_articles: int):
        Retrieves a specified number of articles along with their metadata based on the query.

    retrieve_and_summarize(query: str, num_articles: int):
        Retrieves a specified number of articles based on the query and returns their summaries.
    """

    def __init__(self, vector_database: VectorDatabase):
        self.vector_database = vector_database

    def retrieve_articles(self, query: str, num_articles: int):
        vectorstore = self.vector_database.load_vectorstore()
        query_embedding = vectorstore.embed(query)
        articles = vectorstore.retrieve(query_embedding, num_articles)
        return articles

    def retrieve_articles_with_metadata(self, query: str, num_articles: int):
        vectorstore = self.vector_database.load_vectorstore()
        query_embedding = vectorstore.embed(query)
        articles = vectorstore.retrieve(query_embedding, num_articles)
        articles_with_metadata = [
            {"title": article.title, "content": article.content,
                "metadata": article.metadata}
            for article in articles
        ]
        return articles_with_metadata

    def retrieve_and_summarize(self, query: str, num_articles: int):
        articles = self.retrieve_articles(query, num_articles)
        summaries = [self.summarize(article.content) for article in articles]
        return summaries
