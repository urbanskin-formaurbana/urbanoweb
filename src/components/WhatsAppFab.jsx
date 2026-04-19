import { useEffect, useState } from "react";
import LandingIcon from "./LandingIcon.jsx";

export default function WhatsAppFab({ phone }) {
  const [wide, setWide] = useState(typeof window !== "undefined" && window.innerWidth >= 960);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!phone) return null;

  return (
    <a
      className="fu-wa"
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
    >
      <span className="fu-wa__pulse" aria-hidden="true" />
      <LandingIcon name="whatsapp_icon" size={24} color="currentColor" />
      {wide && <span>WhatsApp</span>}
    </a>
  );
}
