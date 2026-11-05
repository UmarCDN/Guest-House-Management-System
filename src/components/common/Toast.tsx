import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1090 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show border-0 shadow-lg mb-2 rounded-3 text-bg-${t.type}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex align-items-center justify-content-between p-3">
            <div className="d-flex align-items-center gap-2">
              <i
                className={`bi ${
                  t.type === 'success'
                    ? 'bi-check-circle-fill'
                    : t.type === 'danger'
                    ? 'bi-exclamation-octagon-fill'
                    : t.type === 'warning'
                    ? 'bi-exclamation-triangle-fill'
                    : 'bi-info-circle-fill'
                } fs-5`}
              />
              <div>
                {t.title && <div className="fw-bold">{t.title}</div>}
                <div className="small">{t.message}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white ms-3"
              onClick={() => removeToast(t.id)}
              aria-label="Close"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
