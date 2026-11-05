import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { Room } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { Loader } from '../../components/common/Loader';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

export const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, updateDraft, setDraftRoom, calculatePricing } = useBooking();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevImage = () => {
    if (!room || !room.images.length) return;
    setActiveImageIndex((prev) => (prev === 0 ? room.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!room || !room.images.length) return;
    setActiveImageIndex((prev) => (prev === room.images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room]);

  // Local reservation widget form state
  const [checkIn, setCheckIn] = useState(draft.checkIn);
  const [checkOut, setCheckOut] = useState(draft.checkOut);
  const [adults, setAdults] = useState(draft.adults);
  const [children, setChildren] = useState(draft.children);
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [bookedDates, setBookedDates] = useState<{ checkIn: string; checkOut: string }[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      try {
        const [found, booked] = await Promise.all([
          roomService.getById(id),
          roomService.getBookedDates(id)
        ]);
        if (found) {
          setRoom(found);
          setDraftRoom(found);
        }
        if (booked) {
          setBookedDates(booked);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (isLoading) {
    return <Loader fullPage message="Loading room details..." />;
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold">Room not found</h3>
        <p className="text-muted">The requested room does not exist or may have been updated.</p>
        <Link to="/rooms" className="btn btn-primary">Back to Room Search</Link>
      </div>
    );
  }

  // Dynamic price calculation
  const pricing = calculatePricing(room, checkIn, checkOut, numberOfRooms);

  // Date conflict reservation check
  const isReservedForDates = Boolean(
    checkIn &&
    checkOut &&
    bookedDates.some((b) => checkIn < b.checkOut && checkOut > b.checkIn)
  );

  const handleProceedBooking = () => {
    if (isReservedForDates) return;
    updateDraft({
      checkIn,
      checkOut,
      adults,
      children,
      numberOfRooms,
      ...pricing
    });
    setDraftRoom(room);
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/booking' },
          message: 'Please sign in or create an account to finalize your booking.'
        }
      });
    } else {
      navigate('/booking');
    }
  };

  return (
    <div className="bg-light py-4 py-md-5">
      <div className="container">
        {/* Breadcrumb navigation */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/rooms" className="text-decoration-none text-muted">Rooms</Link></li>
            <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">{room.name}</li>
          </ol>
        </nav>

        {/* Title Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary text-white rounded-pill px-3 py-1.5">{room.type}</span>
              <span className={`badge ${room.status === 'Available' && !isReservedForDates ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 py-1.5`}>
                {room.status}
              </span>
              {isReservedForDates && (
                <span className="badge bg-danger rounded-pill px-3 py-1.5 shadow-sm">
                  <i className="bi bi-calendar-x me-1" /> Reserved for dates
                </span>
              )}
              <span className="text-muted small">Floor {room.floor} • Room #{room.roomNumber}</span>
            </div>
            <h1 className="h2 fw-bold text-dark mb-1">{room.name}</h1>
            <div className="d-flex align-items-center gap-2">
              <StarRating rating={room.rating} showNumber reviewsCount={room.reviewCount} size="sm" />
              <span className="text-muted small">• Sector F-6/3, Islamabad</span>
            </div>
          </div>

          <div className="text-md-end">
            <span className="text-muted small d-block">Starting from</span>
            <div className="d-flex align-items-baseline gap-1 justify-content-md-end">
              <span className="h2 fw-bold text-primary font-monospace mb-0">
                {formatCurrency(pricing.roomPrice)}
              </span>
              <span className="text-muted small">/ night</span>
            </div>
            {room.discount > 0 && (
              <small className="badge bg-danger text-white rounded-pill">
                Includes {room.discount}% promotional savings
              </small>
            )}
          </div>
        </div>

        {/* Details Content & Sticky Booking Form Column */}
        <div className="row g-4">
          {/* Left Column: Room Gallery, Specs, Amenities, Rules */}
          <div className="col-lg-8">
            {/* Integrated Room Photo Gallery Showcase */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              {/* Main Photo Display */}
              <div
                className="position-relative gallery-main-container overflow-hidden"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={room.images[activeImageIndex] || room.images[0]}
                  alt={`${room.name} - Photo ${activeImageIndex + 1}`}
                  className="w-100 h-100 object-fit-cover"
                />

                {/* Badges on Top */}
                <div className="position-absolute top-0 start-0 p-3 d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white rounded-pill px-3 py-1.5 shadow-sm">
                    {room.type}
                  </span>
                  {room.discount > 0 && (
                    <span className="badge bg-danger text-white rounded-pill px-3 py-1.5 shadow-sm">
                      <i className="bi bi-tag-fill me-1" /> {room.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Overlay Prev / Next Navigation Buttons */}
                {room.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-nav-btn prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      title="Previous Image (Left Arrow)"
                      aria-label="Previous Image"
                    >
                      <i className="bi bi-chevron-left fs-5" />
                    </button>
                    <button
                      type="button"
                      className="gallery-nav-btn next"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      title="Next Image (Right Arrow)"
                      aria-label="Next Image"
                    >
                      <i className="bi bi-chevron-right fs-5" />
                    </button>
                  </>
                )}

                {/* Bottom Overlay Gradient Bar */}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center"
                  style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 100%)' }}
                >
                  <span className="text-white small fw-medium d-none d-sm-flex align-items-center gap-1.5">
                    <i className="bi bi-geo-alt-fill text-warning" /> Sector F-6/3, Islamabad
                  </span>

                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <span className="badge bg-black bg-opacity-60 text-white border border-white border-opacity-25 px-3 py-1.5 rounded-pill">
                      <i className="bi bi-camera me-1.5" />
                      {activeImageIndex + 1} / {room.images.length} Photos
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-light bg-white text-dark rounded-pill px-3 py-1 shadow-sm d-flex align-items-center gap-1.5 fw-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                    >
                      <i className="bi bi-arrows-fullscreen" />
                      <span className="d-none d-sm-inline">Full View</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Thumbnail Selector Bar */}
              {room.images.length > 1 && (
                <div className="p-3 bg-white border-top">
                  <div className="row g-2 align-items-center">
                    {room.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`col-${Math.max(2, Math.floor(12 / room.images.length))}`}
                      >
                        <div
                          className={`gallery-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                          style={{ height: '78px', cursor: 'pointer' }}
                          onClick={() => setActiveImageIndex(idx)}
                          title={`View photo ${idx + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${room.name} thumbnail ${idx + 1}`}
                            className="w-100 h-100 object-fit-cover"
                          />
                          {activeImageIndex === idx && (
                            <div className="position-absolute top-0 end-0 m-1">
                              <span className="badge bg-primary p-1 rounded-circle">
                                <i className="bi bi-check" style={{ fontSize: '0.65rem' }} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs Cards */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">Room Specifications</h5>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <i className="bi bi-arrows-fullscreen text-primary fs-4 d-block mb-1" />
                    <small className="text-muted d-block">Room Size</small>
                    <strong className="text-dark">{room.roomSize} sq ft</strong>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <i className="bi bi-people text-primary fs-4 d-block mb-1" />
                    <small className="text-muted d-block">Occupancy</small>
                    <strong className="text-dark">Up to {room.maxAdults + room.maxChildren} Guests</strong>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <i className="bi bi-lamp text-primary fs-4 d-block mb-1" />
                    <small className="text-muted d-block">Bed Config</small>
                    <strong className="text-dark">{room.bedType}</strong>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <i className="bi bi-building text-primary fs-4 d-block mb-1" />
                    <small className="text-muted d-block">Location</small>
                    <strong className="text-dark">Floor {room.floor}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-2">Description</h5>
              <p className="text-secondary leading-relaxed mb-0">{room.description}</p>
            </div>

            {/* Amenities Grid */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">Room Amenities & Inclusions</h5>
              <div className="row g-3">
                {room.amenities.map((amenity, i) => (
                  <div key={i} className="col-md-6 col-sm-6">
                    <div className="d-flex align-items-center gap-2 text-dark small">
                      <i className="bi bi-check-circle-fill text-success fs-6" />
                      <span>{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold text-dark mb-3">House Rules & Cancellation Policy</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-bold small text-uppercase text-secondary mb-2">Check-in / Check-out</h6>
                  <ul className="list-unstyled small text-muted d-flex flex-column gap-2.5">
                    <li><i className="bi bi-clock me-2 text-primary" /> Check-in: <strong>14:00 (2:00 PM)</strong></li>
                    <li><i className="bi bi-clock-history me-2 text-primary" /> Check-out: <strong>12:00 (12:00 PM)</strong></li>
                    <li><i className="bi bi-card-heading me-2 text-primary" /> Valid CNIC or Passport required</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold small text-uppercase text-secondary mb-2">Cancellation Policy</h6>
                  <p className="small text-muted mb-0">
                    Free cancellation up to <strong>48 hours</strong> prior to arrival. Cancellations inside 48 hours are subject to standard 1-night tariff charge.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Calculation Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Reserve This Room</h5>
                <span className={`badge ${isReservedForDates ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                  {isReservedForDates ? 'Unavailable' : 'Best Rate'}
                </span>
              </div>

              {/* Conflict Alert Banner */}
              {isReservedForDates && (
                <div className="alert alert-danger d-flex align-items-start gap-2 p-3 mb-3 rounded-3 shadow-sm border-danger">
                  <i className="bi bi-calendar-x fs-5 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="d-block mb-1">Room Already Reserved!</strong>
                    <div className="small text-danger-emphasis">
                      This room has an active reservation covering {checkIn} to {checkOut}. Please select another date range.
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Booked Dates List */}
              {bookedDates.length > 0 && (
                <div className="mb-3 p-2.5 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3">
                  <div className="d-flex align-items-center gap-1.5 text-warning-emphasis small fw-semibold mb-1.5">
                    <i className="bi bi-info-circle-fill text-warning" />
                    <span>Unavailable Reserved Dates:</span>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {bookedDates.map((b, idx) => (
                      <span key={idx} className="badge bg-white text-danger border border-danger-subtle small fw-normal py-1 px-2">
                        <i className="bi bi-x-circle me-1 text-danger" />
                        {b.checkIn} → {b.checkOut}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Inputs */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Check-in Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Check-out Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Guest Counts */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">Adults</label>
                  <select
                    className="form-select form-select-sm"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">Children</label>
                  <select
                    className="form-select form-select-sm"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                  >
                    {[0, 1, 2].map(n => <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Number of Rooms</label>
                <select
                  className="form-select form-select-sm"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                >
                  <option value="1">1 Room</option>
                  <option value="2">2 Rooms</option>
                  <option value="3">3 Rooms</option>
                </select>
              </div>

              {/* Dynamic Price Calculation */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex justify-content-between py-1 small">
                  <span className="text-muted">Nights:</span>
                  <span className="fw-bold text-dark">{pricing.nights}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span className="text-muted">Room base rate:</span>
                  <span className="font-monospace">{formatCurrency(room.pricePerNight)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="d-flex justify-content-between py-1 small text-success">
                    <span>Discount ({room.discount}%):</span>
                    <span className="font-monospace">- {formatCurrency(pricing.discount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-1 small">
                  <span className="text-muted">Taxes (10%):</span>
                  <span className="font-monospace">{formatCurrency(pricing.taxes)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between py-1 fw-bold fs-5 text-dark">
                  <span>Total Amount:</span>
                  <span className="font-monospace text-primary">{formatCurrency(pricing.totalAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                className={`btn w-100 py-3 rounded-3 fw-bold fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all ${
                  room.status === 'Available' && !isReservedForDates
                    ? 'btn-primary'
                    : 'btn-secondary disabled opacity-75'
                }`}
                onClick={handleProceedBooking}
                disabled={room.status !== 'Available' || isReservedForDates}
              >
                <i className={`bi ${isReservedForDates ? 'bi-calendar-x' : room.status === 'Available' ? 'bi-calendar2-check-fill' : 'bi-slash-circle'} fs-5 me-2`} />
                <span>
                  {isReservedForDates
                    ? 'Reserved for Selected Dates'
                    : room.status === 'Available'
                    ? 'Proceed to Instant Booking'
                    : 'Currently Unavailable'}
                </span>
              </button>

              <div className="text-center mt-3">
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-shield-check text-success me-1.5" />
                  Instant confirmation • No booking fee
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="lightbox-backdrop" onClick={() => setIsLightboxOpen(false)}>
          <div
            className="position-relative d-flex flex-column align-items-center justify-content-center p-3"
            style={{ maxWidth: '1050px', width: '95vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-100 d-flex justify-content-between align-items-center text-white mb-2">
              <span className="fw-semibold">
                {room.name} — Photo {activeImageIndex + 1} of {room.images.length}
              </span>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
                onClick={() => setIsLightboxOpen(false)}
                title="Close (Esc)"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Main Lightbox Image Frame */}
            <div
              className="position-relative w-100 rounded-4 overflow-hidden shadow-lg bg-black text-center d-flex align-items-center justify-content-center"
              style={{ maxHeight: '76vh', minHeight: '350px' }}
            >
              <img
                src={room.images[activeImageIndex]}
                alt={`${room.name} fullscreen view`}
                className="img-fluid rounded-3 object-fit-contain"
                style={{ maxHeight: '76vh', width: 'auto', maxWidth: '100%' }}
              />

              {/* Lightbox Nav Buttons */}
              {room.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav-btn prev"
                    onClick={handlePrevImage}
                    title="Previous Photo (Left Arrow)"
                  >
                    <i className="bi bi-chevron-left fs-4" />
                  </button>
                  <button
                    type="button"
                    className="gallery-nav-btn next"
                    onClick={handleNextImage}
                    title="Next Photo (Right Arrow)"
                  >
                    <i className="bi bi-chevron-right fs-4" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Lightbox Thumbnails Strip */}
            {room.images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center mt-3 overflow-auto w-100 py-1">
                {room.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                    style={{ width: '74px', height: '52px', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`thumb ${idx + 1}`} className="w-100 h-100 object-fit-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
