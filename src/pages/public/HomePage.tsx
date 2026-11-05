import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { facilityService } from '../../services/facility.service';
import { reviewService } from '../../services/review.service';
import { Room, Facility, Review } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { updateDraft, setDraftRoom } = useBooking();
  const { isAuthenticated } = useAuth();

  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hero search engine states
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allRooms, allFacs, allRevs] = await Promise.all([
          roomService.getAll(),
          facilityService.getAll(),
          reviewService.getApproved()
        ]);
        setFeaturedRooms(allRooms.filter(r => r.isFeatured || r.rating >= 4.8).slice(0, 3));
        setFacilities(allFacs.filter(f => f.status === 'Enabled').slice(0, 8));
        setReviews(allRevs.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateDraft({
      checkIn,
      checkOut,
      adults: parseInt(guests) || 2
    });
    navigate(`/rooms?type=${encodeURIComponent(roomType)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const handleDirectBook = (room: Room) => {
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
    <div>
      {/* 1. Attractive Hero Section */}
      <section
        className="position-relative text-white py-5 d-flex align-items-center"
        style={{
          minHeight: '85vh',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container py-5">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-9">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
                <i className="bi bi-star-fill me-1" /> Serene Boutique Hospitality
              </span>
              <h1 className="display-3 fw-extrabold text-white mb-3">
                Comfortable Stay, Memorable Experience
              </h1>
              <p className="lead text-white-50 mx-auto mb-0" style={{ maxWidth: '680px' }}>
                Discover an idyllic sanctuary in the capital. Luxurious suites, verdant botanical grounds, and authentic concierge service crafted for your relaxation.
              </p>
            </div>
          </div>

          {/* Integrated Room Search Engine Bar */}
          <div className="row justify-content-center">
            <div className="col-xl-11">
              <div className="bg-white rounded-4 shadow-lg p-3 p-md-4 text-dark border">
                <form onSubmit={handleHeroSearch}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3 col-sm-6">
                      <label className="form-label fw-bold small text-secondary mb-1">
                        <i className="bi bi-calendar-event text-primary me-1" /> Check-in Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg fs-6"
                        value={checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-3 col-sm-6">
                      <label className="form-label fw-bold small text-secondary mb-1">
                        <i className="bi bi-calendar-check text-primary me-1" /> Check-out Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg fs-6"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-2 col-sm-6">
                      <label className="form-label fw-bold small text-secondary mb-1">
                        <i className="bi bi-people text-primary me-1" /> Guests
                      </label>
                      <select
                        className="form-select form-select-lg fs-6"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5">5+ Guests</option>
                      </select>
                    </div>

                    <div className="col-md-2 col-sm-6">
                      <label className="form-label fw-bold small text-secondary mb-1">
                        <i className="bi bi-door-open text-primary me-1" /> Room Type
                      </label>
                      <select
                        className="form-select form-select-lg fs-6"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Deluxe Room">Deluxe Room</option>
                        <option value="Family Room">Family Room</option>
                        <option value="Suite">Suite</option>
                      </select>
                    </div>

                    <div className="col-md-2 col-12">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100 py-2.5 fs-6 shadow-sm"
                        icon="bi-search"
                      >
                        Search Rooms
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Rooms Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
                Handcrafted Accommodations
              </span>
              <h2 className="display-6 fw-bold text-dark mb-1">Featured Rooms & Suites</h2>
              <p className="text-muted mb-0">Immerse yourself in unparalleled luxury, comfort, and state-of-the-art amenities.</p>
            </div>
            <Link to="/rooms" className="btn btn-outline-primary rounded-pill mt-3 mt-md-0 fw-medium">
              View All Rooms <i className="bi bi-arrow-right ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {isLoading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              featuredRooms.map((room) => (
                <div key={room.id} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden room-card transition-all hover-shadow-lg">
                    <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-100 h-100 object-fit-cover transition-transform"
                      />
                      <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-3 px-3 py-1.5 rounded-pill small">
                        {room.type}
                      </span>
                      {room.discount > 0 && (
                        <span className="badge bg-danger position-absolute top-0 end-0 m-3 px-2.5 py-1.5 rounded-pill">
                          {room.discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <StarRating rating={room.rating} showNumber reviewsCount={room.reviewCount} size="sm" />
                          <span className={`badge ${room.status === 'Available' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                            {room.status}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-2">{room.name}</h5>
                        <p className="text-secondary small line-clamp-2 mb-3">
                          {room.description}
                        </p>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {room.amenities.slice(0, 4).map((amenity, i) => (
                            <span key={i} className="badge bg-light text-muted border border-light py-1 px-2 small">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-top mt-auto">
                        <div className="d-flex justify-content-between align-items-end mb-3">
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Price per night</small>
                            <span className="h4 fw-bold text-primary font-monospace mb-0">
                              {formatCurrency(room.pricePerNight * (1 - (room.discount || 0) / 100))}
                            </span>
                            <small className="text-muted"> / night</small>
                          </div>
                          <div className="text-end">
                            <small className="text-muted" style={{ fontSize: '0.72rem' }}>Breakfast included</small>
                          </div>
                        </div>

                        <div className="row g-2 pt-1">
                          <div className="col-6">
                            <Link
                              to={`/rooms/${room.id}`}
                              className="btn btn-outline-primary w-100 rounded-3 fw-semibold room-card-btn"
                            >
                              <i className="bi bi-eye" />
                              <span>Details</span>
                            </Link>
                          </div>
                          <div className="col-6">
                            <button
                              type="button"
                              className={`btn w-100 rounded-3 fw-bold room-card-btn ${
                                room.status === 'Available'
                                  ? 'btn-primary shadow-sm hover-translate-up'
                                  : 'btn-secondary disabled'
                              }`}
                              onClick={() => handleDirectBook(room)}
                              disabled={room.status !== 'Available'}
                            >
                              <i className="bi bi-calendar-check" />
                              <span>{room.status === 'Available' ? 'Book Now' : 'Reserved'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Facilities Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
              World-Class Amenities
            </span>
            <h2 className="display-6 fw-bold text-dark mb-2">Guest House Facilities</h2>
            <p className="text-muted">
              We cater to your every comfort with modern infrastructure, 24/7 personalized care, and executive amenities.
            </p>
          </div>

          <div className="row g-4">
            {facilities.map((fac) => (
              <div key={fac.id} className="col-lg-3 col-md-4 col-sm-6">
                <div className="card h-100 border border-light shadow-sm rounded-4 p-4 text-center transition-all hover-translate-up">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-3"
                    style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                  >
                    <i className={`bi ${fac.icon}`} />
                  </div>
                  <h6 className="fw-bold text-dark mb-2">{fac.name}</h6>
                  <p className="text-muted small mb-0">{fac.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
                The Serene Difference
              </span>
              <h2 className="display-6 fw-bold text-dark mb-3">
                Why Discerning Guests Choose Serene Haven
              </h2>
              <p className="text-secondary mb-4">
                We bridge the intimacy of a luxury private residence with the professional operational standards of a five-star hotel. Every detail of your stay is designed around peaceful leisure and effortless productivity.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3">
                  <div className="bg-primary text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-shield-check fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Prime Diplomatic Enclave Location</h6>
                    <p className="text-muted small mb-0">Nestled in Islamabad’s secure Sector F-6, walking distance to upscale cafes, hiking trails, and embassies.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="bg-success text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-heart-pulse fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Impeccable Hygiene & Sanitization</h6>
                    <p className="text-muted small mb-0">Daily deep cleaning, hypoallergenic luxury Egyptian cotton linens, and purified UV drinking water.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="bg-warning text-dark rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-cup-hot fs-5" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Artisan Culinary Experiences</h6>
                    <p className="text-muted small mb-0">Freshly prepared buffet breakfast included with all stays, plus 24/7 custom room service dining.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                  alt="Guest House Interior"
                  className="rounded-4 shadow-lg w-100 object-fit-cover"
                  style={{ maxHeight: '480px' }}
                />
                <div className="bg-white p-3 rounded-3 shadow position-absolute bottom-0 start-0 m-4 border border-light d-none d-sm-flex align-items-center gap-3">
                  <div className="display-6 fw-bold text-primary font-monospace">4.9</div>
                  <div>
                    <StarRating rating={4.9} size="sm" />
                    <small className="text-muted d-block mt-0.5">Rated by 250+ Verified Guests</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
              Guest Feedback
            </span>
            <h2 className="display-6 fw-bold text-dark mb-2">What Our Guests Say</h2>
            <p className="text-muted">Real stories and testimonials from solo executives, international travelers, and vacationing families.</p>
          </div>

          <div className="row g-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="col-md-6 col-lg-3">
                <div className="card h-100 border border-light shadow-sm rounded-4 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <StarRating rating={rev.rating} size="sm" className="mb-3" />
                    <p className="text-secondary small fst-italic mb-3">"{rev.review}"</p>
                  </div>
                  <div className="d-flex align-items-center gap-2.5 pt-3 border-top">
                    {rev.guestAvatar ? (
                      <img src={rev.guestAvatar} alt={rev.guestName} className="rounded-circle" style={{ width: '38px', height: '38px', objectFit: 'cover' }} />
                    ) : (
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '38px', height: '38px' }}>
                        {rev.guestName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h6 className="fw-bold text-dark mb-0 small">{rev.guestName}</h6>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>Stayed in {rev.roomName}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery Preview & Location Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
                Prime Location
              </span>
              <h2 className="display-6 fw-bold text-dark mb-3">Conveniently Located in Sector F-6</h2>
              <p className="text-secondary mb-3">
                Serene Haven is nestled on Hillview Road, offering easy access to Islamabad’s premier shopping, fine dining, and diplomatic hubs while preserving peaceful privacy.
              </p>
              <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary mb-4">
                <li><i className="bi bi-geo-alt text-danger me-2" /> 5 mins from Kohsar Market & Super Market</li>
                <li><i className="bi bi-airplane text-primary me-2" /> 35 mins from Islamabad International Airport</li>
                <li><i className="bi bi-tree text-success me-2" /> 10 mins from Margalla Hills Trail 3 & 5</li>
                <li><i className="bi bi-building text-secondary me-2" /> 7 mins from Diplomatic Enclave</li>
              </ul>
              <Link to="/contact" className="btn btn-primary rounded-pill px-4">
                Get Driving Directions & Contact
              </Link>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ minHeight: '340px' }}>
                {/* Visual Map Representation */}
                <div
                  className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                  style={{
                    minHeight: '340px',
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="bg-white p-4 rounded-4 shadow-lg max-w-sm text-dark">
                    <i className="bi bi-geo-alt-fill text-danger display-5 d-block mb-2" />
                    <h6 className="fw-bold mb-1">Serene Haven Boutique Guest House</h6>
                    <small className="text-muted d-block mb-3">Plot 14, Hillview Road, Sector F-6/3, Islamabad</small>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      <i className="bi bi-map me-1" /> Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Footer Banner */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container py-3">
          <h2 className="display-6 fw-bold mb-2">Ready for an Unforgettable Retreat?</h2>
          <p className="lead text-white-50 mx-auto mb-4" style={{ maxWidth: '600px' }}>
            Book direct today to receive complimentary breakfast, guaranteed best rates, and flexible cancellation.
          </p>
          <Link to="/rooms" className="btn btn-light text-primary btn-lg rounded-pill px-5 shadow fw-bold">
            Explore All Rooms & Check Availability
          </Link>
        </div>
      </section>
    </div>
  );
};
