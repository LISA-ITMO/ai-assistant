from fastapi import APIRouter, Body, HTTPException
from backend.app.services.llm_service import llm_service

router = APIRouter()


@router.post("/goals")
async def generate_goals(research_topic: str = Body(..., embed=True)):
    try:
        goals_and_tasks = await llm_service.generate_research_goals(research_topic)
        print("Generated goals and tasks:", goals_and_tasks)
        return goals_and_tasks
    except Exception as e:
        print(f"Error in generate_goals endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
