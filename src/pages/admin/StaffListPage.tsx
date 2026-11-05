import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { Staff, StaffRole } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const StaffListPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Receptionist');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  const fetchStaff = async () => {
    try {
      const data = await staffService.getAll();
      setStaffList(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Receptionist');
    setShift('Morning');
    setModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setPhone(staff.phone);
    setRole(staff.role);
    setShift(staff.shift);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await staffService.update(editingStaff.id, {
          name,
          email,
          phone,
          role,
          shift
        });
        showToast(`Staff member "${name}" updated!`, 'success');
      } else {
        await staffService.create({
          name,
          email,
          phone,
          role,
          status: 'Active',
          shift,
          joinedDate: new Date().toISOString().split('T')[0]
        });
        showToast(`Staff member "${name}" added!`, 'success');
      }
      setModalOpen(false);
      await fetchStaff();
    } catch (err: any) {
      showToast(err.message || 'Error saving staff member', 'danger');
    }
  };

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      const updated = await staffService.toggleStatus(id);
      showToast(`${name} is now ${updated.status}`, 'info');
      await fetchStaff();
    } catch (err: any) {
      showToast('Toggle failed', 'danger');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete staff member "${name}"?`)) return;
    try {
      await staffService.delete(id);
      showToast(`${name} deleted`, 'success');
      await fetchStaff();
    } catch (err: any) {
      showToast('Delete failed', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading staff roster..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff & Employee Management</h2>
          <p className="text-muted small mb-0">
            Manage front desk receptionists, managers, housekeeping teams, and shift schedules.
          </p>
        </div>
        <Button variant="primary" size="sm" icon="bi-person-plus" onClick={handleOpenCreate}>
          Add Staff Member
        </Button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Staff Member</th>
                <th scope="col">Contact</th>
                <th scope="col">Assigned Role</th>
                <th scope="col">Shift</th>
                <th scope="col">Joined Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '38px', height: '38px' }}>
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="fw-bold text-dark small d-block">{staff.name}</span>
                        <small className="text-muted">Emp ID: {staff.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small text-dark">{staff.email}</div>
                    <small className="text-muted">{staff.phone}</small>
                  </td>
                  <td>
                    <span className={`badge ${
                      staff.role === 'Admin' ? 'bg-danger-subtle text-danger' :
                      staff.role === 'Manager' ? 'bg-primary-subtle text-primary' :
                      staff.role === 'Receptionist' ? 'bg-info-subtle text-info' :
                      'bg-secondary-subtle text-secondary'
                    } rounded-pill px-3 py-1.5`}>
                      {staff.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{staff.shift} Shift</span>
                  </td>
                  <td>
                    <span className="small text-secondary">{staff.joinedDate}</span>
                  </td>
                  <td>
                    <span className={`badge ${staff.status === 'Active' ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-inline-flex align-items-center gap-1">
                      <button
                        className="btn btn-sm btn-light border rounded-pill"
                        title={staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(staff.id, staff.name)}
                      >
                        <i className={`bi ${staff.status === 'Active' ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'}`} />
                      </button>
                      <button
                        className="btn btn-sm btn-light border rounded-pill"
                        title="Edit Staff"
                        onClick={() => handleOpenEdit(staff)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn btn-sm btn-light border text-danger rounded-pill"
                        title="Delete Staff"
                        onClick={() => handleDelete(staff.id, staff.name)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add New Staff Member'}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Usman Ghani"
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="usman@guesthouse.com"
          />

          <Input
            label="Mobile Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+92 321 6665544"
          />

          <div className="row g-2">
            <div className="col-6">
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                options={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'Receptionist', label: 'Receptionist' },
                  { value: 'Housekeeping', label: 'Housekeeping' }
                ]}
              />
            </div>
            <div className="col-6">
              <Select
                label="Assigned Shift"
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                options={[
                  { value: 'Morning', label: 'Morning (7 AM - 3 PM)' },
                  { value: 'Evening', label: 'Evening (3 PM - 11 PM)' },
                  { value: 'Night', label: 'Night (11 PM - 7 AM)' }
                ]}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light border" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Save Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
