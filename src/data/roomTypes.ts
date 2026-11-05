import { RoomType } from '../types';

export const initialRoomTypes: RoomType[] = [
  {
    id: 'rt-single',
    name: 'Single Room',
    description: 'Cozy and well-equipped rooms ideal for individual travelers and business professionals.',
    basePrice: 65,
    maxGuests: 1,
    amenities: ['Free WiFi', 'Air Conditioning', 'Work Desk', 'En-suite Shower', 'Daily Breakfast'],
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  },
  {
    id: 'rt-double',
    name: 'Double Room',
    description: 'Comfortable rooms designed for couples with a premium queen or double bed.',
    basePrice: 95,
    maxGuests: 2,
    amenities: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Fridge', 'Workstation'],
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  },
  {
    id: 'rt-deluxe',
    name: 'Deluxe Room',
    description: 'Spacious high-end rooms with king beds, city/garden views, and premium amenities.',
    basePrice: 125,
    maxGuests: 3,
    amenities: ['Free WiFi', 'Air Conditioning', 'King Bed', 'Rain Shower', 'Smart TV', 'Nespresso'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  },
  {
    id: 'rt-family',
    name: 'Family Room',
    description: 'Large suite style accommodations accommodating up to 4 to 6 guests comfortably.',
    basePrice: 185,
    maxGuests: 6,
    amenities: ['Free WiFi', 'Air Conditioning', 'Multiple Beds', 'Living Space', 'Kitchenette', 'Bathtub'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  },
  {
    id: 'rt-suite',
    name: 'Suite',
    description: 'Ultra-luxurious multi-room suites with private balconies, jacuzzi, and butler service.',
    basePrice: 220,
    maxGuests: 4,
    amenities: ['Free WiFi', 'Air Conditioning', 'Private Terrace', 'Jacuzzi', 'Espresso Lounge', 'Butler Service'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  }
];
