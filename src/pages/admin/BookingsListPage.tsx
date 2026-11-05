import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { roomService } from '../../services/room.service';
import { Booking, BookingStatus, Room } from '../../types';
import { formatCurrency, formatDate, getBookingStatusVariant, getPaymentStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';
import { useNotifications } from '../../context/NotificationContext';

export const BookingsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useNotifications();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [roomFilter, setRoomFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Invoice / Details Modal
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  const fetchBookingsAndRooms = async () => {
    try {
      const [allBookings, allRooms] = await Promise.all([
        bookingService.getAll(),
        roomService.getAll()
      ]);
      setBookings(allBookings);
      setRooms(allRooms);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndRooms();
  }, []);

  // Update booking lifecycle status
  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await bookingService.updateStatus(id, newStatus);
      showToast(`Booking ${id} status updated to ${newStatus}`, 'success');
      await fetchBookingsAndRooms();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'danger');
    }
  };

  // Filter computation
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Search query (id, guest name, email, phone)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          b.id.toLowerCase().includes(query) ||
          b.guestName.toLowerCase().includes(query) ||
          b.guestEmail.toLowerCase().includes(query) ||
          b.guestPhone.toLowerCase().includes(query) ||
          b.roomName.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Status filter
      if (statusFilter !== 'All' && b.bookingStatus !== statusFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== 'All' && b.paymentStatus !== paymentFilter) {
        return false;
      }

      // Room filter
      if (roomFilter !== 'All' && b.roomId !== roomFilter) {
        return false;
      }

      // Date filter (checkIn or checkOut)
      if (dateFilter && b.checkIn !== dateFilter && b.checkOut !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [bookings, searchQuery, statusFilter, paymentFilter, roomFilter, dateFilter]);

  // Paginated list
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return <Loader message="Loading bookings repository..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Bookings Management</h2>
          <p className="text-muted small mb-0">
            Monitor, confirm, check-in, and manage reservations and guest billing accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">Search Booking</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ID, Guest name, Phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-md-2 col-sm-6">
            <label className="form-label small fw-bold text-secondary mb-1">Booking Status</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div className="col-md-2 col-sm-6">
            <label className="form-label small fw-bold text-secondary mb-1">Payment Status</label>
            <select
              className="form-select form-select-sm"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="col-md-3 col-sm-6">
            <label className="form-label small fw-bold text-secondary mb-1">Room Filter</label>
            <select
              className="form-select form-select-sm"
              value={roomFilter}
              onChange={(e) => {
                setRoomFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 col-sm-6">
            <label className="form-label small fw-bold text-secondary mb-1">Specific Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Booking ID</th>
                <th scope="col">Guest Details</th>
                <th scope="col">Room</th>
                <th scope="col">Check-in / Out</th>
                <th scope="col">Amount</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4">
                      <Link to={`/admin/bookings/${b.id}`} className="fw-bold font-monospace text-primary text-decoration-none">
                        {b.id}
                      </Link>
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        Source: {b.bookingSource}
                      </small>
                    </td>
                    <td>
                      <div className="fw-bold text-dark small">{b.guestName}</div>
                      <small className="text-muted d-block">{b.guestPhone}</small>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>{b.guestEmail}</small>
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">#{b.roomNumber} - {b.roomName}</div>
                      <small className="text-muted">{b.roomType} • {b.adults}A, {b.children}C</small>
                    </td>
                    <td>
                      <div className="small font-monospace text-dark">{formatDate(b.checkIn)}</div>
                      <div className="small font-monospace text-muted">&rarr; {formatDate(b.checkOut)} ({b.nights}n)</div>
                    </td>
                    <td>
                      <div className="font-monospace fw-bold text-dark">{formatCurrency(b.totalAmount)}</div>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        Paid: {formatCurrency(b.paidAmount)}
                      </small>
                    </td>
                    <td>
                      <Badge variant={getPaymentStatusVariant(b.paymentStatus) as any}>
                        {b.paymentStatus}
                      </Badge>
                      <small className="text-muted d-block mt-0.5" style={{ fontSize: '0.7rem' }}>
                        {b.paymentMethod}
                      </small>
                    </td>
                    <td>
                      <Badge variant={getBookingStatusVariant(b.bookingStatus) as any}>
                        {b.bookingStatus}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex align-items-center gap-2">
                        {/* Status Transitions */}
                        {b.bookingStatus === 'Pending' && (
                          <button
                            className="btn btn-sm btn-outline-success rounded-pill px-3"
                            title="Confirm Booking"
                            onClick={() => handleStatusChange(b.id, 'Confirmed')}
                          >
                            Confirm
                          </button>
                        )}
                        {b.bookingStatus === 'Confirmed' && (
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            title="Check In Guest"
                            onClick={() => handleStatusChange(b.id, 'Checked In')}
                          >
                            Check In
                          </button>
                        )}
                        {b.bookingStatus === 'Checked In' && (
                          <button
                            className="btn btn-sm btn-outline-info rounded-pill px-3"
                            title="Check Out Guest"
                            onClick={() => handleStatusChange(b.id, 'Checked Out')}
                          >
                            Check Out
                          </button>
                        )}

                        {/* View & Invoice dropdown */}
                        <Link
                          to={`/admin/bookings/${b.id}`}
                          className="btn btn-sm btn-light border rounded-circle"
                          style={{ width: '34px', height: '34px', padding: 0 }}
                          title="View Details"
                        >
                          <i className="bi bi-eye text-primary" />
                        </Link>
                        <button
                          className="btn btn-sm btn-light border rounded-circle"
                          style={{ width: '34px', height: '34px', padding: 0 }}
                          title="Print Invoice"
                          onClick={() => setSelectedBookingForInvoice(b)}
                        >
                          <i className="bi bi-printer text-secondary" />
                        </button>
                        {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Checked Out' && (
                          <button
                            className="btn btn-sm btn-light border text-danger rounded-circle"
                            style={{ width: '34px', height: '34px', padding: 0 }}
                            title="Cancel Booking"
                            onClick={() => {
                              if (window.confirm(`Cancel booking ${b.id}?`)) {
                                handleStatusChange(b.id, 'Cancelled');
                              }
                            }}
                          >
                            <i className="bi bi-x-circle" />
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

        {/* Pagination bar */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </small>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
        title={selectedBookingForInvoice ? `Tax Invoice: ${selectedBookingForInvoice.id}` : ''}
        size="lg"
      >
        {selectedBookingForInvoice && (
          <InvoiceReceipt booking={selectedBookingForInvoice} showActions={true} />
        )}
      </Modal>
    </div>
  );
};
