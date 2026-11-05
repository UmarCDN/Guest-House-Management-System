import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import './assets/styles/main.css';

// Import Bootstrap bundle JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export const App: React.FC = () => {
  useEffect(() => {
    // Ensure document title
    document.title = 'Serene Haven | Boutique Guest House & Online Booking';
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
