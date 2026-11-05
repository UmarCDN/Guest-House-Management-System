import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-light rounded-circle position-relative p-2 d-flex align-items-center justify-content-center text-secondary border"
        style={{ width: '40px', height: '40px' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <i className="bi bi-bell fs-5" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border border-light py-2"
          style={{ width: '340px', zIndex: 1050 }}
        >
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <span className="fw-bold text-dark small">Notifications</span>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-primary p-0 text-decoration-none small"
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-auto" style={{ maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-3 py-2.5 border-bottom border-light cursor-pointer transition-all ${
                    !notif.read ? 'bg-light bg-opacity-75' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div className="text-primary mt-0.5">
                      <i
                        className={`bi ${
                          notif.type === 'booking_new'
                            ? 'bi-calendar-plus text-primary'
                            : notif.type === 'payment_received'
                            ? 'bi-cash-coin text-success'
                            : notif.type === 'booking_cancelled'
                            ? 'bi-x-circle text-danger'
                            : 'bi-bell text-warning'
                        }`}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark small">{notif.title}</span>
                        <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.78rem' }}>
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link to={notif.link} className="text-primary fw-medium small text-decoration-none d-inline-block mt-1">
                          View details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
