import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useNotifications, type NotificationItem } from "../../context/NotificationContext";
import "./NotificationsDropdown.scss";
import { getIcon, formatTime } from "../../utils/utils";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
        aria-label="Abrir notificaciones"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="panel-header">
            <div className="header-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-counter">{unreadCount} news</span>
              )}
            </div>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <span className="material-symbols-outlined">done_all</span>
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="icon-action-btn"
                  onClick={clearAll}
                  title="Clear all"
                >
                  <span className="material-symbols-outlined">delete_sweep</span>
                </button>
              )}
            </div>
          </div>

          <div className="panel-body">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <span className="material-symbols-outlined">notifications_off</span>
                <p>You don't have any notifications right now.</p>
              </div>
            ) : (
              <ul className="notifications-list">
                {notifications.map((item) => {
                  const { icon, className } = getIcon(item.type);
                  return (
                    <li
                      key={item.id}
                      className={`notification-item ${item.read ? "read" : "unread"}`}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div className={`notification-icon-wrap ${className}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>

                      <div className="notification-content">
                        <div className="item-title-row">
                          <h4 className="item-title">{item.title}</h4>
                          <span className="item-time">{formatTime(item.timestamp)}</span>
                        </div>
                        <p className="item-message">{item.message}</p>
                      </div>

                      <div className="notification-actions">
                        {!item.read && <span className="unread-dot" title="Not read" />}
                        <button
                          type="button"
                          className="dismiss-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(item.id);
                          }}
                          title="Delete notification"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
