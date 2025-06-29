import pytest
from fastapi import UploadFile
from pathlib import Path
import os
from app.services.file_manager.file_service import FileService

pytestmark = pytest.mark.asyncio


@pytest.fixture
def file_service():
    test_upload_dir = "test_uploads"
    service = FileService(upload_dir=test_upload_dir)
    yield service
    if os.path.exists(test_upload_dir):
        for file in os.listdir(test_upload_dir):
            os.remove(os.path.join(test_upload_dir, file))
        os.rmdir(test_upload_dir)


@pytest.fixture
def test_file():
    test_content = b"test content"
    test_filename = "test.txt"
    with open(test_filename, "wb") as f:
        f.write(test_content)

    with open(test_filename, "rb") as f:
        file = UploadFile(filename=test_filename, file=f)
        yield file

    if os.path.exists(test_filename):
        os.remove(test_filename)


async def test_upload_file(file_service, test_file):
    file_path = await file_service.upload_file(test_file)
    assert os.path.exists(file_path)
    assert Path(file_path).name == test_file.filename


async def test_delete_file(file_service, test_file):
    file_path = await file_service.upload_file(test_file)

    success = file_service.delete_file(test_file.filename)
    assert success
    assert not os.path.exists(file_path)


async def test_list_files(file_service, test_file):
    await file_service.upload_file(test_file)

    files = file_service.list_files()
    assert test_file.filename in files


def test_get_file_path(file_service):
    filename = "test.txt"
    file_path = file_service.get_file_path(filename)
    assert str(file_path) == str(file_service.upload_dir / filename)
