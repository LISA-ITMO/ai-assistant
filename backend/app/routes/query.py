from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from backend.app.services import llm_service

router = APIRouter()


class QueryRequest(BaseModel):
    query: str = Field(...,
                       description="The text query to process", min_length=1)


class QueryResponse(BaseModel):
    query: str
    response: str


@router.post("/query", response_model=QueryResponse, status_code=status.HTTP_200_OK)
async def query_endpoint(payload: QueryRequest):
    try:
        query_text = payload.query
        response_text = llm_service.call_openai(query_text)
        return QueryResponse(query=query_text, response=response_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )
