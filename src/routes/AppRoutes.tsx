import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';

// Route Guards
import { ProtectedRoute, AdminRoute, CustomerRoute } from './RouteGuards';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { RoomSearchPage } from '../pages/public/RoomSearchPage';
import { RoomDetailsPage } from '../pages/public/RoomDetailsPage';
import { BookingWizardPage } from '../pages/public/BookingWizardPage';
import { BookingConfirmationPage } from '../pages/public/BookingConfirmationPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { GalleryPage } from '../pages/public/GalleryPage';

// Customer Pages
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';
import { CustomerBookingsPage } from '../pages/customer/CustomerBookingsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ReceptionistBookingPage } from '../pages/admin/ReceptionistBookingPage';
import { BookingsListPage } from '../pages/admin/BookingsListPage';
import { BookingDetailPage } from '../pages/admin/BookingDetailPage';
import { RoomsListPage } from '../pages/admin/RoomsListPage';
import { RoomFormPage } from '../pages/admin/RoomFormPage';
import { RoomTypesPage } from '../pages/admin/RoomTypesPage';
import { GuestsListPage } from '../pages/admin/GuestsListPage';
import { PaymentsListPage } from '../pages/admin/PaymentsListPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { StaffListPage } from '../pages/admin/StaffListPage';
import { GalleryAdminPage } from '../pages/admin/GalleryAdminPage';
import { FacilitiesPage } from '../pages/admin/FacilitiesPage';
import { ReviewsAdminPage } from '../pages/admin/ReviewsAdminPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { InvoicePage } from '../pages/admin/InvoicePage';

// Fallback Pages
import { NotFoundPage } from '../pages/NotFoundPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Portal Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomSearchPage />} />
        <Route path="/rooms/:id" element={<RoomDetailsPage />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingWizardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirmation"
          element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* 2. Customer Member Portal Routes (Protected) */}
      <Route
        path="/customer"
        element={
          <CustomerRoute>
            <CustomerLayout />
          </CustomerRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="bookings" element={<CustomerBookingsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* 3. Admin / Staff Management Portal Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="front-desk" element={<ReceptionistBookingPage />} />
        <Route path="bookings" element={<BookingsListPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="rooms" element={<RoomsListPage />} />
        <Route path="rooms/create" element={<RoomFormPage />} />
        <Route path="rooms/:id/edit" element={<RoomFormPage />} />
        <Route path="room-types" element={<RoomTypesPage />} />
        <Route path="guests" element={<GuestsListPage />} />
        <Route path="payments" element={<PaymentsListPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="staff" element={<StaffListPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="reviews" element={<ReviewsAdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="invoice/:id" element={<InvoicePage />} />
      </Route>

      {/* System Error & Fallback Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
