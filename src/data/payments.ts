import { Payment } from '../types';

export const initialPayments: Payment[] = [
  {
    id: 'PAY-9001',
    bookingId: 'GH-2026-8801',
    guestName: 'Zainab Ahmed',
    amount: 673.2,
    paymentMethod: 'Credit/Debit Card',
    transactionRef: 'TXN-CC-9821344',
    status: 'Paid',
    date: '2026-09-01T14:25:00Z',
    notes: 'Online Stripe gateway transaction'
  },
  {
    id: 'PAY-9002',
    bookingId: 'GH-2026-8802',
    guestName: 'David Miller',
    amount: 475.2,
    paymentMethod: 'Credit/Debit Card',
    transactionRef: 'TXN-CC-1192837',
    status: 'Paid',
    date: '2026-09-02T10:18:00Z',
    notes: 'Visa authorized & captured'
  },
  {
    id: 'PAY-9003',
    bookingId: 'GH-2026-8803',
    guestName: 'Hamza Khan',
    amount: 200.0,
    paymentMethod: 'Bank Transfer',
    transactionRef: 'HBL-FT-4499120',
    status: 'Partial',
    date: '2026-09-05T17:00:00Z',
    notes: 'Deposit received. Remaining 493 to be collected at check-in'
  },
  {
    id: 'PAY-9004',
    bookingId: 'GH-2026-8804',
    guestName: 'Sara Ali',
    amount: 99.27,
    paymentMethod: 'Easypaisa',
    transactionRef: 'EP-90238129',
    status: 'Paid',
    date: '2026-09-06T11:05:00Z',
    notes: 'Mobile wallet verification verified'
  },
  {
    id: 'PAY-9005',
    bookingId: 'GH-2026-8805',
    guestName: 'Marcus Vance',
    amount: 214.5,
    paymentMethod: 'Credit/Debit Card',
    transactionRef: 'TXN-MC-3382910',
    status: 'Paid',
    date: '2026-08-28T09:35:00Z',
    notes: 'Mastercard International'
  },
  {
    id: 'PAY-9006',
    bookingId: 'GH-2026-8806',
    guestName: 'Bilal Farooq',
    amount: 844.8,
    paymentMethod: 'Cash on Arrival',
    transactionRef: 'COA-PENDING-8806',
    status: 'Pending',
    date: '2026-09-07T18:10:00Z',
    notes: 'Due on arrival Sept 18'
  },
  {
    id: 'PAY-9007',
    bookingId: 'GH-2026-8807',
    guestName: 'Fatima Noor',
    amount: 504.9,
    paymentMethod: 'JazzCash',
    transactionRef: 'JC-89123891',
    status: 'Paid',
    date: '2026-08-15T12:05:00Z',
    notes: 'JazzCash agent portal confirmed'
  },
  {
    id: 'PAY-9008',
    bookingId: 'GH-2026-8808',
    guestName: 'Ayesha Siddiqui',
    amount: 297.0,
    paymentMethod: 'Credit/Debit Card',
    transactionRef: 'REF-TXN-7738291',
    status: 'Refunded',
    date: '2026-09-01T09:00:00Z',
    notes: 'Refunded upon booking cancellation policy'
  }
];
