import os

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if not OPENAI_API_KEY:
    raise ValueError("Не удалось найти переменную окружения 'OPENAI_API_KEY'")
