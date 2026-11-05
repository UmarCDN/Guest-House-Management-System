import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/room.service';
import { bookingService } from '../../services/booking.service';
import { paymentService } from '../../services/payment.service';
import { Room, PaymentMethod, Booking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const ReceptionistBookingPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Available' | 'Occupied' | 'Maintenance'>('All');

  // Walk-in reservation form state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guestName, setGuestName] = useState('');
  const [guestCnic, setGuestCnic] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCity, setGuestCity] = useState('Islamabad');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Arrival');
  const [isPaidNow, setIsPaidNow] = useState(true);
  const [instantCheckIn, setInstantCheckIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Receipt Slip Modal state
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async (inDate = checkIn, outDate = checkOut, silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await roomService.getAll({ checkIn: inDate, checkOut: outDate });
      setRooms(data);
      setLastSynced(new Date());

      // If currently selected room becomes occupied/reserved, notify receptionist and deselect/reassign
      setSelectedRoom((prevSelected) => {
        if (!prevSelected) {
          const firstAvail = data.find(r => r.status === 'Available' && !r.isReserved);
          return firstAvail || null;
        }
        const updatedSelf = data.find(r => r.id === prevSelected.id);
        if (updatedSelf) {
          if (updatedSelf.status === 'Occupied' || updatedSelf.isReserved) {
            showToast(`Notice: Room #${updatedSelf.roomNumber} (${updatedSelf.name}) is already reserved for selected dates.`, 'warning');
            const nextAvail = data.find(r => r.status === 'Available' && !r.isReserved && r.id !== updatedSelf.id);
            return nextAvail || null;
          }
          return updatedSelf;
        }
        return prevSelected;
      });
    } finally {
      if (!silent) setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Re-fetch room rack when intake dates change
  useEffect(() => {
    fetchRooms(checkIn, checkOut);
  }, [checkIn, checkOut]);

  // Live auto-synchronization polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms(checkIn, checkOut, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [checkIn, checkOut]);

  // Pricing calculation
  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const baseRate = selectedRoom?.pricePerNight || 0;
  const subtotal = baseRate * nights;
  const taxes = Math.round(subtotal * 0.10);
  const totalAmount = subtotal + taxes;

  const handleSelectRoom = (room: Room) => {
    if (room.status === 'Occupied' || room.isReserved) {
      const guestText = room.activeBooking?.guestName ? `by ${room.activeBooking.guestName}` : 'online';
      showToast(`Room #${room.roomNumber} (${room.name}) is already booked ${guestText} for selected dates.`, 'warning');
      return;
    }
    if (room.status === 'Maintenance') {
      showToast(`Room #${room.roomNumber} is currently undergoing maintenance.`, 'warning');
      return;
    }
    setSelectedRoom(room);
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      showToast('Please select an available room first.', 'warning');
      return;
    }
    if (selectedRoom.status === 'Occupied' || selectedRoom.isReserved) {
      showToast('Cannot reserve: The selected room is already booked for these dates.', 'danger');
      return;
    }
    if (!guestName.trim()) {
      showToast('Guest full name is required.', 'danger');
      return;
    }
    if (!guestPhone.trim()) {
      showToast('Guest phone number is required.', 'danger');
      return;
    }
    if (!guestCnic.trim()) {
      showToast('CNIC / Passport number is required for hotel security record.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData: Omit<Booking, 'id' | 'createdAt'> = {
        guestName,
        guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, '')}@walkin.guest`,
        guestPhone,
        guestCnic,
        guestAddress: guestCity,
        guestCity,
        guestCountry: 'Pakistan',
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        roomName: selectedRoom.name,
        roomType: selectedRoom.type,
        checkIn,
        checkOut,
        adults,
        children,
        numberOfRooms: 1,
        nights,
        roomPrice: baseRate,
        taxes,
        discount: 0,
        totalAmount,
        paidAmount: isPaidNow ? totalAmount : 0,
        remainingAmount: isPaidNow ? 0 : totalAmount,
        paymentMethod,
        paymentStatus: (isPaidNow ? 'Paid' : 'Pending') as any,
        bookingStatus: (instantCheckIn ? 'Checked In' : 'Confirmed') as any,
        bookingSource: 'Walk-in',
        specialRequests
      };

      const newBooking = await bookingService.create(bookingData);

      // Record transaction if paid
      if (isPaidNow) {
        await paymentService.create({
          bookingId: newBooking.id,
          guestName: newBooking.guestName,
          amount: newBooking.totalAmount,
          paymentMethod,
          transactionRef: `REC-${Date.now().toString().slice(-6)}`,
          status: 'Paid',
          date: new Date().toISOString(),
          notes: 'Front Desk Walk-in immediate payment'
        });
      }

      // If instant check-in, also update room status to occupied in MySQL
      if (instantCheckIn) {
        await roomService.update(selectedRoom.id, { status: 'Occupied' });
      }

      showToast(`Walk-in reservation ${newBooking.id} recorded successfully!`, 'success');
      setCreatedBooking({
        ...newBooking,
        roomNumber: selectedRoom.roomNumber,
        roomName: selectedRoom.name,
        roomType: selectedRoom.type,
        guestCnic,
        guestPhone
      });
      setIsReceiptModalOpen(true);

      // Reset form
      setGuestName('');
      setGuestCnic('');
      setGuestPhone('');
      setGuestEmail('');
      setSpecialRequests('');
      await fetchRooms();
    } catch (err: any) {
      showToast(err.message || 'Error creating walk-in booking', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  const availableCount = rooms.filter(r => r.status === 'Available').length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const maintenanceCount = rooms.filter(r => r.status === 'Maintenance').length;

  if (isLoading) {
    return <Loader message="Loading Front Desk visual room rack..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold text-dark mb-0">Front Desk & Run-Time Booking</h2>
            <span className="badge bg-primary text-white rounded-pill px-3 py-1">
              <i className="bi bi-reception-4 me-1" /> POS Terminal
            </span>
          </div>
          <p className="text-muted small mb-0">
            Rapid walk-in check-in engine, instant key-card assignment, and room rack status console.
          </p>
        </div>

        {/* Live Rack Stats Badges & Sync Controls */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 small d-flex align-items-center gap-1.5">
            <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} />
            Live Sync Active
          </span>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-1 shadow-sm"
            onClick={() => fetchRooms(checkIn, checkOut)}
            disabled={isRefreshing}
            title="Force Refresh Room Rack"
          >
            <i className={`bi bi-arrow-clockwise ${isRefreshing ? 'spinner-border spinner-border-sm' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 small">
            🟢 {availableCount} Available
          </span>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-3 small">
            🔴 {occupiedCount} Booked
          </span>
          {maintenanceCount > 0 && (
            <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-3 small">
              🟡 {maintenanceCount} Maintenance
            </span>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Visual Room Rack Grid */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-grid-3x3-gap-fill text-primary me-2" />
                Visual Room Rack ({filteredRooms.length} Rooms)
              </h5>

              {/* Status Filter Tabs */}
              <div className="btn-group btn-group-sm">
                {(['All', 'Available', 'Occupied', 'Maintenance'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterStatus(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted small mb-3">
              Click on any available room tile below to load it directly into the run-time walk-in register.
            </p>

            {/* Room Tiles Grid */}
            <div className="row g-3" style={{ maxHeight: '720px', overflowY: 'auto' }}>
              {filteredRooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isOccupied = room.status === 'Occupied' || Boolean(room.isReserved);
                const isAvail = !isOccupied && room.status === 'Available';

                return (
                  <div key={room.id} className="col-sm-6">
                    <div
                      className={`card h-100 rounded-4 border transition-all cursor-pointer p-3 room-rack-card ${
                        isSelected
                          ? 'selected border-primary border-2 shadow-md'
                          : isAvail
                          ? 'border-success-subtle hover-shadow-sm bg-white'
                          : isOccupied
                          ? 'border-danger-subtle bg-danger bg-opacity-10'
                          : 'disabled border-secondary-subtle bg-light'
                      }`}
                      onClick={() => handleSelectRoom(room)}
                      style={{ cursor: isAvail ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${
                              isSelected
                                ? 'bg-white bg-opacity-25 text-white'
                                : isAvail
                                ? 'bg-dark text-white'
                                : isOccupied
                                ? 'bg-danger text-white'
                                : 'bg-secondary text-white'
                            } rounded-pill px-2.5 py-1 fs-6 font-monospace room-number-badge`}
                          >
                            #{room.roomNumber}
                          </span>
                          <small className={`room-floor-text ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                            Floor {room.floor}
                          </small>
                        </div>
                        <span
                          className={`badge ${
                            isAvail
                              ? 'bg-success text-white'
                              : isOccupied
                              ? 'bg-danger text-white'
                              : 'bg-secondary text-white'
                          } rounded-pill px-2.5 py-1 small`}
                        >
                          {isOccupied ? 'Booked' : room.status}
                        </span>
                      </div>

                      <h6 className={`fw-bold mb-1 text-truncate room-title ${isSelected ? 'text-white' : 'text-dark'}`} title={room.name}>
                        {room.name}
                      </h6>
                      <small className={`d-block mb-1 room-subtitle ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                        {room.type} • {room.bedType}
                      </small>

                      {/* Active Stay / Booking Information Badge */}
                      {isOccupied && room.activeBooking && (
                        <div className="my-1.5 py-1 px-2 rounded-2 bg-white bg-opacity-90 border border-danger-subtle text-danger small">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-truncate me-1" style={{ maxWidth: '110px' }} title={room.activeBooking.guestName}>
                              <i className="bi bi-person-fill me-1" />
                              {room.activeBooking.guestName}
                            </span>
                            <span className="font-monospace text-muted" style={{ fontSize: '0.7rem' }}>
                              {room.activeBooking.checkIn?.slice(5)} → {room.activeBooking.checkOut?.slice(5)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-end mt-auto pt-2 border-top">
                        <span className={`font-monospace fw-bold fs-6 room-price ${isSelected ? 'text-white' : 'text-primary'}`}>
                          {formatCurrency(room.pricePerNight)}
                          <small className={`fw-normal ${isSelected ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>/nt</small>
                        </span>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 room-select-btn ${
                            isSelected
                              ? 'btn-light text-primary fw-bold shadow-sm'
                              : isAvail
                              ? 'btn-outline-primary'
                              : isOccupied
                              ? 'btn-outline-danger disabled'
                              : 'btn-outline-secondary disabled'
                          }`}
                        >
                          {isSelected ? 'Selected' : isAvail ? 'Select' : 'Booked'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Run-time Walk-in Intake Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 sticky-top" style={{ top: '80px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">Walk-in Registration</h5>
                <small className="text-muted">Instant Run-Time Check-In</small>
              </div>
              {selectedRoom && (
                <span className="badge bg-primary rounded-pill px-3 py-1.5 fs-6">
                  Room #{selectedRoom.roomNumber}
                </span>
              )}
            </div>

            {selectedRoom ? (
              <form onSubmit={handleWalkInSubmit}>
                {/* Room Info Tag */}
                <div className="p-2.5 bg-light rounded-3 border mb-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark small d-block">{selectedRoom.name}</span>
                    <small className="text-muted">{selectedRoom.type} • {selectedRoom.bedType}</small>
                  </div>
                  <span className="font-monospace fw-bold text-primary">
                    {formatCurrency(selectedRoom.pricePerNight)}
                  </span>
                </div>

                {/* Stay Dates */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">Check-in Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">Check-out Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Guest Details */}
                <div className="mb-2">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Guest Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Tariq Mehmood"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      CNIC / Passport <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 61101-1234567-1"
                      value={guestCnic}
                      onChange={(e) => setGuestCnic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="+92 300 1234567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="guest@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary mb-1">Origin City</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Lahore / Islamabad"
                      value={guestCity}
                      onChange={(e) => setGuestCity(e.target.value)}
                    />
                  </div>
                </div>

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
                      {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                    </select>
                  </div>
                </div>

                {/* Settlement Options */}
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between py-1 small">
                    <span className="text-muted">Duration:</span>
                    <span className="fw-bold text-dark">{nights} Night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 small">
                    <span className="text-muted">Tariff Subtotal:</span>
                    <span className="font-monospace">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 small">
                    <span className="text-muted">Tax (10%):</span>
                    <span className="font-monospace">{formatCurrency(taxes)}</span>
                  </div>
                  <hr className="my-1.5" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">Total Bill:</span>
                    <span className="h5 fw-bold text-primary font-monospace mb-0">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="mt-2.5 pt-2 border-top">
                    <label className="form-label small fw-bold text-secondary mb-1">Payment Method</label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash on Arrival">Cash at Counter (Walk-in)</option>
                      <option value="Credit/Debit Card">Credit/Debit Card (POS)</option>
                      <option value="Easypaisa">Easypaisa Mobile Account</option>
                      <option value="JazzCash">JazzCash Mobile Account</option>
                      <option value="Bank Transfer">Direct Bank Transfer</option>
                    </select>
                  </div>

                  {/* Status Toggles */}
                  <div className="mt-2.5 d-flex flex-column gap-1.5">
                    <div className="form-check form-switch small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="paidNowSwitch"
                        checked={isPaidNow}
                        onChange={(e) => setIsPaidNow(e.target.checked)}
                      />
                      <label className="form-check-label fw-medium text-dark" htmlFor="paidNowSwitch">
                        Payment Collected in Full Right Now
                      </label>
                    </div>

                    <div className="form-check form-switch small">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="instantCheckInSwitch"
                        checked={instantCheckIn}
                        onChange={(e) => setInstantCheckIn(e.target.checked)}
                      />
                      <label className="form-check-label fw-medium text-dark" htmlFor="instantCheckInSwitch">
                        Mark Room as Occupied & Check-in Now
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedRoom.status !== 'Available'}
                  className={`btn w-100 py-2.5 rounded-3 fw-bold fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2 ${
                    selectedRoom.status === 'Available' ? 'btn-primary' : 'btn-secondary disabled'
                  }`}
                >
                  <i className="bi bi-check-circle-fill" />
                  <span>
                    {isSubmitting
                      ? 'Creating Reservation...'
                      : selectedRoom.status === 'Available'
                      ? 'Complete Walk-in Booking & Print Slip'
                      : 'Selected Room is Not Available'}
                  </span>
                </button>
              </form>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-arrow-left-circle fs-2 d-block mb-2 text-primary" />
                Select a room from the rack to start walk-in booking.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Check-in Slip & Folio Modal */}
      {createdBooking && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Guest Check-In Folio & Key Card Slip"
          size="lg"
        >
          <div className="p-2" id="printable-reception-slip">
            {/* Header branding */}
            <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold text-dark mb-0">Serene Haven Luxury Guest House</h4>
                <small className="text-muted">Plot 14, Hillview Road, Sector F-6/3, Islamabad, Pakistan</small>
                <div className="small text-muted">Tel: +92 51 2223344 • info@serenehavenguesthouse.com</div>
              </div>
              <div className="text-end">
                <span className="badge bg-primary fs-6 font-monospace px-3 py-1.5">
                  {createdBooking.id}
                </span>
                <small className="text-muted d-block mt-1">Walk-in Registration</small>
              </div>
            </div>

            {/* Room Assignment Box */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Assigned Room</small>
                  <span className="h3 fw-bold text-primary font-monospace mb-0">#{createdBooking.roomNumber}</span>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Check-In</small>
                  <span className="fw-bold text-dark mb-0 small font-monospace">{createdBooking.checkIn}</span>
                  <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Standard 14:00</small>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded-3 text-center border">
                  <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.65rem' }}>Check-Out</small>
                  <span className="fw-bold text-dark mb-0 small font-monospace">{createdBooking.checkOut}</span>
                  <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Standard 11:00</small>
                </div>
              </div>
            </div>

            {/* Guest & Billing Details */}
            <div className="table-responsive mb-3">
              <table className="table table-bordered table-sm align-middle small mb-0">
                <tbody>
                  <tr>
                    <th className="bg-light" style={{ width: '30%' }}>Guest Full Name</th>
                    <td className="fw-bold">{createdBooking.guestName}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">CNIC / Passport #</th>
                    <td className="font-monospace">{createdBooking.guestCnic}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Phone Number</th>
                    <td>{createdBooking.guestPhone}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Room Category</th>
                    <td>{createdBooking.roomType} — {createdBooking.roomName}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Nights & Guests</th>
                    <td>{createdBooking.nights} Night(s) • {createdBooking.adults} Adults</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Payment Method</th>
                    <td>{createdBooking.paymentMethod}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Total Tariff Billed</th>
                    <td className="fw-bold font-monospace fs-6 text-primary">
                      {formatCurrency(createdBooking.totalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-light">Settlement Status</th>
                    <td>
                      <span className={`badge ${createdBooking.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {createdBooking.paymentStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="row g-4 pt-4 mt-2 border-top">
              <div className="col-6 text-center">
                <div className="border-top border-dark pt-1 w-75 mx-auto">
                  <small className="fw-bold text-dark d-block">Receptionist / Cashier</small>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Serene Haven Front Desk</small>
                </div>
              </div>
              <div className="col-6 text-center">
                <div className="border-top border-dark pt-1 w-75 mx-auto">
                  <small className="fw-bold text-dark d-block">Guest Signature</small>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>I agree to house regulations</small>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top d-print-none">
              <Button variant="secondary" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon="bi-printer" onClick={() => window.print()}>
                Print Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
