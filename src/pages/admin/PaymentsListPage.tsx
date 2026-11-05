import React, { useState, useEffect, useMemo } from 'react';
import { paymentService } from '../../services/payment.service';
import { Payment } from '../../types';
import { formatCurrency, formatDate, getPaymentStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';

export const PaymentsListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    paymentService.getAll().then((data) => {
      setPayments(data);
      setIsLoading(false);
    });
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.id.toLowerCase().includes(q) ||
          p.bookingId.toLowerCase().includes(q) ||
          p.guestName.toLowerCase().includes(q) ||
          p.transactionRef.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (methodFilter !== 'All' && p.paymentMethod !== methodFilter) {
        return false;
      }
      if (statusFilter !== 'All' && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [payments, searchQuery, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginated = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return <Loader message="Loading payment transactions..." />;
  }

  const totalPaidVolume = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment Transactions & Audit</h2>
          <p className="text-muted small mb-0">
            Real-time gateway settlements, mobile wallet receipts, and cash verification logs.
          </p>
        </div>
        <div className="bg-white rounded-3 px-3 py-2 border shadow-sm text-end">
          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Total Settled Collections</small>
          <strong className="h5 fw-bold text-success font-monospace mb-0">{formatCurrency(totalPaidVolume)}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search transaction ID, booking ref, guest name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Payment Gateways</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash on Arrival">Cash on Arrival</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="JazzCash">JazzCash</option>
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Transaction Statuses</option>
              <option value="Paid">Settled / Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending Approval</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Payment ID</th>
                <th scope="col">Booking Ref</th>
                <th scope="col">Guest</th>
                <th scope="col">Amount</th>
                <th scope="col">Payment Gateway</th>
                <th scope="col">Transaction Ref</th>
                <th scope="col">Date</th>
                <th scope="col" className="text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id}>
                  <td className="ps-4 fw-bold font-monospace text-primary">{p.id}</td>
                  <td className="font-monospace text-dark small">{p.bookingId}</td>
                  <td className="fw-semibold text-dark small">{p.guestName}</td>
                  <td className="font-monospace fw-bold text-dark">{formatCurrency(p.amount)}</td>
                  <td>
                    <span className="small text-dark d-flex align-items-center gap-1.5">
                      <i className={`bi ${
                        p.paymentMethod === 'Credit/Debit Card' ? 'bi-credit-card' :
                        p.paymentMethod === 'Bank Transfer' ? 'bi-bank' :
                        p.paymentMethod === 'Cash on Arrival' ? 'bi-cash' :
                        'bi-phone'
                      }`} />
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className="font-monospace small text-muted">{p.transactionRef}</span>
                  </td>
                  <td>
                    <span className="small text-secondary">{formatDate(p.date)}</span>
                  </td>
                  <td className="text-end pe-4">
                    <Badge variant={getPaymentStatusVariant(p.status) as any}>
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} records
          </small>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
