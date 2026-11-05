import api, { simulateDelay } from './api';
import { GalleryItem } from '../types';
import { initialGallery } from '../data/gallery';

const GALLERY_KEY = 'guesthouse_gallery_data';

const getStoredGallery = (): GalleryItem[] => {
  const data = localStorage.getItem(GALLERY_KEY);
  if (!data) {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(initialGallery));
    return initialGallery;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialGallery;
  }
};

export const galleryService = {
  getAll: async (): Promise<GalleryItem[]> => {
    try {
      const res = await api.get('/gallery');
      if (res.data?.gallery && Array.isArray(res.data.gallery) && res.data.gallery.length > 0) {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(res.data.gallery));
        return res.data.gallery;
      }
    } catch (err) {
      console.warn('Backend API /gallery unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredGallery());
  },

  create: async (data: Omit<GalleryItem, 'id' | 'uploadedAt'>): Promise<GalleryItem> => {
    try {
      const res = await api.post('/gallery', data);
      if (res.data?.galleryItem) {
        const list = getStoredGallery();
        list.unshift(res.data.galleryItem);
        localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
        return res.data.galleryItem;
      }
    } catch (err) {
      console.warn('Backend API create gallery item failed, using local fallback.', err);
    }
    const list = getStoredGallery();
    const item: GalleryItem = {
      ...data,
      id: `gal-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(item);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
    return simulateDelay(item);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/gallery/${id}`);
    } catch (err) {
      console.warn('Backend API delete gallery item failed, using local fallback.', err);
    }
    const list = getStoredGallery();
    const filtered = list.filter(g => String(g.id) !== String(id));
    localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  },

  toggleFeatured: async (id: string): Promise<GalleryItem> => {
    try {
      const res = await api.patch(`/gallery/${id}/featured`);
      const list = getStoredGallery();
      const index = list.findIndex(g => String(g.id) === String(id));
      if (index !== -1 && res.data?.isFeatured !== undefined) {
        list[index].isFeatured = res.data.isFeatured;
        localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
        return list[index];
      }
    } catch (err) {
      console.warn('Backend API toggle featured gallery failed, using local fallback.', err);
    }
    const list = getStoredGallery();
    const index = list.findIndex(g => String(g.id) === String(id));
    if (index === -1) throw new Error('Gallery item not found');
    list[index].isFeatured = !list[index].isFeatured;
    localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  }
};
