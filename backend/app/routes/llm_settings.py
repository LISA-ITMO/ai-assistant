from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, SecretStr
from typing import Optional

from backend.app.config import settings

router = APIRouter(tags=["settings"])


class LLMSettings(BaseModel):
    provider: str
    api_key: SecretStr
    model: Optional[str] = None


@router.post("/settings/llm", status_code=status.HTTP_200_OK)
async def save_llm_settings(llm_settings: LLMSettings):
    try:
        import os
        os.environ[f"{llm_settings.provider.upper()}_API_KEY"] = llm_settings.api_key.get_secret_value()
        if llm_settings.provider.lower() == "openai":
            settings.OPENAI_API_KEY = llm_settings.api_key.get_secret_value()

        return {"status": "success", "message": f"Настройки для {llm_settings.provider} сохранены"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении настроек: {str(e)}"
        )
