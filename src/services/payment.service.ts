import api, { simulateDelay } from './api';
import { Payment } from '../types';
import { initialPayments } from '../data/payments';

const PAYMENTS_KEY = 'guesthouse_payments_data';

const getStoredPayments = (): Payment[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(initialPayments));
    return initialPayments;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialPayments;
  }
};

const mapBackendPayment = (p: any): Payment => ({
  id: String(p.id || p.payment_reference || `PAY-${Math.random()}`),
  bookingId: p.bookingId || p.booking_reference || 'Direct',
  guestName: p.guestName || p.guest_name || 'Valued Guest',
  amount: Number(p.amount || 0),
  paymentMethod: (p.paymentMethod || p.method || p.payment_method || 'Cash at Counter') as any,
  transactionRef: p.transactionRef || p.transaction_ref || p.payment_reference || String(p.id),
  status: p.status === 'paid' ? 'Paid' : p.status === 'pending' ? 'Pending' : (p.status || 'Paid'),
  date: p.date || (p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
  notes: p.notes || ''
});

export const paymentService = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const res = await api.get('/payments');
      if (res.data?.payments && Array.isArray(res.data.payments)) {
        const payments = res.data.payments.map(mapBackendPayment);
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
        return payments;
      }
    } catch (err) {
      console.warn('Backend API /payments unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredPayments());
  },

  create: async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      const res = await api.post('/payments', paymentData);
      if (res.data?.payment) {
        const list = getStoredPayments();
        list.unshift(res.data.payment);
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify(list));
        return res.data.payment;
      }
    } catch (err) {
      console.warn('Backend API create payment failed, using local fallback.', err);
    }
    const payments = getStoredPayments();
    const newPayment: Payment = {
      ...paymentData,
      id: `PAY-${Date.now().toString().slice(-4)}`
    };
    payments.unshift(newPayment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    return simulateDelay(newPayment);
  }
};
