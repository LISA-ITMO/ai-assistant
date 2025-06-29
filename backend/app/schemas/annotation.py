from pydantic import BaseModel, Field
from typing import Literal


class AnnotationRequest(BaseModel):
    filename: str = Field(...,
                          description="Name of the PDF or DOCX file to annotate")
    provider: Literal["chatgpt", "yandexgpt", "gigachat", "deepseek"] = Field(
        ..., description="LLM provider to use for annotation"
    )
    max_length: int = Field(
        200, ge=50, le=500, description="Maximum length of the annotation in words")
    chunk_size: int = Field(8000, ge=1000, le=10000,
                            description="Size of text chunks for long documents")


class AnnotationResponse(BaseModel):
    annotation: str = Field(...,
                            description="Generated annotation for the article")
    provider: str = Field(..., description="LLM provider used for annotation")
