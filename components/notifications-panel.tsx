"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  notificationType: string;
  entityType: string;
  entityId: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsPanelProps = {
  compact?: boolean;
};

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationsPanel({ compact }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const visibleNotifications = useMemo(() => {
    return compact ? notifications.slice(0, 5) : notifications;
  }, [compact, notifications]);

  async function loadNotifications() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/notifications");
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not load notifications.");
        return;
      }

      setNotifications(
        Array.isArray(result?.notifications) ? result.notifications : []
      );
      setUnreadCount(Number(result?.unreadCount || 0));
    } catch {
      setErrorMessage("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  async function markRead(notificationId: string) {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );

    setUnreadCount((current) => Math.max(0, current - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", {
      method: "POST",
    });

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadCount(0);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <section className="gb-card">
      <div className="gb-card-header">
        <div>
          <p className="gb-eyebrow">Notifications</p>
          <h2>
            Notifications{" "}
            {unreadCount > 0 ? (
              <span className="gb-status-pill">{unreadCount} unread</span>
            ) : null}
          </h2>
        </div>

        <div className="gb-action-row">
          <button
            type="button"
            className="gb-button gb-button-secondary"
            onClick={loadNotifications}
            disabled={isLoading}
          >
            Refresh
          </button>

          <button
            type="button"
            className="gb-button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>
      </div>

      {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

      {isLoading ? <p className="gb-muted-text">Loading notifications...</p> : null}

      {!isLoading && visibleNotifications.length === 0 ? (
        <div className="gb-empty-state">
          <h3>No notifications yet</h3>
          <p>Your important GearBeat updates will appear here.</p>
        </div>
      ) : null}

      {!isLoading && visibleNotifications.length > 0 ? (
        <div className="gb-dashboard-stack">
          {visibleNotifications.map((notification) => (
            <article
              key={notification.id}
              className={notification.isRead ? "gb-card" : "gb-card gb-card-highlight"}
            >
              <div className="gb-card-header">
                <div>
                  <p className="gb-eyebrow">{notification.notificationType}</p>
                  <h3>{notification.title}</h3>
                  {notification.body ? (
                    <p className="gb-muted-text">{notification.body}</p>
                  ) : null}
                  <p className="gb-muted-text">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>

                <div className="gb-action-row">
                  {notification.actionUrl ? (
                    <Link
                      href={notification.actionUrl}
                      className="gb-button gb-button-small"
                      onClick={() => markRead(notification.id)}
                    >
                      Open
                    </Link>
                  ) : null}

                  {!notification.isRead ? (
                    <button
                      type="button"
                      className="gb-button gb-button-small gb-button-secondary"
                      onClick={() => markRead(notification.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {compact ? (
        <div className="gb-card-footer">
          <Link href="/notifications" className="gb-text-link">
            View all notifications
          </Link>
        </div>
      ) : null}
    </section>
  );
}
