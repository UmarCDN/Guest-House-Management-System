import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const registerValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(2, 'At least 2 characters'),
  lastName: Yup.string().required('Last name is required').min(2, 'At least 2 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Mobile phone number is required'),
  password: Yup.string().required('Password is required').min(6, 'Must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password
        });
        showToast('Account registered successfully! Welcome to Serene Haven.', 'success');
        navigate('/customer/dashboard');
      } catch (err: any) {
        setServerError(err.message || 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
                  <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-building fs-5" />
                  </div>
                  <span className="fw-bold fs-4 text-dark">Serene Haven</span>
                </Link>
                <h4 className="fw-bold text-dark mb-1">Create Guest Account</h4>
                <p className="text-muted small">Manage your stays, view receipts, and earn member discounts</p>
              </div>

              {serverError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill fs-6" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={formik.handleSubmit}>
                <div className="row g-2">
                  <div className="col-sm-6">
                    <Input
                      label="First Name"
                      name="firstName"
                      placeholder="e.g. Sara"
                      icon="bi-person"
                      required
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.firstName}
                      touched={formik.touched.firstName}
                    />
                  </div>
                  <div className="col-sm-6">
                    <Input
                      label="Last Name"
                      name="lastName"
                      placeholder="e.g. Ali"
                      icon="bi-person"
                      required
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.lastName}
                      touched={formik.touched.lastName}
                    />
                  </div>
                </div>

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="sara@example.com"
                  icon="bi-envelope"
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.email}
                  touched={formik.touched.email}
                />

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

                <div className="row g-2">
                  <div className="col-sm-6">
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      icon="bi-lock"
                      required
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.password}
                      touched={formik.touched.password}
                    />
                  </div>
                  <div className="col-sm-6">
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      icon="bi-lock-fill"
                      required
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.confirmPassword}
                      touched={formik.touched.confirmPassword}
                    />
                  </div>
                </div>

                <div className="form-check small mb-4">
                  <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                  <label className="form-check-label text-secondary" htmlFor="agreeTerms">
                    I agree to the Serene Haven Terms of Service and Privacy Policy.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 py-2.5 mb-3 fw-bold"
                  isLoading={formik.isSubmitting}
                  icon="bi-person-plus"
                >
                  Register Account
                </Button>

                <div className="text-center small text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-bold text-decoration-none">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
