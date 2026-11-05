import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useNotifications } from '../../context/NotificationContext';
import { bookingService } from '../../services/booking.service';
import { paymentService } from '../../services/payment.service';
import { PaymentMethod } from '../../types';
import { StepGuestInfo, GuestInfoValues } from '../../components/booking/StepGuestInfo';
import { StepBookingReview } from '../../components/booking/StepBookingReview';
import { StepPaymentMethod } from '../../components/booking/StepPaymentMethod';

export const BookingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, clearDraft } = useBooking();
  const { addNotification, showToast } = useNotifications();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states across wizard steps
  const [guestInfo, setGuestInfo] = useState<GuestInfoValues>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnicPassport: '',
    address: '',
    city: 'Islamabad',
    country: 'Pakistan',
    specialRequests: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit/Debit Card');

  if (!draft.room) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-lg mx-auto">
          <div className="display-4 text-warning mb-3">
            <i className="bi bi-calendar-x" />
          </div>
          <h4 className="fw-bold text-dark mb-2">No Room Selected</h4>
          <p className="text-muted mb-4">
            You have not selected any room for reservation yet. Please explore our luxury accommodations first.
          </p>
          <Link to="/rooms" className="btn btn-primary rounded-pill px-4">
            Browse Rooms & Suites
          </Link>
        </div>
      </div>
    );
  }

  // Handle Step 1 completion
  const handleGuestInfoSubmit = (values: GuestInfoValues) => {
    setGuestInfo(values);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Step 3 (Payment completion & record creation)
  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    try {
      const room = draft.room!;
      const isPaid = paymentMethod === 'Credit/Debit Card' || paymentMethod === 'Easypaisa' || paymentMethod === 'JazzCash';
      const paidAmount = isPaid ? draft.totalAmount : 0;
      const remainingAmount = isPaid ? 0 : draft.totalAmount;

      const createdBooking = await bookingService.create({
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        guestCnic: guestInfo.cnicPassport,
        guestAddress: guestInfo.address,
        guestCity: guestInfo.city,
        guestCountry: guestInfo.country,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomName: room.name,
        roomType: room.type,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        adults: draft.adults,
        children: draft.children,
        numberOfRooms: draft.numberOfRooms,
        nights: draft.nights,
        roomPrice: draft.roomPrice,
        taxes: draft.taxes,
        discount: draft.discount,
        totalAmount: draft.totalAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        paymentMethod: paymentMethod,
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        bookingStatus: 'Confirmed',
        bookingSource: 'Website',
        specialRequests: guestInfo.specialRequests
      });

      // Also record payment transaction if paid
      if (isPaid) {
        await paymentService.create({
          bookingId: createdBooking.id,
          guestName: createdBooking.guestName,
          amount: createdBooking.totalAmount,
          paymentMethod: paymentMethod,
          transactionRef: `TXN-${paymentMethod.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'Paid',
          date: new Date().toISOString(),
          notes: 'Customer online booking payment'
        });
      }

      // Add system notification for admin dashboard
      await addNotification({
        type: 'booking_new',
        title: 'New Online Reservation',
        message: `${createdBooking.guestName} booked ${createdBooking.roomName} (${createdBooking.id}).`,
        link: `/admin/bookings`
      });

      showToast(`Reservation ${createdBooking.id} created successfully!`, 'success');
      clearDraft();

      // Navigate to confirmation page with booking state
      navigate('/booking/confirmation', {
        state: { booking: createdBooking }
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize booking', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light py-4 py-md-5 min-vh-100">
      <div className="container">
        {/* Progress Stepper Bar */}
        <div className="mb-5 max-w-2xl mx-auto">
          <div className="d-flex align-items-center justify-content-between position-relative">
            {/* Step 1 */}
            <div className="d-flex flex-column align-items-center text-center position-relative" style={{ zIndex: 2 }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                  currentStep >= 1 ? 'bg-primary text-white shadow' : 'bg-white text-muted border'
                }`}
                style={{ width: '44px', height: '44px' }}
              >
                1
              </div>
              <small className="fw-semibold text-dark mt-2">Guest Info</small>
            </div>

            <div className="flex-grow-1 mx-2" style={{ height: '3px', backgroundColor: currentStep >= 2 ? '#0d6efd' : '#cbd5e1' }} />

            {/* Step 2 */}
            <div className="d-flex flex-column align-items-center text-center position-relative" style={{ zIndex: 2 }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                  currentStep >= 2 ? 'bg-primary text-white shadow' : 'bg-white text-muted border'
                }`}
                style={{ width: '44px', height: '44px' }}
              >
                2
              </div>
              <small className={`fw-semibold mt-2 ${currentStep >= 2 ? 'text-dark' : 'text-muted'}`}>Review Stay</small>
            </div>

            <div className="flex-grow-1 mx-2" style={{ height: '3px', backgroundColor: currentStep >= 3 ? '#0d6efd' : '#cbd5e1' }} />

            {/* Step 3 */}
            <div className="d-flex flex-column align-items-center text-center position-relative" style={{ zIndex: 2 }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                  currentStep >= 3 ? 'bg-primary text-white shadow' : 'bg-white text-muted border'
                }`}
                style={{ width: '44px', height: '44px' }}
              >
                3
              </div>
              <small className={`fw-semibold mt-2 ${currentStep >= 3 ? 'text-dark' : 'text-muted'}`}>Payment</small>
            </div>
          </div>
        </div>

        {/* Dynamic Step View */}
        <div className="max-w-3xl mx-auto">
          {currentStep === 1 && (
            <StepGuestInfo
              initialValues={guestInfo}
              onSubmit={handleGuestInfoSubmit}
            />
          )}

          {currentStep === 2 && (
            <StepBookingReview
              draft={draft}
              guestInfo={guestInfo}
              onBack={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onContinue={() => {
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentStep === 3 && (
            <StepPaymentMethod
              totalAmount={draft.totalAmount}
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              onBack={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCompleteBooking={handleCompleteBooking}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};
