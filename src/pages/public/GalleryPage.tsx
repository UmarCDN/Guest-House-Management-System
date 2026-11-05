import React, { useState, useEffect } from 'react';
import { galleryService } from '../../services/gallery.service';
import { GalleryItem } from '../../types';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Rooms', 'Exterior', 'Interior', 'Restaurant', 'Facilities'];

  useEffect(() => {
    galleryService.getAll().then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  return (
    <div className="bg-light py-5">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
            Visual Showcase
          </span>
          <h1 className="display-6 fw-bold text-dark mb-2">Photo Gallery</h1>
          <p className="text-muted">
            Take a visual tour through our boutique suites, landscaped gardens, dining bistro, and executive lounges.
          </p>

          {/* Category Filter Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-medium ${
                  activeCategory === cat ? 'btn-primary shadow-sm' : 'btn-white bg-white text-secondary border'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Loader message="Loading photo gallery..." />
        ) : (
          <div className="row g-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative cursor-pointer transition-all hover-shadow-lg"
                  style={{ cursor: 'pointer', height: '260px' }}
                  onClick={() => setPreviewItem(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 p-3 text-white"
                    style={{ background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.85))' }}
                  >
                    <span className="badge bg-primary bg-opacity-75 rounded-pill px-2.5 py-1 mb-1 small">
                      {item.category}
                    </span>
                    <h6 className="fw-bold mb-0 text-white text-truncate">{item.title}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem?.title || 'Image Preview'}
          size="lg"
        >
          {previewItem && (
            <div>
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="w-100 rounded-3 object-fit-cover"
                style={{ maxHeight: '70vh' }}
              />
              <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
                <span>Category: <strong>{previewItem.category}</strong></span>
                <span>Uploaded: {previewItem.uploadedAt}</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
