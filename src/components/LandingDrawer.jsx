import { Link as RouterLink } from "react-router-dom";
import LandingIcon from "./LandingIcon.jsx";
import FormaBrandSVG from "./FormaBrandSVG.jsx";
import logoSquare from "../assets/images/logo-square.png";

function fullName(user) {
  if (!user) return "";
  if (user.first_name || user.last_name) {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  }
  if (user.name) return user.name;
  return "";
}

export default function LandingDrawer({
  open,
  onClose,
  links,
  pathname,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  sections = [],
  onSectionClick,
}) {
  return (
    <>
      <div className={`fu-drawer-scrim ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`fu-drawer ${open ? "open" : ""}`}>
        <div className="fu-drawer__head">
          <RouterLink className="fu-header__logo" to="/" onClick={() => {
            window.scrollTo(0, 0);
            onClose();
          }}>
            <img src={logoSquare} alt="" style={{ height: 36 }} />
            <div className="fu-header__logo-text" style={{ display: "block" }}>
              <FormaBrandSVG size={60} variant="stacked" color="var(--fu-success-700)" />
            </div>
          </RouterLink>
          <button className="fu-icon-btn" type="button" onClick={onClose} aria-label="Cerrar">
            <LandingIcon name="close" size={24} />
          </button>
        </div>

        <div className="fu-drawer__nav">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            if (isActive) {
              return (
                <button key={to} className="active" type="button">
                  {label}
                </button>
              );
            }
            return (
              <RouterLink key={to} to={to} onClick={onClose}>
                {label}
              </RouterLink>
            );
          })}
        </div>

        {sections.length > 0 && (
          <>
            <div className="fu-drawer__section-title">En esta pagina</div>
            <div className="fu-drawer__nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    onSectionClick?.(section.id);
                    onClose();
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="fu-drawer__footer">
          {isAuthenticated ? (
            <>
              <div style={{ fontSize: 13, color: "var(--fu-ink-500)", marginBottom: 10 }}>Conectado como</div>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>{fullName(user) || "Socio"}</div>
              <RouterLink
                className="fu-btn fu-btn--outlined fu-btn--block"
                to="/my-appointments"
                onClick={onClose}
                style={{ marginBottom: 10, textDecoration: "none", textAlign: "center" }}
              >
                Mis sesiones
              </RouterLink>
              <button
                className="fu-btn fu-btn--outlined fu-btn--block"
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <LandingIcon name="logout" size={18} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              className="fu-btn fu-btn--primary fu-btn--block"
              type="button"
              onClick={() => {
                onLogin();
                onClose();
              }}
            >
              Iniciá sesión para reservar
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
