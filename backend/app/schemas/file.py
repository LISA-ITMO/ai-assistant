from pydantic import BaseModel
from datetime import datetime


class FileInfo(BaseModel):
    filename: str
    size: int
    uploaded_at: str
