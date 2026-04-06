import { Routes, Route } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout.jsx'
import NotFound from '../pages/NotFound.jsx'
import { LANDINGS } from '../pages/_registry.js'
import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import PaymentPage from '../pages/user/PaymentPage.jsx'
import SchedulingPage from '../pages/user/SchedulingPage.jsx'
import AppointmentConfirmedPage from '../pages/user/AppointmentConfirmedPage.jsx'
import ExistingAppointmentPage from '../pages/user/ExistingAppointmentPage.jsx'
import AppointmentHistoryPage from '../pages/user/AppointmentHistoryPage.jsx'
import BookingSuccessPage from '../pages/user/BookingSuccessPage.jsx'
import BookingFailurePage from '../pages/user/BookingFailurePage.jsx'
import BookingPendingPage from '../pages/user/BookingPendingPage.jsx'
import ProtectedAdminRoute from '../components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from '../components/ProtectedUserRoute.jsx'
import AdminPage from '../pages/admin/AdminPage.jsx'
import CinturonOrion from '../pages/landing/CinturonOrion.jsx'
import CinturonTitan from '../pages/landing/CinturonTitan.jsx'
import CinturonAcero from '../pages/landing/CinturonAcero.jsx'

// Module-scope lazy declarations - stable references across renders
const HomePage = React.lazy(() => import('../pages/landing/HomePage.jsx'))

const regularLandings = LANDINGS.map(
  ({ path, import: importer }) => ({ path, Page: React.lazy(importer) })
)

export default function AppRoutes() {

  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route index element={<React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}><HomePage /></React.Suspense>} />
        {/* Explicit Cinturon Routes */}
        <Route path="/cinturon-orion" element={<CinturonOrion />} />
        <Route path="/cinturon-titan" element={<CinturonTitan />} />
        <Route path="/cinturon-acero" element={<CinturonAcero />} />
        {regularLandings.map(({ path, Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <React.Suspense
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                }
              >
                <Page />
              </React.Suspense>
            }
          />
        ))}
        {/* Booking Flow Routes */}
        <Route path="/payment" element={<ProtectedUserRoute><PaymentPage /></ProtectedUserRoute>} />
        <Route path="/schedule" element={<ProtectedUserRoute><SchedulingPage /></ProtectedUserRoute>} />
        <Route path="/appointment-confirmed" element={<ProtectedUserRoute><AppointmentConfirmedPage /></ProtectedUserRoute>} />
        <Route path="/my-appointments" element={<ProtectedUserRoute><AppointmentHistoryPage /></ProtectedUserRoute>} />
        <Route path="/appointment" element={<ProtectedUserRoute><ExistingAppointmentPage /></ProtectedUserRoute>} />
        {/* MercadoPago Redirect Routes */}
        <Route path="/booking/success" element={<ProtectedUserRoute><BookingSuccessPage /></ProtectedUserRoute>} />
        <Route path="/booking/failure" element={<ProtectedUserRoute><BookingFailurePage /></ProtectedUserRoute>} />
        <Route path="/booking/pending" element={<ProtectedUserRoute><BookingPendingPage /></ProtectedUserRoute>} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
