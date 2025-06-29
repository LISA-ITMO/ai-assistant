from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_manager.file_service import FileService
from app.services.rag.vector_db import VectorDBService
from typing import List
from app.schemas.file import FileInfo

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> FileInfo:
    try:
        filename = await FileService.upload_file(file)
        return FileInfo(
            filename=filename,
            size=0,  # Size will be updated when listing files
            uploaded_at="",  # Timestamp will be updated when listing files
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[FileInfo])
async def list_files() -> List[FileInfo]:
    try:
        return FileService.get_file_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{filename}")
async def delete_file(filename: str) -> None:
    try:
        FileService.delete_file(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
