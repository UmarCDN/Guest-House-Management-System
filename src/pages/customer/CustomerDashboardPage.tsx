import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types';
import { formatCurrency, formatDate, getBookingStatusVariant, getPaymentStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchCustomerBookings = async () => {
      try {
        const all = await bookingService.getAll();
        // If logged in as customer, match by email or fallback to all for demo
        const filtered = user?.email
          ? all.filter(b => b.guestEmail.toLowerCase() === user.email.toLowerCase())
          : all.slice(0, 3);
        setBookings(filtered.length > 0 ? filtered : all.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerBookings();
  }, [user]);

  if (isLoading) {
    return <Loader message="Loading your guest dashboard..." />;
  }

  // Calculate Metrics
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending').length;
  const completedBookings = bookings.filter(b => b.bookingStatus === 'Checked Out').length;
  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled').length;

  return (
    <div>
      {/* Header Banner */}
      <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill small mb-2">
            Verified Member Folio
          </span>
          <h2 className="fw-bold text-dark mb-1">Hello, {user?.name || 'Guest'}</h2>
          <p className="text-muted small mb-0">
            Welcome to your Serene Haven member dashboard. Track your upcoming stays and digital receipts.
          </p>
        </div>
        <Link to="/rooms" className="btn btn-primary rounded-pill px-4 shadow-sm text-nowrap">
          <i className="bi bi-plus-circle me-1.5" /> Book a New Stay
        </Link>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Total Bookings</span>
                <h3 className="fw-bold text-dark font-monospace mb-0">{totalBookings}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2.5 fs-4">
                <i className="bi bi-calendar2-check" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Upcoming Stays</span>
                <h3 className="fw-bold text-success font-monospace mb-0">{upcomingBookings}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded-3 p-2.5 fs-4">
                <i className="bi bi-clock-history" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Completed Stays</span>
                <h3 className="fw-bold text-info font-monospace mb-0">{completedBookings}</h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info rounded-3 p-2.5 fs-4">
                <i className="bi bi-check2-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Cancelled Stays</span>
                <h3 className="fw-bold text-danger font-monospace mb-0">{cancelledBookings}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-2.5 fs-4">
                <i className="bi bi-x-circle" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Recent Reservations</h5>
          <Link to="/customer/bookings" className="text-primary text-decoration-none small fw-semibold">
            View All ({bookings.length}) &rarr;
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Booking Ref</th>
                <th scope="col">Room</th>
                <th scope="col">Stay Dates</th>
                <th scope="col">Total Amount</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    You have no bookings on record yet.{' '}
                    <Link to="/rooms" className="text-primary fw-medium">
                      Search Available Rooms
                    </Link>
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">{b.id}</td>
                    <td>
                      <div className="fw-bold text-dark small">{b.roomName}</div>
                      <small className="text-muted">Room #{b.roomNumber} ({b.roomType})</small>
                    </td>
                    <td>
                      <div className="small text-dark">{formatDate(b.checkIn)} &rarr; {formatDate(b.checkOut)}</div>
                      <small className="text-muted">{b.nights} nights</small>
                    </td>
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
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={() => setSelectedBooking(b)}
                      >
                        <i className="bi bi-receipt me-1" /> View Folio
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details / Invoice Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Reservation Folio: ${selectedBooking.id}` : ''}
        size="lg"
      >
        {selectedBooking && <InvoiceReceipt booking={selectedBooking} showActions={true} />}
      </Modal>
    </div>
  );
};
