import React, { useState, useEffect } from 'react';
import { reportService, RevenueReportData } from '../../services/report.service';
import { roomService } from '../../services/room.service';
import { Room } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';
import { useNotifications } from '../../context/NotificationContext';
import { telegramService, TelegramBotStatus } from '../../services/telegram.service';

export const ReportsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram Bot State
  const [botStatus, setBotStatus] = useState<TelegramBotStatus>({
    configured: false,
    online: false,
    instructions: { step1: '', step2: '', step3: '', step4: '', step5: '' }
  });
  const [previewType, setPreviewType] = useState<'daily' | 'weekly' | 'monthly' | 'rooms' | 'summary'>('daily');
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [targetChatId, setTargetChatId] = useState('');
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);

  // Filters
  const [datePreset, setDatePreset] = useState<'all' | 'month' | 'week' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getRevenueReport({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        roomId: selectedRoom !== 'All' ? selectedRoom : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined
      });
      setReportData(data);
    } catch {
      showToast('Could not load revenue report', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBotStatus = async () => {
    const status = await telegramService.getStatus();
    setBotStatus(status);
  };

  useEffect(() => {
    roomService.getAll().then((r) => setRooms(r));
    loadReport();
    loadBotStatus();
  }, []);

  const handleOpenPreview = async (type: 'daily' | 'weekly' | 'monthly' | 'rooms' | 'summary') => {
    setPreviewType(type);
    setIsPreviewLoading(true);
    setIsPreviewModalOpen(true);
    try {
      const text = await telegramService.getPreview(type);
      setPreviewContent(text);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSendTelegram = async () => {
    if (!targetChatId.trim()) {
      showToast('Please enter your Telegram Chat ID', 'warning');
      return;
    }
    setIsSendingTelegram(true);
    try {
      const result = await telegramService.sendReport(previewType, targetChatId.trim());
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'danger');
      }
    } finally {
      setIsSendingTelegram(false);
    }
  };

  const handlePresetChange = (preset: 'all' | 'month' | 'week' | 'custom') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (preset === 'week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];
      const sunday = new Date(d.setDate(diff + 6)).toISOString().split('T')[0];
      setFromDate(monday);
      setToDate(sunday);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadReport();
  };

  const handleResetFilter = () => {
    setDatePreset('all');
    setFromDate('');
    setToDate('');
    setSelectedRoom('All');
    setSelectedStatus('All');
    setSearchQuery('');
    reportService.getRevenueReport().then((data) => setReportData(data));
  };

  const handleExportCSV = () => {
    if (!reportData?.journal) return;
    const exportRows = reportData.journal.map((j) => ({
      BookingReference: j.reference,
      GuestName: j.guestName,
      GuestEmail: j.guestEmail,
      Room: `${j.roomNumber} - ${j.roomName}`,
      CheckIn: j.checkIn,
      CheckOut: j.checkOut,
      Nights: j.nights,
      TotalAmount: j.totalAmount,
      PaymentMethod: j.paymentMethod,
      PaymentStatus: j.paymentStatus,
      BookingStatus: j.bookingStatus,
      DateCreated: j.createdAt
    }));
    exportToCSV(`SereneHaven_Revenue_Report_${new Date().toISOString().split('T')[0]}`, exportRows);
    showToast('Financial report downloaded as CSV spreadsheet!', 'success');
  };

  const summary = reportData?.summary || {
    totalGrossRevenue: 0,
    totalPaidRevenue: 0,
    totalPendingRevenue: 0,
    totalBookings: 0,
    cancelledBookings: 0,
    lostRevenue: 0,
    averageFolio: 0,
    totalNightsSold: 0,
    occupancyRate: 0,
    totalRooms: 0,
    occupiedRooms: 0
  };

  const filteredJournal = (reportData?.journal || []).filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.reference.toLowerCase().includes(q) ||
      j.guestName.toLowerCase().includes(q) ||
      j.roomName.toLowerCase().includes(q) ||
      j.roomNumber.includes(q) ||
      j.paymentMethod.toLowerCase().includes(q)
    );
  });

  const collectionRate = summary.totalGrossRevenue > 0
    ? Math.round((summary.totalPaidRevenue / summary.totalGrossRevenue) * 100)
    : 100;

  return (
    <div>
      {/* Header & Export Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 d-print-none">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold text-dark mb-0">Financial & Revenue Reports</h2>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
              <i className="bi bi-shield-check me-1" /> Audited Live Data
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time financial performance, total revenue tracking, room-level billing, and payment settlements.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="outline-success" size="sm" icon="bi-file-earmark-excel" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outline-danger" size="sm" icon="bi-file-earmark-pdf" onClick={triggerPrint}>
            Export PDF
          </Button>
          <Button variant="primary" size="sm" icon="bi-printer" onClick={triggerPrint}>
            Print Report
          </Button>
        </div>
      </div>

      {/* AI Telegram Reporting Assistant Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden text-white d-print-none" style={{ background: 'linear-gradient(135deg, #102a43 0%, #0088cc 100%)' }}>
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-white text-primary rounded-pill px-3 py-1 fw-bold fs-6">
                  <i className="bi bi-telegram me-1" /> AI Telegram Bot
                </span>
                <span className={`badge ${botStatus.online ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-2.5 py-1 small`}>
                  {botStatus.online ? `● Connected (@${botStatus.bot?.username})` : '⚪ Standby (Token in .env)'}
                </span>
              </div>
              <h5 className="fw-bold mb-1">Mobile Telegram Report Dispatcher</h5>
              <p className="mb-0 text-white-50 small">
                Receive instant daily, weekly, or monthly business reports directly on Telegram via Roman Urdu or English messages.
              </p>
            </div>

            {/* Quick Action Preview Buttons */}
            <div className="d-flex flex-wrap gap-2">
              <button 
                type="button" 
                className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm"
                onClick={() => handleOpenPreview('daily')}
              >
                📊 Aaj Ki Report
              </button>
              <button 
                type="button" 
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={() => handleOpenPreview('weekly')}
              >
                📅 Is Hafte Ki Report
              </button>
              <button 
                type="button" 
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={() => handleOpenPreview('monthly')}
              >
                📈 Is Mahine Ki Report
              </button>
              <button 
                type="button" 
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={() => handleOpenPreview('rooms')}
              >
                🏨 Room Status
              </button>
              <button 
                type="button" 
                className="btn btn-light btn-sm rounded-pill px-3 text-primary fw-bold"
                onClick={() => setIsSetupModalOpen(true)}
                title="Bot Configuration Guide"
              >
                <i className="bi bi-gear-fill me-1" /> Bot Setup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white d-print-none">
        <form onSubmit={handleApplyFilter}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-auto">
              <label className="form-label small fw-bold text-secondary mb-1">Period Preset</label>
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${datePreset === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('all')}
                >
                  All Time
                </button>
                <button
                  type="button"
                  className={`btn ${datePreset === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('month')}
                >
                  This Month
                </button>
                <button
                  type="button"
                  className={`btn ${datePreset === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('week')}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`btn ${datePreset === 'custom' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePresetChange('custom')}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-secondary mb-1">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setFromDate(e.target.value);
                }}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-secondary mb-1">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setToDate(e.target.value);
                }}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-secondary mb-1">Room Filter</label>
              <select
                className="form-select form-select-sm"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="All">All Rooms</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.roomNumber} - {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-secondary mb-1">Booking Status</label>
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
              </select>
            </div>

            <div className="col-12 col-md-auto d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm px-3 flex-grow-1">
                <i className="bi bi-funnel me-1" /> Filter
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm px-2.5" onClick={handleResetFilter} title="Reset Filters">
                <i className="bi bi-arrow-counterclockwise" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading ? (
        <Loader message="Compiling real-time financial ledger..." />
      ) : (
        <>
          {/* Executive Revenue KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-primary border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Total Gross Revenue
                  </span>
                  <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                    <i className="bi bi-cash-stack fs-5" />
                  </div>
                </div>
                <h3 className="fw-bold text-dark font-monospace mb-1">{formatCurrency(summary.totalGrossRevenue)}</h3>
                <div className="small text-muted d-flex align-items-center gap-1.5">
                  <span className="badge bg-light text-dark border">{summary.totalBookings} stays booked</span>
                  <span>• {summary.totalNightsSold} nights</span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-success border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Net Paid Revenue
                  </span>
                  <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                    <i className="bi bi-check2-circle fs-5" />
                  </div>
                </div>
                <h3 className="fw-bold text-success font-monospace mb-1">{formatCurrency(summary.totalPaidRevenue)}</h3>
                <div className="small d-flex align-items-center gap-1 text-success fw-medium">
                  <i className="bi bi-graph-up-arrow me-1" />
                  <span>{collectionRate}% collection rate</span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-warning border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Pending Receivables
                  </span>
                  <div className="bg-warning bg-opacity-10 text-warning-emphasis p-2 rounded-3">
                    <i className="bi bi-clock-history fs-5" />
                  </div>
                </div>
                <h3 className="fw-bold text-warning-emphasis font-monospace mb-1">{formatCurrency(summary.totalPendingRevenue)}</h3>
                <div className="small text-muted">
                  <span>Due upon check-out</span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-info border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Average Folio Size
                  </span>
                  <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                    <i className="bi bi-pie-chart fs-5" />
                  </div>
                </div>
                <h3 className="fw-bold text-info-emphasis font-monospace mb-1">{formatCurrency(summary.averageFolio)}</h3>
                <div className="small text-muted">
                  <span>Average spend per guest reservation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Analytics Row: Payment Method Breakdown & Room Performance */}
          <div className="row g-4 mb-4">
            {/* Revenue by Room Table */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-door-open text-primary me-2" />
                    Revenue Performance by Room
                  </h5>
                  <span className="badge bg-light text-muted border small">
                    {reportData?.roomBreakdown.length || 0} Suites
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr className="small text-uppercase text-secondary">
                        <th scope="col" className="ps-4">Room</th>
                        <th scope="col">Type</th>
                        <th scope="col" className="text-center">Bookings</th>
                        <th scope="col" className="text-end">Total Revenue</th>
                        <th scope="col" className="text-end pe-4">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.roomBreakdown || []).map((r) => {
                        const sharePercent = summary.totalGrossRevenue > 0
                          ? Math.round((r.totalRevenue / summary.totalGrossRevenue) * 100)
                          : 0;
                        return (
                          <tr key={r.roomId}>
                            <td className="ps-4">
                              <span className="badge bg-dark text-white rounded-pill px-2.5 py-1 me-2 small">
                                #{r.roomNumber}
                              </span>
                              <span className="fw-semibold text-dark small">{r.roomName}</span>
                            </td>
                            <td className="small text-muted">{r.roomType}</td>
                            <td className="text-center small font-monospace fw-bold">{r.bookingsCount}</td>
                            <td className="text-end font-monospace fw-bold text-dark">
                              {formatCurrency(r.totalRevenue)}
                            </td>
                            <td className="text-end pe-4">
                              <div className="d-flex align-items-center justify-content-end gap-2">
                                <div className="progress flex-grow-1" style={{ width: '60px', height: '6px' }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${Math.max(sharePercent, 5)}%` }}
                                  />
                                </div>
                                <span className="small text-muted font-monospace" style={{ width: '32px' }}>
                                  {sharePercent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100 p-4">
                <h5 className="fw-bold text-dark mb-3">
                  <i className="bi bi-wallet2 text-primary me-2" />
                  Revenue by Payment Method
                </h5>
                <p className="text-muted small mb-4">
                  Settlement channels captured through online guest booking and front-desk walk-in receipts.
                </p>

                <div className="d-flex flex-column gap-3">
                  {(reportData?.paymentBreakdown || []).map((p, idx) => {
                    const pct = summary.totalGrossRevenue > 0
                      ? Math.round((p.totalAmount / summary.totalGrossRevenue) * 100)
                      : 0;
                    const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'];
                    const color = colors[idx % colors.length];

                    return (
                      <div key={idx} className="p-3 bg-light rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark text-capitalize small">
                            <i className="bi bi-credit-card-2-front text-secondary me-2" />
                            {p.paymentMethod.replace(/_/g, ' ')}
                          </span>
                          <span className="font-monospace fw-bold text-dark">
                            {formatCurrency(p.totalAmount)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center small text-muted mb-1.5">
                          <span>{p.transactionsCount} transactions</span>
                          <span>{pct}% of revenue</span>
                        </div>
                        <div className="progress" style={{ height: '5px' }}>
                          <div className={`progress-bar ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {(!reportData?.paymentBreakdown || reportData.paymentBreakdown.length === 0) && (
                    <div className="text-center py-4 text-muted small">No payment data recorded in this period.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audited Financial Journal Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-journal-text text-primary me-2" />
                  Audited Financial Ledger & Transaction Journal
                </h5>
                <small className="text-muted">
                  Itemized reservation folios eligible for accounting audits and ledger exports.
                </small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm" style={{ width: '260px' }}>
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search guest, room, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-uppercase text-secondary">
                    <th scope="col" className="ps-4">Reference</th>
                    <th scope="col">Guest Details</th>
                    <th scope="col">Room</th>
                    <th scope="col">Dates</th>
                    <th scope="col" className="text-center">Nights</th>
                    <th scope="col" className="text-end">Total Folio</th>
                    <th scope="col">Method</th>
                    <th scope="col" className="text-center">Pay Status</th>
                    <th scope="col" className="text-end pe-4">Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJournal.map((j) => (
                    <tr key={j.id}>
                      <td className="ps-4">
                        <span className="font-monospace fw-bold text-primary small">{j.reference}</span>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                          {j.createdAt ? formatDate(j.createdAt) : ''}
                        </small>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{j.guestName}</div>
                        <div className="small text-muted">{j.guestEmail}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border me-1">#{j.roomNumber}</span>
                        <span className="small text-dark">{j.roomName}</span>
                      </td>
                      <td className="small font-monospace">
                        <div>{j.checkIn}</div>
                        <div className="text-muted">&rarr; {j.checkOut}</div>
                      </td>
                      <td className="text-center small font-monospace">{j.nights}</td>
                      <td className="text-end font-monospace fw-bold text-dark">
                        {formatCurrency(j.totalAmount)}
                      </td>
                      <td className="small text-capitalize">
                        <span className="badge bg-light text-secondary border">
                          {j.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${j.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-2.5 py-1 small`}>
                          {j.paymentStatus}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <span className="badge bg-light text-dark border small">{j.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredJournal.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-muted">
                        No financial records found matching the applied filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Telegram Live Report Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`🤖 Telegram AI Report Preview (${previewType.toUpperCase()})`}
        size="lg"
      >
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-primary text-white rounded-pill px-3 py-1">
              <i className="bi bi-telegram me-1" /> Live MySQL Output
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => {
                navigator.clipboard.writeText(previewContent);
                showToast('Report copied to clipboard!', 'success');
              }}
            >
              <i className="bi bi-clipboard me-1" /> Copy Text
            </button>
          </div>

          {isPreviewLoading ? (
            <div className="py-5 text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted small">Generating live report from database...</p>
            </div>
          ) : (
            <div
              className="p-3 rounded-3 font-monospace small mb-4"
              style={{
                backgroundColor: '#17212b',
                color: '#e3e8ed',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {previewContent}
            </div>
          )}

          {/* Direct Send to Telegram Input */}
          <div className="p-3 bg-light rounded-3 border">
            <h6 className="fw-bold text-dark mb-2">
              <i className="bi bi-send-fill text-primary me-1" /> Send Directly to a Telegram Chat
            </h6>
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Telegram Chat ID (e.g. 123456789)"
                value={targetChatId}
                onChange={(e) => setTargetChatId(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary px-3"
                onClick={handleSendTelegram}
                disabled={isSendingTelegram || !targetChatId.trim()}
              >
                {isSendingTelegram ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
              💡 Tip: Message your bot on Telegram or message <code>@userinfobot</code> to find your numeric Chat ID.
            </small>
          </div>
        </div>
      </Modal>

      {/* Telegram Bot Setup Modal */}
      <Modal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        title="🤖 How to Connect Your Telegram Bot in 60 Seconds"
        size="md"
      >
        <div className="p-2">
          <p className="text-muted small mb-4">
            Follow these simple steps to receive daily, weekly, and monthly reports directly on your phone:
          </p>

          <ol className="list-group list-group-numbered mb-4 small">
            <li className="list-group-item border-0 ps-0 d-flex gap-2">
              <div>
                <strong>Open Telegram</strong> and search for the official bot: <code>@BotFather</code>
              </div>
            </li>
            <li className="list-group-item border-0 ps-0 d-flex gap-2">
              <div>
                Send <code>/newbot</code>, give it a display name (e.g. <em>Serene Haven Reports</em>), and choose a username ending with <code>bot</code>.
              </div>
            </li>
            <li className="list-group-item border-0 ps-0 d-flex gap-2">
              <div>
                Copy the <strong>HTTP API Token</strong> provided by BotFather (format: <code>123456789:ABCdef...</code>).
              </div>
            </li>
            <li className="list-group-item border-0 ps-0 d-flex gap-2">
              <div>
                Paste your token into the <code>backend/.env</code> file:
                <div className="bg-dark text-white p-2 rounded-2 mt-1 font-monospace" style={{ fontSize: '0.75rem' }}>
                  TELEGRAM_BOT_TOKEN=your_token_here
                </div>
              </div>
            </li>
            <li className="list-group-item border-0 ps-0 d-flex gap-2">
              <div>
                Open your bot in Telegram, tap <strong>Start</strong>, and receive reports anytime!
              </div>
            </li>
          </ol>

          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => setIsSetupModalOpen(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
