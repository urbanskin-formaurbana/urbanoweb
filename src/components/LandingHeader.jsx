import { Link as RouterLink } from "react-router-dom";
import LandingIcon from "./LandingIcon.jsx";
import logoSquare from "../assets/images/logo-square.png";

function fullName(user) {
  if (!user) return "";
  if (user.first_name || user.last_name) {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  }
  if (user.name) return user.name;
  return "";
}

export default function LandingHeader({
  links,
  pathname,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  onMenu,
}) {
  const initials = (fullName(user) || "S").slice(0, 1).toUpperCase();

  return (
    <header className="fu-header">
      <div className="fu-container fu-header__inner">
        <RouterLink className="fu-header__logo" to="/">
          <img src={logoSquare} alt="Forma Urbana" />
          <div className="fu-header__logo-text">
            FORMA
            <small>Urbana</small>
          </div>
        </RouterLink>

        <nav className="fu-header__nav">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;
            if (isActive) {
              return (
                <button key={to} className="active" type="button" disabled>
                  {label}
                </button>
              );
            }
            return (
              <RouterLink key={to} to={to}>
                {label}
              </RouterLink>
            );
          })}
        </nav>

        <div className="fu-header__right">
          {isAuthenticated ? (
            <>
              <button className="fu-avatar" title={fullName(user) || "Socio"} type="button">
                {initials}
              </button>
              <button className="fu-btn fu-btn--outlined fu-btn--sm fu-header__logout" type="button" onClick={onLogout}>
                <LandingIcon name="logout" size={16} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <button className="fu-btn fu-btn--outlined fu-btn--sm" type="button" onClick={onLogin}>
              Iniciá sesión
            </button>
          )}

          <button className="fu-icon-btn fu-header__menu" type="button" aria-label="Menú" onClick={onMenu}>
            <LandingIcon name="menu" size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
