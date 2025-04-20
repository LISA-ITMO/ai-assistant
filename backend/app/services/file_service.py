from typing import Optional
from fastapi import HTTPException
import os
from pathlib import Path
import aiofiles
import logging
from ..core.config import settings
import PyPDF2
from docx import Document
import io

logger = logging.getLogger(__name__)


async def get_file_content(file_id: str, research_id: str) -> str:
    try:
        research_dir = Path(settings.UPLOAD_DIR) / research_id

        file_pattern = f"{file_id}.*"
        matching_files = list(research_dir.glob(file_pattern))

        if not matching_files:
            raise HTTPException(
                status_code=404,
                detail=f"Файл не найден: {file_id}"
            )

        file_path = matching_files[0] 
        file_extension = file_path.suffix.lower()

        if file_extension == '.txt':
            async with aiofiles.open(file_path, mode='r', encoding='utf-8') as file:
                try:
                    content = await file.read()
                except UnicodeDecodeError:
                    async with aiofiles.open(file_path, mode='r', encoding='latin-1') as file:
                        content = await file.read()

        elif file_extension == '.pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                content = []
                for page in pdf_reader.pages:
                    content.append(page.extract_text())
                content = '\n'.join(content)

        elif file_extension in ['.doc', '.docx']:
            doc = Document(file_path)
            content = []
            for paragraph in doc.paragraphs:
                if paragraph.text:
                    content.append(paragraph.text)
            content = '\n'.join(content)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый формат файла: {file_extension}"
            )

        if not content:
            raise HTTPException(
                status_code=400,
                detail=f"Не удалось извлечь текст из файла: {file_id}"
            )

        logger.info(
            f"Успешно прочитано содержимое файла {file_id} формата {file_extension}")
        return content

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при чтении файла {file_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при чтении файла: {str(e)}"
        )
