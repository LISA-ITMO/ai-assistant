from fastapi import APIRouter, HTTPException, Depends, Body, Header, UploadFile, Query
from typing import Optional, Dict, List, Any
from pydantic import BaseModel
from ..services.llm_service import LLMService
from ..services.vectorstore_service import VectorStoreService
import time
import os
from fastapi.responses import JSONResponse
from ..services.rag_engine import RAGEngine
from ..services.file_service import get_file_content
from ..services.vector_service import DocumentVectorizer
from ..services.vector_store import VectorStore

router = APIRouter(
    prefix="/research",
    tags=["research"],
    responses={404: {"description": "Not found"}},
)

vector_store = VectorStoreService()


class ResearchTopicRequest(BaseModel):
    research_topic: str


class ResearchRecommendationsResponse(BaseModel):
    recommendations: List[str]


class ResearchGoals(BaseModel):
    goals: List[str]
    tasks: List[str]


class ChatRequest(BaseModel):
    message: str
    research_topic: str
    research_id: str
    chat_history: List[Dict[str, str]]


class EvaluationRequest(BaseModel):
    research_id: str
    topic: str
    reference_annotation: str
    num_samples: Optional[int] = 5


class ResearchReportRequest(BaseModel):
    topic: str
    goals: List[str]
    tasks: List[str]
    notes: str
    recommendations: List[str]
    analysis: Dict[str, Any]
    settings: Dict[str, Any]


@router.post("/generate-goals", response_model=ResearchGoals)
async def generate_research_goals(
    request: ResearchTopicRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="API ключ не предоставлен")

    api_key = authorization.replace("Bearer ", "")
    llm_service = LLMService(api_key)

    try:
        result = await llm_service.generate_research_goals(request.research_topic)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-recommendations", response_model=ResearchRecommendationsResponse)
async def generate_research_recommendations(
    request: ResearchTopicRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="API ключ не предоставлен")

    api_key = authorization.replace("Bearer ", "")
    llm_service = LLMService(api_key)

    try:
        recommendations = await llm_service.generate_research_recommendations(request.research_topic)
        if not isinstance(recommendations, list):
            raise ValueError(
                f"Неверный формат рекомендаций: {recommendations}")

        recommendations = [str(item) for item in recommendations]

        return {"recommendations": recommendations}
    except Exception as e:
        import traceback
        print(f"Ошибка при генерации рекомендаций: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-file")
async def upload_file(
    file: UploadFile,
    research_id: str = Query(...),
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="API ключ не предоставлен"
        )

    try:
        allowed_extensions = ['.txt', '.doc', '.docx', '.pdf']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый формат файла. Разрешены только: {', '.join(allowed_extensions)}"
            )

        content = await file.read()

        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                text_content = content.decode('latin-1')
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Не удалось прочитать содержимое файла: {str(e)}"
                )

        file_id = f"file_{int(time.time())}"

        try:
            await vector_store.vectorize_document(research_id, file_id, text_content)
        except Exception as e:
            logger.error(f"Ошибка при векторизации файла: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка при векторизации файла: {str(e)}"
            )

        return JSONResponse(
            content={
                "message": "Файл успешно загружен и векторизован",
                "file_id": file_id,
                "original_filename": file.filename
            },
            status_code=200
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при загрузке файла: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке файла: {str(e)}"
        )


@router.post("/chat")
async def chat_with_assistant(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="API ключ не предоставлен")

    try:
        api_key = authorization.replace("Bearer ", "")
        llm_service = LLMService(api_key)

        if not request.research_id or not request.message:
            raise HTTPException(
                status_code=400,
                detail="Отсутствуют обязательные параметры: research_id и message"
            )

        try:
            relevant_chunks = await vector_store.search_similar_chunks(
                request.research_id,
                request.message
            )
        except Exception as e:
            logger.error(f"Ошибка при поиске в векторном хранилище: {str(e)}")
            relevant_chunks = []

        # Добавляем контекст к запросу
        context = "\n\n".join(relevant_chunks) if relevant_chunks else ""

        response = await llm_service.chat_with_assistant(
            message=request.message,
            research_topic=request.research_topic,
            chat_history=request.chat_history,
            context=context
        )
        return {"message": response}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка в чате: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обработке запроса: {str(e)}"
        )


@router.get("/files")
async def get_research_files(research_id: str):
    """Получает список файлов для исследования"""
    try:
        research_path = f"{vector_store.vector_store_path}/{research_id}"
        if not os.path.exists(research_path):
            return {"files": []}

        files = []
        for filename in os.listdir(research_path):
            if filename.endswith(".json"):
                file_id = filename[:-5]
                files.append({
                    "id": file_id,
                    "name": file_id,
                    "status": "vectorized"
                })

        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-annotation")
async def generate_annotation(
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="API ключ не предоставлен")

    try:
        api_key = authorization.replace("Bearer ", "")
        file_id = request.get("file_id")
        research_id = request.get("research_id")

        if not file_id or not research_id:
            raise HTTPException(
                status_code=400,
                detail="Необходимо указать file_id и research_id"
            )

        file_content = await get_file_content(file_id, research_id)

        llm_service = LLMService(api_key)
        vectorizer = DocumentVectorizer()
        vector_store = VectorStore()
        rag_engine = RAGEngine(vectorizer, vector_store)

        context = rag_engine.generate_context(file_content)

        annotation = await llm_service.generate_annotation(
            topic=file_content,
            context=context
        )

        return {"annotation": annotation}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при генерации аннотации: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при генерации аннотации: {str(e)}"
        )


@router.post("/generate-report")
async def generate_research_report(
    request: ResearchReportRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="API ключ не предоставлен")

    api_key = authorization.replace("Bearer ", "")
    llm_service = LLMService(api_key)

    try:
        print("Received request data:", request.dict())

        report_data = {
            "topic": request.topic,
            "goals": request.goals if request.settings.get("includeGoals", True) else [],
            "tasks": request.tasks if request.settings.get("includeTasks", True) else [],
            "notes": request.notes if request.settings.get("includeNotes", True) else "",
            "recommendations": request.recommendations if request.settings.get("includeRecommendations", True) else [],
            "analysis": {
                "keyTerms": request.analysis.get("keyTerms", []) if request.settings.get("includeKeyTerms", True) else [],
                "approaches": request.analysis.get("approaches", []) if request.settings.get("includeApproaches", True) else [],
                "comparison": request.analysis.get("comparison", "") if request.settings.get("includeComparison", True) else "",
                "strengths": request.analysis.get("strengths", "") if request.settings.get("includeStrengthsWeaknesses", True) else "",
                "weaknesses": request.analysis.get("weaknesses", "") if request.settings.get("includeStrengthsWeaknesses", True) else "",
                "ownPosition": request.analysis.get("ownPosition", "") if request.settings.get("includeOwnPosition", True) else ""
            },
            "style": request.settings.get("style", "academic"),
            "format": request.settings.get("format", "markdown"),
            "language": request.settings.get("language", "ru"),
            "useRAG": request.settings.get("useRAG", False)
        }

        print("Prepared report data:", report_data)

        report = await llm_service.generate_research_report(report_data)
        print("Generated report:", report)

        return {"report": report}
    except Exception as e:
        import traceback
        print(f"Ошибка при генерации отчета: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
