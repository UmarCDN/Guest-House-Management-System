export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  cnic?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning';

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: string;
  floor: number;
  roomSize: number; // in sq ft
  bedType: string;
  maxAdults: number;
  maxChildren: number;
  pricePerNight: number;
  discount: number; // in percentage or fixed
  description: string;
  amenities: string[];
  images: string[];
  status: RoomStatus;
  isFeatured?: boolean;
  isReserved?: boolean;
  activeBooking?: {
    guestName?: string;
    checkIn?: string;
    checkOut?: string;
    bookingReference?: string;
    status?: string;
  };
  rating: number;
  reviewCount: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'No Show';

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Partial';

export type PaymentMethod = 'Credit/Debit Card' | 'Bank Transfer' | 'Cash on Arrival' | 'Easypaisa' | 'JazzCash';

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCnic: string;
  guestAddress: string;
  guestCity: string;
  guestCountry: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  numberOfRooms: number;
  nights: number;
  roomPrice: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  bookingSource: 'Website' | 'Walk-in' | 'OTA' | 'Phone';
  specialRequests?: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnicPassport: string;
  address: string;
  city: string;
  country: string;
  totalBookings: number;
  totalSpend: number;
  lastVisit: string;
  status: 'Active' | 'VIP' | 'Blacklisted';
}

export interface Payment {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  status: PaymentStatus;
  date: string;
  notes?: string;
}

export type StaffRole = 'Admin' | 'Manager' | 'Receptionist' | 'Housekeeping';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'Active' | 'Inactive';
  shift: 'Morning' | 'Evening' | 'Night';
  joinedDate: string;
}

export interface Review {
  id: string;
  guestName: string;
  guestAvatar?: string;
  rating: number;
  review: string;
  roomId: string;
  roomName: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  icon: string; // Bootstrap icon class e.g. "bi-wifi"
  status: 'Enabled' | 'Disabled';
  category: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'Rooms' | 'Exterior' | 'Interior' | 'Restaurant' | 'Facilities';
  isFeatured?: boolean;
  uploadedAt: string;
}

export type NotificationType = 
  | 'booking_new' 
  | 'booking_cancelled' 
  | 'payment_received' 
  | 'checkin_reminder' 
  | 'checkout_reminder' 
  | 'review_new';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface GeneralSettings {
  guestHouseName: string;
  logo: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description: string;
}

export interface BookingSettings {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  taxRatePercent: number;
  bookingRules: string[];
}

export interface PaymentSettings {
  cashEnabled: boolean;
  bankTransferEnabled: boolean;
  bankDetails: string;
  cardEnabled: boolean;
  cardProvider: string;
  easypaisaEnabled: boolean;
  easypaisaNumber: string;
  jazzcashEnabled: boolean;
  jazzcashNumber: string;
}

export interface SystemSettings {
  general: GeneralSettings;
  booking: BookingSettings;
  payment: PaymentSettings;
}
