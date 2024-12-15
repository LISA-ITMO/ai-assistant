import streamlit as st
from modules.module_preprocessing import Preprocessor
from modules.module_llm_chat import initialize_llm, generate_response
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceInstructEmbeddings


llm = initialize_llm()


def set_page(page_name):
    st.session_state.current_page = page_name


if "current_page" not in st.session_state:
    st.session_state.current_page = "upload"


PAGES = {}


def register_page(name, func):
    """Регистрирует новую страницу."""
    PAGES[name] = func


def render_current_page():
    """Рендерит текущую страницу."""
    page_func = PAGES.get(st.session_state.current_page)
    if page_func:
        page_func()
    else:
        st.error("Страница не найдена")


def upload_page():
    st.title("Загрузка файлов")
    uploaded_files = st.file_uploader(
        label="Выберите файлы",
        accept_multiple_files=True,
        type=["txt", "pdf", "md", "docx"]
    )

    preprocessor = Preprocessor(uploaded_files=uploaded_files)

    def files_to_faiss():
        if uploaded_files:
            preprocessor.extract_text()
            preprocessor.save_to_vector_db()
            st.success("Файлы успешно обработаны и сохранены в базу данных.")
        else:
            st.error("Не удалось обработать файлы. Пожалуйста, выберите файлы.")

    st.button(
        label="Загрузить",
        on_click=files_to_faiss
    )
    st.button(
        label="Перейти к чату",
        on_click=lambda: set_page("chat")
    )


def chat_page():
    st.title("Чат с LLM")
    user_question = st.text_input("Введите ваш вопрос:")

    if user_question:
        context = ""
        response = generate_response(llm, context, user_question)

        st.subheader("Ответ:")
        st.write(response)

    st.button(
        label="Вернуться к загрузке файлов",
        on_click=lambda: set_page("upload")
    )


register_page("upload", upload_page)
register_page("chat", chat_page)

render_current_page()
