import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import LandingHeader from "../components/LandingHeader.jsx";
import LandingDrawer from "../components/LandingDrawer.jsx";
import WhatsAppFab from "../components/WhatsAppFab.jsx";
import LoginModal from "../components/LoginModal.jsx";
import { SentryTestButton } from "../components/SentryTestButton.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../contexts/AuthContext";
import { useBusiness } from "../contexts/BusinessContext";
import authService from "../services/auth_service";
import { getProductTypes } from "../services/campaign_service.js";

const STATIC_HOME_SECTIONS = [
  { label: "Forma Urbana", id: "fu-top" },
  { label: "Estética Corporal", id: "estetica-corporal" },
  { label: "Estética Facial", id: "estetica-facial" },
];

export default function LandingLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { whatsappPhone, businessEmail, businessAddress } = useBusiness();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [homeSections, setHomeSections] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.user_type === "customer") {
      authService.getPurchaseEligibility().catch(() => {});
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    getProductTypes()
      .then((types) => {
        const DEDICATED_SECTIONS = ["body", "facial", "complementarios"];
        setHomeSections(types.filter((t) => !DEDICATED_SECTIONS.includes(t.product_type)));
      })
      .catch(() => setHomeSections([]));
  }, []);

  const scrollToSection = (id) => {
    if (id === "fu-top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (pathname !== "/") return;
    const pending = sessionStorage.getItem("fu-scroll-target");
    if (!pending) return;
    sessionStorage.removeItem("fu-scroll-target");
    window.setTimeout(() => scrollToSection(pending), 140);
  }, [pathname, homeSections.length]);

  const drawerSections = useMemo(() => {
    if (pathname !== "/") return [];

    const dynamicSections = homeSections.map((campaign) => ({
      id: campaign.product_type,
      label:
        campaign.product_label ||
        `${campaign.product_type.charAt(0).toUpperCase()}${campaign.product_type.slice(1)}`,
    }));

    return [
      ...STATIC_HOME_SECTIONS,
      ...dynamicSections,
      { label: "Complementarios", id: "complementarios" },
    ];
  }, [pathname, homeSections]);

  const footerSections = useMemo(() => {
    const dynamicSections = homeSections.map((campaign) => ({
      id: campaign.product_type,
      label:
        campaign.product_label ||
        `${campaign.product_type.charAt(0).toUpperCase()}${campaign.product_type.slice(1)}`,
    }));

    return [
      { label: "Estética Corporal", id: "estetica-corporal" },
      { label: "Estética Facial", id: "estetica-facial" },
      ...dynamicSections,
      { label: "Complementarios", id: "complementarios" },
    ];
  }, [homeSections]);

  const handleFooterSectionClick = (id) => {
    if (pathname === "/") {
      scrollToSection(id);
      return;
    }
    sessionStorage.setItem("fu-scroll-target", id);
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box className="fu-layout">
      <LandingHeader
        links={[]}
        pathname={pathname}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onMenu={() => setMobileMenuOpen(true)}
      />

      <LandingDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={[]}
        pathname={pathname}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        sections={drawerSections}
        onSectionClick={scrollToSection}
      />

      <main className="fu-main">
        <Outlet />
      </main>

      <SiteFooter
        sections={footerSections}
        onSectionClick={handleFooterSectionClick}
        whatsappPhone={whatsappPhone}
        businessEmail={businessEmail}
        businessAddress={businessAddress}
      />

      {import.meta.env.DEV && (
        <Box sx={{ px: 2, pb: 2 }}>
          <SentryTestButton />
        </Box>
      )}

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} onSuccess={() => setLoginModalOpen(false)} />

      <WhatsAppFab phone={whatsappPhone} />
    </Box>
  );
}
