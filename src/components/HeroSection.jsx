import { useEffect, useRef, useState } from "react";
import LandingIcon from "./LandingIcon.jsx";
import FormaBrandSVG from "./FormaBrandSVG.jsx";

const CATEGORIES = [
  { label: "Estética Corporal", anchor: "estetica-corporal" },
  { label: "Estética Facial", anchor: "estetica-facial" },
];

function HeroBadge({ icon, children }) {
  return (
    <span className="fu-hero__badge">
      <LandingIcon name={icon} size={14} />
      {children}
    </span>
  );
}

export default function HeroSection({ isAuthenticated, onLogin, onCategorySelect, imageSrc, categories = CATEGORIES }) {
  const [dropOpen, setDropOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!dropOpen) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropOpen]);

  const handleCTA = () => {
    if (!isAuthenticated) {
      onLogin?.();
      return;
    }
    setDropOpen((v) => !v);
  };

  return (
    <section className="fu-hero">
      <div className="fu-hero__frame">
        <img className="fu-hero__image" src={imageSrc} alt="" aria-hidden="true" />
        <div className="fu-hero__overlay" />

        <div className="fu-container">
          <div className="fu-hero__content">
            <h1 className="fu-hero__brand">
              <FormaBrandSVG size={200} variant="stacked" />
            </h1>

            <p className="fu-hero__lead">MÁS QUE UNA ESTÉTICA: TECNOLOGÍA QUE TRANSFORMA TU CUERPO.</p>

            <div className="fu-hero__badges">
              <HeroBadge icon="spa">Sin agujas</HeroBadge>
              <HeroBadge icon="healing">Sin cirugía</HeroBadge>
              <HeroBadge icon="verified">Resultados reales</HeroBadge>
            </div>

            <div className="fu-hero__cta" ref={wrapRef}>
              <button className="fu-btn fu-btn--primary fu-btn--lg" type="button" onClick={handleCTA}>
                {isAuthenticated ? "Agendá una sesión" : "Iniciá sesión"}
                <LandingIcon
                  name={isAuthenticated ? (dropOpen ? "expand_less" : "expand_more") : "login"}
                  size={18}
                />
              </button>

              {dropOpen && (
                <div className="fu-hero__dropdown" role="menu">
                  <div className="fu-hero__dropdown-label">Elegí la categoría</div>
                  {categories.map((category) => (
                    <button
                      key={category.anchor}
                      className="fu-hero__dropdown-item"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropOpen(false);
                        onCategorySelect?.(category.anchor);
                      }}
                    >
                      <span>{category.label}</span>
                      <LandingIcon name="arrow_forward" size={18} color="var(--fu-ink-400)" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
