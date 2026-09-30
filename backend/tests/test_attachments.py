from fastapi.testclient import TestClient

from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
    create_task,
)


def test_upload_attachment(
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
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "test_document.txt",
                b"TechScope attachment test content",
                "text/plain",
            ),
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    attachment = response.json()

    assert attachment["task_id"] == task_id
    assert attachment["original_filename"] == "test_document.txt"
    assert attachment["content_type"] == "text/plain"
    assert attachment["file_size"] == len(
        b"TechScope attachment test content"
    )
    assert attachment["created_at"] is not None


def test_list_attachments(
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

    client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "document.txt",
                b"Attachment content",
                "text/plain",
            ),
        },
        headers=auth_headers(token),
    )

    response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    attachments = response.json()

    assert len(attachments) == 1

    attachment = attachments[0]

    assert attachment["task_id"] == task_id
    assert attachment["original_filename"] == "document.txt"



def test_download_attachment(
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

    file_content = b"TechScope download test content"

    upload_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "download_test.txt",
                file_content,
                "text/plain",
            ),
        },
        headers=auth_headers(token),
    )

    assert upload_response.status_code == 201

    attachment_id = upload_response.json()["id"]

    response = client.get(
        (
            f"/projects/{project_id}/tasks/{task_id}"
            f"/attachments/{attachment_id}/download"
        ),
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.content == file_content
    assert response.headers["content-type"].startswith("text/plain")


def test_delete_attachment(
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

    upload_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "delete_test.txt",
                b"Delete me",
                "text/plain",
            ),
        },
        headers=auth_headers(token),
    )

    assert upload_response.status_code == 201

    attachment_id = upload_response.json()["id"]

    response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}/attachments/{attachment_id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    list_response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        headers=auth_headers(token),
    )

    assert list_response.status_code == 200
    assert list_response.json() == []


def test_another_user_cannot_delete_attachment(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        email="owner@example.com",
    )

    other_token = create_authenticated_user(
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

    upload_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "secret.txt",
                b"Secret attachment",
                "text/plain",
            ),
        },
        headers=auth_headers(owner_token),
    )

    assert upload_response.status_code == 201

    attachment_id = upload_response.json()["id"]

    response = client.delete(
        f"/projects/{project_id}/tasks/{task_id}/attachments/{attachment_id}",
        headers=auth_headers(other_token),
    )

    assert response.status_code in {
        403,
        404,
    }


def test_another_user_cannot_download_attachment(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        email="owner@example.com",
    )

    other_token = create_authenticated_user(
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

    upload_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "private_document.txt",
                b"Private attachment content",
                "text/plain",
            ),
        },
        headers=auth_headers(owner_token),
    )

    assert upload_response.status_code == 201

    attachment_id = upload_response.json()["id"]

    response = client.get(
        (
            f"/projects/{project_id}/tasks/{task_id}"
            f"/attachments/{attachment_id}/download"
        ),
        headers=auth_headers(other_token),
    )

    assert response.status_code in {
        403,
        404,
    }


def test_another_user_cannot_list_attachments(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        email="owner@example.com",
    )

    other_token = create_authenticated_user(
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

    upload_response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "private_list_test.txt",
                b"Private attachment",
                "text/plain",
            ),
        },
        headers=auth_headers(owner_token),
    )

    assert upload_response.status_code == 201

    response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        headers=auth_headers(other_token),
    )

    assert response.status_code in {
        403,
        404,
    }


def test_upload_rejects_unsupported_file_type(
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
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "malicious.exe",
                b"Not a real executable",
                "application/x-msdownload",
            ),
        },
        headers=auth_headers(token),
    )

    assert response.status_code in {
        400,
        415,
    }


def test_upload_rejects_too_large_file(
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

    large_file = b"a" * (10 * 1024 * 1024 + 1)

    response = client.post(
        f"/projects/{project_id}/tasks/{task_id}/attachments",
        files={
            "file": (
                "large.txt",
                large_file,
                "text/plain",
            ),
        },
        headers=auth_headers(token),
    )

    assert response.status_code in {
        400,
        413,
    }