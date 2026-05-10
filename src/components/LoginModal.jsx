import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAuthorisationURLWithQueryParamsAndSetState } from "supertokens-auth-react/recipe/thirdparty";
import analytics from "../utils/analytics";

export default function LoginModal({ open, onClose, context }) {
  const location = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleGoogleLogin = async () => {
    analytics.trackLoginAttempt("google");
    try {
      // Embed the current page as redirectToPath in the browser URL so the SDK
      // picks it up when building the OAuth state (via getRedirectToPathFromURL).
      const redirectPath = location.pathname + location.search;
      const urlWithRedirect = new URL(window.location.href);
      urlWithRedirect.searchParams.set("redirectToPath", redirectPath);
      window.history.replaceState(null, "", urlWithRedirect.toString());

      const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
        thirdPartyId: "google",
        frontendRedirectURI: window.location.origin + "/auth/callback/google",
      });
      window.location.assign(authUrl);
    } catch (err) {
      console.error("Google auth init failed", err);
      // TODO: surface this error in UI when a toast/inline-error pattern is available
    }
  };

  return (
    <div
      className={`fu-modal-scrim ${open ? "open" : ""}`}
      onClick={() => onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="fu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fu-modal__handle" />

        <h2 className="fu-modal__title">{context === "reserve" ? "Agendá tu evaluación" : "Iniciá sesión"}</h2>
        <p className="fu-modal__lead">
          {context === "reserve"
            ? "Entrá con tu cuenta de Google para reservar y gestionar tus sesiones."
            : "Entrá con tu cuenta de Google. Es rápido y seguro."}
        </p>

        <div className="fu-modal__google-wrap">
          <button
            type="button"
            className="fu-btn fu-btn--outline fu-btn--lg fu-btn--block"
            onClick={handleGoogleLogin}
          >
            Continuar con Google
          </button>
        </div>

        <p className="fu-modal__foot">
          Al continuar aceptás nuestros <a href="#">términos</a> y <a href="#">política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}
