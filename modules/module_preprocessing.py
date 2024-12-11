from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceInstructEmbeddings
import os
import re
import markdown
from pdfminer.high_level import extract_text as extract_text_from_pdf
from io import StringIO
from html.parser import HTMLParser
from langchain.text_splitter import RecursiveCharacterTextSplitter


class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = StringIO()

    def handle_data(self, d):
        self.text.write(d)

    def get_data(self):
        return self.text.getvalue()


def strip_tags(html):
    """Удалить HTML-теги из строки."""
    s = MLStripper()
    s.feed(html)
    return s.get_data()


def clean_markdown(text):
    """Очистить синтаксис Markdown из текста."""
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    text = re.sub(r'!\[[^\]]*]\([^)]*\)', '', text)
    text = re.sub(r'#+\s?', '', text)
    text = re.sub(r'\|', ' ', text)
    text = re.sub(r'-{2,}', '', text)
    text = re.sub(r'\n{2,}', '\n', text)
    return text


def extract_text_from_md(md_path):
    """Извлечь и очистить текст из Markdown-файла."""
    with open(md_path, "r", encoding="utf-8") as file:
        md_content = file.read()
        html = markdown.markdown(md_content)
        text = strip_tags(html)
        return clean_markdown(text)


def extract_text_from_file(file_path):
    """Извлечь текст из файла на основе его расширения."""
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.md'):
        return extract_text_from_md(file_path)
    elif file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    else:
        return "Неподдерживаемый формат файла."


class Preprocessor:
    def __init__(self, uploaded_files, chunk_size=1200, chunk_overlap=300):
        """
        Инициализирует препроцессор со списком загруженных файлов.

        Параметры:
        - uploaded_files: Список файлов 
        - chunk_size: Максимальный размер одного текстового блока
        - chunk_overlap: Размер перекрытия между последовательными блоками
        """
        self.uploaded_files = uploaded_files
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.all_docs = []
        self.allowed_extensions = ['.md', '.pdf', '.txt']

    def extract_text(self):
        """
        Извлекает и обрабатывает текст из загруженных файлов.
        Разбивает текст на фрагменты и добавляет их в self.all_docs.
        """
        for uploaded_file in self.uploaded_files:
            if uploaded_file is not None:
                # Get file extension and validate it
                _, file_extension = os.path.splitext(uploaded_file.name)
                if file_extension in self.allowed_extensions:
                    file_name_without_extension = os.path.splitext(uploaded_file.name)[
                        0]

                    # Read file content
                    file_content = self._read_uploaded_file(
                        uploaded_file, file_extension)

                    # Split text into chunks
                    text_splitter = RecursiveCharacterTextSplitter(
                        chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
                    )
                    docs = text_splitter.split_text(file_content)

                    # Add metadata and header to each chunk
                    for i, chunk in enumerate(docs):
                        metadata = {
                            "File Name": file_name_without_extension,
                            "Chunk Number": i + 1,
                        }

                        header = f"File Name: {file_name_without_extension}\n"
                        for key, value in metadata.items():
                            header += f"{key}: {value}\n"

                        chunk_with_header = header + file_name_without_extension + "\n" + chunk
                        self.all_docs.append(chunk_with_header)

    def _read_uploaded_file(self, uploaded_file, file_extension):
        """
        Читает содержимое загруженного файла в зависимости от его расширения.

        Параметры:
        - uploaded_file: Объект загруженного файла
        - file_extension: Расширение файла

        Возвращает:
        - Содержимое файла в виде текста
        """
        if file_extension == '.pdf':
            return extract_text_from_pdf(uploaded_file)
        elif file_extension in ['.md', '.txt']:
            return uploaded_file.read().decode('utf-8')
        else:
            raise ValueError("Unsupported file format")

    def save_to_vector_db(self, model_name="hkunlp/instructor-large", vector_db_directory="vector_db"):
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': True}
        hf_embedding = HuggingFaceInstructEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )

        db = FAISS.from_texts(self.all_docs, hf_embedding)
        db.save_local(folder_path=vector_db_directory)
