import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import analytics from "../utils/analytics";

export default function LoginModal({ open, onClose, onSuccess, context }) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleWrapRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(300);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !googleWrapRef.current) return undefined;

    const updateWidth = () => {
      const next = Math.max(220, Math.floor(googleWrapRef.current?.clientWidth || 300));
      setGoogleWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(googleWrapRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [open]);

  const handlePostLogin = () => {
    onClose?.();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.user_type === "employee") return;

    onSuccess?.();
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    analytics.trackLoginAttempt("google");
    setLoading(true);
    setError("");
    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result?.success) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        analytics.trackLogin({
          authMethod: "google",
          userId: storedUser?.id,
          isNewUser: Boolean(result.isNewUser),
        });
        setTimeout(() => handlePostLogin(), 450);
      } else {
        analytics.trackLoginError({ authMethod: "google", error: new Error("No se pudo iniciar sesión con Google.") });
        setError("No se pudo iniciar sesión con Google.");
      }
    } catch (err) {
      analytics.trackLoginError({ authMethod: "google", error: err });
      setError(err.message || "Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
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

        {error && <div className="fu-modal__error">{error}</div>}

        <div className="fu-modal__google-wrap" ref={googleWrapRef}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              analytics.trackLoginError({ authMethod: "google", error: new Error("Error al iniciar sesión con Google.") });
              setError("Error al iniciar sesión con Google.");
            }}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            locale="es"
            width={String(googleWidth)}
            disabled={loading}
          />
        </div>

        <p className="fu-modal__foot">
          Al continuar aceptás nuestros <a href="#">términos</a> y <a href="#">política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}
