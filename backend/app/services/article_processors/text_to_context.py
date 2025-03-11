from typing import Dict, List
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter


class PDFContextProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False
        )

    def _process_text(self, text: str) -> List[str]:
        return self.text_splitter.split_text(text)

    def _process_tables(self, tables: List[pd.DataFrame]) -> List[str]:
        table_texts = []
        for idx, table in enumerate(tables):
            table_text = f"Table {idx + 1}:\n{table.to_string()}"
            table_chunks = self.text_splitter.split_text(table_text)
            table_texts.extend(table_chunks)
        return table_texts

    def _process_images(self, images: List[Dict]) -> List[str]:
        image_texts = []
        for img in images:
            image_text = f"Image on page {img['page_num']}, index {img['image_index']}, format: {img['extension']}"
            image_texts.append(image_text)
        return image_texts

    def process_pdf_content(self, pdf_content: Dict) -> List[str]:
        context_chunks = []

        if pdf_content.get('text'):
            text_chunks = self._process_text(pdf_content['text'])
            context_chunks.extend(text_chunks)

        if pdf_content.get('tables'):
            table_chunks = self._process_tables(pdf_content['tables'])
            context_chunks.extend(table_chunks)

        if pdf_content.get('images'):
            image_descriptions = self._process_images(pdf_content['images'])
            context_chunks.extend(image_descriptions)

        return context_chunks
