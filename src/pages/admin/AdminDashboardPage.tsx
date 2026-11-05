import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, DashboardData } from '../../services/dashboard.service';
import { formatCurrency, formatDate, getBookingStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { RevenueTrendChart, OccupancyGaugeChart, MonthlyBookingsBarChart } from '../../components/charts/AdminCharts';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !data) {
    return <Loader message="Loading real-time dashboard from database..." />;
  }

  const { stats, charts, recentBookings } = data;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Executive Dashboard</h2>
          <p className="text-muted small mb-0">
            Real-time MySQL database operations, occupancy metrics, reservations, and financial overview.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/bookings" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-calendar-check me-1" /> View Bookings
          </Link>
          <Link to="/admin/rooms/create" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm">
            <i className="bi bi-plus-circle me-1" /> Add New Room
          </Link>
        </div>
      </div>

      {/* 8 Statistics Metric Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Total Rooms */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Total Rooms</span>
                <h4 className="fw-bold text-dark font-monospace mb-0">{stats.totalRooms}</h4>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 fs-5">
                <i className="bi bi-building" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              Across boutique property
            </div>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Available Rooms</span>
                <h4 className="fw-bold text-success font-monospace mb-0">{stats.availableRooms}</h4>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded-3 p-2 fs-5">
                <i className="bi bi-door-open" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              Ready for immediate check-in
            </div>
          </div>
        </div>

        {/* Occupied Rooms */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Occupied Rooms</span>
                <h4 className="fw-bold text-danger font-monospace mb-0">{stats.occupiedRooms}</h4>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-2 fs-5">
                <i className="bi bi-person-fill-check" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              Active in-house stays
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Total Revenue</span>
                <h4 className="fw-bold text-primary font-monospace mb-0">{formatCurrency(stats.totalRevenue)}</h4>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 fs-5">
                <i className="bi bi-cash-stack" />
              </div>
            </div>
            <div className="mt-2 text-success small fw-medium" style={{ fontSize: '0.72rem' }}>
              <i className="bi bi-check2-circle text-success me-1" /> Live settled volume
            </div>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Today's Check-ins</span>
                <h4 className="fw-bold text-info font-monospace mb-0">{stats.todayCheckIns}</h4>
              </div>
              <div className="bg-info bg-opacity-10 text-info rounded-3 p-2 fs-5">
                <i className="bi bi-box-arrow-in-right" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              Scheduled arrivals
            </div>
          </div>
        </div>

        {/* Today's Check-outs */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Today's Check-outs</span>
                <h4 className="fw-bold text-secondary font-monospace mb-0">{stats.todayCheckOuts}</h4>
              </div>
              <div className="bg-secondary bg-opacity-10 text-secondary rounded-3 p-2 fs-5">
                <i className="bi bi-box-arrow-right" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              Departures & room turnover
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Total Bookings</span>
                <h4 className="fw-bold text-dark font-monospace mb-0">{stats.totalBookings}</h4>
              </div>
              <div className="bg-dark bg-opacity-10 text-dark rounded-3 p-2 fs-5">
                <i className="bi bi-journal-bookmark-fill" />
              </div>
            </div>
            <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
              All-time reservations in MySQL
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small d-block">Pending Bookings</span>
                <h4 className="fw-bold text-warning font-monospace mb-0">{stats.pendingBookings}</h4>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-2 fs-5">
                <i className="bi bi-hourglass-split" />
              </div>
            </div>
            <div className="mt-2 text-warning small" style={{ fontSize: '0.72rem' }}>
              Awaiting confirmation/settlement
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Revenue Analytics */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Revenue Trend (2026)</h5>
                <small className="text-muted">Monthly gross billing and booking income from MySQL</small>
              </div>
              <span className="badge bg-light text-dark border">Quarterly</span>
            </div>
            <RevenueTrendChart
              data={charts.revenueTrend}
              currentMonthRevenue={stats.totalRevenue}
            />
          </div>
        </div>

        {/* Occupancy Rate Gauge */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Live Occupancy Rate</h5>
                <small className="text-muted">Current room allocation status</small>
              </div>
            </div>
            <OccupancyGaugeChart
              occupancyRate={stats.occupancyRate}
              distribution={charts.roomDistribution}
            />
          </div>
        </div>

        {/* Monthly Bookings Bar Chart */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Monthly Booking Volume</h5>
                <small className="text-muted">Completed reservations per month from MySQL</small>
              </div>
            </div>
            <MonthlyBookingsBarChart data={charts.bookingVolume} />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Latest Booking Activity</h5>
            <small className="text-muted">Real-time guest reservations directly from database</small>
          </div>
          <Link to="/admin/bookings" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            Manage All Bookings &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Booking ID</th>
                <th scope="col">Guest</th>
                <th scope="col">Room</th>
                <th scope="col">Check-in / Out</th>
                <th scope="col">Total Amount</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 8).map((b) => (
                <tr key={b.id}>
                  <td className="ps-4 fw-bold font-monospace text-primary">{b.id}</td>
                  <td>
                    <div className="fw-bold text-dark small">{b.guestName}</div>
                    <small className="text-muted">{b.guestPhone}</small>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border me-1">#{b.roomNumber}</span>
                    <span className="small text-secondary">{b.roomName}</span>
                  </td>
                  <td className="small font-monospace text-dark">
                    {formatDate(b.checkIn)} &rarr; {formatDate(b.checkOut)}
                  </td>
                  <td className="font-monospace fw-bold text-dark">{formatCurrency(b.totalAmount)}</td>
                  <td>
                    <Badge variant={getBookingStatusVariant(b.bookingStatus) as any}>
                      {b.bookingStatus}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <Link
                      to={`/admin/bookings/${b.id}`}
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted small">
                    No bookings recorded in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
