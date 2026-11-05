import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export interface GuestInfoValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnicPassport: string;
  address: string;
  city: string;
  country: string;
  specialRequests?: string;
}

interface StepGuestInfoProps {
  initialValues: GuestInfoValues;
  onSubmit: (values: GuestInfoValues) => void;
}

const guestValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(2, 'Too short'),
  lastName: Yup.string().required('Last name is required').min(2, 'Too short'),
  email: Yup.string().email('Invalid email format').required('Email address is required'),
  phone: Yup.string().required('Contact phone number is required'),
  cnicPassport: Yup.string().required('CNIC or Passport number is required'),
  address: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required'),
  specialRequests: Yup.string().max(300, 'Maximum 300 characters')
});

export const StepGuestInfo: React.FC<StepGuestInfoProps> = ({ initialValues, onSubmit }) => {
  const { user } = useAuth();

  // If user is logged in, autofill details if empty
  const defaultVals: GuestInfoValues = {
    firstName: initialValues.firstName || (user ? user.name.split(' ')[0] : ''),
    lastName: initialValues.lastName || (user ? user.name.split(' ').slice(1).join(' ') : ''),
    email: initialValues.email || user?.email || '',
    phone: initialValues.phone || user?.phone || '',
    cnicPassport: initialValues.cnicPassport || user?.cnic || '',
    address: initialValues.address || user?.address || '',
    city: initialValues.city || user?.city || '',
    country: initialValues.country || user?.country || 'Pakistan',
    specialRequests: initialValues.specialRequests || ''
  };

  const formik = useFormik<GuestInfoValues>({
    initialValues: defaultVals,
    validationSchema: guestValidationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
        <h5 className="fw-bold text-dark mb-1">
          <i className="bi bi-person-vcard text-primary me-2" />
          Step 1: Primary Guest Information
        </h5>
        <p className="text-muted small mb-4">
          Please provide accurate personal details as required by government hotel verification policies.
        </p>

        <div className="row g-3">
          <div className="col-md-6">
            <Input
              label="First Name"
              name="firstName"
              placeholder="e.g. Zainab"
              icon="bi-person"
              required
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.firstName}
              touched={formik.touched.firstName}
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Last Name"
              name="lastName"
              placeholder="e.g. Ahmed"
              icon="bi-person"
              required
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.lastName}
              touched={formik.touched.lastName}
            />
          </div>

          <div className="col-md-6">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="zainab@example.com"
              icon="bi-envelope"
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
            />
          </div>

          <div className="col-md-6">
            <Input
              label="Mobile Phone"
              name="phone"
              placeholder="+92 300 1234567"
              icon="bi-telephone"
              required
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.phone}
              touched={formik.touched.phone}
            />
          </div>

          <div className="col-md-12">
            <Input
              label="CNIC / National ID / Passport Number"
              name="cnicPassport"
              placeholder="42101-1234567-1 or A98234102"
              icon="bi-card-heading"
              required
              value={formik.values.cnicPassport}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.cnicPassport}
              touched={formik.touched.cnicPassport}
              helpText="Will be verified against original document upon check-in"
            />
          </div>

          <div className="col-md-6">
            <Input
              label="Street Address"
              name="address"
              placeholder="House 45, Street 12, Sector F-8"
              icon="bi-geo-alt"
              required
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.address}
              touched={formik.touched.address}
            />
          </div>

          <div className="col-md-3">
            <Input
              label="City"
              name="city"
              placeholder="Islamabad"
              required
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.city}
              touched={formik.touched.city}
            />
          </div>

          <div className="col-md-3">
            <Input
              label="Country"
              name="country"
              placeholder="Pakistan"
              required
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.country}
              touched={formik.touched.country}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-medium small mb-1.5 text-secondary">
              Special Requests or Preferences (Optional)
            </label>
            <textarea
              name="specialRequests"
              rows={3}
              className="form-control"
              placeholder="e.g. Quiet room away from elevator, late check-in arrival around 9 PM..."
              value={formik.values.specialRequests}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" size="lg" icon="bi-arrow-right">
          Continue to Booking Review
        </Button>
      </div>
    </form>
  );
};
