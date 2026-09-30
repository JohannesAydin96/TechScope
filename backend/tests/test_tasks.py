from fastapi.testclient import TestClient

from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
    create_task,
)


def test_create_task(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
    )

    project_id = project["id"]

    task = create_task(
        client,
        token,
        project_id,
        title="Build Test Suite",
        description="Create integration tests for tasks",
        priority="high",
        due_date="2026-08-15",
        labels=["Backend", "Testing"],
    )

    assert task["title"] == "Build Test Suite"
    assert task["description"] == "Create integration tests for tasks"
    assert task["status"] == "todo"
    assert task["priority"] == "high"
    assert task["due_date"] == "2026-08-15T00:00:00"
    assert task["labels"] == ["Backend", "Testing"]
    assert task["project_id"] == project_id
    assert "id" in task
    assert "created_at" in task


from tests.helpers import auth_headers


def test_get_tasks_returns_created_task(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
    )

    project_id = project["id"]

    create_task(
        client,
        token,
        project_id,
        title="Listed Task",
        description="Task should appear in project task list",
        priority="medium",
        labels=["API"],
    )

    response = client.get(
        f"/projects/{project_id}/tasks",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    tasks = response.json()

    assert len(tasks) == 1
    assert tasks[0]["title"] == "Listed Task"
    assert tasks[0]["description"] == "Task should appear in project task list"
    assert tasks[0]["status"] == "todo"
    assert tasks[0]["priority"] == "medium"
    assert tasks[0]["labels"] == ["API"]
    assert tasks[0]["project_id"] == project_id


def test_update_task(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
    )

    project_id = project["id"]

    created_task = create_task(
        client,
        token,
        project_id,
        title="Original Task",
        description="Original description",
        priority="medium",
        labels=["Backend"],
    )

    task_id = created_task["id"]

    response = client.patch(
        f"/projects/{project_id}/tasks/{task_id}",
        json={
            "title": "Updated Task",
            "description": "Updated description",
            "status": "in_progress",
            "priority": "high",
            "due_date": "2026-09-01",
            "labels": ["Backend", "Testing"],
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    task = response.json()

    assert task["id"] == task_id
    assert task["project_id"] == project_id
    assert task["title"] == "Updated Task"
    assert task["description"] == "Updated description"
    assert task["status"] == "in_progress"
    assert task["priority"] == "high"
    assert task["due_date"] == "2026-09-01T00:00:00"
    assert task["labels"] == ["Backend", "Testing"]


def test_delete_task(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
    )

    project_id = project["id"]

    created_task = create_task(
        client,
        token,
        project_id,
        title="Task To Delete",
    )

    task_id = created_task["id"]

    response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Task deleted successfully",
    }

    list_response = client.get(
        f"/projects/{project_id}/tasks",
        headers=auth_headers(token),
    )

    assert list_response.status_code == 200
    assert list_response.json() == []


def test_user_cannot_access_another_users_tasks(
    client: TestClient,
) -> None:
    # User 1
    token_user1 = create_authenticated_user(client)

    project = create_project(
        client,
        token_user1,
    )

    project_id = project["id"]

    create_task(
        client,
        token_user1,
        project_id,
        title="Private Task",
    )

    # User 2
    token_user2 = create_authenticated_user(
        client,
        email="user2@example.com",
        password="password123",
    )

    response = client.get(
        f"/projects/{project_id}/tasks",
        headers=auth_headers(token_user2),
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_task(
    client: TestClient,
) -> None:
    # User 1 owns the project and task
    token_user1 = create_authenticated_user(client)

    project = create_project(
        client,
        token_user1,
    )

    project_id = project["id"]

    task = create_task(
        client,
        token_user1,
        project_id,
        title="Private Task",
    )

    task_id = task["id"]

    # User 2 attempts to update it
    token_user2 = create_authenticated_user(
        client,
        email="user2@example.com",
        password="password123",
    )

    response = client.patch(
        f"/projects/{project_id}/tasks/{task_id}",
        json={
            "title": "Unauthorized Update",
            "status": "in_progress",
        },
        headers=auth_headers(token_user2),
    )

    assert response.status_code == 404


def test_user_cannot_delete_another_users_task(
    client: TestClient,
) -> None:
    # User 1 owns the project and task
    token_user1 = create_authenticated_user(client)

    project = create_project(
        client,
        token_user1,
    )

    project_id = project["id"]

    task = create_task(
        client,
        token_user1,
        project_id,
        title="Private Task",
    )

    task_id = task["id"]

    # User 2 attempts to delete it
    token_user2 = create_authenticated_user(
        client,
        email="user2@example.com",
        password="password123",
    )

    response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}",
        headers=auth_headers(token_user2),
    )

    assert response.status_code == 404