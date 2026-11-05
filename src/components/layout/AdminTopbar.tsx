import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface AdminTopbarProps {
  onToggleMobileSidebar: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/bookings?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-bottom sticky-top py-2.5 px-3 px-lg-4" style={{ zIndex: 1020 }}>
      <div className="d-flex align-items-center justify-content-between">
        {/* Left: Mobile menu toggle & Global search */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light border d-lg-none p-2 text-secondary"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation"
          >
            <i className="bi bi-list fs-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center">
            <div className="input-group input-group-sm" style={{ width: '280px' }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search bookings, guests, rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="d-flex align-items-center gap-3">
          <NotificationDropdown />

          <div className="dropdown">
            <button
              className="btn btn-light border-0 d-flex align-items-center gap-2 p-1.5 rounded-pill dropdown-toggle"
              type="button"
              id="adminProfileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name || 'Admin'}
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
              <div className="text-start d-none d-sm-block pe-1">
                <span className="fw-bold text-dark small d-block leading-tight">{user?.name || 'Admin'}</span>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Administrator</small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3" aria-labelledby="adminProfileDropdown">
              <li>
                <div className="px-3 py-2 border-bottom">
                  <span className="fw-bold text-dark small d-block">{user?.name}</span>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center gap-2 text-danger small py-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
