import { useState, useEffect } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Link,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Button,
  Divider,
  ListSubheader,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import EventIcon from "@mui/icons-material/Event";
import FormaUrbanaLogo from "../assets/images/FormaUrbanaLogo.svg";
import { SentryTestButton } from "../components/SentryTestButton.jsx";
import { useAuth } from "../contexts/AuthContext";
import appointmentService from "../services/appointment_service";
import authService from "../services/auth_service";
import { getProductTypes } from "../services/campaign_service.js";

const STANDARD_LINKS = [
  { to: "/", label: "FORMA Urbana" },
  { to: "/cinturon-orion", label: "Cinturón de Orión" },
  { to: "/cinturon-titan", label: "Cinturón de Titán" },
  { to: "/cinturon-acero", label: "Cinturón de Acero" },
  { to: "/terminos-y-condiciones", label: "Términos y condiciones" },
];

const TEST_LINKS = [
  { to: "/", label: "FORMA Urbana" },
  { to: "/cinturon-de-orion", label: "Cinturón de Orión" },
  { to: "/cinturon-de-titan", label: "Cinturón de Titán" },
  { to: "/cinturon-de-acero", label: "Cinturón de Acero" },
  { to: "/terminos-y-condiciones", label: "Términos y condiciones" },
];

const STATIC_HOME_SECTIONS = [
  { label: "Estética Corporal", id: "estetica-corporal" },
  { label: "Estética Facial", id: "estetica-facial" },
  { label: "Complementarios", id: "complementarios" },
];

export default function LandingLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const links = pathname.startsWith("/cinturon-de-")
    ? TEST_LINKS
    : STANDARD_LINKS;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);
  const [homeSections, setHomeSections] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch purchase eligibility when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.user_type === "customer") {
      authService
        .getPurchaseEligibility()
        .then((data) => {
          setCanPurchasePackages(data.can_purchase_packages);
        })
        .catch(() => {
          setCanPurchasePackages(false);
        });
    } else {
      setCanPurchasePackages(false);
    }
  }, [isAuthenticated, user]);

  // Fetch home sections (campaigns) when on home page
  useEffect(() => {
    if (pathname === "/") {
      getProductTypes()
        .then((types) => {
          // Filter out dedicated sections to prevent duplicates
          const DEDICATED_SECTIONS = ["body", "facial", "complementarios"];
          setHomeSections(types.filter((t) => !DEDICATED_SECTIONS.includes(t.product_type)));
        })
        .catch(() => {
          setHomeSections([]);
        });
    } else {
      setHomeSections([]);
    }
  }, [pathname]);

  // Load appointment when menu opens and user is authenticated
  useEffect(() => {
    if (mobileMenuOpen && isAuthenticated && !appointment && !loadingAppointment) {
      setLoadingAppointment(true);
      appointmentService
        .getCustomerAppointments()
        .then((apt) => {
          setAppointment(apt);
        })
        .catch(() => {
          setAppointment(null);
        })
        .finally(() => {
          setLoadingAppointment(false);
        });
    }
  }, [mobileMenuOpen, isAuthenticated, appointment, loadingAppointment]);

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleExistingAppointmentClick = () => {
    navigate("/my-appointments");
    handleLinkClick();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setAppointment(null);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // Filter out cinturón landing page links for socios
  const CINTURON_LINKS = ["/cinturon-orion", "/cinturon-titan", "/cinturon-acero"];
  const visibleLinks = canPurchasePackages
    ? links.filter(l => !CINTURON_LINKS.includes(l.to))
    : links;

  const renderNavLinks = () =>
    visibleLinks.map(({ to, label }) => {
      const isActive = pathname === to;
      return (
        <Link
          key={to}
          component={isActive ? "span" : RouterLink}
          to={isActive ? undefined : to}
          underline={isActive ? "none" : "hover"}
          sx={{
            fontWeight: isActive ? 700 : 400,
            fontSize: { xs: 14, md: 16 },
            color: isActive ? "text.primary" : "#2e7d32",
            pointerEvents: isActive ? "none" : "auto",
          }}
        >
          {label}
        </Link>
      );
    });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 0, sm: 2 } }}>
        <Box
          component="header"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Box
            component="nav"
            display="flex"
            alignItems="center"
            gap={{ xs: 0, sm: 2 }}
          >
            <Box
              component="img"
              src={FormaUrbanaLogo}
              alt="FORMA Urbana"
              sx={{ height: { xs: 80, sm: 100, md: 120 }, display: "block" }}
            />
            {!isMobile && renderNavLinks()}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && isAuthenticated && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: "#2e7d32",
                  borderColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "rgba(46, 125, 50, 0.04)",
                    borderColor: "#2e7d32",
                  },
                }}
              >
                Cerrar sesión
              </Button>
            )}
            {isMobile && (
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleMenuClick}
                sx={{ mr: 0 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleMenuClick}
          sx={{
            "& .MuiDrawer-paper": {
              width: 250,
              pt: 2,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <List sx={{ flex: 1 }}>
            {visibleLinks.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <ListItem key={to} disablePadding>
                  <ListItemButton
                    component={isActive ? "div" : RouterLink}
                    to={isActive ? undefined : to}
                    onClick={handleLinkClick}
                    disabled={isActive}
                    sx={{
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "text.primary" : "#2e7d32",
                      "&.Mui-disabled": {
                        opacity: 1,
                      },
                    }}
                  >
                    {label}
                  </ListItemButton>
                </ListItem>
              );
            })}

            {/* Home page section links */}
            {pathname === "/" && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListSubheader sx={{ bgcolor: "transparent", color: "#2e7d32", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  En esta página
                </ListSubheader>
                {STATIC_HOME_SECTIONS.map(({ label, id }) => (
                  <ListItem key={id} disablePadding>
                    <ListItemButton
                      onClick={() => scrollToSection(id)}
                      sx={{
                        color: "#2e7d32",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">{label}</Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
                {homeSections.map((campaign) => (
                  <ListItem key={campaign.product_type} disablePadding>
                    <ListItemButton
                      onClick={() => scrollToSection(campaign.product_type)}
                      sx={{
                        color: "#2e7d32",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {campaign.product_label ||
                          campaign.product_type.charAt(0).toUpperCase() +
                            campaign.product_type.slice(1)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}

            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ pt: 2, pb: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#2e7d32", textTransform: "uppercase" }}
                  >
                    {appointment ? "Sesiones existentes" : "Mis Sesiones"}
                  </Typography>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleExistingAppointmentClick}
                    sx={{
                      color: "#2e7d32",
                      py: 1.5,
                    }}
                  >
                    <EventIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {appointment ? (appointment.status === "pending" ? "Cita pendiente" : "Cita confirmada") : "Ver mis sesiones"}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
          {isAuthenticated && (
            <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
                sx={{
                  color: "#2e7d32",
                  borderColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "rgba(46, 125, 50, 0.04)",
                    borderColor: "#2e7d32",
                  },
                }}
              >
                Cerrar sesión
              </Button>
            </Box>
          )}
        </Drawer>
        <Box component="main">
          <Outlet />
        </Box>
        <Box
          component="footer"
          mt={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography fontSize={12} color="text.secondary">
            © {new Date().getFullYear()} FORMA Urbana
          </Typography>
          {import.meta.env.DEV && <SentryTestButton />}
        </Box>
      </Container>
    </Box>
  );
}
