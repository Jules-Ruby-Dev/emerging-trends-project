"""Unit / integration tests for the FastAPI routes.

External dependencies (Supabase, Ollama, ChromaDB) are mocked so the tests
run offline without real credentials.
"""

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ── Health ────────────────────────────────────────────────────────────────────

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ── Auth ──────────────────────────────────────────────────────────────────────

def _mock_supabase_session(user_id: str = "test-user-123", token: str = "mock-token"):
    session = MagicMock()
    session.access_token = token
    user = MagicMock()
    user.id = user_id
    response = MagicMock()
    response.session = session
    response.user = user
    return response


@patch("app.routes.auth.sign_up", return_value=_mock_supabase_session())
def test_signup_success(mock_sign_up):
    payload = {"email": "test@example.com", "password": "securepassword"}
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["access_token"] == "mock-token"
    assert data["user_id"] == "test-user-123"
    mock_sign_up.assert_called_once_with("test@example.com", "securepassword")


@patch("app.routes.auth.sign_up")
def test_signup_failure(mock_sign_up):
    bad_response = MagicMock()
    bad_response.session = None
    bad_response.user = None
    mock_sign_up.return_value = bad_response

    payload = {"email": "bad@example.com", "password": "shortpass"}
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 400


@patch("app.routes.auth.sign_in", return_value=_mock_supabase_session())
def test_signin_success(mock_sign_in):
    payload = {"email": "test@example.com", "password": "securepassword"}
    response = client.post("/auth/signin", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock-token"
    mock_sign_in.assert_called_once_with("test@example.com", "securepassword")


@patch("app.routes.auth.sign_in")
def test_signin_failure(mock_sign_in):
    bad_response = MagicMock()
    bad_response.session = None
    bad_response.user = None
    mock_sign_in.return_value = bad_response

    payload = {"email": "wrong@example.com", "password": "wrongpassword"}
    response = client.post("/auth/signin", json=payload)
    assert response.status_code == 401


# ── Chat ──────────────────────────────────────────────────────────────────────

@patch("app.routes.chat.get_user_from_token")
@patch("app.routes.chat.get_ai_reply", new_callable=AsyncMock)
def test_chat_success(mock_reply, mock_get_user):
    mock_user = MagicMock()
    mock_user.id = "user-abc"
    mock_get_user.return_value = mock_user
    mock_reply.return_value = "Hey there! How are you doing today?"

    response = client.post(
        "/chat",
        json={"message": "Hello Aria!"},
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "Hey there! How are you doing today?"
    assert "session_id" in data


@patch("app.routes.chat.get_user_from_token")
@patch("app.routes.chat.get_ai_reply", new_callable=AsyncMock)
def test_chat_ollama_unavailable(mock_reply, mock_get_user):
    mock_user = MagicMock()
    mock_user.id = "user-abc"
    mock_get_user.return_value = mock_user
    mock_reply.side_effect = RuntimeError("Unable to reach Ollama at http://localhost:11434.")

    response = client.post(
        "/chat",
        json={"message": "Hello Aria!"},
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Unable to reach Ollama at http://localhost:11434."


@patch("app.routes.chat.get_user_from_token", return_value=None)
def test_chat_unauthorized(_mock_get_user):
    response = client.post(
        "/chat",
        json={"message": "Hello!"},
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401


def test_chat_no_token():
    response = client.post("/chat", json={"message": "Hello!"})
    assert response.status_code == 403


# ── Memory service ────────────────────────────────────────────────────────────

@patch("app.services.memory_service.get_chroma_client")
def test_store_and_retrieve_memory(mock_get_client):
    from app.services.memory_service import store_memory, retrieve_memories

    mock_collection = MagicMock()
    mock_collection.count.return_value = 1
    mock_collection.query.return_value = {"documents": [["User said: hi there"]]}
    mock_get_client.return_value.get_or_create_collection.return_value = mock_collection

    store_memory("user-1", "hi there")
    mock_collection.add.assert_called_once()

    results = retrieve_memories("user-1", "hi there")
    assert results == ["User said: hi there"]


@patch("app.services.memory_service.get_chroma_client")
def test_retrieve_memory_empty_collection(mock_get_client):
    from app.services.memory_service import retrieve_memories

    mock_collection = MagicMock()
    mock_collection.count.return_value = 0
    mock_get_client.return_value.get_or_create_collection.return_value = mock_collection

    results = retrieve_memories("user-2", "anything")
    assert results == []
