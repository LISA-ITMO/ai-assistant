from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename, "size": len(content)}
