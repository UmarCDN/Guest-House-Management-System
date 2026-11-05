import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container py-5 text-center min-vh-75 d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-sm rounded-4 p-5 max-w-md mx-auto bg-white">
        <div className="display-1 fw-bold text-primary mb-2 font-monospace">404</div>
        <h3 className="fw-bold text-dark mb-2">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page or suite you are searching for might have been moved or is currently unavailable.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-primary rounded-pill px-4">
            Return Home
          </Link>
          <Link to="/rooms" className="btn btn-outline-secondary rounded-pill px-4">
            Browse Rooms
          </Link>
        </div>
      </div>
    </div>
  );
};
