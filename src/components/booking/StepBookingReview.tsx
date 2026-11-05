import React from 'react';
import { BookingDraft } from '../../context/BookingContext';
import { GuestInfoValues } from './StepGuestInfo';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';

interface StepBookingReviewProps {
  draft: BookingDraft;
  guestInfo: GuestInfoValues;
  onBack: () => void;
  onContinue: () => void;
}

export const StepBookingReview: React.FC<StepBookingReviewProps> = ({
  draft,
  guestInfo,
  onBack,
  onContinue
}) => {
  const room = draft.room;

  if (!room) {
    return (
      <div className="alert alert-warning">
        No room selected. Please go back to Room Search and choose a room.
      </div>
    );
  }

  return (
    <div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
        <h5 className="fw-bold text-dark mb-1">
          <i className="bi bi-calendar2-check text-primary me-2" />
          Step 2: Review Booking & Stay Details
        </h5>
        <p className="text-muted small mb-4">
          Please confirm your selected dates, guest room allocation, and pricing breakdown before moving to payment.
        </p>

        <div className="row g-4 mb-4">
          {/* Room Summary Card */}
          <div className="col-md-7">
            <div className="card border rounded-3 overflow-hidden h-100">
              <div className="row g-0 h-100">
                <div className="col-sm-5">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="img-fluid h-100 w-100 object-fit-cover"
                    style={{ minHeight: '180px' }}
                  />
                </div>
                <div className="col-sm-7 p-3 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-primary-subtle text-primary mb-1">{room.type}</span>
                    <h6 className="fw-bold text-dark mb-1">{room.name}</h6>
                    <small className="text-muted d-block mb-2">
                      <i className="bi bi-door-open me-2 text-primary" /> Room #{room.roomNumber} (Floor {room.floor})
                    </small>
                    <div className="d-flex flex-wrap gap-2.5 small text-secondary">
                      <span><i className="bi bi-people me-2 text-primary" /> Max {room.maxAdults + room.maxChildren} guests</span>
                      <span><i className="bi bi-arrows-fullscreen me-2 text-primary" /> {room.roomSize} sq ft</span>
                      <span><i className="bi bi-lamp me-2 text-primary" /> {room.bedType}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-top">
                    <span className="text-muted small">Standard Rate: </span>
                    <strong className="text-primary font-monospace">{formatCurrency(room.pricePerNight)}</strong>
                    <span className="text-muted small"> / night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Dates Card */}
          <div className="col-md-5">
            <div className="bg-light p-3 rounded-3 h-100 border border-light d-flex flex-column justify-content-between">
              <div>
                <h6 className="fw-bold text-dark small text-uppercase mb-3">Schedule & Guest Count</h6>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Check-in:</span>
                  <strong className="text-dark">{formatDate(draft.checkIn)} (from 2:00 PM)</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Check-out:</span>
                  <strong className="text-dark">{formatDate(draft.checkOut)} (by 12:00 PM)</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Total Nights:</span>
                  <strong className="text-dark">{draft.nights} Night{draft.nights > 1 ? 's' : ''}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Rooms Reserved:</span>
                  <strong className="text-dark">{draft.numberOfRooms} Room</strong>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Occupants:</span>
                  <strong className="text-dark">{draft.adults} Adults, {draft.children} Children</strong>
                </div>
              </div>

              <div className="mt-3 pt-2 border-top">
                <small className="text-muted">Primary Guest:</small>
                <div className="fw-bold small text-dark">{guestInfo.firstName} {guestInfo.lastName} ({guestInfo.email})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-3 bg-light rounded-3 border">
          <h6 className="fw-bold text-dark small text-uppercase mb-3">Price Calculation</h6>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Room charges ({formatCurrency(room.pricePerNight)} × {draft.nights} nights × {draft.numberOfRooms} room):</span>
            <span className="font-monospace">{formatCurrency(draft.subtotal)}</span>
          </div>
          {draft.discount > 0 && (
            <div className="d-flex justify-content-between py-1 small text-success">
              <span>Promotional Discount ({room.discount}% OFF):</span>
              <span className="font-monospace">- {formatCurrency(draft.discount)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Taxes & Hospitality Surcharge (10%):</span>
            <span className="font-monospace">{formatCurrency(draft.taxes)}</span>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between py-1 fw-bold fs-5 text-dark">
            <span>Total Payable Amount:</span>
            <span className="font-monospace text-primary">{formatCurrency(draft.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" size="lg" icon="bi-arrow-left" onClick={onBack}>
          Back to Guest Info
        </Button>
        <Button variant="primary" size="lg" icon="bi-credit-card" onClick={onContinue}>
          Proceed to Payment Method
        </Button>
      </div>
    </div>
  );
};
