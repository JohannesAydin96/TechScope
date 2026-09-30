from fastapi.testclient import TestClient

from app.services.notification_service import NotificationService
from tests.database import TestingSessionLocal
from tests.helpers import (
    auth_headers,
    create_authenticated_user,
    create_project,
    create_task,
)


def test_list_notifications(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project_a = create_project(
        client,
        token,
    )

    project_b = create_project(
        client,
        token,
    )

    project_a_id = project_a["id"]
    project_b_id = project_b["id"]

    task = create_task(
        client,
        token,
        project_a_id,
        title="Notification Task",
    )

    task_id = task["id"]

    me_response = client.get(
        "/me",
        headers=auth_headers(token),
    )

    assert me_response.status_code == 200

    user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Project A notification",
            message="This belongs to Project A.",
        )

    response_a = client.get(
        f"/projects/{project_a_id}/notifications",
        headers=auth_headers(token),
    )

    assert response_a.status_code == 200

    notifications_a = response_a.json()

    assert len(notifications_a) == 1
    assert notifications_a[0]["user_id"] == user_id
    assert notifications_a[0]["type"] == "task_due"
    assert notifications_a[0]["title"] == "Project A notification"
    assert notifications_a[0]["message"] == "This belongs to Project A."

    response_b = client.get(
        f"/projects/{project_b_id}/notifications",
        headers=auth_headers(token),
    )

    assert response_b.status_code == 200
    assert response_b.json() == []


def test_list_unread_notifications(
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
        title="Unread Notification Task",
    )

    task_id = task["id"]

    me_response = client.get(
        "/me",
        headers=auth_headers(token),
    )

    assert me_response.status_code == 200

    user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Task due soon",
            message="Your task is due soon.",
        )

    response = client.get(
        f"/projects/{project_id}/notifications/unread",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    notifications = response.json()

    assert len(notifications) == 1

    notification = notifications[0]

    assert notification["user_id"] == user_id
    assert notification["type"] == "task_due"
    assert notification["title"] == "Task due soon"
    assert notification["message"] == "Your task is due soon."
    assert notification["is_read"] is False


def test_mark_notification_as_read(
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
        title="Read Notification Task",
    )

    task_id = task["id"]

    me_response = client.get(
        "/me",
        headers=auth_headers(token),
    )

    assert me_response.status_code == 200

    user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        notification = NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Task due",
            message="Due tomorrow",
        )

        notification_id = notification.id

    response = client.patch(
        (
            f"/projects/{project_id}/notifications/"
            f"{notification_id}/read"
        ),
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    notification_data = response.json()

    assert notification_data["id"] == notification_id
    assert notification_data["is_read"] is True


def test_mark_all_notifications_as_read(
    client: TestClient,
) -> None:
    token = create_authenticated_user(client)

    project = create_project(
        client,
        token,
    )

    project_id = project["id"]

    first_task = create_task(
        client,
        token,
        project_id,
        title="First Notification Task",
    )

    second_task = create_task(
        client,
        token,
        project_id,
        title="Second Notification Task",
    )

    me_response = client.get(
        "/me",
        headers=auth_headers(token),
    )

    assert me_response.status_code == 200

    user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=first_task["id"],
            notification_type="task_due",
            title="First notification",
            message="First message",
        )

        NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=second_task["id"],
            notification_type="task_due",
            title="Second notification",
            message="Second message",
        )

    response = client.patch(
        f"/projects/{project_id}/notifications/read-all",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "All project notifications marked as read"
    )
    assert data["updated_count"] == 2

    unread_response = client.get(
        f"/projects/{project_id}/notifications/unread",
        headers=auth_headers(token),
    )

    assert unread_response.status_code == 200
    assert unread_response.json() == []


def test_delete_notification(
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
        title="Delete Notification Task",
    )

    task_id = task["id"]

    me_response = client.get(
        "/me",
        headers=auth_headers(token),
    )

    assert me_response.status_code == 200

    user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        notification = NotificationService.create_notification(
            db,
            user_id=user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Delete me",
            message="Delete this notification",
        )

        notification_id = notification.id

    response = client.delete(
        (
            f"/projects/{project_id}/notifications/"
            f"{notification_id}"
        ),
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Notification deleted successfully"
    }

    notifications_response = client.get(
        f"/projects/{project_id}/notifications",
        headers=auth_headers(token),
    )

    assert notifications_response.status_code == 200
    assert notifications_response.json() == []


def test_another_user_cannot_mark_notification_as_read(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        username="Owner User",
        email="owner@example.com",
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
        title="Private Notification Task",
    )

    task_id = task["id"]

    other_token = create_authenticated_user(
        client,
        username="Other User",
        email="other@example.com",
    )

    me_response = client.get(
        "/me",
        headers=auth_headers(owner_token),
    )

    assert me_response.status_code == 200

    owner_user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        notification = NotificationService.create_notification(
            db,
            user_id=owner_user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Private notification",
            message="Only the owner may update this.",
        )

        notification_id = notification.id

    response = client.patch(
        (
            f"/projects/{project_id}/notifications/"
            f"{notification_id}/read"
        ),
        headers=auth_headers(other_token),
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Notification not found"
    }


def test_another_user_cannot_delete_notification(
    client: TestClient,
) -> None:
    owner_token = create_authenticated_user(
        client,
        username="Owner User",
        email="owner@example.com",
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
        title="Private Notification Task",
    )

    task_id = task["id"]

    other_token = create_authenticated_user(
        client,
        username="Other User",
        email="other@example.com",
    )

    me_response = client.get(
        "/me",
        headers=auth_headers(owner_token),
    )

    assert me_response.status_code == 200

    owner_user_id = me_response.json()["id"]

    with TestingSessionLocal() as db:
        notification = NotificationService.create_notification(
            db,
            user_id=owner_user_id,
            task_id=task_id,
            notification_type="task_due",
            title="Private notification",
            message="Only the owner may delete this.",
        )

        notification_id = notification.id

    response = client.delete(
        (
            f"/projects/{project_id}/notifications/"
            f"{notification_id}"
        ),
        headers=auth_headers(other_token),
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Notification not found"
    }

    owner_notifications_response = client.get(
        f"/projects/{project_id}/notifications",
        headers=auth_headers(owner_token),
    )

    assert owner_notifications_response.status_code == 200

    notifications = owner_notifications_response.json()

    assert len(notifications) == 1
    assert notifications[0]["id"] == notification_id