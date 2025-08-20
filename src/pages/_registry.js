export const LANDINGS = [
  {
    path: '/',
    import: () => import('./landing/Home.jsx'),
  },
  {
    path: '/pricing',
    import: () => import('./landing/Pricing.jsx'),
  },
  {
    path: '/promo-sept',
    import: () => import('./landing/PromoSept.jsx'),
  },
  // Ejemplo: { path: '/promo-enero', import: () => import('./landing/PromoEnero.jsx') }
]
