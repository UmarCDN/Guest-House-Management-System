import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { Room } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

export const RoomSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateDraft, setDraftRoom } = useBooking();
  const { isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [checkIn, setCheckIn] = useState(() => searchParams.get('checkIn') || new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return searchParams.get('checkOut') || tomorrow.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(() => parseInt(searchParams.get('guests') || '2'));
  const [children, setChildren] = useState(0);
  const [selectedType, setSelectedType] = useState(() => searchParams.get('type') || 'All');
  const [maxPrice, setMaxPrice] = useState(300);
  const [hideReserved, setHideReserved] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  const availableFacilities = [
    'Free WiFi',
    'Air Conditioning',
    'King Bed',
    'Private Balcony',
    'Bathtub',
    'Smart TV',
    'Room Service',
    'Breakfast Included'
  ];

  useEffect(() => {
    let isCurrent = true;
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const data = await roomService.getAll({ checkIn, checkOut });
        if (isCurrent) {
          setRooms(data);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchRooms();
    return () => {
      isCurrent = false;
    };
  }, [checkIn, checkOut]);

  const handleFacilityToggle = (fac: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  // Filter & Sort computation
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Hide reserved rooms if toggle enabled
        if (hideReserved && room.isReserved) {
          return false;
        }
        // Room type filter
        if (selectedType !== 'All' && room.type !== selectedType) {
          return false;
        }
        // Capacity filter
        const totalGuests = adults + children;
        if (room.maxAdults + room.maxChildren < totalGuests) {
          return false;
        }
        // Price filter
        const effectivePrice = room.pricePerNight * (1 - (room.discount || 0) / 100);
        if (effectivePrice > maxPrice) {
          return false;
        }
        // Facilities filter
        if (selectedFacilities.length > 0) {
          const hasAllSelected = selectedFacilities.every((fac) =>
            room.amenities.some((a) => a.toLowerCase().includes(fac.toLowerCase()))
          );
          if (!hasAllSelected) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.pricePerNight * (1 - (a.discount || 0) / 100);
        const priceB = b.pricePerNight * (1 - (b.discount || 0) / 100);

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        return b.rating - a.rating; // default: most popular / highest rating
      });
  }, [rooms, selectedType, adults, children, maxPrice, selectedFacilities, sortBy, hideReserved]);

  const handleBookNow = (room: Room) => {
    updateDraft({
      checkIn,
      checkOut,
      adults,
      children
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
        {/* Page Banner / Header */}
        <div className="mb-4">
          <h1 className="h2 fw-bold text-dark mb-1">Available Rooms & Suites</h1>
          <p className="text-muted small mb-0">
            Compare room types, capacities, rates, and amenities to find your ideal stay.
          </p>
        </div>

        <div className="row g-4">
          {/* Left Column: Filter Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '90px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Filters</h5>
                <button
                  className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                  onClick={() => {
                    setSelectedType('All');
                    setMaxPrice(300);
                    setSelectedFacilities([]);
                    setAdults(2);
                    setChildren(0);
                  }}
                >
                  Reset All
                </button>
              </div>

              {/* Stay Dates */}
              <div className="mb-3 pb-3 border-bottom">
                <label className="form-label small fw-bold text-secondary mb-1">Check-in</label>
                <input
                  type="date"
                  className="form-control form-control-sm mb-2"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
                <label className="form-label small fw-bold text-secondary mb-1">Check-out</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Guests Count */}
              <div className="mb-3 pb-3 border-bottom">
                <label className="form-label small fw-bold text-secondary mb-1">Occupancy</label>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Adults (18+)</small>
                    <select
                      className="form-select form-select-sm"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Children</small>
                    <select
                      className="form-select form-select-sm"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                    >
                      {[0, 1, 2, 3].map((num) => (
                        <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="form-check form-switch small">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hideReservedCheck"
                    checked={hideReserved}
                    onChange={(e) => setHideReserved(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold text-secondary" htmlFor="hideReservedCheck">
                    Available Only (Hide Reserved)
                  </label>
                </div>
              </div>

              {/* Room Type */}
              <div className="mb-3 pb-3 border-bottom">
                <label className="form-label small fw-bold text-secondary mb-1">Room Category</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Double Room">Double Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-secondary mb-0">Max Price / Night</label>
                  <span className="fw-bold text-primary small font-monospace">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="50"
                  max="300"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                  <span>$50</span>
                  <span>$150</span>
                  <span>$300+</span>
                </div>
              </div>

              {/* Room Facilities */}
              <div>
                <label className="form-label small fw-bold text-secondary mb-2">Amenities</label>
                <div className="d-flex flex-column gap-1.5">
                  {availableFacilities.map((facility) => (
                    <div className="form-check small" key={facility}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`fac-${facility}`}
                        checked={selectedFacilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                      />
                      <label className="form-check-label text-dark" htmlFor={`fac-${facility}`}>
                        {facility}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Room Results List */}
          <div className="col-lg-9">
            {/* Top Toolbar: Result count & Sort */}
            <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 border">
              <div>
                <span className="fw-bold text-dark">
                  {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
                </span>
                <span className="text-muted small ms-2">for your selected dates</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Sort by:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '180px' }}
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Room Cards Grid */}
            {isLoading ? (
              <Skeleton type="card" count={3} />
            ) : filteredRooms.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <EmptyState
                  icon="bi-search"
                  title="No matching rooms found"
                  description="Try broadening your filters, choosing different dates, or increasing your budget range."
                  actionText="Reset Filters"
                  onAction={() => {
                    setSelectedType('All');
                    setMaxPrice(300);
                    setSelectedFacilities([]);
                  }}
                />
              </div>
            ) : (
              <div className="row g-4">
                {filteredRooms.map((room) => {
                  const effectivePrice = room.pricePerNight * (1 - (room.discount || 0) / 100);
                  return (
                    <div key={room.id} className="col-md-6 col-xl-4">
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden room-card transition-all hover-shadow-lg">
                        <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                          <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-3 px-2.5 py-1.5 rounded-pill small">
                            {room.type}
                          </span>
                          {room.isReserved && (
                            <span className="badge bg-danger position-absolute top-0 end-0 m-3 px-3 py-1.5 rounded-pill shadow-sm">
                              <i className="bi bi-calendar-x me-1" /> Reserved for dates
                            </span>
                          )}
                          {!room.isReserved && room.discount > 0 && (
                            <span className="badge bg-danger position-absolute top-0 end-0 m-3 px-2.5 py-1.5 rounded-pill">
                              {room.discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <StarRating rating={room.rating} showNumber reviewsCount={room.reviewCount} size="sm" />
                              <span
                                className={`badge ${
                                  room.isReserved
                                    ? 'bg-danger text-white'
                                    : room.status === 'Available'
                                    ? 'bg-success-subtle text-success'
                                    : 'bg-secondary-subtle text-secondary'
                                }`}
                              >
                                {room.isReserved ? 'Reserved' : room.status}
                              </span>
                            </div>

                            <h5 className="fw-bold text-dark mb-1">{room.name}</h5>

                            <div className="small text-muted mb-3 d-flex flex-wrap align-items-center gap-2">
                              <span><i className="bi bi-people text-primary me-2" />Max {room.maxAdults + room.maxChildren}</span>
                              <span className="text-secondary opacity-50">•</span>
                              <span><i className="bi bi-lamp text-primary me-2" />{room.bedType}</span>
                              <span className="text-secondary opacity-50">•</span>
                              <span><i className="bi bi-arrows-fullscreen text-primary me-2" />{room.roomSize} sq ft</span>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                              {room.amenities.slice(0, 3).map((amenity, i) => (
                                <span key={i} className="badge bg-light text-muted border border-light py-1.5 px-2.5 small">
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="badge bg-light text-muted border border-light py-1.5 px-2.5 small">
                                  +{room.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-top mt-auto">
                            <div className="d-flex justify-content-between align-items-end mb-3">
                              <div>
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Price per night</small>
                                <div className="d-flex align-items-baseline gap-2">
                                  <span className="h4 fw-bold text-primary font-monospace mb-0">
                                    {formatCurrency(effectivePrice)}
                                  </span>
                                  {room.discount > 0 && (
                                    <span className="text-muted small text-decoration-line-through">
                                      {formatCurrency(room.pricePerNight)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-end">
                                <small className="text-muted" style={{ fontSize: '0.72rem' }}>+10% hotel tax</small>
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
                                    room.status === 'Available' && !room.isReserved
                                      ? 'btn-primary shadow-sm hover-translate-up'
                                      : 'btn-secondary disabled opacity-75'
                                  }`}
                                  onClick={() => handleBookNow(room)}
                                  disabled={room.status !== 'Available' || !!room.isReserved}
                                >
                                  <i className={`bi ${room.isReserved ? 'bi-calendar-x me-1' : room.status === 'Available' ? 'bi-calendar-check me-1' : 'bi-slash-circle me-1'}`} />
                                  <span>{room.isReserved ? 'Reserved' : room.status === 'Available' ? 'Book Now' : room.status}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
