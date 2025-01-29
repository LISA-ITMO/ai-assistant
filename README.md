# A.R.T.H.U.R.
> A.R.T.H.U.R. - Academic Research Tool for Helpful Understanding and Retrieval.

## Описание
A.R.T.H.U.R. - это инструмент для академических исследований, который помогает загружать, обрабатывать и анализировать научные статьи. Он использует возможности OpenAI и других инструментов для генерации обзоров, аннотаций и целей исследований.

## Установка

1. Клонируйте репозиторий:
   ```sh
   git clone https://github.com/yourusername/ai-assistant.git
   cd ai-assistant
    ```
2. Создайте и активируйте виртуальное окружение:
    ```sh
    python -m venv venv
    source venv/bin/activate
    ```
3. Установите зависимости:
    ```
    pip install -r requirements.txt
    ```
4. Установите переменные окружения:
    ```
    export OPENAI_API_KEY=<your_openai_api_key>
    ```

## Использование
### Запуск приложения
1. Установите переменную окружения PYTHONPATH:
    ```
    export PYTHONPATH=$(pwd)
    ```
2. Запустите приложение Streamlit:
    ```
    streamlit run src/app.py
    ```
### Основные вкладки
- Upload: Загрузка PDF-файлов научных статей.
- Materials: Просмотр загруженных статей, генерация аннотаций и обзоров литературы.
- Generate: Генерация статей на основе заданной темы.
- Settings: Настройки длины статьи, стиля написания и языка.

## Структура проекта
```
ai-assistant/
├── src/
│   ├── app.py
│   ├── modules/
│   │   ├── agents.py
│   │   ├── rag.py
│   │   └── vector_database.py
│   └── utils/
│       ├── file_io.py
│       └── ...
├── uploaded_files/
├── venv/
├── requirements.txt
└── README.md
```
### Основные модули 
- `app.py`: Основной файл приложения Streamlit.
- `modules/agents.py`: Определение агентов для генерации обзоров и целей исследований.
- `modules/rag.py`: Реализация Retrieval-Augmented Generation (RAG) для поиска и обработки статей.
- `modules/vector_database.py`: Работа с векторной базой данных для хранения и поиска статей.
- `utils/file_io.py`: Утилиты для работы с файлами, включая загрузку и предобработку PDF-файлов.
