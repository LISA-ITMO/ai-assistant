import pytest
import os
from pathlib import Path
from fastapi import HTTPException
from app.services.rag.chunking import ChunkingService
from app.services.file_manager.file_service import FileService


@pytest.fixture
def test_file():
    test_content = """This is a test document.
    It has multiple lines and paragraphs.
    
    This is a new paragraph with some more text.
    We need enough text to create multiple chunks.
    
    Here's another paragraph with different content.
    The text splitter should create chunks from this content.
    """

    test_filename = "test_doc.txt"
    test_dir = "test_uploads"

    os.makedirs(test_dir, exist_ok=True)

    file_path = os.path.join(test_dir, test_filename)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(test_content)

    yield test_filename

    if os.path.exists(file_path):
        os.remove(file_path)
    if os.path.exists(test_dir):
        os.rmdir(test_dir)


def test_get_text_splitter():
    splitter = ChunkingService.get_text_splitter()
    assert splitter._chunk_size == 500
    assert splitter._chunk_overlap == 50
    assert splitter._length_function == len


def test_get_embedding_model():
    model = ChunkingService.get_embedding_model()
    assert model.model_name == "sentence-transformers/all-MiniLM-L6-v2"


def test_process_file(test_file):
    chunk_count = ChunkingService.process_file(test_file)

    assert chunk_count > 0

    vector_store_path = os.path.join(
        ChunkingService.VECTOR_DB_DIR, ChunkingService.COLLECTION_NAME)
    assert os.path.exists(vector_store_path)

    if os.path.exists(ChunkingService.VECTOR_DB_DIR):
        for root, dirs, files in os.walk(ChunkingService.VECTOR_DB_DIR, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(ChunkingService.VECTOR_DB_DIR)


def test_process_nonexistent_file():
    with pytest.raises(HTTPException) as exc_info:
        ChunkingService.process_file("nonexistent.txt")
    assert exc_info.value.status_code == 404
    assert "File not found" in str(exc_info.value.detail)


def test_process_invalid_file():
    test_filename = "invalid.txt"
    test_dir = "test_uploads"
    os.makedirs(test_dir, exist_ok=True)

    file_path = os.path.join(test_dir, test_filename)
    with open(file_path, "wb") as f:
        f.write(b"\x00\x01\x02\x03")

    try:
        with pytest.raises(HTTPException) as exc_info:
            ChunkingService.process_file(test_filename)
        assert exc_info.value.status_code == 500
        assert "Error reading file" in str(exc_info.value.detail)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(test_dir):
            os.rmdir(test_dir)
