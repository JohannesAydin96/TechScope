/**
 * Navigation bar for the TechScope dashboard.
 *
 * Handles logout and project-scoped notifications,
 * including notification visibility and unread counts.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationPanel from "./NotificationPanel";
import { notificationService } from "../services/notificationService";

type Props = {
  selectedProjectId: number | null;
};

type UnreadCountState = {
  projectId: number | null;
  count: number;
};

export default function Navbar({
  selectedProjectId,
}: Props) {
  const navigate = useNavigate();

  const [
    notificationsProjectId,
    setNotificationsProjectId,
  ] = useState<number | null>(null);

  const [unreadCountState, setUnreadCountState] =
    useState<UnreadCountState>({
      projectId: null,
      count: 0,
    });

  const showNotifications =
    selectedProjectId !== null &&
    notificationsProjectId === selectedProjectId;

  const unreadCount =
    selectedProjectId !== null &&
    unreadCountState.projectId === selectedProjectId
      ? unreadCountState.count
      : 0;

  useEffect(() => {
    if (selectedProjectId === null) {
      return;
    }

    const projectId = selectedProjectId;
    let cancelled = false;

    async function loadProjectUnreadCount() {
      try {
        const unreadNotifications =
          await notificationService.getUnreadNotifications(
            projectId,
          );

        if (!cancelled) {
          setUnreadCountState({
            projectId,
            count: unreadNotifications.length,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load unread notifications:",
            error,
          );
        }
      }
    }

    void loadProjectUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  async function loadUnreadCount() {
    if (selectedProjectId === null) {
      return;
    }

    try {
      const unreadNotifications =
        await notificationService.getUnreadNotifications(
          selectedProjectId,
        );

      setUnreadCountState({
        projectId: selectedProjectId,
        count: unreadNotifications.length,
      });
    } catch (error) {
      console.error(
        "Failed to load unread notifications:",
        error,
      );
    }
  }

  function logout() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  async function toggleNotifications() {
    if (selectedProjectId === null) {
      return;
    }

    if (!showNotifications) {
      await loadUnreadCount();
      setNotificationsProjectId(selectedProjectId);
      return;
    }

    setNotificationsProjectId(null);
  }

  return (
    <nav
      className="navbar"
      aria-label="Main navigation"
    >
      <div className="navbar-actions">
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-btn"
            onClick={toggleNotifications}
            aria-label={`Open notifications. ${unreadCount} unread.`}
            aria-expanded={showNotifications}
            aria-controls="notification-panel"
          >
            <span aria-hidden="true">🔔</span>

            {unreadCount > 0 && (
              <span
                className="notification-badge"
                aria-hidden="true"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications &&
            selectedProjectId !== null && (
              <div
                id="notification-panel"
                className="notification-dropdown"
              >
                <NotificationPanel
                  projectId={selectedProjectId}
                  onNotificationsChanged={
                    loadUnreadCount
                  }
                  onClose={() =>
                    setNotificationsProjectId(null)
                  }
                />
              </div>
            )}
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={logout}
          aria-label="Log out"
        >
          <span
            className="logout-icon"
            aria-hidden="true"
          >
            ↪
          </span>

          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}