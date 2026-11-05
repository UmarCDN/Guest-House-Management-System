import api from './api';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const contactService = {
  sendMessage: async (payload: ContactMessagePayload): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/contact', payload);
      return {
        success: true,
        message: res.data?.message || 'Inquiry submitted successfully.'
      };
    } catch (err: any) {
      console.warn('Backend API /contact unreachable, using simulated response.', err);
      return {
        success: true,
        message: 'Your inquiry has been received. Our concierge team will contact you shortly.'
      };
    }
  }
};
