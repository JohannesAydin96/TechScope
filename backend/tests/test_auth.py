from fastapi.testclient import TestClient

from app.models.user import User
from tests.database import TestingSessionLocal

from tests.helpers import auth_headers, create_authenticated_user

def test_register_user_writes_to_test_database(
    client: TestClient,
) -> None:
    payload = {
        "username": "Test User",
        "email": "testuser@example.com",
        "password": "StrongPassword123!",
    }

    response = client.post(
        "/register",
        json=payload,
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["username"] == payload["username"]
    assert response_data["email"] == payload["email"]
    assert "id" in response_data
    assert "created_at" in response_data
    assert "password" not in response_data
    assert "hashed_password" not in response_data

    with TestingSessionLocal() as db:
        user = (
            db.query(User)
            .filter(User.email == payload["email"])
            .first()
        )

        assert user is not None
        assert user.username == payload["username"]
        assert user.email == payload["email"]
        assert user.hashed_password != payload["password"]
        assert user.hashed_password

def test_register_user_with_duplicate_email_returns_400(
    client: TestClient,
) -> None:
    payload = {
        "username": "First User",
        "email": "duplicate@example.com",
        "password": "StrongPassword123!",
    }

    first_response = client.post(
        "/register",
        json=payload,
    )

    assert first_response.status_code == 201

    duplicate_payload = {
        "username": "Second User",
        "email": "duplicate@example.com",
        "password": "AnotherPassword123!",
    }

    duplicate_response = client.post(
        "/register",
        json=duplicate_payload,
    )

    assert duplicate_response.status_code == 400
    assert duplicate_response.json() == {
        "detail": "Email already registered",
    }

def test_login_returns_access_token(
    client: TestClient,
) -> None:
    register_payload = {
        "username": "Login User",
        "email": "login@example.com",
        "password": "StrongPassword123!",
    }

    register_response = client.post(
        "/register",
        json=register_payload,
    )

    assert register_response.status_code == 201

    login_payload = {
        "email": register_payload["email"],
        "password": register_payload["password"],
    }

    login_response = client.post(
        "/login",
        json=login_payload,
    )

    assert login_response.status_code == 200

    response_data = login_response.json()

    assert "access_token" in response_data
    assert response_data["access_token"]
    assert response_data["token_type"] == "bearer"


def test_login_with_invalid_password_returns_401(
    client: TestClient,
) -> None:
    register_payload = {
        "username": "Wrong Password User",
        "email": "wrongpassword@example.com",
        "password": "CorrectPassword123!",
    }

    register_response = client.post(
        "/register",
        json=register_payload,
    )

    assert register_response.status_code == 201

    login_payload = {
        "email": register_payload["email"],
        "password": "IncorrectPassword123!",
    }

    login_response = client.post(
        "/login",
        json=login_payload,
    )

    assert login_response.status_code == 401
    assert login_response.json() == {
        "detail": "Invalid email or password",
    }


def test_get_current_user_returns_authenticated_user(
    client: TestClient,
) -> None:
    register_payload = {
        "username": "Authenticated User",
        "email": "authenticated@example.com",
        "password": "StrongPassword123!",
    }

    register_response = client.post(
        "/register",
        json=register_payload,
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/login",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    me_response = client.get(
    "/me",
    headers=auth_headers(access_token),
)

    assert me_response.status_code == 200

    user = me_response.json()

    assert user["username"] == register_payload["username"]
    assert user["email"] == register_payload["email"]

def test_get_current_user_without_token_returns_401(
    client: TestClient,
) -> None:
    response = client.get("/me")

    assert response.status_code == 401