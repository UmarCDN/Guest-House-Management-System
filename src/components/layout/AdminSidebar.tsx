import React from 'react';
import { NavLink, Link } from 'react-router-dom';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: string;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: 'bi-grid-1x2' },
  { label: 'Front Desk (Walk-in)', to: '/admin/front-desk', icon: 'bi-reception-4', badge: 'Instant' },
  { label: 'Bookings', to: '/admin/bookings', icon: 'bi-calendar-check', badge: 'Live' },
  { label: 'Rooms', to: '/admin/rooms', icon: 'bi-door-open' },
  { label: 'Room Types', to: '/admin/room-types', icon: 'bi-tags' },
  { label: 'Guests', to: '/admin/guests', icon: 'bi-people' },
  { label: 'Payments', to: '/admin/payments', icon: 'bi-cash-stack' },
  { label: 'Reports', to: '/admin/reports', icon: 'bi-graph-up' },
  { label: 'Staff', to: '/admin/staff', icon: 'bi-person-badge' },
  { label: 'Reviews', to: '/admin/reviews', icon: 'bi-star' },
  { label: 'Gallery', to: '/admin/gallery', icon: 'bi-images' },
  { label: 'Facilities', to: '/admin/facilities', icon: 'bi-shield-check' },
  { label: 'Settings', to: '/admin/settings', icon: 'bi-gear' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-dark text-white d-flex flex-column flex-shrink-0 transition-all ${
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
        {/* Brand Header */}
        <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <Link to="/admin/dashboard" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-building fs-5" />
            </div>
            <div>
              <span className="fw-bold fs-6 d-block leading-none">Serene Haven</span>
              <small className="text-white-50 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                Admin Portal
              </small>
            </div>
          </Link>
          <button
            type="button"
            className="btn-close btn-close-white d-lg-none"
            onClick={onCloseMobile}
            aria-label="Close"
          />
        </div>

        {/* Navigation items */}
        <div className="flex-grow-1 p-2">
          <div className="text-uppercase text-white-50 small px-3 py-2 fw-semibold" style={{ fontSize: '0.7rem' }}>
            Main Menu
          </div>
          <ul className="nav nav-pills flex-column gap-1">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center justify-content-between py-2.5 px-3 rounded-3 text-white-50 ${
                      isActive ? 'active bg-primary text-white fw-semibold shadow-sm' : 'hover-bg-secondary'
                    }`
                  }
                  onClick={onCloseMobile}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <i className={`bi ${item.icon} fs-6`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="badge bg-danger rounded-pill font-monospace" style={{ fontSize: '0.65rem' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Shortcut to Public Website */}
        <div className="p-3 border-top border-secondary border-opacity-25">
          <Link
            to="/"
            target="_blank"
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-box-arrow-up-right" />
            <span>View Public Site</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
