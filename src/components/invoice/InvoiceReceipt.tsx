import React from 'react';
import { Booking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { triggerPrint } from '../../utils/exportUtils';

interface InvoiceReceiptProps {
  booking: Booking;
  showActions?: boolean;
}

export const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({
  booking,
  showActions = true
}) => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5 my-3 invoice-container" id="printable-invoice">
      {/* Header with Print & Download Action Buttons */}
      {showActions && (
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom d-print-none">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
            <i className="bi bi-receipt me-1" /> Official Guest Folio & Tax Invoice
          </span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" icon="bi-printer" onClick={triggerPrint}>
              Print Invoice
            </Button>
            <Button variant="primary" size="sm" icon="bi-download" onClick={handleDownload}>
              Download PDF
            </Button>
          </div>
        </div>
      )}

      {/* Guest House Branding & Invoice Meta */}
      <div className="row g-4 align-items-start mb-5">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <i className="bi bi-building fs-5" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-dark">Serene Haven</h4>
              <small className="text-muted text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.72rem' }}>
                Boutique Guest House & Suites
              </small>
            </div>
          </div>
          <p className="text-secondary small mb-1">Plot 14, Hillview Road, Sector F-6/3, Islamabad, Pakistan</p>
          <p className="text-secondary small mb-1">Phone: +92 51 289 4433 | Email: accounts@serenehavenguesthouse.com</p>
          <p className="text-secondary small mb-0">NTN / Tax Registration: PK-9948210-A</p>
        </div>

        <div className="col-md-6 text-md-end">
          <h2 className="text-uppercase fw-extrabold text-primary mb-1">INVOICE</h2>
          <div className="text-secondary small mb-1">
            <strong>Invoice No:</strong> INV-{booking.id.replace('GH-', '')}
          </div>
          <div className="text-secondary small mb-1">
            <strong>Booking Ref:</strong> {booking.id}
          </div>
          <div className="text-secondary small mb-1">
            <strong>Date Issued:</strong> {formatDate(booking.createdAt)}
          </div>
          <div className="mt-2">
            <Badge variant={booking.paymentStatus === 'Paid' ? 'success' : booking.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
              Payment: {booking.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Bill To / Booking Info Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-3 h-100 border border-light">
            <h6 className="fw-bold text-dark text-uppercase small mb-2" style={{ letterSpacing: '0.5px' }}>
              Bill To (Guest Details)
            </h6>
            <div className="fw-bold text-dark fs-6 mb-1">{booking.guestName}</div>
            <div className="small text-secondary mb-1">
              <i className="bi bi-envelope me-1.5 text-muted" /> {booking.guestEmail}
            </div>
            <div className="small text-secondary mb-1">
              <i className="bi bi-telephone me-1.5 text-muted" /> {booking.guestPhone}
            </div>
            {booking.guestCnic && (
              <div className="small text-secondary mb-1">
                <i className="bi bi-card-heading me-1.5 text-muted" /> ID/Passport: {booking.guestCnic}
              </div>
            )}
            <div className="small text-secondary">
              <i className="bi bi-geo-alt me-1.5 text-muted" /> {booking.guestAddress}, {booking.guestCity}, {booking.guestCountry}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 bg-light rounded-3 h-100 border border-light">
            <h6 className="fw-bold text-dark text-uppercase small mb-2" style={{ letterSpacing: '0.5px' }}>
              Stay Information
            </h6>
            <div className="row g-2 small">
              <div className="col-6">
                <span className="text-muted d-block">Room Assigned:</span>
                <strong className="text-dark">Room {booking.roomNumber} - {booking.roomName}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Room Category:</span>
                <strong className="text-dark">{booking.roomType}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Check-in:</span>
                <strong className="text-dark">{formatDate(booking.checkIn)}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Check-out:</span>
                <strong className="text-dark">{formatDate(booking.checkOut)}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Duration:</span>
                <strong className="text-dark">{booking.nights} Night{booking.nights > 1 ? 's' : ''}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Occupants:</span>
                <strong className="text-dark">{booking.adults} Adults, {booking.children} Children</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="table-responsive mb-4">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr className="small text-uppercase text-secondary">
              <th scope="col" style={{ width: '45%' }}>Description</th>
              <th scope="col" className="text-center">Rate / Night</th>
              <th scope="col" className="text-center">Nights</th>
              <th scope="col" className="text-center">Rooms</th>
              <th scope="col" className="text-end">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="fw-bold text-dark">{booking.roomName}</div>
                <small className="text-muted">Standard lodging accommodation including complimentary breakfast</small>
              </td>
              <td className="text-center font-monospace">{formatCurrency(booking.roomPrice)}</td>
              <td className="text-center">{booking.nights}</td>
              <td className="text-center">{booking.numberOfRooms}</td>
              <td className="text-end font-monospace fw-medium">
                {formatCurrency(booking.roomPrice * booking.nights * booking.numberOfRooms)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary Calculation */}
      <div className="row justify-content-end mb-4">
        <div className="col-md-5">
          <div className="p-3 bg-light rounded-3">
            <div className="d-flex justify-content-between py-1 small">
              <span className="text-muted">Subtotal:</span>
              <span className="font-monospace fw-medium">
                {formatCurrency(booking.roomPrice * booking.nights * booking.numberOfRooms + booking.discount)}
              </span>
            </div>
            {booking.discount > 0 && (
              <div className="d-flex justify-content-between py-1 small text-success">
                <span>Special Promotional Discount:</span>
                <span className="font-monospace">- {formatCurrency(booking.discount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between py-1 small">
              <span className="text-muted">Government & Tourism Tax (10%):</span>
              <span className="font-monospace fw-medium">{formatCurrency(booking.taxes)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between py-1 fw-bold fs-6 text-dark">
              <span>Grand Total:</span>
              <span className="font-monospace text-primary">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="d-flex justify-content-between py-1 small text-success">
              <span>Amount Paid ({booking.paymentMethod}):</span>
              <span className="font-monospace">{formatCurrency(booking.paidAmount)}</span>
            </div>
            <div className="d-flex justify-content-between py-1 fw-bold small text-danger">
              <span>Balance Due:</span>
              <span className="font-monospace">{formatCurrency(booking.remainingAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Terms Footer */}
      <div className="border-top pt-4 mt-4 row g-3 text-secondary small">
        <div className="col-md-8">
          <h6 className="fw-bold text-dark small text-uppercase mb-1">Terms & Conditions</h6>
          <p className="mb-1">
            Check-out time is strictly 12:00 PM. Late check-out without prior authorization may incur an extra half-day tariff.
          </p>
          <p className="mb-0">
            Thank you for choosing <strong>Serene Haven</strong>. We hope you had a pleasant and memorable stay!
          </p>
        </div>
        <div className="col-md-4 text-md-end d-flex flex-column justify-content-end">
          <div className="mt-4 pt-2 border-top border-dark d-inline-block text-center" style={{ width: '180px', marginLeft: 'auto' }}>
            <span className="fw-bold d-block text-dark small">Authorized Signature</span>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Serene Haven Front Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
