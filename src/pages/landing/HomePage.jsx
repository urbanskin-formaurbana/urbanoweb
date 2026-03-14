/* eslint-disable no-irregular-whitespace */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO.jsx";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import appointmentService from "../../services/appointment_service.js";
import paymentService from "../../services/payment_service.js";
import treatmentService from "../../services/treatment_service.js";
import authService from "../../services/auth_service.js";
import LoginModal from "../../components/LoginModal.jsx";
import PurchaseOptionsDialog from "../../components/PurchaseOptionsDialog.jsx";
import LaserDepilationModal from "../../components/LaserDepilationModal.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [checkingAppointment, setCheckingAppointment] = useState(false);
  const [bodyTreatments, setBodyTreatments] = useState([]);
  const [facialTreatments, setFacialTreatments] = useState([]);
  const [complementaryTreatments, setComplementaryTreatments] = useState([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [treatmentsError, setTreatmentsError] = useState(null);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedTreatmentForPurchase, setSelectedTreatmentForPurchase] = useState(null);
  const [laserModalOpen, setLaserModalOpen] = useState(false);
  const [laserGender, setLaserGender] = useState('hombres');

  const [laserTreatments, setLaserTreatments] = useState([]);

  useEffect(() => {
    treatmentService
      .getAllTreatments()
      .then((data) => {
        setBodyTreatments(data.filter((t) => t.category === "body"));
        setFacialTreatments(data.filter((t) => t.category === "facial"));
        setComplementaryTreatments(data.filter((t) => t.category === "complementarios"));
        setLaserTreatments(data.filter((t) => t.category === "laser"));
      })
      .catch((err) => {
        console.error("Error loading treatments:", err);
        setTreatmentsError("No se pudieron cargar los tratamientos.");
      })
      .finally(() => setTreatmentsLoading(false));
  }, []);

  // Get laser treatments by gender
  const laserHombres = laserTreatments.filter((t) => t.gender === "hombres");
  const laserMujeres = laserTreatments.filter((t) => t.gender === "mujeres");

  // Check purchase eligibility when authenticated (only for customers)
  useEffect(() => {
    if (isAuthenticated && user?.user_type === "customer") {
      authService
        .getPurchaseEligibility()
        .then((data) => {
          setCanPurchasePackages(data.can_purchase_packages);
        })
        .catch((err) => {
          console.error("Error checking purchase eligibility:", err);
          setCanPurchasePackages(false);
        });
    }
  }, [isAuthenticated, user]);

  const handleBodyTreatmentClick = (treatment) => {
    if (!isAuthenticated) {
      navigate(treatment.route);
      return;
    }

    // Redirect employees to admin panel
    if (user?.user_type === "employee") {
      navigate("/admin");
      return;
    }

    // If can't purchase packages, redirect to landing page (evaluation flow)
    if (!canPurchasePackages) {
      navigate(treatment.route);
      return;
    }

    // Can purchase packages - open dialog to choose option
    setSelectedTreatmentForPurchase(treatment);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseConfirm = async (packageId) => {
    setCheckingAppointment(true);
    try {
      const existingAppointment = await appointmentService.getCustomerAppointments();
      if (existingAppointment) {
        navigate("/existing-appointment", {
          state: { appointment: existingAppointment },
        });
        return;
      }

      const unscheduledPayment = await paymentService.getUnscheduledPayment();
      if (unscheduledPayment) {
        paymentService.savePaymentId(unscheduledPayment._id);
        navigate("/schedule", {
          state: {
            treatment: { name: selectedTreatmentForPurchase.name, slug: selectedTreatmentForPurchase.slug },
          },
        });
        return;
      }

      navigate("/payment", {
        state: {
          treatment: { name: selectedTreatmentForPurchase.name, slug: selectedTreatmentForPurchase.slug },
          selectedPackageId: packageId,
        },
      });
    } catch (err) {
      console.error("Error in purchase flow:", err);
      setLoginModalOpen(true);
    } finally {
      setCheckingAppointment(false);
    }
  };

  const handleFacialTreatmentClick = async (treatment) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    // Redirect employees to admin panel
    if (user?.user_type === "employee") {
      navigate("/admin");
      return;
    }

    setCheckingAppointment(true);
    try {
      // Check for existing active appointment
      const existingAppointment = await appointmentService.getCustomerAppointments();

      if (existingAppointment) {
        // Customer has pending or confirmed appointment
        navigate("/existing-appointment", {
          state: { appointment: existingAppointment },
        });
      } else {
        // No existing appointment - check if customer already paid but hasn't scheduled yet
        const unscheduledPayment = await paymentService.getUnscheduledPayment();
        if (unscheduledPayment) {
          // Customer paid but didn't schedule - skip payment, go directly to scheduling
          paymentService.savePaymentId(unscheduledPayment._id);
          navigate("/schedule", {
            state: { treatment: { name: treatment.name, slug: treatment.slug } },
          });
        } else {
          // No payment or payment already has appointment - proceed to payment
          navigate("/payment", {
            state: { treatment: { name: treatment.name, slug: treatment.slug } },
          });
        }
      }
    } catch (err) {
      console.error("Error checking appointments:", err);
      // For other errors, show login modal as fallback
      setLoginModalOpen(true);
    } finally {
      setCheckingAppointment(false);
    }
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  return (
    <>
      <SEO
        title="FORMA Urbana — Estética Corporal y Facial | Montevideo Centro"
        description="Tratamientos no invasivos de estética corporal y facial en Montevideo Centro. Sin agujas. Sin cirugías. Resultados reales."
      />

      {/* Hero Section */}
      <Box
        component="header"
        sx={{
          textAlign: "center",
          bgcolor: "success.light",
          color: "success.contrastText",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            FORMA Urbana
          </Typography>
          <Typography variant="h5" gutterBottom>
            Más que una estética facial y corporal
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Tratamientos no invasivos en Montevideo Centro. Sin cirugías. Sin agujas. Resultados
            reales.
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => setLoginModalOpen(true)}
              sx={{ fontWeight: "bold" }}
            >
              Iniciá sesión para reservar
            </Button>
          )}
        </Container>
      </Box>

      {/* Loading State */}
      {treatmentsLoading && (
        <Container component="section" sx={{ py: { xs: 4, md: 6 }, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      )}

      {/* Error State */}
      {treatmentsError && !treatmentsLoading && (
        <Container component="section" sx={{ py: { xs: 3, md: 4 } }}>
          <Alert severity="error">{treatmentsError}</Alert>
        </Container>
      )}

      {/* Body Treatments Section */}
      {!treatmentsLoading && !treatmentsError && (
        <>
          <Container component="section" sx={{ py: { xs: 3, md: 4 } }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              align="center"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Estética Corporal
            </Typography>
            <Typography
              align="center"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              Tecnología no invasiva para reducir contorno, tonificar músculo y reafirmar piel
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              {bodyTreatments.map((treatment) => (
                <Grid key={treatment.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleBodyTreatmentClick(treatment)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                        {treatment.name}
                      </Typography>
                      {treatment.subtitle && (
                        <Typography variant="body2" color="success.main" gutterBottom>
                          {treatment.subtitle}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {treatment.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Facial Treatments Section */}
          <Box sx={{ bgcolor: "grey.50", py: { xs: 3, md: 4 } }}>
            <Container component="section">
              <Typography
                variant={isMobile ? "h4" : "h3"}
                align="center"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Estética Facial
              </Typography>
              <Typography
                align="center"
                sx={{ mb: 3, color: "text.secondary" }}
              >
                Tratamientos para limpiar, hidratar, rejuvenecer y renovar tu piel
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {facialTreatments.map((treatment) => (
                  <Grid key={treatment.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleFacialTreatmentClick(treatment)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                          {treatment.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {treatment.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Laser Depilation Section - only show if treatments exist */}
          {laserTreatments.length > 0 && (
            <Box sx={{ py: { xs: 3, md: 4 } }}>
              <Container component="section">
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  align="center"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Depilación Láser
                </Typography>
                <Typography
                  align="center"
                  sx={{ mb: 3, color: "text.secondary" }}
                >
                  Depilación definitiva sin dolor. Zonas y paquetes personalizados
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                  {[
                    { gender: "hombres", label: "Hombres" },
                    { gender: "mujeres", label: "Mujeres" },
                  ].map(({ gender, label }) => (
                    <Grid key={gender} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 3,
                          },
                        }}
                        onClick={() => {
                          setLaserGender(gender);
                          setLaserModalOpen(true);
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
                            {label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                            Ver zonas y paquetes disponibles
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          )}

          {/* Complementarios Section - only show if treatments exist */}
          {complementaryTreatments.length > 0 && (
            <Container component="section" sx={{ py: { xs: 3, md: 4 } }}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                align="center"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Complementarios
              </Typography>
              <Typography
                align="center"
                sx={{ mb: 3, color: "text.secondary" }}
              >
                Otros servicios que no encajan completamente en las categorías anteriores
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {complementaryTreatments.map((treatment) => (
                  <Grid key={treatment.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleFacialTreatmentClick(treatment)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                          {treatment.name}
                        </Typography>
                        {treatment.subtitle && (
                          <Typography variant="body2" color="success.main" gutterBottom>
                            {treatment.subtitle}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {treatment.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          )}
        </>
      )}

      {/* Footer CTA */}
      {isAuthenticated && (
        <Box
          component="section"
          sx={{
            py: { xs: 3, md: 4 },
            textAlign: "center",
            bgcolor: "success.light",
            color: "success.contrastText",
          }}
        >
          <Container>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
              ¿Listo para empezar?
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Selecciona un tratamiento arriba para reservar tu sesión
            </Typography>
          </Container>
        </Box>
      )}

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <PurchaseOptionsDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        treatment={selectedTreatmentForPurchase}
        onConfirm={handlePurchaseConfirm}
      />

      <LaserDepilationModal
        open={laserModalOpen}
        onClose={() => setLaserModalOpen(false)}
        gender={laserGender}
        treatments={laserGender === "hombres" ? laserHombres : laserMujeres}
        isAuthenticated={isAuthenticated}
        onLoginRequired={() => {
          setLaserModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
}
