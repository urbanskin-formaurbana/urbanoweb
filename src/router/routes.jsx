import { Routes, Route, Navigate } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout.jsx'
import PromoLandingLayout from '../layouts/PromoLandingLayout.jsx'
import NotFound from '../pages/NotFound.jsx'
import { LANDINGS } from '../pages/_registry.js'
import React from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function AppRoutes() {
  const promoPath = '/oferta-apertura'
  const promoLanding = LANDINGS.find((l) => l.path === promoPath)
  const regularLandings = LANDINGS.filter((l) => l.path !== promoPath)
  const PromoPage = promoLanding ? React.lazy(promoLanding.import) : null

  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route index element={<Navigate to="/cinturon-orion" replace />} />
        {regularLandings.map(({ path, import: importer }, idx) => {
          const Page = React.lazy(importer)
          return (
            <Route
              key={idx}
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
          )
        })}
      </Route>
      {PromoPage && (
        <Route element={<PromoLandingLayout />}>
          <Route
            path={promoLanding.path}
            element={
              <React.Suspense
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                }
              >
                <PromoPage />
              </React.Suspense>
            }
          />
        </Route>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
