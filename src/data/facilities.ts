import { Facility } from '../types';

export const initialFacilities: Facility[] = [
  {
    id: 'fac-1',
    name: 'Free High-Speed WiFi',
    description: 'Complimentary fiber optic wireless connection accessible throughout all rooms and public lounges.',
    icon: 'bi-wifi',
    status: 'Enabled',
    category: 'Connectivity'
  },
  {
    id: 'fac-2',
    name: 'Secure Valet Parking',
    description: 'Guarded 24/7 on-premise parking facility with CCTV surveillance and EV charging ports.',
    icon: 'bi-p-circle-fill',
    status: 'Enabled',
    category: 'Transportation'
  },
  {
    id: 'fac-3',
    name: 'Climate Control AC & Heating',
    description: 'Individual digital thermostat controls in all guest suites for bespoke ambient comfort.',
    icon: 'bi-snow',
    status: 'Enabled',
    category: 'Comfort'
  },
  {
    id: 'fac-4',
    name: '24/7 Room Service & Dining',
    description: 'Extensive multi-cuisine dining menu delivered fresh to your suite at any hour.',
    icon: 'bi-cup-hot-fill',
    status: 'Enabled',
    category: 'Dining'
  },
  {
    id: 'fac-5',
    name: 'Complimentary Continental Breakfast',
    description: 'Daily buffet featuring artisan breads, tropical fruits, freshly brewed espresso, and hot dishes.',
    icon: 'bi-egg-fried',
    status: 'Enabled',
    category: 'Dining'
  },
  {
    id: 'fac-6',
    name: 'Express Laundry & Dry Cleaning',
    description: 'Same-day laundry and professional garment pressing services available on request.',
    icon: 'bi-basket3-fill',
    status: 'Enabled',
    category: 'Services'
  },
  {
    id: 'fac-7',
    name: '24/7 Concierge & Reception',
    description: 'Attentive multilingual staff on hand for luggage handling, local excursions, and reservations.',
    icon: 'bi-clock-history',
    status: 'Enabled',
    category: 'Services'
  },
  {
    id: 'fac-8',
    name: 'CCTV Security & Smart Locks',
    description: 'Advanced biometric building access, continuous surveillance, and secure electronic room keycards.',
    icon: 'bi-shield-check',
    status: 'Enabled',
    category: 'Safety'
  }
];
