import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { Booking, BookingStatus } from '../../types';
import { formatCurrency, formatDate, getBookingStatusVariant, getPaymentStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';
import { useNotifications } from '../../context/NotificationContext';
import { triggerPrint } from '../../utils/exportUtils';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoiceTab, setShowInvoiceTab] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      const b = await bookingService.getById(id);
      if (b) setBooking(b);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleStatusTransition = async (newStatus: BookingStatus) => {
    if (!booking) return;
    try {
      const updated = await bookingService.updateStatus(booking.id, newStatus);
      setBooking(updated);
      showToast(`Booking ${booking.id} transitioned to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Transition failed', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading reservation details..." />;
  }

  if (!booking) {
    return (
      <div className="card p-5 text-center bg-white rounded-4 border-0 shadow-sm">
        <h4>Booking Not Found</h4>
        <p className="text-muted">No booking matches the identifier "{id}".</p>
        <Link to="/admin/bookings" className="btn btn-primary rounded-pill px-4">
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Quick Lifecycle Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/admin/bookings" className="btn btn-light border btn-sm rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-arrow-left" />
            </Link>
            <h2 className="fw-bold text-dark font-monospace mb-0">{booking.id}</h2>
            <Badge variant={getBookingStatusVariant(booking.bookingStatus) as any}>
              {booking.bookingStatus}
            </Badge>
            <Badge variant={getPaymentStatusVariant(booking.paymentStatus) as any}>
              {booking.paymentStatus}
            </Badge>
          </div>
          <small className="text-muted">
            Created on {formatDate(booking.createdAt)} via {booking.bookingSource}
          </small>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {booking.bookingStatus === 'Pending' && (
            <Button variant="success" size="sm" icon="bi-check-lg" onClick={() => handleStatusTransition('Confirmed')}>
              Confirm Booking
            </Button>
          )}
          {booking.bookingStatus === 'Confirmed' && (
            <Button variant="primary" size="sm" icon="bi-box-arrow-in-right" onClick={() => handleStatusTransition('Checked In')}>
              Check In Guest
            </Button>
          )}
          {booking.bookingStatus === 'Checked In' && (
            <Button variant="info" size="sm" icon="bi-box-arrow-right" onClick={() => handleStatusTransition('Checked Out')}>
              Check Out Guest
            </Button>
          )}
          {booking.bookingStatus !== 'Cancelled' && (
            <Button
              variant="outline-danger"
              size="sm"
              icon="bi-x-circle"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this reservation?')) {
                  handleStatusTransition('Cancelled');
                }
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline-secondary"
            size="sm"
            icon="bi-printer"
            onClick={() => {
              setShowInvoiceTab(true);
              setTimeout(() => triggerPrint(), 200);
            }}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Tabs: Overview vs Invoice Folio */}
      <ul className="nav nav-tabs mb-4 border-bottom">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-4 ${!showInvoiceTab ? 'active' : 'text-secondary'}`}
            onClick={() => setShowInvoiceTab(false)}
          >
            <i className="bi bi-info-circle me-1.5" /> Reservation Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-4 ${showInvoiceTab ? 'active' : 'text-secondary'}`}
            onClick={() => setShowInvoiceTab(true)}
          >
            <i className="bi bi-receipt me-1.5" /> Tax Invoice & Folio
          </button>
        </li>
      </ul>

      {showInvoiceTab ? (
        <InvoiceReceipt booking={booking} showActions={true} />
      ) : (
        <div className="row g-4">
          {/* Guest Information Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-person-badge text-primary me-2" />
                Guest Details
              </h5>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Full Name</span>
                <strong className="text-dark fs-6">{booking.guestName}</strong>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Email Address</span>
                <span className="text-secondary small">{booking.guestEmail}</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Phone Number</span>
                <span className="text-secondary small">{booking.guestPhone}</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">CNIC / Passport</span>
                <span className="text-secondary small font-monospace">{booking.guestCnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted small d-block">Address</span>
                <span className="text-secondary small">{booking.guestAddress}, {booking.guestCity}, {booking.guestCountry}</span>
              </div>
            </div>
          </div>

          {/* Booking Stay Information Card */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-door-closed text-primary me-2" />
                Stay Allocation
              </h5>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Assigned Room</span>
                <strong className="text-dark">Room #{booking.roomNumber} - {booking.roomName}</strong>
                <span className="badge bg-light text-dark border ms-1">{booking.roomType}</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Check-in Schedule</span>
                <span className="text-dark fw-medium">{formatDate(booking.checkIn)} (from 14:00)</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Check-out Schedule</span>
                <span className="text-dark fw-medium">{formatDate(booking.checkOut)} (until 12:00)</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Duration & Occupancy</span>
                <span className="text-secondary small">
                  {booking.nights} Nights • {booking.adults} Adults, {booking.children} Children
                </span>
              </div>
              <div>
                <span className="text-muted small d-block">Special Requests</span>
                <span className="text-secondary small fst-italic">
                  {booking.specialRequests || 'No special requests provided.'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Financial Breakdown Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-wallet2 text-primary me-2" />
                Payment Summary
              </h5>
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="d-flex justify-content-between py-1 small">
                  <span className="text-muted">Total Folio Charge:</span>
                  <span className="font-monospace fw-bold">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small text-success">
                  <span>Amount Paid:</span>
                  <span className="font-monospace fw-bold">{formatCurrency(booking.paidAmount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small text-danger fw-bold">
                  <span>Balance Due:</span>
                  <span className="font-monospace">{formatCurrency(booking.remainingAmount)}</span>
                </div>
              </div>

              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Payment Method</span>
                <span className="text-dark fw-medium">{booking.paymentMethod}</span>
              </div>
              <div className="mb-3 pb-3 border-bottom">
                <span className="text-muted small d-block">Payment Status</span>
                <Badge variant={getPaymentStatusVariant(booking.paymentStatus) as any}>
                  {booking.paymentStatus}
                </Badge>
              </div>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100"
                  icon="bi-receipt"
                  onClick={() => setShowInvoiceTab(true)}
                >
                  Inspect Full Itemized Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
