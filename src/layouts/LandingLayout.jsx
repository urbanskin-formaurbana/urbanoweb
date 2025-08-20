import { Link, Outlet } from 'react-router-dom'

export default function LandingLayout() {
  return (
    <div style={{maxWidth: 960, margin: '0 auto', padding: 24}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <Link to="/">Urbanoweb</Link>
        <nav style={{display:'flex', gap:12}}>
          <Link to="/pricing">Pricing</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer style={{marginTop:48, fontSize:12, color:'#666'}}>© {new Date().getFullYear()} Urbanoweb</footer>
    </div>
  )
}
