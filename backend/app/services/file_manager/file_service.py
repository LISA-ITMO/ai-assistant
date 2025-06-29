import os
import shutil
import logging
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
# from app.models.file import File
from app.services.rag.vector_db import VectorDBService
from datetime import datetime
from typing import List, Dict

logger = logging.getLogger(__name__)


class FileService:
    UPLOAD_DIR = "uploads"
    SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx"}

    @staticmethod
    async def upload_file(file: UploadFile) -> str:
        try:
            logger.info(f"Starting file upload for {file.filename}")
            file_path = FileService.save_file(file)
            logger.info(
                f"File {file.filename} uploaded successfully to {file_path}")
            return file.filename  # Return only the filename instead of full path
        except Exception as e:
            logger.error(
                f"Error uploading file {file.filename}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def save_file(file: UploadFile) -> str:
        try:
            os.makedirs(FileService.UPLOAD_DIR, exist_ok=True)
            logger.info(
                f"Upload directory checked/created: {FileService.UPLOAD_DIR}")

            # Sanitize filename
            filename = file.filename.replace(" ", "_")
            _, ext = os.path.splitext(filename)
            if ext.lower() not in FileService.SUPPORTED_EXTENSIONS:
                raise HTTPException(
                    status_code=400, detail=f"Unsupported file extension: {ext}")

            file_path = os.path.join(FileService.UPLOAD_DIR, filename)
            logger.info(f"Target file path: {file_path}")

            if os.path.exists(file_path):
                raise HTTPException(
                    status_code=400, detail="File already exists")

            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file.file.close()
                logger.info(f"File {filename} saved successfully")
            except Exception as e:
                logger.error(
                    f"Error during file save: {str(e)}", exc_info=True)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up partial file: {file_path}")
                raise HTTPException(
                    status_code=500, detail=f"Error saving file: {str(e)}")

            return str(file_path)
        except Exception as e:
            logger.error(
                f"Unexpected error in save_file: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def delete_file(filename: str) -> None:
        try:
            logger.info(f"Attempting to delete file: {filename}")
            file_path = os.path.join(FileService.UPLOAD_DIR, filename)

            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                raise HTTPException(status_code=404, detail="File not found")

            try:
                os.remove(file_path)
                logger.info(f"File deleted successfully: {file_path}")
                VectorDBService.delete_chunks_by_filename(filename)
                logger.info(f"Vector DB chunks deleted for file: {filename}")
            except Exception as e:
                logger.error(
                    f"Error deleting file {filename}: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=500, detail=f"Error deleting file: {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error in delete_file: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_file_list() -> List[Dict]:
        try:
            os.makedirs(FileService.UPLOAD_DIR, exist_ok=True)
            logger.info("Getting file list from directory: %s",
                        FileService.UPLOAD_DIR)

            files = []
            for filename in os.listdir(FileService.UPLOAD_DIR):
                file_path = os.path.join(FileService.UPLOAD_DIR, filename)

                if not os.path.isfile(file_path):
                    continue

                _, ext = os.path.splitext(filename)
                if ext.lower() not in FileService.SUPPORTED_EXTENSIONS:
                    continue

                try:
                    stats = os.stat(file_path)
                    files.append({
                        "filename": filename,
                        "size": stats.st_size,
                        "uploaded_at": datetime.fromtimestamp(stats.st_mtime).isoformat()
                    })
                    logger.debug(
                        f"Added file to list: {filename}, size: {stats.st_size}, date: {datetime.fromtimestamp(stats.st_mtime).isoformat()}")
                except Exception as e:
                    logger.error(
                        f"Error getting stats for file {filename}: {str(e)}", exc_info=True)
                    continue

            files.sort(key=lambda x: x["uploaded_at"], reverse=True)
            logger.info(f"Found {len(files)} files")
            return files

        except Exception as e:
            logger.error(f"Error getting file list: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500, detail=f"Error getting file list: {str(e)}")
