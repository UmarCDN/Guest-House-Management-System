import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface RevenueTrendItem {
  month: string;
  revenue: number;
}

interface RevenueTrendChartProps {
  data?: RevenueTrendItem[];
  currentMonthRevenue?: number;
}

// Monthly Booking & Revenue Trend Chart (Dynamic SVG)
export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data = [],
  currentMonthRevenue
}) => {
  // Use real data or fallback to monthly view
  const trendData = data && data.length > 0
    ? data
    : [
        { month: 'Sep', revenue: 2829 },
        { month: 'Oct', revenue: 360 }
      ];

  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 1000) * 1.25;
  const currentRev = currentMonthRevenue !== undefined
    ? currentMonthRevenue
    : trendData[trendData.length - 1]?.revenue || 0;

  const pointsCount = trendData.length;
  const stepX = pointsCount > 1 ? 500 / (pointsCount - 1) : 250;

  const polylinePoints = trendData
    .map((d, idx) => {
      const x = 50 + idx * stepX;
      const y = 160 - (d.revenue / maxRevenue) * 130;
      return `${x},${Math.max(20, Math.min(160, y))}`;
    })
    .join(' ');

  const areaPoints = `50,160 ${polylinePoints} ${50 + (pointsCount - 1) * stepX},160`;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="h4 fw-bold text-dark mb-0 font-monospace">{formatCurrency(currentRev)}</span>
          <span className="badge bg-success-subtle text-success ms-2">
            <i className="bi bi-graph-up-arrow me-1" /> Live Revenue
          </span>
        </div>
        <span className="text-muted small">Database Real-Time Records</span>
      </div>
      <div style={{ height: '220px', width: '100%' }}>
        <svg viewBox="0 0 600 200" className="w-100 h-100 overflow-visible">
          <defs>
            <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a365d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1a365d" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[20, 60, 110, 160].map((y) => (
            <line
              key={y}
              x1="40"
              y1={y}
              x2="560"
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area polygon */}
          <polygon points={areaPoints} fill="url(#revenueGrad)" />

          {/* Trend line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#1a365d"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {trendData.map((d, idx) => {
            const cx = 50 + idx * stepX;
            const cy = Math.max(20, Math.min(160, 160 - (d.revenue / maxRevenue) * 130));
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="5" fill="#ffffff" stroke="#1a365d" strokeWidth="3" />
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  ${d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
                </text>
                <text x={cx} y="180" textAnchor="middle" fontSize="12" fontWeight="600" fill="#64748b">
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface OccupancyGaugeChartProps {
  occupancyRate?: number;
  distribution?: {
    available: number;
    occupied: number;
    maintenance: number;
  };
}

// Occupancy Rate Gauge & Room Distribution (Dynamic SVG)
export const OccupancyGaugeChart: React.FC<OccupancyGaugeChartProps> = ({
  occupancyRate = 0,
  distribution = { available: 0, occupied: 0, maintenance: 0 }
}) => {
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, occupancyRate))) / 100;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-2">
      <div className="position-relative" style={{ width: '160px', height: '160px' }}>
        <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={occupancyRate > 50 ? '#059669' : '#1a365d'}
            strokeWidth="10"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <span className="h3 fw-bold text-dark d-block mb-0">{occupancyRate}%</span>
          <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
            Occupancy
          </small>
        </div>
      </div>
      <div className="row w-100 text-center mt-3 g-2">
        <div className="col-4">
          <div className="p-2 rounded bg-light border">
            <span className="d-block fw-bold text-success fs-6 font-monospace">{distribution.available}</span>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Available</small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded bg-light border">
            <span className="d-block fw-bold text-danger fs-6 font-monospace">{distribution.occupied}</span>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Occupied</small>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded bg-light border">
            <span className="d-block fw-bold text-warning fs-6 font-monospace">{distribution.maintenance}</span>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Blocked</small>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MonthlyBookingsBarChartProps {
  data?: { month: string; count: number }[];
}

// Monthly Bookings Bar Chart (Dynamic SVG)
export const MonthlyBookingsBarChart: React.FC<MonthlyBookingsBarChartProps> = ({
  data = []
}) => {
  const chartData = data && data.length > 0
    ? data
    : [
        { month: 'Sep', count: 5 },
        { month: 'Oct', count: 1 }
      ];

  const max = Math.max(...chartData.map((d) => d.count), 5) * 1.3;
  const count = chartData.length;
  const colWidth = Math.min(75, 450 / count);

  return (
    <div style={{ height: '220px', width: '100%' }}>
      <svg viewBox="0 0 500 200" className="w-100 h-100">
        {chartData.map((d, i) => {
          const x = 40 + i * colWidth;
          const barHeight = Math.max(8, (d.count / max) * 130);
          const y = 160 - barHeight;
          return (
            <g key={i}>
              {/* Background pill */}
              <rect
                x={x}
                y="20"
                width="34"
                height="140"
                rx="6"
                fill="#f1f5f9"
              />
              {/* Active bar */}
              <rect
                x={x}
                y={y}
                width="34"
                height={barHeight}
                rx="6"
                fill={i === chartData.length - 1 ? '#1a365d' : '#3b82f6'}
              />
              <text
                x={x + 17}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#1e293b"
              >
                {d.count}
              </text>
              <text
                x={x + 17}
                y="180"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#64748b"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

