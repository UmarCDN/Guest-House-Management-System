import { SystemSettings } from '../types';

export const initialSettings: SystemSettings = {
  general: {
    guestHouseName: 'Serene Haven Boutique Guest House',
    logo: 'Serene Haven',
    tagline: 'Comfortable Stay, Memorable Experience',
    email: 'contact@serenehavenguesthouse.com',
    phone: '+92 51 289 4433',
    address: 'Plot 14, Hillview Road, Sector F-6/3',
    city: 'Islamabad',
    country: 'Pakistan',
    description: 'Serene Haven offers refined boutique lodging surrounded by peaceful landscapes, providing luxury suites, warm personalized hospitality, and modern executive amenities.'
  },
  booking: {
    checkInTime: '14:00 (2:00 PM)',
    checkOutTime: '12:00 (12:00 PM)',
    cancellationPolicy: 'Free cancellation up to 48 hours before scheduled check-in. Cancellations made within 48 hours will incur a 1-night charge.',
    taxRatePercent: 10,
    bookingRules: [
      'Government-issued photo identification (CNIC/Passport) is strictly required at check-in.',
      'Primary guest must be at least 18 years of age.',
      'Smoking is strictly prohibited in all interior rooms and corridors. Designated outdoor zones available.',
      'Quiet hours are observed between 10:00 PM and 7:00 AM.',
      'Pets are allowed exclusively in Garden Cottage suites with prior approval.'
    ]
  },
  payment: {
    cashEnabled: true,
    bankTransferEnabled: true,
    bankDetails: 'Habib Bank Limited (HBL) | Account Title: Serene Haven Lodging Pvt Ltd | IBAN: PK36HABB0001234567890123',
    cardEnabled: true,
    cardProvider: 'Stripe & Visa / MasterCard Gateway',
    easypaisaEnabled: true,
    easypaisaNumber: '+92 300 1234567 (Title: Serene Haven)',
    jazzcashEnabled: true,
    jazzcashNumber: '+92 301 9876543 (Title: Serene Haven)'
  }
};
