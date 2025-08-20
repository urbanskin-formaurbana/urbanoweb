export const LANDINGS = [
  {
    path: '/',
    import: () => import('./landing/Home.jsx'),
    seo: { title: 'Urbanoweb — Home', description: 'Landing principal de Urbanoweb' },
  },
  {
    path: '/pricing',
    import: () => import('./landing/Pricing.jsx'),
    seo: { title: 'Urbanoweb — Pricing', description: 'Planes y precios' },
  },
  {
    path: '/promo-sept',
    import: () => import('./landing/PromoSept.jsx'),
    seo: { title: 'Urbanoweb — Promo Septiembre', description: 'Descuento especial de septiembre' }
  },
  // Ejemplo: { path: '/promo-enero', import: () => import('./landing/PromoEnero.jsx'), seo:{...} }
]
