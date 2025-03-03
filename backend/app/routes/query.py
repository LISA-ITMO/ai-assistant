from fastapi import APIRouter
from backend.app.services import llm_service

router = APIRouter()


@router.post("/query")
async def query_endpoint(payload: dict):
    query_text = payload.get("query", "")
    response_text = llm_service.call_openai(query_text)
    return {"query": query_text, "response": response_text}
