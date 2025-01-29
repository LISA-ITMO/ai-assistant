from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document


class VectorDatabase:
    def __init__(self, embedding_model, vectorstore_path):
        self.embedding_model = embedding_model
        self.vectorstore_path = vectorstore_path

    def process_and_store_articles(self, articles):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200)
        documents = [Document(page_content=chunk)
                     for article in articles for chunk in text_splitter.split_text(article)]

        embeddings = OpenAIEmbeddings(model=self.embedding_model)

        vectorstore = FAISS.from_documents(documents, embeddings)
        vectorstore.save_local(self.vectorstore_path)

    def load_vectorstore(self):
        return FAISS.load_local(self.vectorstore_path)
