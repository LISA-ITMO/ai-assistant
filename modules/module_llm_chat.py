from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_huggingface import HuggingFacePipeline
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline


def initialize_llm(model_name="meta-llama/Llama-3.2-1B-Instruct"):
    """
    Инициализация LLM.
    Parameters:
    - model_name (str): Название модели из HuggingFace, по умолчанию "meta-llama/Llama-3.2-1B-Instruct".

    Returns:
    - HuggingFacePipeline: Инстанс LLM.
    """

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)

    hf_pipeline = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_length=4096,
        temperature=0.2,
        top_p=1,
    )

    llm = HuggingFacePipeline(
        pipeline=hf_pipeline,
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
    )

    return llm


def generate_response(llm: object, context: str, question: str) -> str:
    """
    Функция для генерации ответа на вопрос, используя контекст.
    Parameters:
    - llm: LLM-инстанс.
    - context (str): Контекст из загруженных ранее статей.
    - question (str): Вопрос пользователя.

    Returns:
    - str: Сгенерированный ответ.
    """

    template = '''
        Контекст: {context}
        Исходя из контекста, ответьте на следующий вопрос:
        Вопрос: {question}
        Предоставьте ответ только на основе предоставленного контекста, без использования общих знаний. 
        Ответ должен быть непосредственно взят из предоставленного контекста.
        Пожалуйста, исправьте грамматические ошибки для улучшения читаемости.
        Если в контексте нет информации, достаточной для ответа на вопрос, укажите, что ответ отсутствует в данном контексте.
        Пожалуйста, включите источник информации в качестве ссылки, поясняющей, как вы пришли к своему ответу.
    '''

    prompt = PromptTemplate(
        input_variables=["context", "question"], template=template)
    formatted_prompt = prompt.format(context=context, question=question)

    llm_chain = LLMChain(prompt=prompt, llm=llm)
    response = llm_chain.run(formatted_prompt)

    return response
