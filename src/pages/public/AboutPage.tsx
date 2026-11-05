import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div>
      {/* Hero Banner */}
      <div
        className="py-5 text-white text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container py-5">
          <h1 className="display-4 fw-extrabold text-white mb-2">About Serene Haven</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '650px' }}>
            A premier boutique residence dedicated to the art of personalized hospitality and tranquility in Islamabad.
          </p>
        </div>
      </div>

      {/* Story & Philosophy */}
      <div className="container py-5">
        <div className="row align-items-center g-5 mb-5">
          <div className="col-lg-6">
            <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
              Our Story
            </span>
            <h2 className="display-6 fw-bold text-dark mb-3">Refined Living with Warm Hospitality</h2>
            <p className="text-secondary leading-relaxed mb-3">
              Founded with the vision to create a tranquil sanctuary amidst the bustling diplomatic and cultural capital of Pakistan, Serene Haven blends classical architectural charm with modern bespoke luxury.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              Whether you are an international diplomat attending high-level meetings, an executive working remotely, or a family exploring the picturesque Margalla Hills, our tailored service ensures every stay feels like returning home.
            </p>
            <div className="row g-3">
              <div className="col-6">
                <div className="border-start border-primary border-4 ps-3">
                  <h3 className="fw-bold text-dark font-monospace mb-0">8+</h3>
                  <small className="text-muted">Exclusive Luxury Suites</small>
                </div>
              </div>
              <div className="col-6">
                <div className="border-start border-primary border-4 ps-3">
                  <h3 className="fw-bold text-dark font-monospace mb-0">98%</h3>
                  <small className="text-muted">Guest Satisfaction Rate</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80"
              alt="Serene Haven Lobby"
              className="rounded-4 shadow-lg w-100 object-fit-cover"
              style={{ maxHeight: '420px' }}
            />
          </div>
        </div>

        {/* Pillars of Hospitality */}
        <div className="bg-light p-4 p-md-5 rounded-4 border">
          <h3 className="fw-bold text-dark text-center mb-4">Our Core Pillars</h3>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="fs-1 text-primary mb-2"><i className="bi bi-shield-heart" /></div>
              <h5 className="fw-bold text-dark mb-2">Uncompromised Privacy</h5>
              <p className="text-muted small mb-0">Discreet executive suites with soundproofing, secure biometric access, and 24/7 security guard presence.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="fs-1 text-primary mb-2"><i className="bi bi-gem" /></div>
              <h5 className="fw-bold text-dark mb-2">Bespoke Excellence</h5>
              <p className="text-muted small mb-0">From custom organic breakfast menus to dedicated concierge travel arrangements, every detail is considered.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="fs-1 text-primary mb-2"><i className="bi bi-tree" /></div>
              <h5 className="fw-bold text-dark mb-2">Natural Serenity</h5>
              <p className="text-muted small mb-0">Verdant botanical gardens, terrace pergolas, and clean mountain air right in the heart of Sector F-6.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
