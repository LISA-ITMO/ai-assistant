from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Optional
import os

from backend.app.core.config import settings
from backend.app.models import UploadedFile


class VectorService:
    def __init__(self, api_key: Optional[str] = None):
        self.embeddings = OpenAIEmbeddings(
            api_key=api_key or settings.OPENAI_API_KEY
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.vector_store = None
        self.vector_store_path = "vector_store"

    async def process_pdf(self, file_path: str) -> List[str]:
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        texts = self.text_splitter.split_documents(pages)
        return texts

    async def add_documents_to_vector_store(self, documents: List[str], research_topic_id: int):
        if not os.path.exists(self.vector_store_path):
            self.vector_store = FAISS.from_documents(
                documents, self.embeddings
            )
            self.vector_store.save_local(
                f"{self.vector_store_path}/{research_topic_id}")
        else:
            existing_store = FAISS.load_local(
                f"{self.vector_store_path}/{research_topic_id}",
                self.embeddings
            )
            existing_store.add_documents(documents)
            existing_store.save_local(
                f"{self.vector_store_path}/{research_topic_id}")

    async def vectorize_uploaded_files(self, files: List[UploadedFile], research_topic_id: int):
        all_documents = []
        for file in files:
            file_documents = await self.process_pdf(file.file_path)
            all_documents.extend(file_documents)

        await self.add_documents_to_vector_store(all_documents, research_topic_id)
        return len(all_documents)
