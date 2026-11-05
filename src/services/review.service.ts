import api, { simulateDelay } from './api';
import { Review } from '../types';
import { initialReviews } from '../data/reviews';

const REVIEWS_KEY = 'guesthouse_reviews_data';

const mapBackendReview = (r: any): Review => ({
  id: String(r.id),
  roomId: String(r.roomId || r.room_id || '1'),
  roomName: r.roomName || (r.room_number ? `Room ${r.room_number}` : 'Deluxe Suite'),
  guestName: r.guestName || r.guest_name,
  guestAvatar: r.guestAvatar,
  rating: Number(r.rating || 5),
  review: r.review || r.comment || '',
  date: r.date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
  status: r.status || 'Approved'
});

const getStoredReviews = (): Review[] => {
  const data = localStorage.getItem(REVIEWS_KEY);
  if (!data) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialReviews));
    return initialReviews;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialReviews;
  }
};

export const reviewService = {
  getAll: async (): Promise<Review[]> => {
    try {
      const res = await api.get('/reviews');
      if (res.data?.reviews && Array.isArray(res.data.reviews) && res.data.reviews.length > 0) {
        const mapped = res.data.reviews.map(mapBackendReview);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Backend API /reviews unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredReviews());
  },

  getApproved: async (): Promise<Review[]> => {
    try {
      const res = await api.get('/reviews/approved');
      if (res.data?.reviews && Array.isArray(res.data.reviews) && res.data.reviews.length > 0) {
        return res.data.reviews.map(mapBackendReview);
      }
    } catch (err) {
      console.warn('Backend API /reviews/approved unreachable, using local fallback.', err);
    }
    const list = getStoredReviews();
    return simulateDelay(list.filter(r => r.status === 'Approved'));
  },

  updateStatus: async (id: string, status: 'Approved' | 'Pending' | 'Rejected'): Promise<Review> => {
    try {
      await api.patch(`/reviews/${id}/status`, { status });
    } catch (err) {
      console.warn('Backend API update review status failed, using local fallback.', err);
    }
    const list = getStoredReviews();
    const index = list.findIndex(r => String(r.id) === String(id));
    if (index === -1) throw new Error('Review not found');
    list[index].status = status;
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/reviews/${id}`);
    } catch (err) {
      console.warn('Backend API delete review failed, using local fallback.', err);
    }
    const list = getStoredReviews();
    const filtered = list.filter(r => String(r.id) !== String(id));
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  },

  create: async (data: Omit<Review, 'id' | 'date' | 'status'>): Promise<Review> => {
    try {
      const res = await api.post('/reviews', {
        roomId: parseInt(data.roomId, 10) || 1,
        guestName: data.guestName,
        rating: data.rating,
        comment: data.review
      });
      if (res.data?.reviewId) {
        const newRev: Review = {
          ...data,
          id: String(res.data.reviewId),
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        };
        const list = getStoredReviews();
        list.unshift(newRev);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
        return newRev;
      }
    } catch (err) {
      console.warn('Backend API create review failed, using local fallback.', err);
    }
    const list = getStoredReviews();
    const newRev: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    list.unshift(newRev);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
    return simulateDelay(newRev);
  }
};
