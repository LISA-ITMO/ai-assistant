import os
from fastapi import HTTPException
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.utils.pdf_parser import PDFParser
from app.utils.docx_parser import DOCXParser
from app.services.llm.base import BaseLLMService
from app.services.llm.chatgpt import ChatGPTService
from app.services.llm.yandexgpt import YandexGPTService
from app.services.llm.gigachat import GigaChatService
from app.services.llm.deepseek import DeepSeekService


class AnnotationService:
    SUPPORTED_EXTENSIONS = {".pdf", ".docx"}
    DEFAULT_CHUNK_SIZE = 8000
    DEFAULT_CHUNK_OVERLAP = 200
    INTERMEDIATE_ANNOTATION_LENGTH = 100

    @staticmethod
    def get_llm_provider(provider_name: str) -> BaseLLMService:
        providers = {
            "chatgpt": ChatGPTService,
            "yandexgpt": YandexGPTService,
            "gigachat": GigaChatService,
            "deepseek": DeepSeekService
        }
        provider_class = providers.get(provider_name)
        if not provider_class:
            raise HTTPException(
                status_code=400, detail=f"Unsupported LLM provider: {provider_name}")
        return provider_class()

    @staticmethod
    def extract_text(filename: str) -> str:
        file_path = os.path.join("uploads", filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="File not found on disk")

        _, ext = os.path.splitext(filename)
        if ext.lower() not in AnnotationService.SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=400, detail=f"Unsupported file extension: {ext}")

        try:
            if ext.lower() == ".pdf":
                return PDFParser.extract_text_from_pdf(file_path)
            else:
                return DOCXParser.extract_text_from_docx(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error extracting text: {str(e)}")

    @staticmethod
    def split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len
        )
        return text_splitter.split_text(text)

    @staticmethod
    def generate_intermediate_annotation(chunk: str, llm_provider: BaseLLMService) -> str:
        prompt = (
            f"Создайте лаконичную аннотацию (краткое изложение) следующего текста не более чем в {AnnotationService.INTERMEDIATE_ANNOTATION_LENGTH} слов. "
            "Сосредоточьтесь на основных идеях и ключевых моментах. Используйте ясный и профессиональный язык:\n\n"
            f"{chunk}"
        )
        try:
            return llm_provider.generate_response(prompt)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error generating intermediate annotation: {str(e)}")

    @staticmethod
    def generate_final_annotation(intermediate_annotations: list[str], llm_provider: BaseLLMService, max_length: int) -> str:
        combined_text = "\n".join(intermediate_annotations)
        prompt = (
            f"Создайте лаконичную аннотацию (краткое изложение) из следующих объединённых сводок не более чем в {max_length} слов. "
            "Синтезируйте основные идеи, ключевые выводы и назначение оригинальной статьи. Используйте ясный и профессиональный язык:\n\n"
            f"{combined_text}"
        )
        try:
            return llm_provider.generate_response(prompt)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error generating final annotation: {str(e)}")

    @staticmethod
    def generate_annotation(filename: str, provider: str, max_length: int, chunk_size: int) -> tuple[str, str]:
        text = AnnotationService.extract_text(filename)

        llm_provider = AnnotationService.get_llm_provider(provider)

        if len(text) <= chunk_size:
            prompt = (
                f"Создайте лаконичную аннотацию (краткое изложение) следующей статьи не более чем в {max_length} слов. "
                "Сосредоточьтесь на основных идеях, ключевых выводах и назначении статьи. Используйте ясный и профессиональный язык:\n\n"
                f"{text}"
            )
            try:
                annotation = llm_provider.generate_response(prompt)
                return annotation, provider
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Error generating annotation: {str(e)}")

        chunks = AnnotationService.split_text(
            text,
            chunk_size=chunk_size,
            chunk_overlap=AnnotationService.DEFAULT_CHUNK_OVERLAP
        )

        intermediate_annotations = []
        for chunk in chunks:
            annotation = AnnotationService.generate_intermediate_annotation(
                chunk, llm_provider)
            intermediate_annotations.append(annotation)

        final_annotation = AnnotationService.generate_final_annotation(
            intermediate_annotations,
            llm_provider,
            max_length
        )

        return final_annotation, provider
