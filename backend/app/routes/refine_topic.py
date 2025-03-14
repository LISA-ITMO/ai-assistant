from fastapi import APIRouter, HTTPException, Body
from backend.app.services.llm_service import improve_research_topic

router = APIRouter()


@router.post("/refine-topic")
async def refine_topic(research_topic: str = Body(..., embed=True)):
    try:
        refined_topic = improve_research_topic(research_topic)
        return {"refined_topic": refined_topic}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error refining topic: {str(e)}"
        )
