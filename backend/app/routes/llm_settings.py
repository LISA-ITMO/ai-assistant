from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, SecretStr
from typing import Optional
import os
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database import get_db
from backend.app.models import APIKey

router = APIRouter(tags=["settings"])


class LLMSettings(BaseModel):
    provider: str
    api_key: SecretStr
    model: Optional[str] = None


@router.post("/settings/llm", status_code=status.HTTP_200_OK)
async def save_llm_settings(llm_settings: LLMSettings, db: Session = Depends(get_db)):
    try:
        api_key = APIKey(
            provider=llm_settings.provider,
            key=llm_settings.api_key.get_secret_value()
        )
        db.add(api_key)
        db.commit()

        os.environ[f"{llm_settings.provider.upper()}_API_KEY"] = llm_settings.api_key.get_secret_value()
        if llm_settings.provider.lower() == "openai":
            settings.OPENAI_API_KEY = llm_settings.api_key.get_secret_value()

        return {"status": "success", "message": f"Настройки для {llm_settings.provider} сохранены"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении настроек: {str(e)}"
        )
