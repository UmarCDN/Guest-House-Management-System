import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CustomerSidebar } from '../components/layout/CustomerSidebar';
import { ToastContainer } from '../components/common/Toast';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';

export const CustomerLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <CustomerSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="d-flex flex-column flex-grow-1 min-w-0">
        <header className="bg-white border-bottom sticky-top py-2.5 px-3 px-md-4 d-flex align-items-center justify-content-between" style={{ zIndex: 1020 }}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light border d-lg-none p-2 text-secondary"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <i className="bi bi-list fs-5" />
            </button>
            <span className="fw-semibold text-dark small d-none d-sm-inline">
              Welcome back to your Serene Haven member portal
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link to="/rooms" className="btn btn-primary btn-sm rounded-pill d-none d-sm-inline-flex align-items-center gap-1.5">
              <i className="bi bi-plus-circle" /> Book a Room
            </Link>
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-grow-1 p-3 p-md-4">
          <div className="container-fluid max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
