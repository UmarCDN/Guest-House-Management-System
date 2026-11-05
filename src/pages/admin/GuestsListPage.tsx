import React, { useState, useEffect, useMemo } from 'react';
import { guestService } from '../../services/guest.service';
import { Guest } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const GuestsListPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal view / edit states
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Guest>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchGuests = async () => {
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          g.firstName?.toLowerCase().includes(q) ||
          g.lastName?.toLowerCase().includes(q) ||
          g.email?.toLowerCase().includes(q) ||
          g.phone?.includes(q) ||
          g.cnicPassport?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'All' && g.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [guests, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage) || 1;
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenEdit = (guest: Guest) => {
    setEditForm(guest);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    try {
      await guestService.update(editForm.id, editForm);
      showToast(`Guest profile updated successfully`, 'success');
      setEditModalOpen(false);
      await fetchGuests();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading guest registry..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Guest Directory & CRM</h2>
          <p className="text-muted small mb-0">
            Guest profiles, identification records, lifetime stay frequencies, and preferences.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, phone, or CNIC/Passport..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Guest Statuses</option>
              <option value="Active">Active Regular</option>
              <option value="VIP">VIP Guest</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Guest Name</th>
                <th scope="col">Contact Info</th>
                <th scope="col">CNIC / Passport</th>
                <th scope="col">Location</th>
                <th scope="col">Total Stays</th>
                <th scope="col">Total Spend</th>
                <th scope="col">Last Visit</th>
                <th scope="col">Tier</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuests.map((g) => (
                <tr key={g.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '36px', height: '36px' }}>
                        {g.firstName.charAt(0)}{g.lastName.charAt(0)}
                      </div>
                      <div>
                        <span className="fw-bold text-dark small d-block">{g.firstName} {g.lastName}</span>
                        <small className="text-muted">ID: {g.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small text-dark">{g.email}</div>
                    <small className="text-muted">{g.phone}</small>
                  </td>
                  <td>
                    <span className="font-monospace small text-secondary">{g.cnicPassport}</span>
                  </td>
                  <td>
                    <span className="small text-dark">{g.city}, {g.country}</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{g.totalBookings} Bookings</span>
                  </td>
                  <td>
                    <span className="font-monospace fw-bold text-dark">{formatCurrency(g.totalSpend)}</span>
                  </td>
                  <td>
                    <span className="small font-monospace text-secondary">{formatDate(g.lastVisit)}</span>
                  </td>
                  <td>
                    <span className={`badge ${g.status === 'VIP' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-inline-flex gap-1">
                      <button
                        className="btn btn-sm btn-light border rounded-pill"
                        title="View Details"
                        onClick={() => setSelectedGuest(g)}
                      >
                        <i className="bi bi-eye" />
                      </button>
                      <button
                        className="btn btn-sm btn-light border rounded-pill"
                        title="Edit Guest"
                        onClick={() => handleOpenEdit(g)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGuests.length)} of {filteredGuests.length} guests
          </small>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Guest Modal */}
      <Modal
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        title={selectedGuest ? `Guest Profile: ${selectedGuest.firstName} ${selectedGuest.lastName}` : ''}
      >
        {selectedGuest && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center display-6 fw-bold" style={{ width: '64px', height: '64px' }}>
                {selectedGuest.firstName.charAt(0)}{selectedGuest.lastName.charAt(0)}
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{selectedGuest.firstName} {selectedGuest.lastName}</h5>
                <span className={`badge ${selectedGuest.status === 'VIP' ? 'bg-warning text-dark' : 'bg-success'} rounded-pill mt-1`}>
                  {selectedGuest.status} Guest
                </span>
              </div>
            </div>

            <div className="row g-3 small mb-4">
              <div className="col-6"><strong>Email:</strong> {selectedGuest.email}</div>
              <div className="col-6"><strong>Phone:</strong> {selectedGuest.phone}</div>
              <div className="col-6"><strong>CNIC / Passport:</strong> {selectedGuest.cnicPassport}</div>
              <div className="col-6"><strong>Address:</strong> {selectedGuest.address}, {selectedGuest.city}</div>
              <div className="col-6"><strong>Total Stays:</strong> {selectedGuest.totalBookings}</div>
              <div className="col-6"><strong>Lifetime Spend:</strong> {formatCurrency(selectedGuest.totalSpend)}</div>
              <div className="col-6"><strong>Last Visited:</strong> {formatDate(selectedGuest.lastVisit)}</div>
              <div className="col-6"><strong>Origin:</strong> {selectedGuest.country}</div>
            </div>

            <div className="d-flex justify-content-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedGuest(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Guest Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Guest Details"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="row g-2">
            <div className="col-6">
              <Input
                label="First Name"
                value={editForm.firstName || ''}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </div>
            <div className="col-6">
              <Input
                label="Last Name"
                value={editForm.lastName || ''}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <Input
            label="Phone"
            value={editForm.phone || ''}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            required
          />
          <Input
            label="CNIC / Passport"
            value={editForm.cnicPassport || ''}
            onChange={(e) => setEditForm({ ...editForm, cnicPassport: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={editForm.address || ''}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="btn btn-light border" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
