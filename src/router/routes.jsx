import { Routes, Route, Navigate } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout.jsx'
import NotFound from '../pages/NotFound.jsx'
import { LANDINGS } from '../pages/_registry.js'
import React from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route index element={<Navigate to="/cinturon-orion" replace />} />
        {LANDINGS.map(({ path, import: importer }, idx) => {
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
