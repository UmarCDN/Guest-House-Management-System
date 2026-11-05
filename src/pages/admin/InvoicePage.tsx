import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types';
import { InvoiceReceipt } from '../../components/invoice/InvoiceReceipt';
import { Loader } from '../../components/common/Loader';

export const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      bookingService.getById(id).then((b) => {
        if (b) setBooking(b);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return <Loader message="Generating tax invoice..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Invoice Not Found</h4>
        <p className="text-muted">No booking record found for reference {id}.</p>
        <Link to="/admin/bookings" className="btn btn-primary">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 max-w-4xl mx-auto">
      <div className="mb-3 d-print-none">
        <Link to="/admin/bookings" className="btn btn-light border btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1" /> Back to Bookings
        </Link>
      </div>
      <InvoiceReceipt booking={booking} showActions={true} />
    </div>
  );
};
