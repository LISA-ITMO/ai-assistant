from transformers import pipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from modules.module_llm_chat import initialize_llm


class ArticleAnnotator:
    def __init__(self, chunk_size=1200, chunk_overlap=300):
        """
        Инициализация ArticleAnnotator с параметрами разбивки текста.
        Parameters:
        - chunk_size: Максимальный размер одного текстового блока
        - chunk_overlap: Размер перекрытия между последовательными блоками
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.llm = initialize_llm()

    def generate_annotation(self, text):
        """
        Функция для генерации аннотации текста.

        Parameters:
        - text: Текст статьи.

        Returns:
        - Строка с аннотацией.
        """
        template = '''
            Проанализируйте предоставленный текст и создайте аннотацию, которая включает краткое содержание, основные идеи и выводы. 
            Текст: {text}
            Аннотация:
        '''
        prompt = PromptTemplate(input_variables=["text"], template=template)

        llm_chain = LLMChain(prompt=prompt, llm=self.llm)
        return llm_chain.run(text)

    def annotate_articles(self, uploaded_files):
        """
        Функция для аннотирования все выбранных файлов.

        Parameters:
        - uploaded_files: Список загруженных файлов.

        Returns:
        - Словарь в котором ключи - названия файлов, а значения - их аннотации
        """
        annotations = {}

        for uploaded_file in uploaded_files:
            if uploaded_file is not None:
                file_name = uploaded_file.name

                file_content = self._read_uploaded_file(uploaded_file)

                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
                )
                chunks = text_splitter.split_text(file_content)

                annotations[file_name] = "\n\n".join([
                    self.generate_annotation(chunk) for chunk in chunks
                ])

        return annotations

    def _read_uploaded_file(self, uploaded_file):
        """
        Функция для чтения контента из загруженного файла.
        Parameters:
        - uploaded_file: Загруженный файл

        Returns:
        - Текст из загруженного файла
        """
        return uploaded_file.read().decode('utf-8')
