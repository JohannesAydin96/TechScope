from fastapi.testclient import TestClient


def create_authenticated_user(
    client: TestClient,
    username: str = "Test User",
    email: str = "test@example.com",
    password: str = "StrongPassword123!",
) -> str:
    """
    Registers a user and returns a valid JWT access token.
    """

    register_response = client.post(
        "/register",
        json={
            "username": username,
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    """
    Returns Authorization headers for authenticated requests.
    """

    return {
        "Authorization": f"Bearer {token}",
    }


def create_project(
    client: TestClient,
    token: str,
    name: str = "Test Project",
    description: str = "Test Description",
) -> dict[str, object]:
    """
    Creates a project and returns the created project.
    """

    response = client.post(
        "/projects",
        json={
            "name": name,
            "description": description,
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    return response.json()


def create_task(
    client: TestClient,
    token: str,
    project_id: int,
    title: str = "Test Task",
    description: str = "Test task description",
    priority: str = "medium",
    due_date: str | None = None,
    labels: list[str] | None = None,
) -> dict[str, object]:
    """
    Creates a task and returns the created task.
    """

    response = client.post(
        f"/projects/{project_id}/tasks",
        json={
            "title": title,
            "description": description,
            "priority": priority,
            "due_date": due_date,
            "labels": labels or [],
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    return response.json()