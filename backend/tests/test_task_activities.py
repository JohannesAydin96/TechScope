from fastapi.testclient import TestClient

from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
    create_task,
)


def test_task_creation_creates_activity(
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
        title="Activity Test Task",
    )

    task_id = task["id"]

    response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/activities",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    activities = response.json()

    assert len(activities) == 1

    activity = activities[0]

    assert activity["task_id"] == task_id
    assert activity["action"] == "task_created"
    assert activity["created_at"] is not None


def test_task_update_creates_activity(
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

    update_response = client.patch(
        f"/projects/{project_id}/tasks/{task_id}",
        json={
            "title": "Updated Task",
            "status": "in_progress",
        },
        headers=auth_headers(token),
    )

    assert update_response.status_code == 200

    response = client.get(
        f"/projects/{project_id}/tasks/{task_id}/activities",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    activities = response.json()

    assert len(activities) == 3

    updated_activities = [
        activity
        for activity in activities
        if activity["action"] == "task_updated"
    ]

    created_activities = [
        activity
        for activity in activities
        if activity["action"] == "task_created"
    ]

    assert len(updated_activities) == 2
    assert len(created_activities) == 1

    updated_fields = {
        activity["field_name"]
        for activity in updated_activities
    }

    assert updated_fields == {
        "title",
        "status",
    }

    activities_by_field = {
        activity["field_name"]: activity
        for activity in updated_activities
    }

    assert activities_by_field["title"]["old_value"] == "Test Task"
    assert activities_by_field["title"]["new_value"] == "Updated Task"

    assert activities_by_field["status"]["old_value"] == "todo"
    assert activities_by_field["status"]["new_value"] == "in_progress"