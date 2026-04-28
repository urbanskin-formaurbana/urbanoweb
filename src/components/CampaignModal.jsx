import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "../contexts/BusinessContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  Checkbox,
  Collapse,
  IconButton,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { createCampaignService } from "../services/campaign_service";
import analytics from "../utils/analytics";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function CampaignItemRow({ item, onContratar }) {
  const hasSessionPromo =
    item.is_session_promo &&
    typeof item.promo_price === "number" &&
    item.promo_price > 0;
  const hasCuponeraPromo = !!item.is_cuponera_promo;
  const isFeatured = hasSessionPromo || hasCuponeraPromo;

  return (
    <ListItem
      disablePadding
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1,
        borderBottom: "1px solid #eee",
        "&:last-child": { borderBottom: "none" },
        ...(isFeatured && {
          border: "2px solid #2e7d32",
          borderRadius: 1,
          backgroundColor: "#f2f8f3",
          mb: 1,
          position: "relative",
          overflow: "visible",
        }),
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
          <Typography variant="body2" fontWeight="500">
            {item.name}
          </Typography>
          {hasSessionPromo && (
            <Chip
              label="Oferta"
              size="small"
              sx={{ backgroundColor: "#2e7d32", color: "#fff", height: 18, fontSize: 10, fontWeight: 700 }}
            />
          )}
          {hasCuponeraPromo && !hasSessionPromo && (
            <Chip
              label="Promo en cuponera"
              size="small"
              sx={{ backgroundColor: "#14331b", color: "#fff", height: 18, fontSize: 10, fontWeight: 700 }}
            />
          )}
        </Box>
        {hasSessionPromo ? (
          <Typography variant="body2" color="text.secondary">
            <span style={{ textDecoration: "line-through", marginRight: 6 }}>${item.price}</span>
            <span style={{ color: "#2e7d32", fontWeight: 700 }}>${item.promo_price}</span>
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            $ {item.price}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {item.duration_minutes} min
        </Typography>
      </Box>
      <Button size="small" variant="outlined" color="success" onClick={() => onContratar(item)}>
        Contratar
      </Button>
    </ListItem>
  );
}

/**
 * Generic Campaign Modal - replaces LaserDepilationModal
 * Props:
 *   - open: boolean
 *   - onClose: function
 *   - productType: string (e.g., 'laser', 'hifu')
 *   - modalTitle: string (e.g., 'Depilación Láser')
 *   - gender: string (optional - 'hombres' or 'mujeres')
 *   - treatments: array of treatment objects
 *   - isAuthenticated: boolean
 *   - onLoginRequired: function
 */
function CampaignModal({
  open,
  onClose,
  productType,
  modalTitle,
  gender,
  treatments = [],
  isAuthenticated,
  onLoginRequired,
}) {
  const navigate = useNavigate();
  const { whatsappPhone } = useBusiness();
  const [tabValue, setTabValue] = useState(0);
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [hasCampaign, setHasCampaign] = useState(null);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [waitlistJoining, setWaitlistJoining] = useState(false);

  // Filter treatments by type (zona/paquete) and gender (if provided)
  const zonas = treatments.filter(
    (t) =>
      t.item_type === "zona" &&
      (!gender || t.gender === gender)
  );
  const paquetes = treatments.filter(
    (t) =>
      t.item_type === "paquete" &&
      (!gender || t.gender === gender)
  );

  const campaignService = createCampaignService(productType);

  const handleContratar = async (item) => {
    analytics.trackCampaignItemSelected({ productType, gender, item });
    if (!isAuthenticated) {
      analytics.trackLoginModalOpened({ trigger: "campaign_click" });
      onLoginRequired();
      return;
    }

    try {
      setHasCampaign(null);
      const campaign = await campaignService.getActiveCampaign();

      if (!campaign) {
        // No active campaign - offer waitlist
        if (isAuthenticated) {
          try {
            const status = await campaignService.checkWaitlistStatus();
            setIsOnWaitlist(status?.is_on_waitlist || false);
          } catch {
            setIsOnWaitlist(false);
          }
        }
        setHasCampaign(false);
        return;
      }

      // Bug fix #3: Check if slots are available before navigating
      const availableSlots = await campaignService.getAvailableSlots(
        item.duration_minutes
      );
      if (!availableSlots || availableSlots.length === 0) {
        // No slots available - show waitlist
        if (isAuthenticated) {
          try {
            const status = await campaignService.checkWaitlistStatus();
            setIsOnWaitlist(status?.is_on_waitlist || false);
          } catch {
            setIsOnWaitlist(false);
          }
        }
        setHasCampaign(false);
        return;
      }

      setHasCampaign(true);
      onClose();
      navigate("/schedule", {
        state: {
          treatment: { name: item.name, slug: item.slug, item_type: item.item_type, category: productType },
          selectedPackageId: null,
          campaignItemType: item.item_type,
          productType: productType,
        },
      });
    } catch (error) {
      setHasCampaign(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      setWaitlistJoining(true);
      await campaignService.joinWaitlist();
      analytics.trackJoinWaitlist({ productType, gender });
      setIsOnWaitlist(true);
    } catch (error) {
    } finally {
      setWaitlistJoining(false);
    }
  };

  const handleZoneToggle = (zona) => {
    setSelectedZones((prev) =>
      prev.some((z) => z.slug === zona.slug)
        ? prev.filter((z) => z.slug !== zona.slug)
        : [...prev, zona]
    );
  };

  const handleConsultaWhatsApp = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    if (selectedZones.length === 0) {
      return;
    }
    const lines = selectedZones.map((z) => `• ${z.name}`).join("\n");
    const msg = `Hola! Me gustaría consultar sobre un paquete personalizado de ${modalTitle.toLowerCase()}.\n\nZonas de interés:\n${lines}\n\n¿Podrían indicarme el precio?`;
    analytics.trackWhatsAppClick({
      source: "campaign_modal",
      context: {
        productType,
        gender,
        selectedZones: selectedZones.map((z) => z.slug),
      },
    });
    window.open(
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.25rem",
          textAlign: "center",
          mb: -2,
        }}
      >
        {modalTitle}
      </DialogTitle>
      <DialogContent>
        {hasCampaign === false && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay turnos disponibles en este momento. Nos ponemos en contacto
              cuando abramos la próxima campaña.
            </Alert>
            <Button
              variant="contained"
              color="success"
              onClick={handleJoinWaitlist}
              disabled={isOnWaitlist || waitlistJoining}
              sx={{ mt: 2 }}
            >
              {waitlistJoining
                ? "Procesando..."
                : isOnWaitlist
                ? "Ya estás en la lista de espera ✓"
                : "Anotarme en la lista de espera"}
            </Button>
          </Box>
        )}

        {(hasCampaign === null || hasCampaign === true) && (
          <>
            {gender && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                {gender === "hombres" ? "Hombres" : "Mujeres"}
              </Typography>
            )}
            {(zonas.length > 0 || paquetes.length > 0) && (
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: "divider", mb: -2 }}
              >
                {zonas.length > 0 && <Tab label="Zonas" />}
                {paquetes.length > 0 && <Tab label="Paquetes" />}
              </Tabs>
            )}

            {/* Zonas Tab */}
            {zonas.length > 0 && (
              <TabPanel value={tabValue} index={zonas.length > 0 ? 0 : -1}>
                <List sx={{ width: "100%" }}>
                  {zonas.map((zona) => (
                    <CampaignItemRow key={zona.slug} item={zona} onContratar={handleContratar} />
                  ))}
                </List>
              </TabPanel>
            )}

            {/* Paquetes Tab */}
            {paquetes.length > 0 && (
              <TabPanel
                value={tabValue}
                index={zonas.length > 0 ? 1 : 0}
              >
                <List sx={{ width: "100%" }}>
                  {paquetes.map((paquete) => (
                    <CampaignItemRow key={paquete.slug} item={paquete} onContratar={handleContratar} />
                  ))}

                  {/* Consulta por tu propio paquete */}
                  <Box
                    sx={{
                      py: 2,
                      px: 1,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        mb: consultaOpen ? 1 : 0,
                      }}
                      onClick={() => setConsultaOpen(!consultaOpen)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Consulta por tu propio paquete
                      </Typography>
                      <IconButton size="small">
                        {consultaOpen ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>

                    <Collapse in={consultaOpen}>
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1.5 }}
                        >
                          Selecciona las zonas que deseas combinar
                        </Typography>
                        <Box sx={{ maxHeight: "300px", overflow: "auto", mb: 2 }}>
                          {zonas.map((zona) => (
                            <Box
                              key={zona.slug}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 0.5,
                              }}
                            >
                              <Checkbox
                                checked={selectedZones.some(
                                  (z) => z.slug === zona.slug
                                )}
                                onChange={() => handleZoneToggle(zona)}
                                size="small"
                              />
                              <Typography variant="body2">
                                {zona.name}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        {selectedZones.length === 0 && (
                          <Alert
                            severity="info"
                            sx={{ mb: 1, fontSize: "0.875rem" }}
                          >
                            Selecciona al menos una zona
                          </Alert>
                        )}
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          disabled={
                            selectedZones.length === 0 || !isAuthenticated
                          }
                          onClick={handleConsultaWhatsApp}
                        >
                          Enviar por WhatsApp
                        </Button>
                      </Box>
                    </Collapse>
                  </Box>
                </List>
              </TabPanel>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CampaignModal;
