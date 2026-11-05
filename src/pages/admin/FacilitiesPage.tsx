import React, { useState, useEffect } from 'react';
import { facilityService } from '../../services/facility.service';
import { Facility } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const FacilitiesPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFac, setEditingFac] = useState<Facility | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('bi-wifi');
  const [category, setCategory] = useState('Amenities');

  const fetchFacilities = async () => {
    try {
      const data = await facilityService.getAll();
      setFacilities(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenCreate = () => {
    setEditingFac(null);
    setName('');
    setDescription('');
    setIcon('bi-wifi');
    setCategory('Amenities');
    setModalOpen(true);
  };

  const handleOpenEdit = (fac: Facility) => {
    setEditingFac(fac);
    setName(fac.name);
    setDescription(fac.description);
    setIcon(fac.icon);
    setCategory(fac.category);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFac) {
        await facilityService.update(editingFac.id, {
          name,
          description,
          icon,
          category
        });
        showToast(`Facility "${name}" updated!`, 'success');
      } else {
        await facilityService.create({
          name,
          description,
          icon,
          category,
          status: 'Enabled'
        });
        showToast(`Facility "${name}" created!`, 'success');
      }
      setModalOpen(false);
      await fetchFacilities();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'danger');
    }
  };

  const handleToggle = async (id: string, name: string) => {
    try {
      const updated = await facilityService.toggleStatus(id);
      showToast(`Facility "${name}" is now ${updated.status}`, 'info');
      await fetchFacilities();
    } catch {
      showToast('Toggle failed', 'danger');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete facility "${name}"?`)) return;
    try {
      await facilityService.delete(id);
      showToast(`Facility "${name}" removed`, 'success');
      await fetchFacilities();
    } catch {
      showToast('Delete failed', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading facility configurations..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Facilities & Hotel Amenities</h2>
          <p className="text-muted small mb-0">
            Define high-impact guest house services, public highlights, and room amenity tags.
          </p>
        </div>
        <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={handleOpenCreate}>
          Add Facility
        </Button>
      </div>

      <div className="row g-4">
        {facilities.map((fac) => (
          <div key={fac.id} className="col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="rounded-3 bg-primary bg-opacity-10 text-primary p-2.5 d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
                  >
                    <i className={`bi ${fac.icon}`} />
                  </div>
                  <span className={`badge ${fac.status === 'Enabled' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} rounded-pill px-3 py-1.5`}>
                    {fac.status}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-1">{fac.name}</h5>
                <small className="text-primary fw-semibold d-block mb-2">{fac.category}</small>
                <p className="text-muted small mb-0">{fac.description}</p>
              </div>

              <div className="pt-3 border-top mt-4 d-flex justify-content-between align-items-center">
                <button
                  className={`btn btn-sm rounded-pill px-3 ${
                    fac.status === 'Enabled' ? 'btn-outline-secondary' : 'btn-outline-success'
                  }`}
                  onClick={() => handleToggle(fac.id, fac.name)}
                >
                  {fac.status === 'Enabled' ? 'Disable' : 'Enable'}
                </button>

                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-light border rounded-pill"
                    onClick={() => handleOpenEdit(fac)}
                    title="Edit"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-sm btn-light text-danger border rounded-pill"
                    onClick={() => handleDelete(fac.id, fac.name)}
                    title="Delete"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFac ? `Edit Facility: ${editingFac.name}` : 'Add New Facility'}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Facility Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Free High-Speed WiFi"
            required
          />

          <div className="row g-2">
            <div className="col-6">
              <Input
                label="Bootstrap Icon Class"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="bi-wifi"
                required
              />
            </div>
            <div className="col-6">
              <Input
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Connectivity"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary mb-1">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this service for guests..."
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light border" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Save Facility
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
