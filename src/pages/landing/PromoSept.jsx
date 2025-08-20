import SEO from '../../components/SEO'
import { Link } from 'react-router-dom'

function Section({ title, children }) {
  return (
    <section style={{margin:'48px 0'}}>
      {title && <h2 style={{fontSize:24, margin:'0 0 12px'}}>{title}</h2>}
      <div>{children}</div>
    </section>
  )
}

function CTAButton({ to='#', children }) {
  return (
    <a href={to}
       style={{display:'inline-block', padding:'12px 18px', borderRadius:8, border:'1px solid #111', textDecoration:'none'}}>
      {children}
    </a>
  )
}

export default function PromoSept() {
  return (
    <>
      <SEO title="Urbanoweb — Promo Septiembre"
           description="Descuento especial de septiembre. Oferta por tiempo limitado." />

      <header style={{display:'flex', alignItems:'center', gap:16, margin:'24px 0'}}>
        <img src="/landings/promo-sept/logo.svg" alt="Logo" height="32" />
        <span style={{color:'#666'}}>|</span>
        <Link to="/">Volver al inicio</Link>
      </header>

      <Section>
        <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24, alignItems:'center'}}>
          <div>
            <h1 style={{fontSize:40, lineHeight:1.1, margin:'0 0 12px'}}>
              -30% este mes. Construye tu presencia web ahora.
            </h1>
            <p style={{color:'#444', margin:'0 0 16px'}}>
              Sitios rápidos con enfoque SEO y performance. Entrega ágil en pocos días.
            </p>
            <div style={{display:'flex', gap:12}}>
              <CTAButton to="#contacto">Solicitar demo</CTAButton>
              <CTAButton to="#precios">Ver precios</CTAButton>
            </div>
          </div>
          <img src="/landings/promo-sept/hero.jpg" alt="Hero" style={{width:'100%', borderRadius:12}} />
        </div>
      </Section>

      <Section title="Beneficios clave">
        <ul style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, paddingLeft:18}}>
          <li>Tiempo de carga <strong>1s</strong> en 4G.</li>
          <li>Diseño responsive y accesible.</li>
          <li>Integración con analítica y pixel.</li>
        </ul>
      </Section>

      <Section title="Planes" id="precios">
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
          {[
            {name:'Starter', price:'USD 299', features:['1 landing', 'Hosting incluido', 'Soporte 15 días']},
            {name:'Growth', price:'USD 699', features:['3 landings', 'A/B testing', 'Soporte 30 días']},
            {name:'Scale', price:'USD 1299', features:['6 landings', 'CMS ligero', 'Soporte 60 días']},
          ].map(card => (
            <div key={card.name} style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <h3 style={{margin:'0 0 8px'}}>{card.name}</h3>
              <div style={{fontSize:24, margin:'0 0 8px'}}>{card.price}</div>
              <ul style={{margin:0, paddingLeft:18}}>
                {card.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <div style={{marginTop:12}}>
                <CTAButton to="#contacto">Seleccionar</CTAButton>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="FAQ">
        <details style={{marginBottom:8}}>
          <summary>¿Cuánto tarda la entrega?</summary>
          <p>Primer borrador en 72 horas para el plan Starter.</p>
        </details>
        <details style={{marginBottom:8}}>
          <summary>¿Puedo migrar a un plan superior?</summary>
          <p>Sí, se prorratea la diferencia y no pierdes trabajo realizado.</p>
        </details>
      </Section>

      <footer style={{margin:'64px 0 24px', fontSize:12, color:'#666'}}>
        © {new Date().getFullYear()} Urbanoweb — Promo Septiembre
      </footer>
    </>
  )
}
