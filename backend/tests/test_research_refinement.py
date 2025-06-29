from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_refine_research_topic():
    response = client.post(
        "/api/v1/research/topic",
        json={"topic": "AI in education",
              "provider": "chatgpt"}
    )
    assert response.status_code == 200
    assert "refined_topic" in response.json()
    assert "provider" in response.json()
    assert response.json()["provider"] == "chatgpt"
    assert isinstance(response.json()["refined_topic"], str)


def test_refine_research_topic_invalid_provider():
    response = client.post(
        "/api/v1/research/refine",
        json={"topic": "AI in education",
              "provider": "invalid"}
    )
    assert response.status_code == 400
