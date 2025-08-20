import { Routes, Route } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout.jsx'
import NotFound from '../pages/NotFound.jsx'
import { LANDINGS } from '../pages/_registry.js'
import React from 'react'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        {LANDINGS.map(({ path, import: importer }, idx) => {
          const Page = React.lazy(importer)
          return (
            <Route
              key={idx}
              path={path}
              element={
                <React.Suspense fallback={<div>Cargando…</div>}>
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
