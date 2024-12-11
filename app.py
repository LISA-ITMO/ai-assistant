import streamlit as st
from modules.module_preprocessing import Preprocessor
from modules.module_llm_chat import initialize_llm, generate_response
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceInstructEmbeddings


llm = initialize_llm()
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': True}
hf_embedding = HuggingFaceInstructEmbeddings(
    model_name="hkunlp/instructor-large",
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)
db = FAISS.load_local("ai-assistant/vector_db",
                      embeddings=hf_embedding,
                      allow_dangerous_deserialization=True)

if "current_screen" not in st.session_state:
    st.session_state.current_screen = "upload"


def switch_to_chat():
    st.session_state.current_screen = "chat"


def upload_screen():
    st.title("Загрузка файлов")
    uploaded_files = st.file_uploader(
        "Выберите файлы", accept_multiple_files=True, type=["txt", "pdf", "md", "docx"])

    preprocessor = Preprocessor(uploaded_files=uploaded_files)

    def files_to_faiss():
        if uploaded_files:
            preprocessor.extract_text()
            preprocessor.save_to_vector_db()
            st.write(f"Успех.")
        else:
            st.write(f"Что-то пошло не так.")

    st.button("Загрузить", on_click=files_to_faiss)
    st.button("Перейти к чату", on_click=switch_to_chat)


def chat_screen():
    st.title("Чат с LLM")
    user_question = st.text_input("Введите ваш вопрос:")
    if user_question:
        search_results = db.similarity_search(user_question, k=5)
        context = "\n".join([doc.page_content for doc in search_results])

        response = generate_response(llm, context, user_question)

        st.subheader("Ответ:")
        st.write(response)

    if st.button("Вернуться к загрузке файлов"):
        st.session_state.current_screen = "upload"


if st.session_state.current_screen == "upload":
    upload_screen()
elif st.session_state.current_screen == "chat":
    chat_screen()
