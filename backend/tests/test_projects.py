from fastapi.testclient import TestClient

from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
)


def test_create_project(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
        name="My First Project",
        description="Test project description",
    )

    assert project["name"] == "My First Project"
    assert project["description"] == "Test project description"
    assert "id" in project
    assert "created_at" in project


def test_get_projects_returns_created_project(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    create_project(
        client,
        token,
        name="Backend API",
        description="Testing project listing",
    )

    response = client.get(
        "/projects",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    projects = response.json()

    assert len(projects) == 1
    assert projects[0]["name"] == "Backend API"
    assert projects[0]["description"] == "Testing project listing"


def test_get_project_by_id_returns_project(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    created_project = create_project(
        client,
        token,
        name="Specific Project",
        description="Project fetched by ID",
    )

    project_id = created_project["id"]

    response = client.get(
        f"/projects/{project_id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    project = response.json()

    assert project["id"] == project_id
    assert project["name"] == "Specific Project"
    assert project["description"] == "Project fetched by ID"


def test_update_project(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    created_project = create_project(
        client,
        token,
        name="Original Project",
        description="Original description",
    )

    project_id = created_project["id"]

    response = client.put(
        f"/projects/{project_id}",
        json={
            "name": "Updated Project",
            "description": "Updated description",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    updated_project = response.json()

    assert updated_project["id"] == project_id
    assert updated_project["name"] == "Updated Project"
    assert updated_project["description"] == "Updated description"


def test_delete_project(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    created_project = create_project(
        client,
        token,
        name="Project To Delete",
        description="This project will be deleted",
    )

    project_id = created_project["id"]

    delete_response = client.delete(
        f"/projects/{project_id}",
        headers=auth_headers(token),
    )

    assert delete_response.status_code == 200

    get_response = client.get(
        f"/projects/{project_id}",
        headers=auth_headers(token),
    )

    assert get_response.status_code == 404