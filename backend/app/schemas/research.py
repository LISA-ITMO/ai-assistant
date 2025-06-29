from pydantic import BaseModel
from typing import List
from app.schemas.chat import LLMProvider


class TopicRefinementRequest(BaseModel):
    topic: str
    provider: LLMProvider
    temperature: float = 0.7
    max_length: int = 200


class TopicRefinementResponse(BaseModel):
    refined_topic: str


class ResearchPlanRequest(BaseModel):
    topic: str
    provider: LLMProvider
    temperature: float = 0.7
    max_length: int = 200


class ResearchPlanResponse(BaseModel):
    goal: str
    tasks: List[str]


class ResearchTopicRequest(BaseModel):
    topic: str
    provider: LLMProvider = LLMProvider.CHATGPT


class ResearchTopicResponse(BaseModel):
    refined_topic: str
    provider: str
