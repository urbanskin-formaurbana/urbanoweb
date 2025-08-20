export const LANDINGS = [
  {
    path: '/cinturon-orion',
    import: () => import('./landing/CinturonOrion.jsx'),
  },
  {
    path: '/cinturon-titan',
    import: () => import('./landing/CinturonTitan.jsx'),
  },
  {
    path: '/cinturon-acero',
    import: () => import('./landing/CinturonAcero.jsx'),
  },
  {
    path: '/oferta-apertura',
    import: () => import('./landing/OfertaApertura.jsx'),
  },
]
