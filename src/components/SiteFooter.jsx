import { Link as RouterLink } from "react-router-dom";
import { Box } from "@mui/material";
import LandingIcon from "./LandingIcon.jsx";
import FormaBrandSVG from "./FormaBrandSVG.jsx";
import analytics from "../utils/analytics";

export default function SiteFooter({ sections = [], onSectionClick, whatsappPhone, businessEmail, businessAddress }) {
  return (
    <footer className="fu-footer">
      <div className="fu-container">
        <div className="fu-footer__grid">
          <div>
            <div className="fu-footer__brand">
              <FormaBrandSVG size={80} variant="stacked" />
            </div>
            <p className="fu-footer__sub">Más que una estética facial y corporal. Tratamientos no invasivos en Montevideo Centro.</p>
            <p className="fu-footer__address">
              <LandingIcon name="place" size={16} color="currentColor" />
              {businessAddress}
            </p>
          </div>
          <div>
            <h4>Tratamientos</h4>
            {sections.map((section) => (
              <button key={section.id} type="button" className="fu-footer__link" onClick={() => onSectionClick?.(section.id)}>
                {section.label}
              </button>
            ))}
          </div>
          <div>
            <h4>Contacto</h4>
            {whatsappPhone && (
              <a
                className="fu-footer__link"
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.trackWhatsAppClick({ source: "footer" })}
              >
                WhatsApp
              </a>
            )}
            {businessEmail && (
              <a className="fu-footer__link" href={`mailto:${businessEmail}`}>
                {businessEmail}
              </a>
            )}
          </div>
        </div>
        <div className="fu-footer__copy">
          <span>© {new Date().getFullYear()} Forma Urbana. Todos los derechos reservados.</span>
          <Box component={RouterLink} to="/terminos-y-condiciones" sx={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", "&:hover": { color: "#fff" } }}>
            Términos y condiciones
          </Box>
        </div>
      </div>
    </footer>
  );
}
