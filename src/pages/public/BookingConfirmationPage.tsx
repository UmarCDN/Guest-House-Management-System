import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Booking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { triggerPrint } from '../../utils/exportUtils';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';

export const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const booking = (location.state as { booking?: Booking })?.booking;

  if (!booking) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="bg-light py-5">
      <div className="container max-w-4xl mx-auto">
        {/* Success Banner Card */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 text-center bg-white d-print-none">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3"
            style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
          >
            <i className="bi bi-check-circle-fill" />
          </div>
          <span className="badge bg-success-subtle text-success px-3 py-1.5 rounded-pill fw-bold text-uppercase mb-2">
            Reservation Confirmed
          </span>
          <h2 className="fw-bold text-dark mb-2">Thank You for Booking with Us!</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px' }}>
            Your reservation is secured. A confirmation email and digital voucher have been dispatched to <strong>{booking.guestEmail}</strong>.
          </p>

          <div className="p-3 bg-light rounded-3 border max-w-md mx-auto mb-4 text-start small">
            <div className="d-flex justify-content-between mb-1.5">
              <span className="text-muted">Booking Reference:</span>
              <strong className="text-primary font-monospace fs-6">{booking.id}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1.5">
              <span className="text-muted">Primary Guest:</span>
              <strong className="text-dark">{booking.guestName}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1.5">
              <span className="text-muted">Assigned Room:</span>
              <strong className="text-dark">{booking.roomName} ({booking.roomType})</strong>
            </div>
            <div className="d-flex justify-content-between mb-1.5">
              <span className="text-muted">Stay Duration:</span>
              <strong className="text-dark">{formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)} ({booking.nights} nights)</strong>
            </div>
            <div className="d-flex justify-content-between mb-1.5">
              <span className="text-muted">Payment Status:</span>
              <span className={`badge ${booking.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill`}>
                {booking.paymentStatus} ({booking.paymentMethod})
              </span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2 fw-bold">
              <span>Total Folio Amount:</span>
              <span className="text-primary font-monospace fs-6">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Button variant="outline-secondary" icon="bi-printer" onClick={triggerPrint}>
              Print Confirmation
            </Button>
            <Button variant="primary" icon="bi-download" onClick={triggerPrint}>
              Download PDF Confirmation
            </Button>
            <Link to="/" className="btn btn-light border px-4">
              <i className="bi bi-house me-1" /> Back to Home
            </Link>
          </div>
        </div>

        {/* Official Printable Folio Receipt */}
        <div>
          <h5 className="fw-bold text-dark mb-2 px-1 d-print-none">
            <i className="bi bi-receipt text-primary me-2" />
            Official Booking Voucher & Tax Invoice
          </h5>
          <InvoiceReceipt booking={booking} showActions={false} />
        </div>
      </div>
    </div>
  );
};
