import { Review } from '../types';

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    guestName: 'David Miller',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    review: 'Exceptional hospitality! The Executive Deluxe room was spotless, the bed was supremely comfortable, and the high-speed internet made remote work effortless.',
    roomId: 'room-102',
    roomName: 'Executive Deluxe Room',
    date: '2026-09-06',
    status: 'Approved'
  },
  {
    id: 'rev-2',
    guestName: 'Zainab Ahmed',
    guestAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    review: 'The Presidential Royal Suite was beyond our expectations. The terrace view at sunrise and the espresso lounge were pure bliss. Will definitely return with family!',
    roomId: 'room-101',
    roomName: 'Presidential Royal Suite',
    date: '2026-09-02',
    status: 'Approved'
  },
  {
    id: 'rev-3',
    guestName: 'Marcus Vance',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    review: 'Great location and friendly staff. Breakfast spread was fresh and plentiful. The room was well soundproofed from street noise.',
    roomId: 'room-202',
    roomName: 'Classic Single Studio',
    date: '2026-08-30',
    status: 'Approved'
  },
  {
    id: 'rev-4',
    guestName: 'Fatima Noor',
    guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    review: 'The garden atmosphere is so peaceful. Kids loved the green spaces and the housekeeping team was courteous and attentive.',
    roomId: 'room-103',
    roomName: 'Garden Cottage Suite',
    date: '2026-08-25',
    status: 'Approved'
  },
  {
    id: 'rev-5',
    guestName: 'Hamza Khan',
    rating: 4,
    review: 'Very good stay overall. Check-in was smooth, parking was secure. Minor delay in room service coffee but rectified politely.',
    roomId: 'room-103',
    roomName: 'Garden Cottage Suite',
    date: '2026-09-05',
    status: 'Pending'
  },
  {
    id: 'rev-6',
    guestName: 'Anonymous Traveler',
    rating: 2,
    review: 'Wi-Fi briefly dropped around 11 PM during my zoom call.',
    roomId: 'room-201',
    roomName: 'Superior Double Haven',
    date: '2026-09-04',
    status: 'Rejected'
  }
];
