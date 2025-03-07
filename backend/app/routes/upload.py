from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import os
import shutil

router = APIRouter()

os.makedirs("data", exist_ok=True)


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Загрузка нескольких файлов в папку data.

    Args:
        files: Список загружаемых файлов

    Returns:
        Информация о загруженных файлах
    """
    uploaded_files = []

    for file in files:
        try:
            file_path = os.path.join("data", file.filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            uploaded_files.append({
                "filename": file.filename,
                "path": file_path,
                "size": os.path.getsize(file_path)
            })

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Ошибка при загрузке файла {file.filename}: {str(e)}")

    return JSONResponse(
        content={
            "message": f"Успешно загружено {len(uploaded_files)} файлов",
            "files": uploaded_files
        },
        status_code=200
    )
