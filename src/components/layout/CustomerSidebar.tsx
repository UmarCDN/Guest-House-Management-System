import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface CustomerSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`bg-white border-end d-flex flex-column flex-shrink-0 transition-all ${
          isMobileOpen ? 'show' : ''
        }`}
        style={{
          width: '260px',
          minHeight: '100vh',
          zIndex: 1045,
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        {/* Brand */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <Link to="/" className="text-dark text-decoration-none d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-building fs-5" />
            </div>
            <div>
              <span className="fw-bold fs-6 d-block leading-none">Serene Haven</span>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Guest Portal</small>
            </div>
          </Link>
          <button
            type="button"
            className="btn-close d-lg-none"
            onClick={onCloseMobile}
            aria-label="Close"
          />
        </div>

        {/* User Card */}
        <div className="p-3 bg-light m-2 rounded-3 border">
          <div className="d-flex align-items-center gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name}
              className="rounded-circle"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div className="overflow-hidden">
              <h6 className="fw-bold text-dark mb-0 text-truncate small">{user?.name || 'Guest'}</h6>
              <small className="text-muted text-truncate d-block" style={{ fontSize: '0.72rem' }}>
                {user?.email}
              </small>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-grow-1 p-2">
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <NavLink
                to="/customer/dashboard"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 text-secondary ${
                    isActive ? 'active bg-primary text-white fw-semibold shadow-sm' : 'hover-bg-light'
                  }`
                }
                onClick={onCloseMobile}
              >
                <i className="bi bi-grid-1x2 fs-6" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/customer/bookings"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 text-secondary ${
                    isActive ? 'active bg-primary text-white fw-semibold shadow-sm' : 'hover-bg-light'
                  }`
                }
                onClick={onCloseMobile}
              >
                <i className="bi bi-calendar-check fs-6" />
                <span>My Bookings</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/customer/profile"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 text-secondary ${
                    isActive ? 'active bg-primary text-white fw-semibold shadow-sm' : 'hover-bg-light'
                  }`
                }
                onClick={onCloseMobile}
              >
                <i className="bi bi-person-gear fs-6" />
                <span>My Profile</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-top d-flex flex-column gap-2">
          <Link to="/rooms" className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-plus-circle" />
            <span>Book Another Room</span>
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-light text-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-box-arrow-right" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
