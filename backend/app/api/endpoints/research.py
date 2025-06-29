from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.research import ResearchPlanRequest, ResearchPlanResponse, ResearchTopicRequest, ResearchTopicResponse
from app.schemas.annotation import AnnotationRequest, AnnotationResponse
from app.services.chat import ChatService
from app.services.research import ResearchPlanService
from app.services.research_refinement import ResearchRefinementService
from app.services.annotation import AnnotationService

router = APIRouter()
research_plan_service = ResearchPlanService()
research_topic_service = ResearchRefinementService()


@router.post("/plan", response_model=ResearchPlanResponse)
def generate_research_plan(request: ResearchPlanRequest):
    try:
        result = research_plan_service.generate_research_plan(
            request.topic, request.provider
        )
        return ResearchPlanResponse(goal=result["goal"], tasks=result["tasks"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating research plan: {str(e)}")


@router.post("/topic", response_model=ResearchTopicResponse)
def refine_research_topic(request: ResearchTopicRequest):
    try:
        refined_topic, provider = research_topic_service.refine_research_topic(
            request.topic, request.provider
        )
        return ResearchTopicResponse(refined_topic=refined_topic, provider=provider)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error refining research topic: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
def generate_chat_response(request: ChatRequest):
    try:
        response, provider, context = ChatService.generate_response(
            request.prompt, request.provider, request.use_rag, request.top_k
        )
        return ChatResponse(response=response, provider=provider, context=context)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}")
