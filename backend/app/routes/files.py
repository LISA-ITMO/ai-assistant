from fastapi import APIRouter, HTTPException, UploadFile, File
import os
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Путь к директории с загруженными файлами
UPLOAD_DIR = "backend/app/data/uploads"


class FileInfo(BaseModel):
    name: str
    size: int


class FileList(BaseModel):
    files: List[FileInfo]


@router.get("/files", response_model=FileList)
async def get_files():
    """
    Получение списка всех загруженных файлов
    """
    try:
        # Создаем директорию, если она не существует
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Получаем список файлов
        files = []
        for filename in os.listdir(UPLOAD_DIR):
            if filename.endswith('.pdf'):  # Проверяем только PDF файлы
                file_path = os.path.join(UPLOAD_DIR, filename)
                file_size = os.path.getsize(file_path)
                files.append(FileInfo(name=filename, size=file_size))

        return FileList(files=files)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ошибка при получении списка файлов: {str(e)}")


@router.post("/files/upload")
async def upload_file(files: List[UploadFile] = File(...)):
    """
    Загрузка файлов на сервер
    """
    try:
        # Создаем директорию, если она не существует
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        uploaded_files = []
        for file in files:
            # Сохраняем файл на сервере
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())
            uploaded_files.append(file.filename)

        return {"files": uploaded_files}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ошибка при загрузке файлов: {str(e)}")


@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """
    Удаление файла по имени
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Проверяем существование файла
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail=f"Файл {filename} не найден")

        # Удаляем файл
        os.remove(file_path)

        return {"message": f"Файл {filename} успешно удален"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ошибка при удалении файла: {str(e)}")
