import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-building fs-5" />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-white">Serene Haven</h5>
                <small className="text-white-50 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                  Boutique Guest House
                </small>
              </div>
            </div>
            <p className="text-white-50 small pe-lg-4 mb-3">
              Experience the tranquility of luxury boutique living in the heart of Islamabad. Personalized concierge service, exquisite suites, and tranquil botanical surroundings.
            </p>
            <div className="d-flex gap-3 fs-5 text-white-50">
              <a href="#facebook" className="text-white-50 hover-text-primary"><i className="bi bi-facebook" /></a>
              <a href="#instagram" className="text-white-50 hover-text-primary"><i className="bi bi-instagram" /></a>
              <a href="#tripadvisor" className="text-white-50 hover-text-primary"><i className="bi bi-star-fill text-warning" /></a>
              <a href="#whatsapp" className="text-white-50 hover-text-primary"><i className="bi bi-whatsapp text-success" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>
              Explore
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-white-50">
              <li><Link to="/" className="text-decoration-none text-white-50 hover-text-white">Home</Link></li>
              <li><Link to="/rooms" className="text-decoration-none text-white-50 hover-text-white">Our Rooms & Suites</Link></li>
              <li><Link to="/gallery" className="text-decoration-none text-white-50 hover-text-white">Photo Gallery</Link></li>
              <li><Link to="/about" className="text-decoration-none text-white-50 hover-text-white">About Guest House</Link></li>
              <li><Link to="/contact" className="text-decoration-none text-white-50 hover-text-white">Contact & Location</Link></li>
            </ul>
          </div>

          {/* Guest Services & Portals */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>
              Guest Portals
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-white-50">
              <li><Link to="/customer/dashboard" className="text-decoration-none text-white-50 hover-text-white">Customer Portal</Link></li>
              <li><Link to="/customer/bookings" className="text-decoration-none text-white-50 hover-text-white">My Booking History</Link></li>
              <li><Link to="/admin/dashboard" className="text-decoration-none text-white-50 hover-text-white">Staff / Admin Management</Link></li>
              <li><Link to="/login" className="text-decoration-none text-white-50 hover-text-white">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>
              Direct Contact
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-white-50 mb-3">
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt text-primary mt-0.5" />
                <span>Plot 14, Hillview Road, Sector F-6/3, Islamabad, Pakistan</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone text-primary" />
                <span>+92 51 289 4433</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope text-primary" />
                <span>contact@serenehavenguesthouse.com</span>
              </li>
            </ul>
            <div className="badge bg-secondary text-white py-1.5 px-3 rounded-pill">
              <i className="bi bi-check2-circle text-success me-1" /> Best Rate Guaranteed Online
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-white-50 small mb-0">
            &copy; {new Date().getFullYear()} Serene Haven Boutique Guest House. All rights reserved.
          </p>
          <div className="d-flex flex-wrap align-items-center gap-2 text-white-50 small">
            <span>Accepted Payments:</span>
            <span className="badge bg-dark border text-light py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5"><i className="bi bi-credit-card text-warning" /> Cards</span>
            <span className="badge bg-dark border text-light py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5"><i className="bi bi-bank text-info" /> Bank Transfer</span>
            <span className="badge bg-dark border text-light py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5"><i className="bi bi-phone text-success" /> Easypaisa / JazzCash</span>
            <span className="badge bg-dark border text-light py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5"><i className="bi bi-cash text-light" /> Cash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
