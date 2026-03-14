import {useState, useEffect} from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Stack,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import LoginModal from "../../components/LoginModal";
import PhoneCountryInput from "../../components/PhoneCountryInput";
import authService from "../../services/auth_service";
import paymentService from "../../services/payment_service";
import appointmentService from "../../services/appointment_service";
import treatmentService from "../../services/treatment_service";
import MercadoPagoBrick from "../../components/MercadoPagoBrick";
import {extractCountryAndPhone} from "../../utils/countries";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, loading} = useAuth();
  const MP_FEE_RATE = 0.0729; // MercadoPago effective fee ~7.29% for Uruguay (for display only)
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle | processing | approved | rejected | error
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [basePrice, setBasePrice] = useState(null); // from DB
  const [totalPrice, setTotalPrice] = useState(null); // with fee applied
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    cedula: "",
    email: "",
    whatsappPhone: "",
  });
  const [profileLocked, setProfileLocked] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [fieldsFromDB, setFieldsFromDB] = useState(new Set()); // Track fields loaded from DB
  const [treatmentDescription, setTreatmentDescription] = useState(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [treatment, setTreatment] = useState(
    location.state?.treatment || {
      name: "Evaluación",
      slug: "evaluation",
    }
  );
  const selectedPackageId = location.state?.selectedPackageId || null;
  const isEvaluation = location.state?.isEvaluation ?? false;

  // Load treatment description and price from DB
  useEffect(() => {
    if (treatment.slug && treatment.slug !== "evaluation") {
      setLoadingDescription(true);
      treatmentService
        .getTreatmentPackages(treatment.slug)
        .then((data) => {
          // Update treatment with duration from API
          setTreatment((prev) => ({
            ...prev,
            duration_minutes: data?.duration_minutes || 90,
          }));

          // If evaluation, use evaluation description; otherwise use treatment description
          if (isEvaluation) {
            setTreatmentDescription(
              "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti. Esta sesión de evaluación no garantiza el inicio de un tratamiento con nosotros."
            );
          } else if (data?.description) {
            setTreatmentDescription(data.description);
          }

          // If evaluation, use evaluation_price; if package selected, use package price; otherwise use single session price
          if (isEvaluation && data?.evaluation_price != null) {
            const base = data.evaluation_price;
            setBasePrice(base);
            setTotalPrice(Math.round((base / (1 - MP_FEE_RATE)) * 100) / 100);
          } else if (selectedPackageId && data?.packages) {
            const pkg = data.packages.find((p) => p.id === selectedPackageId);
            if (pkg) {
              setBasePrice(pkg.price);
              setTotalPrice(
                Math.round((pkg.price / (1 - MP_FEE_RATE)) * 100) / 100,
              );
            }
          } else if (data?.single_session_price != null) {
            const base = data.single_session_price;
            setBasePrice(base);
            setTotalPrice(Math.round((base / (1 - MP_FEE_RATE)) * 100) / 100);
          }
        })
        .catch(() => {
          // Non-fatal: description and price just won't display
        })
        .finally(() => setLoadingDescription(false));
    } else if (treatment.slug === "evaluation") {
      setTreatmentDescription(
        "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti. Esta sesión de evaluación no garantiza el inicio de un tratamiento con nosotros."
      );
    }
  }, [treatment.slug, selectedPackageId, isEvaluation]);

  useEffect(() => {
    if (paymentStatus === "approved") {
      const timer = setTimeout(() => {
        navigate("/schedule", {state: {treatment}});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate, treatment]);

  // Redirect employees to admin panel
  useEffect(() => {
    if (!loading && user?.user_type === "employee") {
      navigate("/admin");
    }
  }, [loading, user, navigate]);

  // Show login modal only on initial mount if user is not authenticated (and not still loading)
  useEffect(() => {
    if (!loading && !user) {
      setShowLoginModal(true);
    }
  }, [loading, user]);

  // Check for existing appointments and completed payments when user is authenticated
  // Also check after login modal closes to ensure context is fully loaded
  // Only check for customers, not employees
  useEffect(() => {
    if (!loading && user && !showLoginModal && user?.user_type !== "employee") {
      // First check if user has an existing appointment (pending or confirmed)
      appointmentService
        .getCustomerAppointments()
        .then((appointment) => {
          if (appointment) {
            // User has an existing appointment, redirect to view it
            navigate("/existing-appointment", {state: {appointment}});
          } else {
            // No existing appointment, check for completed payment without appointment
            return paymentService.getUnscheduledPayment();
          }
        })
        .then((payment) => {
          if (payment) {
            paymentService.savePaymentId(payment._id);
            navigate("/schedule", {state: {treatment, isEvaluation}});
          }
        })
        .catch(() => {}); // Fail silently
    }
  }, [loading, user, showLoginModal, navigate, treatment]);

  // Fetch profile data when user is loaded
  useEffect(() => {
    if (!loading && user) {
      setProfileLoading(true);
      authService
        .getCurrentUser()
        .then((profile) => {
          const fieldsLoaded = new Set();

          // Track which fields have values from DB
          if (profile.first_name) fieldsLoaded.add("firstName");
          if (profile.last_name) fieldsLoaded.add("lastName");
          if (profile.birth_date) fieldsLoaded.add("birthDate");
          if (profile.cedula) fieldsLoaded.add("cedula");
          if (profile.email) fieldsLoaded.add("email");
          if (profile.whatsapp_phone) fieldsLoaded.add("whatsappPhone");

          setProfileData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            birthDate: profile.birth_date || "",
            cedula: profile.cedula || "",
            email: profile.email || "",
            whatsappPhone: profile.whatsapp_phone || "",
          });
          setFieldsFromDB(fieldsLoaded);
          // Don't set profileLocked here - it's only set after successful payment
        })
        .catch(() => {
          // Non-fatal: user will fill the form manually
        })
        .finally(() => setProfileLoading(false));
    }
  }, [loading, user]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
      return "El número de WhatsApp es requerido";
    }

    // Extract country and phone to get expected digit count
    const {country, phoneNumber} = extractCountryAndPhone(phone);
    const digits = phoneNumber.replace(/\D/g, "");
    const expectedLength = country.phoneLength;

    if (digits.length < expectedLength) {
      return `Ingresa exactamente ${expectedLength} dígitos para ${country.name} (tienes ${digits.length})`;
    }
    if (digits.length > expectedLength) {
      return `El número no puede exceder ${expectedLength} dígitos para ${country.name}`;
    }
    return "";
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.firstName.trim())
      errs.firstName = "El nombre es requerido";
    if (!profileData.lastName.trim())
      errs.lastName = "El apellido es requerido";
    if (!profileData.birthDate)
      errs.birthDate = "La fecha de nacimiento es requerida";
    if (!profileData.cedula.trim()) errs.cedula = "La cédula es requerida";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim()) {
      errs.email = "El correo electrónico es requerido";
    } else if (!emailRegex.test(profileData.email.trim())) {
      errs.email = "Ingresa un correo electrónico válido";
    }

    // WhatsApp phone validation
    const phoneError = validatePhoneNumber(profileData.whatsappPhone);
    if (phoneError) {
      errs.whatsappPhone = phoneError;
    }

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Show Wallet Brick when user is ready to pay
  const handleShowCardPayment = async () => {
    if (!validateProfile()) return;

    setError("");

    try {
      // WhatsApp phone is already in correct format from PhoneCountryInput component
      // Save profile data (always save, backend is idempotent)
      await authService.updateProfile({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        birth_date: profileData.birthDate,
        cedula: profileData.cedula.trim(),
        email: profileData.email.trim(),
        whatsapp_phone: profileData.whatsappPhone,
      });

      // Create MercadoPago preference for Checkout Pro
      const preference_request = {
        treatment_id: treatment.slug,
        customer_name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`,
        customer_email: profileData.email.trim(),
        customer_phone: profileData.whatsappPhone,
        is_evaluation: isEvaluation,
      };

      // Add package_id if purchasing a cuponera
      if (selectedPackageId) {
        preference_request.package_id = selectedPackageId;
      }

      const {preference_id} =
        await paymentService.createPaymentPreference(preference_request);

      setPreferenceId(preference_id);
      setPaymentStatus("payment_ready");
    } catch (err) {
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized") ||
        err.message?.includes("token")
      ) {
        setShowLoginModal(true);
      } else {
        setError(err.message || "Error al preparar el pago. Intenta de nuevo.");
      }
    }
  };

  const handlePaymentSuccess = (paymentId) => {
    paymentService.savePaymentId(paymentId);
    setProfileLocked(true); // Gray out all fields after payment success
    setPaymentStatus("approved");
  };

  const handlePaymentError = (err) => {
    console.error("Payment error:", err);
    // Extract meaningful error message
    const errorMsg =
      err?.message || "Error al procesar el pago. Por favor intenta de nuevo.";
    setError(errorMsg);
    // Keep status as 'payment_ready' so the form stays visible with the error above it
    setPaymentStatus("payment_ready");
  };

  const isProfileComplete = () => {
    return (
      profileData.firstName.trim() &&
      profileData.lastName.trim() &&
      profileData.birthDate &&
      profileData.cedula.trim() &&
      profileData.email.trim() &&
      profileData.whatsappPhone.trim()
    );
  };

  // A field is locked (grayed out) if:
  // 1. Profile is locked (payment successful)
  // 2. OR it's an auth-provided field (email from Google, phone from WhatsApp)
  // 3. OR it was loaded from DB (has a value from database)
  const isFieldLocked = (fieldName) => {
    if (profileLoading || paymentStatus === "processing") return true;
    if (profileLocked) return true; // All fields grayed after payment success

    // Auth-provided fields are grayed
    if (fieldName === "email" && user?.auth_method === "google") return true;
    if (fieldName === "phone" && user?.auth_method === "whatsapp") return true;

    // Fields loaded from DB are grayed
    if (fieldsFromDB.has(fieldName)) return true;

    return false;
  };

  const steps = ["Autenticación", "Pago", "Agendar cita"];

  return (
    <>
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      <Container>
        {/* Treatment Description Section */}
        {treatmentDescription && !loadingDescription && (
          <Card sx={{mb: 3, bgcolor: "info.light"}}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{fontWeight: "bold", color: "info.main"}}
              >
                Sobre este tratamiento
              </Typography>
              <Typography variant="body2">{treatmentDescription}</Typography>
            </CardContent>
          </Card>
        )}

        {loadingDescription && (
          <Box sx={{display: "flex", justifyContent: "center", mb: 3}}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Stepper activeStep={1} sx={{mb: 2}}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Payment Summary */}
        <Card sx={{mb: 3, border: "2px solid", borderColor: "success.main"}}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{fontWeight: "bold"}}>
              Resumen de pago
            </Typography>
            <Stack spacing={1} sx={{mt: 1}}>
              <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="body1">
                  {isEvaluation ? `Sesión de evaluación — ${treatment.name}` : treatment.name}
                </Typography>
                <Typography variant="body1" sx={{whiteSpace: "nowrap"}}>
                  {basePrice != null ? `$${basePrice}` : "..."}
                </Typography>
              </Box>
              <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="body2" color="text.secondary">
                  Costo de procesamiento
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{whiteSpace: "nowrap"}}
                >
                  {totalPrice != null && basePrice != null
                    ? `$${(totalPrice - basePrice).toFixed(2)}`
                    : "..."}
                </Typography>
              </Box>
              <Box
                sx={{pt: 1, borderTop: "1px solid", borderColor: "divider"}}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{fontWeight: "bold"}}>
                  Total
                </Typography>
                <Typography
                  variant="h5"
                  color="success.main"
                  sx={{fontWeight: "bold", whiteSpace: "nowrap"}}
                >
                  {totalPrice != null ? (
                    `$${totalPrice} UYU`
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Personal Data Section */}
        {paymentStatus !== "approved" && paymentStatus !== "pending" && (
          <Card sx={{mb: 3}}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{fontWeight: "bold", mb: 2}}
              >
                Tus datos personales
              </Typography>

              {profileLocked && (
                <Alert severity="success" sx={{mb: 2}}>
                  Tus datos personales ya están guardados.
                </Alert>
              )}

              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      label="Nombre"
                      value={profileData.firstName}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }));
                        if (profileErrors.firstName)
                          setProfileErrors((prev) => ({
                            ...prev,
                            firstName: "",
                          }));
                      }}
                      error={!!profileErrors.firstName}
                      helperText={profileErrors.firstName}
                      fullWidth
                      disabled={isFieldLocked("firstName")}
                      slotProps={{
                        input: {readOnly: isFieldLocked("firstName")},
                      }}
                      sx={
                        isFieldLocked("firstName")
                          ? {
                              "& .MuiInputBase-root": {
                                bgcolor: "action.disabledBackground",
                              },
                            }
                          : {}
                      }
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      label="Apellido"
                      value={profileData.lastName}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }));
                        if (profileErrors.lastName)
                          setProfileErrors((prev) => ({...prev, lastName: ""}));
                      }}
                      error={!!profileErrors.lastName}
                      helperText={profileErrors.lastName}
                      fullWidth
                      disabled={isFieldLocked("lastName")}
                      slotProps={{input: {readOnly: isFieldLocked("lastName")}}}
                      sx={
                        isFieldLocked("lastName")
                          ? {
                              "& .MuiInputBase-root": {
                                bgcolor: "action.disabledBackground",
                              },
                            }
                          : {}
                      }
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      label="Fecha de nacimiento"
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          birthDate: e.target.value,
                        }));
                        if (profileErrors.birthDate)
                          setProfileErrors((prev) => ({
                            ...prev,
                            birthDate: "",
                          }));
                      }}
                      error={!!profileErrors.birthDate}
                      helperText={profileErrors.birthDate}
                      fullWidth
                      disabled={isFieldLocked("birthDate")}
                      slotProps={{
                        input: {readOnly: isFieldLocked("birthDate")},
                        inputLabel: {shrink: true},
                        htmlInput: {
                          max: new Date().toISOString().split("T")[0],
                        },
                      }}
                      sx={
                        isFieldLocked("birthDate")
                          ? {
                              "& .MuiInputBase-root": {
                                bgcolor: "action.disabledBackground",
                              },
                            }
                          : {}
                      }
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      label="Cédula de identidad"
                      placeholder="1.234.567-8"
                      value={profileData.cedula}
                      onChange={(e) => {
                        // Extract only digits
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8);

                        // Format as X.XXX.XXX-X
                        let formatted = "";
                        if (digits.length > 0) {
                          formatted = digits.slice(0, 1);
                        }
                        if (digits.length > 1) {
                          formatted += "." + digits.slice(1, 4);
                        }
                        if (digits.length > 4) {
                          formatted += "." + digits.slice(4, 7);
                        }
                        if (digits.length > 7) {
                          formatted += "-" + digits.slice(7, 8);
                        }

                        setProfileData((prev) => ({
                          ...prev,
                          cedula: formatted,
                        }));
                        if (profileErrors.cedula)
                          setProfileErrors((prev) => ({...prev, cedula: ""}));
                      }}
                      error={!!profileErrors.cedula}
                      helperText={profileErrors.cedula}
                      fullWidth
                      disabled={isFieldLocked("cedula")}
                      slotProps={{
                        input: {readOnly: isFieldLocked("cedula")},
                        htmlInput: {inputMode: "numeric"},
                      }}
                      sx={
                        isFieldLocked("cedula")
                          ? {
                              "& .MuiInputBase-root": {
                                bgcolor: "action.disabledBackground",
                              },
                            }
                          : {}
                      }
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{xs: 12, sm: 12}}>
                    <PhoneCountryInput
                      value={profileData.whatsappPhone}
                      onChange={(newPhone) => {
                        setProfileData((prev) => ({
                          ...prev,
                          whatsappPhone: newPhone,
                        }));
                        // Real-time validation as user types
                        const phoneError = validatePhoneNumber(newPhone);
                        setProfileErrors((prev) => ({
                          ...prev,
                          whatsappPhone: phoneError,
                        }));
                      }}
                      error={!!profileErrors.whatsappPhone}
                      helperText={profileErrors.whatsappPhone}
                      disabled={isFieldLocked("whatsappPhone")}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      label="Correo electrónico"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        if (profileErrors.email)
                          setProfileErrors((prev) => ({...prev, email: ""}));
                      }}
                      error={!!profileErrors.email}
                      helperText={profileErrors.email}
                      fullWidth
                      disabled={isFieldLocked("email")}
                      slotProps={{
                        input: {readOnly: isFieldLocked("email")},
                      }}
                      sx={
                        isFieldLocked("email")
                          ? {
                              "& .MuiInputBase-root": {
                                bgcolor: "action.disabledBackground",
                              },
                            }
                          : {}
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Status feedback */}
        {paymentStatus === "approved" && (
          <Card sx={{mb: 3, bgcolor: "success.light"}}>
            <CardContent sx={{textAlign: "center"}}>
              <CheckCircleIcon
                sx={{fontSize: 48, color: "success.main", mb: 1}}
              />
              <Typography
                variant="h6"
                sx={{fontWeight: "bold", color: "success.main"}}
              >
                ¡Pago aprobado!
              </Typography>
              <Typography variant="body2" sx={{mt: 1}}>
                Redirigiendo para agendar tu cita...
              </Typography>
            </CardContent>
          </Card>
        )}

        {paymentStatus === "pending" && (
          <Card sx={{mb: 3, bgcolor: "info.light"}}>
            <CardContent sx={{textAlign: "center"}}>
              <CheckCircleIcon sx={{fontSize: 48, color: "info.main", mb: 1}} />
              <Typography
                variant="h6"
                sx={{fontWeight: "bold", color: "info.main"}}
              >
                Pago en verificación
              </Typography>
              <Typography variant="body2" sx={{mt: 1, mb: 2}}>
                Tu pago está siendo verificado. Puede tomar unos minutos.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/schedule", {state: {treatment}})}
              >
                Continuar para agendar cita
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Payment Section */}
        {paymentStatus !== "approved" && paymentStatus !== "pending" && (
          <Card
            sx={{
              ...(paymentStatus === "payment_ready" && {
                mx: {xs: -2, sm: 0},
                borderRadius: {xs: 0, sm: 2},
              }),
            }}
          >
            <CardContent sx={{m: -2}}>
              {paymentStatus === "payment_ready" ? (
                <>
                  {error && (
                    <Alert
                      severity="error"
                      sx={{mb: 3}}
                      icon={<ErrorOutlineIcon />}
                    >
                      {error}
                    </Alert>
                  )}
                  <MercadoPagoBrick
                    key="payment-brick"
                    preferenceId={preferenceId}
                    amount={totalPrice}
                    treatmentId={treatment.slug}
                    packageId={selectedPackageId}
                    payerEmail={profileData.email}
                    isEvaluation={isEvaluation}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    sx={{m: 2, color: "text.secondary"}}
                  >
                    Haz clic en "Pagar ahora" para ingresar los datos de tu
                    tarjeta de crédito/débito de forma segura.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleShowCardPayment}
                    disabled={
                      profileLoading ||
                      !isProfileComplete() ||
                      totalPrice == null ||
                      !!profileErrors.whatsappPhone
                    }
                    sx={{
                      display: "block",
                      width: "calc(100% - 32px)",
                      my: 2,
                      mx: 2,
                    }}
                  >
                    {profileLoading ? "Preparando..." : "Pagar ahora"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back button — only before payment is approved or pending */}
        {paymentStatus !== "approved" && paymentStatus !== "pending" && (
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={paymentStatus === "processing"}
            sx={{mt: 4}}
          >
            Atrás
          </Button>
        )}
      </Container>
    </>
  );
}
