import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types';
import { formatCurrency, formatDate, getBookingStatusVariant, getPaymentStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';

export const CustomerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      if (user?.email) {
        const myBookings = await bookingService.getByGuestEmail(user.email);
        setBookings(myBookings);
      } else {
        const all = await bookingService.getAll();
        setBookings(all);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation? Cancellation policy applies.')) return;
    setCancellingId(id);
    try {
      await bookingService.cancel(id);
      showToast(`Reservation ${id} has been cancelled.`, 'warning');
      await fetchBookings();
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return <Loader message="Loading your bookings history..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Stays & Reservations</h2>
          <p className="text-muted small mb-0">
            View all confirmed, active, and past reservations along with printable tax receipts.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Booking ID</th>
                <th scope="col">Room</th>
                <th scope="col">Check-in</th>
                <th scope="col">Check-out</th>
                <th scope="col">Guests</th>
                <th scope="col">Amount</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No bookings found in your history.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">{b.id}</td>
                    <td>
                      <div className="fw-bold text-dark small">{b.roomName}</div>
                      <small className="text-muted">Room #{b.roomNumber}</small>
                    </td>
                    <td className="small text-dark font-monospace">{formatDate(b.checkIn)}</td>
                    <td className="small text-dark font-monospace">{formatDate(b.checkOut)}</td>
                    <td className="small text-secondary">{b.adults}A, {b.children}C</td>
                    <td className="font-monospace fw-bold text-dark">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <Badge variant={getPaymentStatusVariant(b.paymentStatus) as any}>
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={getBookingStatusVariant(b.bookingStatus) as any}>
                        {b.bookingStatus}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-circle"
                          style={{ width: '34px', height: '34px', padding: 0 }}
                          title="View Invoice Folio"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-circle"
                          style={{ width: '34px', height: '34px', padding: 0 }}
                          title="Print / Download Invoice"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <i className="bi bi-printer" />
                        </button>
                        {(b.bookingStatus === 'Pending' || b.bookingStatus === 'Confirmed') && (
                          <button
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            style={{ width: '34px', height: '34px', padding: 0 }}
                            title="Cancel Booking"
                            disabled={cancellingId === b.id}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            {cancellingId === b.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                              <i className="bi bi-x-lg" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Invoice & Folio for ${selectedBooking.id}` : ''}
        size="lg"
      >
        {selectedBooking && <InvoiceReceipt booking={selectedBooking} showActions={true} />}
      </Modal>
    </div>
  );
};
