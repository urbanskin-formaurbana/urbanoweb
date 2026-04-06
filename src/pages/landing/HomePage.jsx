/* eslint-disable no-irregular-whitespace */
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
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
import {useTheme} from "@mui/material/styles";
import appointmentService from "../../services/appointment_service.js";
import paymentService from "../../services/payment_service.js";
import treatmentService from "../../services/treatment_service.js";
import authService from "../../services/auth_service.js";
import {getProductTypes} from "../../services/campaign_service.js";
import LoginModal from "../../components/LoginModal.jsx";
import PurchaseOptionsDialog from "../../components/PurchaseOptionsDialog.jsx";
import CampaignModal from "../../components/CampaignModal.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {isHtml} from "../../utils/richText.js";

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {isAuthenticated, user} = useAuth();
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
  const [selectedTreatmentForPurchase, setSelectedTreatmentForPurchase] =
    useState(null);
  const [campaignModals, setCampaignModals] = useState({}); // Track modal open state for each campaign
  const [campaignProducts, setCampaignProducts] = useState([]); // List of available campaign product types
  const [treatmentsByCategory, setTreatmentsByCategory] = useState({}); // All treatments grouped by category

  useEffect(() => {
    treatmentService
      .getAllTreatments()
      .then((data) => {
        setBodyTreatments(data.filter((t) => t.category === "body"));
        setFacialTreatments(data.filter((t) => t.category === "facial"));
        setComplementaryTreatments(
          data.filter((t) => t.category === "complementarios"),
        );

        // Build map of all treatments by category (including new dynamic categories)
        const byCategory = {};
        data.forEach((t) => {
          if (!byCategory[t.category]) {
            byCategory[t.category] = [];
          }
          byCategory[t.category].push(t);
        });
        setTreatmentsByCategory(byCategory);

        // Fetch campaign product types from backend (with product_label and product_description)
        getProductTypes()
          .then((types) => {
            // Filter out dedicated sections to prevent duplicates
            const DEDICATED_SECTIONS = ["body", "facial", "complementarios"];
            setCampaignProducts(
              types.filter((t) => !DEDICATED_SECTIONS.includes(t.product_type)),
            );
          })
          .catch((err) => console.error("Error loading product types:", err));
      })
      .catch((err) => {
        console.error("Error loading treatments:", err);
        setTreatmentsError("No se pudieron cargar los tratamientos.");
      })
      .finally(() => setTreatmentsLoading(false));
  }, []);

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
      const existingAppointment =
        await appointmentService.getCustomerAppointments();
      if (existingAppointment) {
        navigate("/my-appointments");
        return;
      }

      const unscheduledPayment = await paymentService.getUnscheduledPayment();
      if (unscheduledPayment) {
        paymentService.savePaymentId(unscheduledPayment._id);
        navigate("/schedule", {
          state: {
            treatment: {
              name: selectedTreatmentForPurchase.name,
              slug: selectedTreatmentForPurchase.slug,
            },
          },
        });
        return;
      }

      navigate("/payment", {
        state: {
          treatment: {
            name: selectedTreatmentForPurchase.name,
            slug: selectedTreatmentForPurchase.slug,
          },
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
      const existingAppointment =
        await appointmentService.getCustomerAppointments();

      if (existingAppointment) {
        // Customer has pending or confirmed appointment
        navigate("/my-appointments");
      } else {
        // No existing appointment - check if customer already paid but hasn't scheduled yet
        const unscheduledPayment = await paymentService.getUnscheduledPayment();
        if (unscheduledPayment) {
          // Customer paid but didn't schedule - skip payment, go directly to scheduling
          paymentService.savePaymentId(unscheduledPayment._id);
          navigate("/schedule", {
            state: {
              treatment: {name: treatment.name, slug: treatment.slug},
              productType: "facial",
            },
          });
        } else {
          // No payment or payment already has appointment - proceed to payment
          navigate("/payment", {
            state: {
              treatment: {name: treatment.name, slug: treatment.slug},
              productType: "facial",
            },
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
          py: {xs: 2, md: 4},
        }}
      >
        <Container>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            sx={{fontWeight: "bold"}}
            gutterBottom
          >
            FORMA Urbana
          </Typography>
          <Typography variant="h5" gutterBottom>
            Más que una estética facial y corporal
          </Typography>
          <Typography sx={{mb: 3}}>
            Tratamientos no invasivos en Montevideo Centro. Sin cirugías. Sin
            agujas. Resultados reales.
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => setLoginModalOpen(true)}
              sx={{fontWeight: "bold"}}
            >
              Iniciá sesión para reservar
            </Button>
          )}
        </Container>
      </Box>

      {/* Loading State */}
      {treatmentsLoading && (
        <Container
          component="section"
          sx={{py: {xs: 4, md: 6}, textAlign: "center"}}
        >
          <CircularProgress />
        </Container>
      )}

      {/* Error State */}
      {treatmentsError && !treatmentsLoading && (
        <Container component="section" sx={{py: {xs: 3, md: 4}}}>
          <Alert severity="error">{treatmentsError}</Alert>
        </Container>
      )}

      {/* Body Treatments Section */}
      {!treatmentsLoading && !treatmentsError && (
        <>
          <Container
            component="section"
            id="estetica-corporal"
            sx={{py: {xs: 3, md: 4}}}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              align="center"
              gutterBottom
              sx={{mb: 3}}
            >
              Estética Corporal
            </Typography>
            <Typography align="center" sx={{mb: 3, color: "text.secondary"}}>
              Tecnología no invasiva para reducir contorno, tonificar músculo y
              reafirmar piel
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              {bodyTreatments.map((treatment) => (
                <Grid key={treatment.slug} size={{xs: 12, sm: 6, md: 4}}>
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: {xs: "column", sm: "row"},
                      }}
                    >
                      {treatment.image_url && (
                        <Box
                          component="img"
                          src={treatment.image_url}
                          alt={treatment.name}
                          sx={{
                            width: {xs: "100%", sm: 200},
                            height: {xs: 180, sm: "auto"},
                            objectFit: "cover",
                            flexShrink: 0,
                            borderRadius: {
                              xs: "4px 4px 0 0",
                              sm: "4px 0 0 4px",
                            },
                          }}
                        />
                      )}
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{fontWeight: "bold"}}
                        >
                          {treatment.name}
                        </Typography>
                        {treatment.subtitle && (
                          <Typography
                            variant="body2"
                            color="success.main"
                            gutterBottom
                          >
                            {treatment.subtitle}
                          </Typography>
                        )}
                        {treatment.description &&
                          (isHtml(treatment.description) ? (
                            <Box
                              component="div"
                              dangerouslySetInnerHTML={{
                                __html: treatment.description,
                              }}
                              sx={{
                                fontSize: "0.875rem",
                                color: "text.secondary",
                                mb: 1,
                                "& p": {mt: 0, mb: 0.5},
                                "& ul, & ol": {pl: 2, mt: 0},
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{mb: 1}}
                            >
                              {treatment.description}
                            </Typography>
                          ))}
                        <Typography
                          variant="body2"
                          sx={{fontWeight: "medium", mt: "auto"}}
                        >
                          Precio: ${treatment.price}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Facial Treatments Section */}
          <Box sx={{bgcolor: "grey.50", py: {xs: 3, md: 4}}}>
            <Container component="section" id="estetica-facial">
              <Typography
                variant={isMobile ? "h4" : "h3"}
                align="center"
                gutterBottom
                sx={{mb: 3}}
              >
                Estética Facial
              </Typography>
              <Typography align="center" sx={{mb: 3, color: "text.secondary"}}>
                Tratamientos para limpiar, hidratar, rejuvenecer y renovar tu
                piel
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {facialTreatments.map((treatment) => (
                  <Grid key={treatment.slug} size={{xs: 12, sm: 6, md: 4}}>
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
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: {xs: "column", sm: "row"},
                        }}
                      >
                        {treatment.image_url && (
                          <Box
                            component="img"
                            src={treatment.image_url}
                            alt={treatment.name}
                            sx={{
                              width: {xs: "100%", sm: 200},
                              height: {xs: 180, sm: "auto"},
                              objectFit: "cover",
                              flexShrink: 0,
                              borderRadius: {
                                xs: "4px 4px 0 0",
                                sm: "4px 0 0 4px",
                              },
                            }}
                          />
                        )}
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{fontWeight: "bold"}}
                          >
                            {treatment.name}
                          </Typography>
                          {treatment.description &&
                            (isHtml(treatment.description) ? (
                              <Box
                                component="div"
                                dangerouslySetInnerHTML={{
                                  __html: treatment.description,
                                }}
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                  mb: 1,
                                  "& p": {mt: 0, mb: 0.5},
                                  "& ul, & ol": {pl: 2, mt: 0},
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{mb: 1}}
                              >
                                {treatment.description}
                              </Typography>
                            ))}
                          <Typography
                            variant="body2"
                            sx={{fontWeight: "medium", mt: "auto"}}
                          >
                            Precio: ${treatment.price}
                          </Typography>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Dynamic Campaign Sections */}
          {campaignProducts.map((campaign) => {
            const productType = campaign.product_type;
            const campaignTreatments = treatmentsByCategory[productType] || [];

            if (campaignTreatments.length === 0) return null;

            // Check if this campaign has gender-specific treatments
            const hasGenderSplit = campaignTreatments.some((t) => t.gender);

            return (
              <Box key={productType} id={productType} sx={{py: {xs: 3, md: 4}}}>
                <Container component="section">
                  {campaign.image_url && (
                    <Box
                      component="img"
                      src={campaign.image_url}
                      alt={campaign.product_label}
                      sx={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 1,
                        mb: 3,
                        display: "block",
                      }}
                    />
                  )}
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    align="center"
                    gutterBottom
                    sx={{mb: 3}}
                  >
                    {campaign.product_label ||
                      productType.charAt(0).toUpperCase() +
                        productType.slice(1)}
                  </Typography>
                  {campaign.product_description &&
                    (isHtml(campaign.product_description) ? (
                      <Box
                        component="div"
                        dangerouslySetInnerHTML={{
                          __html: campaign.product_description,
                        }}
                        sx={{
                          mb: 3,
                          color: "text.secondary",
                          textAlign: "center",
                          "& p": {mt: 0, mb: 0.5},
                          "& ul, & ol": {
                            display: "inline-block",
                            textAlign: "left",
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        align="center"
                        sx={{mb: 3, color: "text.secondary"}}
                      >
                        {campaign.product_description}
                      </Typography>
                    ))}

                  {/* Calculate minimum price for this campaign */}
                  {(() => {
                    // For gender-split, calculate min price per gender; otherwise overall min
                    const getMinPriceByGender = (gender) => {
                      const genderTreatments = campaignTreatments.filter((t) => t.gender === gender);
                      if (genderTreatments.length === 0) return null;
                      const minPrice = Math.min(...genderTreatments.map((t) => t.price || Infinity));
                      return minPrice === Infinity ? null : minPrice;
                    };

                    const overallMinPrice = (() => {
                      const minPrice = Math.min(
                        ...campaignTreatments.map((t) => t.price || Infinity),
                      );
                      return minPrice === Infinity ? null : minPrice;
                    })();

                    return (
                      <Grid container spacing={3} justifyContent="center">
                        {hasGenderSplit ? (
                          [
                            {gender: "hombres", label: "Hombres"},
                            {gender: "mujeres", label: "Mujeres"},
                          ].map(({gender, label}) => {
                            const genderMinPrice = getMinPriceByGender(gender);
                            return (
                              <Grid key={gender} size={{xs: 12, sm: 6, md: 4}}>
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
                                    setCampaignModals((prev) => ({
                                      ...prev,
                                      [`${productType}-${gender}`]: true,
                                    }));
                                  }}
                                >
                                  <CardContent
                                    sx={{
                                      flexGrow: 1,
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      gutterBottom
                                      sx={{
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      {label}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{textAlign: "center", mb: 1}}
                                    >
                                      Ver zonas y paquetes disponibles
                                    </Typography>
                                    {genderMinPrice && (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: "medium",
                                          textAlign: "center",
                                          mt: "auto",
                                        }}
                                      >
                                        Desde: ${genderMinPrice}
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })
                        ) : (
                          <Grid size={{xs: 12, sm: 6, md: 4}}>
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
                                setCampaignModals((prev) => ({
                                  ...prev,
                                  [productType]: true,
                                }));
                              }}
                            >
                              <CardContent
                                sx={{
                                  flexGrow: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  gutterBottom
                                  sx={{fontWeight: "bold", textAlign: "center"}}
                                >
                                  Consultar disponibilidad
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{textAlign: "center", mb: 1}}
                                >
                                  Zonas y paquetes personalizados
                                </Typography>
                                {overallMinPrice && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: "medium",
                                      textAlign: "center",
                                      mt: "auto",
                                    }}
                                  >
                                    Desde: ${overallMinPrice}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    );
                  })()}
                </Container>
              </Box>
            );
          })}

          {/* Complementarios Section - only show if treatments exist */}
          {complementaryTreatments.length > 0 && (
            <Container
              component="section"
              id="complementarios"
              sx={{py: {xs: 3, md: 4}}}
            >
              <Typography
                variant={isMobile ? "h4" : "h3"}
                align="center"
                gutterBottom
                sx={{mb: 3}}
              >
                Complementarios
              </Typography>
              <Typography align="center" sx={{mb: 3, color: "text.secondary"}}>
                Otros servicios que no encajan completamente en las categorías
                anteriores
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {complementaryTreatments.map((treatment) => (
                  <Grid key={treatment.slug} size={{xs: 12, sm: 6, md: 4}}>
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
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: {xs: "column", sm: "row"},
                        }}
                      >
                        {treatment.image_url && (
                          <Box
                            component="img"
                            src={treatment.image_url}
                            alt={treatment.name}
                            sx={{
                              width: {xs: "100%", sm: 200},
                              height: {xs: 180, sm: "auto"},
                              objectFit: "cover",
                              flexShrink: 0,
                              borderRadius: {
                                xs: "4px 4px 0 0",
                                sm: "4px 0 0 4px",
                              },
                            }}
                          />
                        )}
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{fontWeight: "bold"}}
                          >
                            {treatment.name}
                          </Typography>
                          {treatment.subtitle && (
                            <Typography
                              variant="body2"
                              color="success.main"
                              gutterBottom
                            >
                              {treatment.subtitle}
                            </Typography>
                          )}
                          {treatment.description &&
                            (isHtml(treatment.description) ? (
                              <Box
                                component="div"
                                dangerouslySetInnerHTML={{
                                  __html: treatment.description,
                                }}
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                  mb: 1,
                                  "& p": {mt: 0, mb: 0.5},
                                  "& ul, & ol": {pl: 2, mt: 0},
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{mb: 1}}
                              >
                                {treatment.description}
                              </Typography>
                            ))}
                          <Typography
                            variant="body2"
                            sx={{fontWeight: "medium", mt: "auto"}}
                          >
                            Precio: ${treatment.price}
                          </Typography>
                        </CardContent>
                      </Box>
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
            py: {xs: 3, md: 4},
            textAlign: "center",
            bgcolor: "success.light",
            color: "success.contrastText",
          }}
        >
          <Container>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
              ¿Listo para empezar?
            </Typography>
            <Typography sx={{mb: 2}}>
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

      {/* Dynamic Campaign Modals */}
      {campaignProducts.map((campaign) => {
        const productType = campaign.product_type;
        const label =
          campaign.product_label ||
          productType.charAt(0).toUpperCase() + productType.slice(1);
        const campaignTreatments = treatmentsByCategory[productType] || [];

        const hasGenderSplit = campaignTreatments.some((t) => t.gender);

        if (hasGenderSplit) {
          return (
            <Box key={productType}>
              {["hombres", "mujeres"].map((gender) => {
                const modalKey = `${productType}-${gender}`;
                const isOpen = campaignModals[modalKey] || false;
                const treatments = campaignTreatments.filter(
                  (t) => t.gender === gender,
                );

                return (
                  <CampaignModal
                    key={modalKey}
                    open={isOpen}
                    onClose={() => {
                      setCampaignModals((prev) => ({
                        ...prev,
                        [modalKey]: false,
                      }));
                    }}
                    gender={gender}
                    treatments={treatments}
                    isAuthenticated={isAuthenticated}
                    onLoginRequired={() => {
                      setCampaignModals((prev) => ({
                        ...prev,
                        [modalKey]: false,
                      }));
                      setLoginModalOpen(true);
                    }}
                    productType={productType}
                    modalTitle={`${label} - ${gender === "hombres" ? "Hombres" : "Mujeres"}`}
                  />
                );
              })}
            </Box>
          );
        } else {
          const modalKey = productType;
          const isOpen = campaignModals[modalKey] || false;

          return (
            <CampaignModal
              key={modalKey}
              open={isOpen}
              onClose={() => {
                setCampaignModals((prev) => ({
                  ...prev,
                  [modalKey]: false,
                }));
              }}
              treatments={campaignTreatments}
              isAuthenticated={isAuthenticated}
              onLoginRequired={() => {
                setCampaignModals((prev) => ({
                  ...prev,
                  [modalKey]: false,
                }));
                setLoginModalOpen(true);
              }}
              productType={productType}
              modalTitle={label}
            />
          );
        }
      })}
    </>
  );
}
