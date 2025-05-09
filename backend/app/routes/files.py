from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import os
import shutil
from ..core.config import settings


router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
async def list_files():
    try:
        files = []
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path) and filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt', '.csv', '.xlsx', '.xls')):
                files.append({
                    "filename": filename,
                    "size": os.path.getsize(file_path)
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка файлов: {str(e)}"
        )


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    uploaded_files = []

    try:
        for file in files:

            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, safe_filename)

            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка при сохранении файла {file.filename}: {str(e)}"
                )

            uploaded_files.append({
                "filename": safe_filename,
                "size": os.path.getsize(file_path)
            })

        return JSONResponse(
            content={
                "message": f"Успешно загружено {len(uploaded_files)} файлов",
                "files": uploaded_files
            },
            status_code=200
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке файлов: {str(e)}"
        )


@router.delete("/{filename}")
async def delete_file(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail=f"Файл {filename} не найден"
            )

        os.remove(file_path)
        return {"message": f"Файл {filename} успешно удален"}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении файла {filename}: {str(e)}"
        )
