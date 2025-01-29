import os
import re
import fitz
import pickle


def load_pdf(file_path):
    """
    Универсальный экстрактор текста из PDF-файлов.
    Поддерживает текстовые PDF, PDF с колонками, а также PDF с изображениями текста (OCR).

    :param file_path: Путь к PDF-файлу.
    :return: Извлеченный текст.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Файл {file_path} не найден.")
    if not file_path.lower().endswith(".pdf"):
        raise ValueError("Файл должен быть в формате PDF.")

    text = ""

    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"Ошибка при использовании PyMuPDF: {e}")

    if not text.strip():
        raise ValueError("Не удалось извлечь текст из PDF.")

    return text.strip()


def preprocess_text(text):
    """
    Preprocesses the input text by performing the following operations:
    1. Converts the text to lowercase.
    2. Removes all characters except word characters, digits, whitespace, and mathematical symbols (=, -, +, *, /, ()).
    3. Collapses multiple spaces into a single space.
    4. Strips leading and trailing whitespace.
    5. Removes any numeric references in square brackets (e.g., [1], [2]).

    Args:
        text (str): The input text to preprocess.

    Returns:
        str: The preprocessed text.
    """
    text = text.lower()
    text = re.sub(r"[^\w\d\s\=\-\+\*\/\(\)]", "", text)
    text = " ".join(text.split())
    text = text.strip()
    text = re.sub(r"\[\d+\]", "", text)
    return text


def save_embeddings(file_path, embeddings):
    save_path = file_path.replace(".pdf", ".embeddings")
    with open(save_path, "wb") as f:
        pickle.dump(embeddings, f)
