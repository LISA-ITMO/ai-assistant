from fastapi import APIRouter
from app.services.annotation import AnnotationService
from app.schemas.annotation import AnnotationRequest, AnnotationResponse

router = APIRouter()


@router.post("/generate", response_model=AnnotationResponse)
async def generate_annotation(request: AnnotationRequest):
    annotation, provider = AnnotationService.generate_annotation(
        filename=request.filename,
        provider=request.provider,
        max_length=request.max_length,
        chunk_size=request.chunk_size
    )
    return AnnotationResponse(annotation=annotation, provider=provider)
