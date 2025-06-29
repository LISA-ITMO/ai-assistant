from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_generate_chat_response_chatgpt():
    response = client.post(
        "/api/v1/chat", json={"prompt": "Hello!", "provider": "chatgpt"})
    print(response)
    assert response.status_code == 200
    assert "response" in response.json()
    assert response.json()["provider"] == "chatgpt"


def test_generate_chat_response_invalid_provider():
    response = client.post(
        "/api/v1/chat", json={"prompt": "Hello!", "provider": "invalid"})
    assert response.status_code == 400
