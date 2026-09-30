/**
 * Notification panel for TechScope.
 *
 * Displays and manages project-scoped notifications,
 * including read states, deletion, loading, and errors.
 */

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { notificationService } from "../services/notificationService";
import type { Notification } from "../types/notification";

interface NotificationPanelProps {
  projectId: number;
  onNotificationsChanged: () => void | Promise<void>;
  onClose: () => void;
}

function NotificationPanel({
  projectId,
  onNotificationsChanged,
  onClose,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<
    number | null
  >(null);
  const [markingAllAsRead, setMarkingAllAsRead] =
    useState(false);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

useEffect(() => {
  let cancelled = false;

  async function fetchNotifications() {
    try {
      const data =
        await notificationService.getNotifications(
          projectId
        );

      if (!cancelled) {
        setNotifications(data);
        setError("");
      }
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      if (!cancelled) {
        setError("Failed to load notifications.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchNotifications();

  return () => {
    cancelled = true;
  };
}, [projectId]);

  async function handleMarkAsRead(
    notification: Notification
  ) {
    if (
      notification.is_read ||
      updatingId === notification.id ||
      deletingId === notification.id
    ) {
      return;
    }

    try {
      setUpdatingId(notification.id);
      setError("");

      await notificationService.markAsRead(
        projectId,
        notification.id
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map(
          (currentNotification) =>
            currentNotification.id ===
            notification.id
              ? {
                  ...currentNotification,
                  is_read: true,
                }
              : currentNotification
        )
      );

      await onNotificationsChanged();
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
      setError("Failed to update notification.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    if (markingAllAsRead) {
      return;
    }

    try {
      setMarkingAllAsRead(true);
      setError("");

      await notificationService.markAllAsRead(
        projectId
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      await onNotificationsChanged();
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
      setError("Failed to update notifications.");
    } finally {
      setMarkingAllAsRead(false);
    }
  }

  async function handleDeleteNotification(
    event: MouseEvent<HTMLButtonElement>,
    notificationId: number
  ) {
    event.stopPropagation();

    if (deletingId === notificationId) {
      return;
    }

    try {
      setDeletingId(notificationId);
      setError("");

      await notificationService.deleteNotification(
        projectId,
        notificationId
      );

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );

      await onNotificationsChanged();
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );
      setError("Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  }

  const hasUnreadNotifications =
    notifications.some(
      (notification) => !notification.is_read
    );

  if (loading) {
    return (
      <section
        className="notification-panel"
        aria-labelledby="notification-panel-title"
        aria-busy="true"
      >
        <div className="notification-panel-header">
          <h3 id="notification-panel-title">
            Notifications
          </h3>

          <button
            type="button"
            className="notification-close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        <p
          className="notification-panel-message"
          role="status"
        >
          Loading notifications...
        </p>
      </section>
    );
  }

  return (
    <section
      className="notification-panel"
      aria-labelledby="notification-panel-title"
    >
      <div className="notification-panel-header">
        <h3 id="notification-panel-title">
          Notifications
        </h3>

        <div className="notification-header-actions">
          {hasUnreadNotifications && (
            <button
              type="button"
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              disabled={markingAllAsRead}
              aria-busy={markingAllAsRead}
            >
              {markingAllAsRead
                ? "Marking as read..."
                : "Mark all as read"}
            </button>
          )}

          <button
            type="button"
            className="notification-close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>
      </div>

      {error && (
        <p
          className="notification-panel-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {notifications.length === 0 ? (
        <div
          className="notification-empty-state"
          role="status"
        >
          <div
            className="notification-empty-icon"
            aria-hidden="true"
          >
            🔔
          </div>

          <h4>No notifications yet</h4>

          <p>
            You&apos;ll see updates here when tasks
            change status.
          </p>
        </div>
      ) : (
        <div
          className="notification-list"
          role="list"
          aria-label="Notifications"
        >
          {notifications.map((notification) => {
            const isUpdating =
              updatingId === notification.id;
            const isDeleting =
              deletingId === notification.id;
            const titleId =
              `notification-title-${notification.id}`;

            return (
              <article
                key={notification.id}
                className={`notification-item ${
                  notification.is_read
                    ? "read"
                    : "unread"
                } ${
                  isUpdating || isDeleting
                    ? "updating"
                    : ""
                }`}
                onClick={() =>
                  handleMarkAsRead(notification)
                }
                onKeyDown={(event) => {
                  if (
                    !notification.is_read &&
                    !isUpdating &&
                    !isDeleting &&
                    (event.key === "Enter" ||
                      event.key === " ")
                  ) {
                    event.preventDefault();
                    handleMarkAsRead(notification);
                  }
                }}
                role={
                  notification.is_read
                    ? "listitem"
                    : "button"
                }
                tabIndex={
                  notification.is_read ||
                  isUpdating ||
                  isDeleting
                    ? -1
                    : 0
                }
                aria-labelledby={titleId}
                aria-label={
                  notification.is_read
                    ? undefined
                    : `Mark ${notification.title} as read`
                }
                aria-busy={isUpdating || isDeleting}
              >
                <div className="notification-item-content">
                  <div className="notification-item-heading">
                    {!notification.is_read && (
                      <span
                        className="notification-unread-dot"
                        aria-hidden="true"
                      />
                    )}

                    <strong id={titleId}>
                      {notification.title}
                    </strong>

                    <button
                      type="button"
                      className="notification-delete-btn"
                      onClick={(event) =>
                        handleDeleteNotification(
                          event,
                          notification.id
                        )
                      }
                      disabled={isDeleting}
                      aria-label={`Delete ${notification.title}`}
                      aria-busy={isDeleting}
                    >
                      <span aria-hidden="true">
                        🗑
                      </span>
                    </button>
                  </div>

                  <p>{notification.message}</p>

                  <time
                    dateTime={notification.created_at}
                  >
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </time>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default NotificationPanel;