from fastapi import APIRouter, HTTPException, Body
from backend.app.services.llm_service import llm_service

router = APIRouter()


@router.post("/refine-topic")
async def refine_topic(research_topic: str = Body(..., embed=True)):
    try:
        refined_topic = llm_service.improve_research_topic(research_topic)
        return {"refined_topic": refined_topic}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error refining topic: {str(e)}"
        )
