import { Notification } from '../types';

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'booking_new',
    title: 'New Online Booking',
    message: 'Booking GH-2026-8806 placed by Bilal Farooq for Penthouse Panorama Suite.',
    timestamp: '10 minutes ago',
    read: false,
    link: '/admin/bookings'
  },
  {
    id: 'notif-2',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Easypaisa transaction of $99.27 verified for Booking GH-2026-8804.',
    timestamp: '45 minutes ago',
    read: false,
    link: '/admin/payments'
  },
  {
    id: 'notif-3',
    type: 'checkin_reminder',
    title: 'Check-in Scheduled Today',
    message: 'David Miller scheduled to check into Executive Deluxe Room (102).',
    timestamp: '2 hours ago',
    read: true,
    link: '/admin/bookings'
  },
  {
    id: 'notif-4',
    type: 'review_new',
    title: 'New Guest Review',
    message: 'David Miller submitted a 5-star rating for Executive Deluxe Room.',
    timestamp: '5 hours ago',
    read: true,
    link: '/admin/reviews'
  },
  {
    id: 'notif-5',
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: 'Booking GH-2026-8808 cancelled by Ayesha Siddiqui. Refund issued.',
    timestamp: '1 day ago',
    read: true,
    link: '/admin/bookings'
  }
];
