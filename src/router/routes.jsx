import { Routes, Route } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout.jsx'
import GoogleAuthCallback from '../auth/GoogleAuthCallback.jsx'
import NotFound from '../pages/NotFound.jsx'
import { LANDINGS } from '../pages/_registry.js'
import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import PaymentPage from '../pages/user/PaymentPage.jsx'
import SchedulingPage from '../pages/user/SchedulingPage.jsx'
import AppointmentConfirmedPage from '../pages/user/AppointmentConfirmedPage.jsx'
import ExistingAppointmentPage from '../pages/user/ExistingAppointmentPage.jsx'
import AppointmentHistoryPage from '../pages/user/AppointmentHistoryPage.jsx'
import ProtectedAdminRoute from '../components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from '../components/ProtectedUserRoute.jsx'
import AdminPage from '../pages/admin/AdminPage.jsx'
import PagosLedgerPage from '../pages/admin/PagosLedgerPage.jsx'
import CinturonOrion from '../pages/landing/CinturonOrion.jsx'
import CinturonTitan from '../pages/landing/CinturonTitan.jsx'
import CinturonAcero from '../pages/landing/CinturonAcero.jsx'

// Module-scope lazy declarations - stable references across renders
const HomePage = React.lazy(() => import('../pages/landing/HomePage.jsx'))

const regularLandings = LANDINGS.map(
  ({ path, import: importer }) => ({ path, Page: React.lazy(importer) })
)

const Spinner = (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
)

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback/google" element={<GoogleAuthCallback />} />

      <Route element={<LandingLayout />}>
        <Route index element={<React.Suspense fallback={Spinner}><HomePage /></React.Suspense>} />
        {/* Explicit Cinturon Routes */}
        <Route path="/cinturon-orion" element={<CinturonOrion />} />
        <Route path="/cinturon-titan" element={<CinturonTitan />} />
        <Route path="/cinturon-acero" element={<CinturonAcero />} />
        {regularLandings.map(({ path, Page }) => (
          <Route
            key={path}
            path={path}
            element={<React.Suspense fallback={Spinner}><Page /></React.Suspense>}
          />
        ))}
        {/* Public booking entry: /schedule has no auth gate — the "Continuar al pago"
            button checks the session and redirects to /auth if needed */}
        <Route path="/schedule" element={<SchedulingPage />} />
        {/* Protected user routes */}
        <Route path="/payment" element={<ProtectedUserRoute><PaymentPage /></ProtectedUserRoute>} />
        <Route path="/appointment-confirmed" element={<ProtectedUserRoute><AppointmentConfirmedPage /></ProtectedUserRoute>} />
        <Route path="/my-appointments" element={<ProtectedUserRoute><AppointmentHistoryPage /></ProtectedUserRoute>} />
        <Route path="/appointment" element={<ProtectedUserRoute><ExistingAppointmentPage /></ProtectedUserRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/pagos"
        element={
          <ProtectedAdminRoute>
            <PagosLedgerPage />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  )
}
