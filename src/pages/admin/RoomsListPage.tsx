import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../../services/room.service';
import { Room } from '../../types';
import { formatCurrency, getRoomStatusVariant } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';

export const RoomsListPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomForView, setSelectedRoomForView] = useState<Room | null>(null);

  const fetchRooms = async () => {
    try {
      const list = await roomService.getAll();
      setRooms(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDeleteRoom = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete room "${name}"?`)) return;
    try {
      await roomService.delete(id);
      showToast(`Room "${name}" removed successfully`, 'success');
      await fetchRooms();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'danger');
    }
  };

  if (isLoading) {
    return <Loader message="Loading room inventory..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Room Inventory & Management</h2>
          <p className="text-muted small mb-0">
            Configure room inventory, pricing tiers, cleaning schedules, and maintenance statuses.
          </p>
        </div>
        <Link to="/admin/rooms/create" className="btn btn-primary rounded-pill px-3 shadow-sm d-inline-flex align-items-center gap-1.5">
          <i className="bi bi-plus-circle" /> Add New Room
        </Link>
      </div>

      {/* Rooms Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Room #</th>
                <th scope="col">Room Name</th>
                <th scope="col">Category</th>
                <th scope="col">Floor</th>
                <th scope="col">Capacity</th>
                <th scope="col">Base Rate / Night</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="ps-4">
                    <span className="fw-bold font-monospace text-primary fs-6">
                      {room.roomNumber}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="rounded-2 object-fit-cover"
                        style={{ width: '48px', height: '36px' }}
                      />
                      <div>
                        <span className="fw-bold text-dark small d-block">{room.name}</span>
                        <small className="text-muted">{room.bedType} • {room.roomSize} sq ft</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{room.type}</span>
                  </td>
                  <td>Floor {room.floor}</td>
                  <td>
                    <span className="small text-secondary">{room.maxAdults} Adults, {room.maxChildren} Children</span>
                  </td>
                  <td>
                    <span className="font-monospace fw-bold text-dark">{formatCurrency(room.pricePerNight)}</span>
                    {room.discount > 0 && (
                      <small className="badge bg-danger ms-1.5">{room.discount}% OFF</small>
                    )}
                  </td>
                  <td>
                    <Badge variant={getRoomStatusVariant(room.status) as any}>
                      {room.status}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-inline-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-light border rounded-circle"
                        style={{ width: '34px', height: '34px', padding: 0 }}
                        title="View Room Preview"
                        onClick={() => setSelectedRoomForView(room)}
                      >
                        <i className="bi bi-eye text-primary" />
                      </button>
                      <Link
                        to={`/admin/rooms/${room.id}/edit`}
                        className="btn btn-sm btn-light border rounded-circle"
                        style={{ width: '34px', height: '34px', padding: 0 }}
                        title="Edit Room"
                      >
                        <i className="bi bi-pencil text-secondary" />
                      </Link>
                      <button
                        className="btn btn-sm btn-light border text-danger rounded-circle"
                        style={{ width: '34px', height: '34px', padding: 0 }}
                        title="Delete Room"
                        onClick={() => handleDeleteRoom(room.id, room.name)}
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

      {/* Room Details Preview Modal */}
      <Modal
        isOpen={!!selectedRoomForView}
        onClose={() => setSelectedRoomForView(null)}
        title={selectedRoomForView ? `Room ${selectedRoomForView.roomNumber}: ${selectedRoomForView.name}` : ''}
        size="lg"
      >
        {selectedRoomForView && (
          <div>
            <div className="rounded-3 overflow-hidden mb-3" style={{ maxHeight: '300px' }}>
              <img
                src={selectedRoomForView.images[0]}
                alt={selectedRoomForView.name}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <div className="row g-3 mb-3 small">
              <div className="col-4"><strong>Type:</strong> {selectedRoomForView.type}</div>
              <div className="col-4"><strong>Floor:</strong> Floor {selectedRoomForView.floor}</div>
              <div className="col-4"><strong>Size:</strong> {selectedRoomForView.roomSize} sq ft</div>
              <div className="col-4"><strong>Price:</strong> {formatCurrency(selectedRoomForView.pricePerNight)}</div>
              <div className="col-4"><strong>Bed:</strong> {selectedRoomForView.bedType}</div>
              <div className="col-4"><strong>Status:</strong> {selectedRoomForView.status}</div>
            </div>
            <p className="text-secondary small mb-3">{selectedRoomForView.description}</p>
            <h6 className="fw-bold small mb-2">Amenities:</h6>
            <div className="d-flex flex-wrap gap-1.5">
              {selectedRoomForView.amenities.map((a, i) => (
                <span key={i} className="badge bg-light text-dark border">{a}</span>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
