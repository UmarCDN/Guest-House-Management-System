import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="container py-5 text-center min-vh-75 d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-sm rounded-4 p-5 max-w-md mx-auto bg-white">
        <div className="display-1 fw-bold text-danger mb-2">
          <i className="bi bi-shield-lock" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Access Restricted</h3>
        <p className="text-muted mb-4">
          You do not possess the required administrator privileges to access this management area. Please sign in with an administrative account.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-light border rounded-pill px-4">
            Go Home
          </Link>
          <Link to="/login" className="btn btn-primary rounded-pill px-4">
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};
