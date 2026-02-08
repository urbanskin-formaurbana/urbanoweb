import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import FormaUrbanaLogo from "../assets/images/FormaUrbanaLogo.svg";

const STANDARD_LINKS = [
  { to: "/cinturon-orion", label: "Cinturón de Orión" },
  { to: "/cinturon-titan", label: "Cinturón de Titán" },
  { to: "/cinturon-acero", label: "Cinturón de Acero" },
  { to: "/terminos-y-condiciones", label: "Términos y condiciones" },
];

const TEST_LINKS = [
  { to: "/cinturon-de-orion", label: "Cinturón de Orión" },
  { to: "/cinturon-de-titan", label: "Cinturón de Titán" },
  { to: "/cinturon-de-acero", label: "Cinturón de Acero" },
  { to: "/terminos-y-condiciones", label: "Términos y condiciones" },
];

export default function LandingLayout() {
  const { pathname } = useLocation();
  const links = pathname.startsWith("/cinturon-de-")
    ? TEST_LINKS
    : STANDARD_LINKS;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () =>
    links.map(({ to, label }) => {
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

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleMenuClick}
          sx={{
            "& .MuiDrawer-paper": {
              width: 250,
              pt: 2,
            },
          }}
        >
          <List>
            {links.map(({ to, label }) => {
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
          </List>
        </Drawer>
        <Box component="main">
          <Outlet />
        </Box>
        <Typography
          component="footer"
          mt={6}
          fontSize={12}
          color="text.secondary"
        >
          © {new Date().getFullYear()} FORMA Urbana
        </Typography>
      </Container>
    </Box>
  );
}
