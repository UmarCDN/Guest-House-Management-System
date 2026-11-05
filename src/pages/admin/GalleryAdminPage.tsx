import React, { useState, useEffect } from 'react';
import { galleryService } from '../../services/gallery.service';
import { GalleryItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const GalleryAdminPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Rooms' | 'Exterior' | 'Interior' | 'Restaurant' | 'Facilities'>('Rooms');
  const [imageUrl, setImageUrl] = useState('');

  const fetchGallery = async () => {
    try {
      const data = await galleryService.getAll();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await galleryService.create({
        title,
        category,
        imageUrl,
        isFeatured: false
      });
      showToast('New photo uploaded to gallery!', 'success');
      setTitle('');
      setImageUrl('');
      setModalOpen(false);
      await fetchGallery();
    } catch (err: any) {
      showToast('Upload failed', 'danger');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const updated = await galleryService.toggleFeatured(id);
      showToast(updated.isFeatured ? 'Set as featured hero photo' : 'Removed from featured', 'info');
      await fetchGallery();
    } catch {
      showToast('Toggle failed', 'danger');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete photo "${title}"?`)) return;
    try {
      await galleryService.delete(id);
      showToast('Photo removed', 'success');
      await fetchGallery();
    } catch {
      showToast('Delete failed', 'danger');
    }
  };

  const filteredItems = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);

  if (isLoading) {
    return <Loader message="Loading photo catalog..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gallery & Media Asset Management</h2>
          <p className="text-muted small mb-0">
            Organize guest house suites, exterior architecture, courtyard gardens, and dining photographs.
          </p>
        </div>
        <Button variant="primary" size="sm" icon="bi-cloud-arrow-up" onClick={() => setModalOpen(true)}>
          Upload New Image
        </Button>
      </div>

      {/* Category Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', 'Rooms', 'Exterior', 'Interior', 'Restaurant', 'Facilities'].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 fw-medium ${
              activeTab === cat ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
            }`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="row g-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="col-sm-6 col-lg-4 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
              <div className="position-relative" style={{ height: '200px' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-100 h-100 object-fit-cover"
                />
                <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-2 rounded-pill small">
                  {item.category}
                </span>
                {item.isFeatured && (
                  <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 rounded-pill small">
                    <i className="bi bi-star-fill me-1" /> Featured
                  </span>
                )}
              </div>

              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <h6 className="fw-bold text-dark small text-truncate mb-1">{item.title}</h6>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>Uploaded: {item.uploadedAt}</small>
                </div>

                <div className="pt-3 border-top mt-2 d-flex justify-content-between align-items-center">
                  <button
                    className={`btn btn-sm rounded-pill px-2.5 ${
                      item.isFeatured ? 'btn-warning text-dark' : 'btn-light border'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleToggleFeatured(item.id)}
                  >
                    <i className={`bi ${item.isFeatured ? 'bi-star-fill' : 'bi-star'} me-1`} />
                    {item.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    className="btn btn-sm btn-light text-danger border rounded-pill"
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete Image"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Image Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Image (Mock Asset Manager)"
      >
        <form onSubmit={handleUploadSubmit}>
          <Input
            label="Image Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Garden Pavilion Gazebo"
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'Rooms', label: 'Rooms' },
              { value: 'Exterior', label: 'Exterior' },
              { value: 'Interior', label: 'Interior' },
              { value: 'Restaurant', label: 'Restaurant' },
              { value: 'Facilities', label: 'Facilities' }
            ]}
          />

          <Input
            label="Direct Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            required
            helpText="Enter a web-accessible image URL"
          />

          {imageUrl && (
            <div className="rounded-3 overflow-hidden border mb-3" style={{ height: '160px' }}>
              <img src={imageUrl} alt="Preview" className="w-100 h-100 object-fit-cover" />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light border" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Add to Gallery
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
