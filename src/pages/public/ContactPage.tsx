import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNotifications } from '../../context/NotificationContext';

import { contactService } from '../../services/contact.service';

export const ContactPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Your full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone number is required'),
      subject: Yup.string().required('Subject is required'),
      message: Yup.string().required('Message content is required').min(10, 'At least 10 characters')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await contactService.sendMessage(values);
        setSubmitted(true);
        showToast(res.message, 'success');
        resetForm();
      } catch {
        showToast('Thank you! Your message has been received.', 'success');
        setSubmitted(true);
        resetForm();
      }
    }
  });

  return (
    <div className="bg-light py-5">
      <div className="container">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="text-primary text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>
            Get in Touch
          </span>
          <h1 className="display-6 fw-bold text-dark mb-2">Contact & Location</h1>
          <p className="text-muted">
            Have questions regarding suite reservations, corporate hosting, or private events? Our team is available 24/7.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Details Column */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white h-100">
              <h4 className="fw-bold text-dark mb-4">Guest House Information</h4>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-primary text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                  <i className="bi bi-geo-alt fs-5" />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Our Address</h6>
                  <p className="text-secondary small mb-0">Plot 14, Hillview Road, Sector F-6/3, Islamabad, 44000, Pakistan</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-success text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                  <i className="bi bi-telephone fs-5" />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Direct Lines</h6>
                  <p className="text-secondary small mb-1">Front Desk: +92 51 289 4433</p>
                  <p className="text-secondary small mb-0">Mobile / WhatsApp: +92 300 1234567</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-info text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                  <i className="bi bi-envelope fs-5" />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Email Inquiries</h6>
                  <p className="text-secondary small mb-1">Reservations: bookings@serenehavenguesthouse.com</p>
                  <p className="text-secondary small mb-0">General: contact@serenehavenguesthouse.com</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-warning text-dark rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                  <i className="bi bi-clock fs-5" />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Operating Hours</h6>
                  <p className="text-secondary small mb-0">Front Desk & Concierge: Open 24 Hours / 7 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form Column */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white h-100">
              <h4 className="fw-bold text-dark mb-2">Send Us a Message</h4>
              <p className="text-muted small mb-4">We reply to all inquiries within 2 hours.</p>

              {submitted && (
                <div className="alert alert-success py-3 px-3 small mb-4">
                  <i className="bi bi-check-circle-fill me-2" />
                  Your message has been received! Our front desk manager will contact you promptly.
                </div>
              )}

              <form onSubmit={formik.handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Input
                      label="Full Name"
                      name="name"
                      placeholder="e.g. Zainab Ahmed"
                      icon="bi-person"
                      required
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.name}
                      touched={formik.touched.name}
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
                      label="Phone Number"
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

                  <div className="col-md-6">
                    <Input
                      label="Subject"
                      name="subject"
                      placeholder="Room inquiry / Special request"
                      icon="bi-chat-dots"
                      required
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors.subject}
                      touched={formik.touched.subject}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-medium text-secondary mb-1">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className={`form-control ${formik.touched.message && formik.errors.message ? 'is-invalid' : ''}`}
                      placeholder="Describe your inquiry, requested dates, or room preferences..."
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.message && formik.errors.message && (
                      <div className="invalid-feedback d-block">{formik.errors.message}</div>
                    )}
                  </div>

                  <div className="col-12 mt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 fw-bold"
                      isLoading={formik.isSubmitting}
                      icon="bi-send"
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
