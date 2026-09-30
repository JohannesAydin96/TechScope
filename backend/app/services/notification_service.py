"""
Notification service for TechScope.

Handles creation, retrieval, read-state updates, and deletion
of user notifications scoped to specific projects.

"""

import logging

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.task import Task


logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        *,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        task_id: int | None = None,
        commit: bool = True,
    ) -> Notification:
        
        """
        Create and persist a notification.

        Set commit=False when the notification should be committed
        together with another database operation.

        """

        notification = Notification(
            user_id=user_id,
            task_id=task_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
        )

        db.add(notification)

        if commit:
            db.commit()
            db.refresh(notification)
        else:
            db.flush()

        logger.info(
            (
                "Notification created: "
                "notification_id=%s user_id=%s task_id=%s "
                "type=%s committed=%s"
            ),
            notification.id,
            user_id,
            task_id,
            notification_type,
            commit,
        )

        return notification

    @staticmethod
    def get_notifications(
        db: Session,
        *,
        user_id: int,
        project_id: int,
    ) -> list[Notification]:
        
        """
        Return notifications belonging to a user and project,
        ordered from newest to oldest.

        """

        return (
            db.query(Notification)
            .join(
                Task,
                Notification.task_id == Task.id,
            )
            .filter(
                Notification.user_id == user_id,
                Task.project_id == project_id,
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def get_unread_notifications(
        db: Session,
        *,
        user_id: int,
        project_id: int,
    ) -> list[Notification]:
        
        """
        Return unread notifications belonging to a user and project,
        ordered from newest to oldest.

        """

        return (
            db.query(Notification)
            .join(
                Task,
                Notification.task_id == Task.id,
            )
            .filter(
                Notification.user_id == user_id,
                Task.project_id == project_id,
                Notification.is_read.is_(False),
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def mark_as_read(
        db: Session,
        *,
        notification_id: int,
        user_id: int,
        project_id: int,
    ) -> Notification | None:
        
        """
        Mark one notification as read.

        Returns None if the notification does not exist,
        does not belong to the user,
        or does not belong to the project.

        """

        notification = (
            db.query(Notification)
            .join(
                Task,
                Notification.task_id == Task.id,
            )
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
                Task.project_id == project_id,
            )
            .first()
        )

        if notification is None:
            return None

        notification.is_read = True

        db.commit()
        db.refresh(notification)

        logger.info(
            (
                "Notification marked as read: "
                "notification_id=%s user_id=%s project_id=%s"
            ),
            notification_id,
            user_id,
            project_id,
        )

        return notification

    @staticmethod
    def mark_all_as_read(
        db: Session,
        *,
        user_id: int,
        project_id: int,
    ) -> int:
        
        """
        Mark all unread notifications belonging to a user
        and project as read.

        Returns the number of updated notifications.

        """
        project_task_ids = (
            db.query(Task.id)
            .filter(Task.project_id == project_id)
        )

        updated_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.task_id.in_(project_task_ids),
                Notification.is_read.is_(False),
            )
            .update(
                {
                    Notification.is_read: True,
                },
                synchronize_session=False,
            )
        )

        db.commit()

        logger.info(
            (
                "Notifications marked as read: "
                "user_id=%s project_id=%s updated_count=%s"
            ),
            user_id,
            project_id,
            updated_count,
        )

        return updated_count

    @staticmethod
    def delete_notification(
        db: Session,
        *,
        notification_id: int,
        user_id: int,
        project_id: int,
    ) -> bool:
        
        """
        Delete one notification.

        Returns False if the notification does not exist,
        does not belong to the user,
        or does not belong to the project.

        """

        notification = (
            db.query(Notification)
            .join(
                Task,
                Notification.task_id == Task.id,
            )
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
                Task.project_id == project_id,
            )
            .first()
        )

        if notification is None:
            return False

        db.delete(notification)
        db.commit()

        logger.info(
            (
                "Notification deleted: "
                "notification_id=%s user_id=%s project_id=%s"
            ),
            notification_id,
            user_id,
            project_id,
        )

        return True