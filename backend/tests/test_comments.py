from fastapi.testclient import TestClient

from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
    create_task,
)


def test_create_comment(
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
    )

    task_id = task["id"]

    response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "First comment",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    comment = response.json()

    assert comment["task_id"] == task_id
    assert comment["content"] == "First comment"
    assert comment["user_id"] is not None
    assert comment["created_at"] is not None


def test_list_comments(
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
    )

    task_id = task["id"]

    first_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "First comment",
        },
        headers=auth_headers(token),
    )

    second_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "Second comment",
        },
        headers=auth_headers(token),
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    comments = response.json()

    assert len(comments) == 2

    comment_contents = {
        comment["content"]
        for comment in comments
    }

    assert comment_contents == {
        "First comment",
        "Second comment",
    }


def test_update_comment(
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
    )

    task_id = task["id"]

    create_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "Original comment",
        },
        headers=auth_headers(token),
    )

    assert create_response.status_code == 201

    comment = create_response.json()

    comment_id = comment["id"]

    update_response = client.patch(
        f"/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
        json={
            "content": "Updated comment",
        },
        headers=auth_headers(token),
    )

    assert update_response.status_code == 200

    updated_comment = update_response.json()

    assert updated_comment["id"] == comment_id
    assert updated_comment["content"] == "Updated comment"
    assert updated_comment["updated_at"] is not None


def test_delete_comment(
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
    )

    task_id = task["id"]

    create_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "Comment to delete",
        },
        headers=auth_headers(token),
    )

    assert create_response.status_code == 201

    comment_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
        headers=auth_headers(token),
    )

    assert delete_response.status_code == 200

    list_response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        headers=auth_headers(token),
    )

    assert list_response.status_code == 200
    assert list_response.json() == []


def test_another_user_cannot_update_comment(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        email="owner@example.com",
    )

    other_user_token = create_authenticated_user(
        client,
        email="other@example.com",
    )

    project = create_project(
        client,
        owner_token,
    )

    project_id = project["id"]

    task = create_task(
        client,
        owner_token,
        project_id,
    )

    task_id = task["id"]

    create_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "Owner comment",
        },
        headers=auth_headers(owner_token),
    )

    assert create_response.status_code == 201

    comment_id = create_response.json()["id"]

    response = client.patch(
        f"/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
        json={
            "content": "Unauthorized update",
        },
        headers=auth_headers(other_user_token),
    )

    assert response.status_code in {
        403,
        404,
    }


def test_another_user_cannot_delete_comment(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        email="owner@example.com",
    )

    other_user_token = create_authenticated_user(
        client,
        email="other@example.com",
    )

    project = create_project(
        client,
        owner_token,
    )

    project_id = project["id"]

    task = create_task(
        client,
        owner_token,
        project_id,
    )

    task_id = task["id"]

    create_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/comments",
        json={
            "content": "Owner comment",
        },
        headers=auth_headers(owner_token),
    )

    assert create_response.status_code == 201

    comment_id = create_response.json()["id"]

    response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}/comments/{comment_id}",
        headers=auth_headers(other_user_token),
    )

    assert response.status_code in {
        403,
        404,
    }