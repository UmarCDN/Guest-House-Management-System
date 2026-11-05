import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1030 }}>
      {/* Top micro bar for contact info */}
      <div className="bg-dark text-light py-1.5 px-3 px-lg-4 small d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4 text-light text-opacity-75">
            <span>
              <i className="bi bi-geo-alt me-1 text-warning" /> Sector F-6/3, Islamabad
            </span>
            <span>
              <i className="bi bi-telephone me-1 text-warning" /> +92 51 289 4433
            </span>
            <span>
              <i className="bi bi-clock me-1 text-warning" /> 24/7 Front Desk Support
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-warning text-decoration-none fw-medium">
                <i className="bi bi-shield-lock me-1" /> Admin Dashboard
              </Link>
            )}
            {isCustomer && (
              <Link to="/customer/dashboard" className="text-info text-decoration-none fw-medium">
                <i className="bi bi-person me-1" /> Customer Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '42px', height: '42px' }}
            >
              <i className="bi bi-building fs-5" />
            </div>
            <div>
              <span className="fw-bold text-dark fs-5 tracking-tight d-block leading-none">
                Serene Haven
              </span>
              <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                Boutique Guest House
              </span>
            </div>
          </Link>

          {/* Mobile hamburger button */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Nav links */}
          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
              <li className="nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary active fw-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/rooms"
                  className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary active fw-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Rooms & Suites
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/gallery"
                  className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary active fw-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/about"
                  className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary active fw-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/contact"
                  className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-primary active fw-bold' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* Auth CTA */}
            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              {isAuthenticated && user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2 py-1.5 px-3 rounded-pill"
                    type="button"
                    data-bs-toggle="dropdown"
                    onClick={() => {
                      if (isAdmin) navigate('/admin/dashboard');
                      else navigate('/customer/dashboard');
                    }}
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={user.name}
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold text-dark">{user.name.split(' ')[0]}</span>
                  </button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    icon="bi-box-arrow-right"
                    onClick={handleLogout}
                    className="ms-1"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-secondary btn-sm px-3.5 py-1.5 rounded-pill fw-medium">
                    <i className="bi bi-box-arrow-in-right" />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/rooms" className="btn btn-primary btn-sm px-3.5 py-1.5 rounded-pill fw-medium shadow-sm">
                    <i className="bi bi-calendar-plus" />
                    <span>Book a Room</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
