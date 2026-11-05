import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/review.service';
import { Review } from '../../types';
import { StarRating } from '../../components/common/StarRating';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const ReviewsAdminPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAll();
      setReviews(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    try {
      await reviewService.updateStatus(id, status);
      showToast(`Review marked as ${status}`, 'success');
      await fetchReviews();
    } catch {
      showToast('Status update failed', 'danger');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this guest review?')) return;
    try {
      await reviewService.delete(id);
      showToast('Review deleted', 'success');
      await fetchReviews();
    } catch {
      showToast('Delete failed', 'danger');
    }
  };

  const filteredReviews = filter === 'All' ? reviews : reviews.filter(r => r.status === filter);

  if (isLoading) {
    return <Loader message="Loading guest testimonials..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Guest Reviews & Moderation</h2>
          <p className="text-muted small mb-0">
            Moderate guest ratings, approve genuine testimonials for the homepage, and audit feedback.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`btn btn-sm rounded-pill px-3 fw-medium ${
              filter === status ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
            }`}
            onClick={() => setFilter(status as any)}
          >
            {status} ({status === 'All' ? reviews.length : reviews.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary">
                <th scope="col" className="ps-4">Guest</th>
                <th scope="col">Rating</th>
                <th scope="col" style={{ width: '38%' }}>Review Content</th>
                <th scope="col">Room Stayed</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((rev) => (
                <tr key={rev.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small" style={{ width: '36px', height: '36px' }}>
                        {rev.guestName.charAt(0)}
                      </div>
                      <span className="fw-bold text-dark small">{rev.guestName}</span>
                    </div>
                  </td>
                  <td>
                    <StarRating rating={rev.rating} size="sm" showNumber />
                  </td>
                  <td>
                    <p className="text-dark small mb-0 fst-italic">"{rev.review}"</p>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{rev.roomName}</span>
                  </td>
                  <td>
                    <span className="small text-secondary">{rev.date}</span>
                  </td>
                  <td>
                    <Badge
                      variant={
                        rev.status === 'Approved' ? 'success' :
                        rev.status === 'Pending' ? 'warning' : 'danger'
                      }
                    >
                      {rev.status}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-inline-flex align-items-center gap-1">
                      {rev.status !== 'Approved' && (
                        <button
                          className="btn btn-sm btn-outline-success rounded-pill px-2"
                          title="Approve Review"
                          onClick={() => handleUpdateStatus(rev.id, 'Approved')}
                        >
                          <i className="bi bi-check-lg" />
                        </button>
                      )}
                      {rev.status !== 'Rejected' && (
                        <button
                          className="btn btn-sm btn-outline-warning rounded-pill px-2"
                          title="Reject Review"
                          onClick={() => handleUpdateStatus(rev.id, 'Rejected')}
                        >
                          <i className="bi bi-slash-circle" />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-light text-danger border rounded-pill px-2"
                        title="Delete Review"
                        onClick={() => handleDelete(rev.id)}
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
    </div>
  );
};
