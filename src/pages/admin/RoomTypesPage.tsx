import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/room.service';
import { RoomType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const RoomTypesPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [types, setTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  // Modal form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(100);
  const [maxGuests, setMaxGuests] = useState(2);
  const [imageUrl, setImageUrl] = useState('');

  const fetchRoomTypes = async () => {
    try {
      const data = await roomService.getRoomTypes();
      setTypes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleOpenCreate = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setBasePrice(100);
    setMaxGuests(2);
    setImageUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
    setModalOpen(true);
  };

  const handleOpenEdit = (rt: RoomType) => {
    setEditingType(rt);
    setName(rt.name);
    setDescription(rt.description);
    setBasePrice(rt.basePrice);
    setMaxGuests(rt.maxGuests);
    setImageUrl(rt.images[0] || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await roomService.updateRoomType(editingType.id, {
          name,
          description,
          basePrice: Number(basePrice),
          maxGuests: Number(maxGuests),
          images: [imageUrl]
        });
        showToast(`Category "${name}" updated!`, 'success');
      } else {
        await roomService.createRoomType({
          name,
          description,
          basePrice: Number(basePrice),
          maxGuests: Number(maxGuests),
          amenities: ['WiFi', 'Air Conditioning'],
          images: [imageUrl],
          status: 'active'
        });
        showToast(`Category "${name}" created!`, 'success');
      }
      setModalOpen(false);
      await fetchRoomTypes();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'danger');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete room category "${name}"?`)) return;
    try {
      await roomService.deleteRoomType(id);
      showToast(`Category "${name}" removed`, 'success');
      await fetchRoomTypes();
    } catch (err: any) {
      showToast(err.message || 'Error deleting category', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading room categories..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Room Categories & Types</h2>
          <p className="text-muted small mb-0">
            Define standard room classes, base prices, capacity ceilings, and marketing descriptions.
          </p>
        </div>
        <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={handleOpenCreate}>
          Add Room Category
        </Button>
      </div>

      <div className="row g-4">
        {types.map((rt) => (
          <div key={rt.id} className="col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
              <div style={{ height: '180px' }}>
                <img
                  src={rt.images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                  alt={rt.name}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary">{rt.name}</span>
                    <span className="badge bg-success-subtle text-success">{rt.status}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{rt.name}</h5>
                  <p className="text-muted small mb-3">{rt.description}</p>
                  <div className="d-flex justify-content-between text-secondary small mb-3">
                    <span><i className="bi bi-people me-1" /> Max: {rt.maxGuests} Guests</span>
                    <span className="fw-bold text-primary font-monospace">From {formatCurrency(rt.basePrice)}/night</span>
                  </div>
                </div>

                <div className="pt-3 border-top d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" size="sm" icon="bi-pencil" onClick={() => handleOpenEdit(rt)}>
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" icon="bi-trash" onClick={() => handleDelete(rt.id, rt.name)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingType ? `Edit Category: ${editingType.name}` : 'New Room Category'}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Presidential Penthouse"
            required
          />

          <div className="row g-2">
            <div className="col-6">
              <Input
                label="Base Price ($)"
                type="number"
                min={10}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                required
              />
            </div>
            <div className="col-6">
              <Input
                label="Max Guests"
                type="number"
                min={1}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <Input
            label="Display Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            required
          />

          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary mb-1">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light border" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
