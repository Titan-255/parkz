import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Driver Pages
import { DriverDashboard } from './features/driver/DriverDashboard';
import { ParkingSearchPage } from './features/driver/ParkingSearchPage';
import { ParkingDetailsPage } from './features/driver/ParkingDetailsPage';
import { BookingFlowPage } from './features/driver/BookingFlowPage';
import { BookingConfirmationPage } from './features/driver/BookingConfirmationPage';
import { MyBookingsPage } from './features/driver/MyBookingsPage';
import { DriverProfilePage } from './features/driver/DriverProfilePage';

// Owner Pages
import { OwnerDashboard } from './features/owner/OwnerDashboard';
import { AddParkingWizard } from './features/owner/AddParkingWizard';
import { OwnerParkingPage } from './features/owner/OwnerParkingPage';
import { OwnerBookingsPage } from './features/owner/OwnerBookingsPage';
import { OwnerEarningsPage } from './features/owner/OwnerEarningsPage';
import { OwnerProfilePage } from './features/owner/OwnerProfilePage';

// Admin Pages
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminParkingPage } from './features/admin/AdminParkingPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import { AdminBookingsPage } from './features/admin/AdminBookingsPage';
import { AdminPaymentsPage } from './features/admin/AdminPaymentsPage';
import { AdminComplaintsPage } from './features/admin/AdminComplaintsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Driver Application Routes */}
        <Route path="app">
          <Route index element={<DriverDashboard />} />
          <Route path="search" element={<ParkingSearchPage />} />
          <Route path="parking/:id" element={<ParkingDetailsPage />} />
          <Route
            path="booking/:id"
            element={
              <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'OWNER']}>
                <BookingFlowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'OWNER']}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings/:bookingId"
            element={
              <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'OWNER']}>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'OWNER']}>
                <DriverProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Space Owner Routes */}
        <Route
          path="owner"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="parking" element={<OwnerParkingPage />} />
          <Route path="parking/new" element={<AddParkingWizard />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
          <Route path="earnings" element={<OwnerEarningsPage />} />
          <Route path="profile" element={<OwnerProfilePage />} />
        </Route>

        {/* Master Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="parking" element={<AdminParkingPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
