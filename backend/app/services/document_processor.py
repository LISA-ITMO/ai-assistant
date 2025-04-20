import os
from typing import List, Dict, Any, Optional
import nltk
import fitz
from nltk.tokenize import sent_tokenize
import logging


logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')


class DocumentProcessor:

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Инициализация процессора документов

        Args:
            chunk_size: Максимальный размер чанка в символах
            chunk_overlap: Размер перекрытия между соседними чанками в символах
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        logger.info(
            f"Инициализирован DocumentProcessor с размером чанка {chunk_size} и перекрытием {chunk_overlap}")

    def process_file(self, file_path: str) -> Dict[str, Any]:
        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == '.pdf':
            return self._process_pdf(file_path)
        elif file_ext in ['.txt', '.md']:
            return self._process_text_file(file_path)
        elif file_ext in ['.docx', '.doc']:
            return self._process_word_document(file_path)
        else:
            raise ValueError(f"Неподдерживаемый формат файла: {file_ext}")

    def _process_pdf(self, file_path: str) -> Dict[str, Any]:
        try:
            doc = fitz.open(file_path)
            text = ""
            metadata = {
                "title": doc.metadata.get("title", os.path.basename(file_path)),
                "author": doc.metadata.get("author", "Неизвестный автор"),
                "pages": len(doc),
                "file_name": os.path.basename(file_path),
                "file_path": file_path,
                "file_type": "pdf"
            }

            for page in doc:
                text += page.get_text()

            return {
                "metadata": metadata,
                "text": text
            }
        except Exception as e:
            logger.error(
                f"Ошибка при обработке PDF файла {file_path}: {str(e)}")
            raise

    def _process_text_file(self, file_path: str) -> Dict[str, Any]:
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()

            metadata = {
                "title": os.path.basename(file_path),
                "author": "Неизвестный автор",
                "file_name": os.path.basename(file_path),
                "file_path": file_path,
                "file_type": "text"
            }

            return {
                "metadata": metadata,
                "text": text
            }
        except Exception as e:
            logger.error(
                f"Ошибка при обработке текстового файла {file_path}: {str(e)}")
            raise

    def _process_word_document(self, file_path: str) -> Dict[str, Any]:
        try:
            import docx

            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

            metadata = {
                "title": os.path.basename(file_path),
                "author": doc.core_properties.author if hasattr(doc, 'core_properties') and hasattr(doc.core_properties, 'author') else "Неизвестный автор",
                "file_name": os.path.basename(file_path),
                "file_path": file_path,
                "file_type": "docx"
            }

            return {
                "metadata": metadata,
                "text": text
            }
        except ImportError:
            logger.error(
                "Библиотека python-docx не установлена. Установите ее с помощью pip install python-docx")
            raise
        except Exception as e:
            logger.error(
                f"Ошибка при обработке Word документа {file_path}: {str(e)}")
            raise

    def create_chunks(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:

        sentences = sent_tokenize(text)

        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) > self.chunk_size and current_chunk:
                chunk_data = {
                    "text": current_chunk.strip(),
                    "metadata": metadata.copy(),
                    "chunk_id": len(chunks)
                }
                chunks.append(chunk_data)

                words = current_chunk.split()
                overlap_words = words[-min(len(words),
                                           self.chunk_overlap // 5):]
                current_chunk = " ".join(overlap_words) + " " + sentence
            else:
                current_chunk += " " + sentence

        if current_chunk.strip():
            chunk_data = {
                "text": current_chunk.strip(),
                "metadata": metadata.copy(),
                "chunk_id": len(chunks)
            }
            chunks.append(chunk_data)

        logger.info(
            f"Создано {len(chunks)} чанков из документа {metadata['file_name']}")
        return chunks


if __name__ == "__main__":
    document_processor = DocumentProcessor()
    print(document_processor.process_file(
        "/home/roman/University/Diploma/ai-assistant/backend/uploads/CV_Roman_Kharkovskoy.pdf"))
