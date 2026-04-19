import {useState, useEffect} from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import {useBusiness} from "../../contexts/BusinessContext";
import LoginModal from "../../components/LoginModal";
import PhoneCountryInput from "../../components/PhoneCountryInput";
import authService from "../../services/auth_service";
import paymentService from "../../services/payment_service";
import appointmentService from "../../services/appointment_service";
import treatmentService from "../../services/treatment_service";
import MercadoPagoBrick from "../../components/MercadoPagoBrick";
import FlowStepper from "../../components/booking/FlowStepper.jsx";
import {extractCountryAndPhone} from "../../utils/countries";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import bankService from "../../services/bank_service";
import transferReceiptStore from "../../utils/transferReceiptStore";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const DEFAULT_DEPOSIT_AMOUNT = 500;
const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const DOW_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function getValidDepositAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_DEPOSIT_AMOUNT;
  return parsed;
}

function formatMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  if (Number.isInteger(parsed)) return parsed.toString();
  return parsed.toFixed(2);
}

function formatLongDate(dateStr) {
  if (!dateStr) return "—";
  const d = dayjs(dateStr);
  return `${DOW_ES[d.day()]} ${d.date()} de ${MONTHS_ES[d.month()]}`;
}

function paymentLabel(m) {
  return (
    {
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
      efectivo: "Efectivo en clínica",
      deposito: `Seña $${DEFAULT_DEPOSIT_AMOUNT} + resto en clínica`,
    }[m] || m
  );
}

// Lockable field matching handoff fu-locked-value / fu-input
function LockableField({
  label,
  value,
  onChange,
  locked,
  error,
  type = "text",
  placeholder,
  children,
}) {
  const lockedStyle = {
    bgcolor: "#fafaf7",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    p: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 1,
    minHeight: 44,
  };
  return (
    <Box>
      <Typography
        sx={{fontSize: 13, fontWeight: 600, color: "#141414", mb: 0.5}}
      >
        {label}
      </Typography>
      {locked ? (
        <Box sx={lockedStyle}>
          <LockIcon sx={{fontSize: 15, color: "#8a8a8a", flexShrink: 0}} />
          <Typography sx={{fontSize: 14, color: "#5b5b5b"}}>
            {value || "—"}
          </Typography>
        </Box>
      ) : children ? (
        children
      ) : (
        <Box>
          <Box
            component="input"
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            sx={{
              width: "100%",
              p: "10px 14px",
              fontSize: 14,
              fontFamily: "'Work Sans'",
              border: "1px solid",
              borderColor: error ? "#b42a2a" : "#e0e0e0",
              borderRadius: "8px",
              outline: "none",
              bgcolor: "#fff",
              color: "#141414",
              boxSizing: "border-box",
              "&:focus": {
                borderColor: "#2e7d32",
                boxShadow: "0 0 0 3px rgba(46,125,50,0.12)",
              },
            }}
          />
          {error && (
            <Typography sx={{fontSize: 12, color: "#b42a2a", mt: 0.5}}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// Payment method radio row
function PaymentRadio({
  method,
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  pill,
}) {
  const active = selected === method;
  return (
    <Box
      onClick={() => onSelect(method)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        border: "1.5px solid",
        borderColor: active ? "#2e7d32" : "#e0e0e0",
        borderRadius: "8px",
        bgcolor: active ? "#f2f8f3" : "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
        mb: 1.5,
        "&:hover": {borderColor: "#2e7d32"},
      }}
    >
      {/* pip */}
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: active ? "#2e7d32" : "#bdbdbd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {active && (
          <Box
            sx={{width: 8, height: 8, borderRadius: "50%", bgcolor: "#2e7d32"}}
          />
        )}
      </Box>
      <Box sx={{flex: 1}}>
        <Box sx={{display: "flex", alignItems: "center", gap: 0.75, mb: 0.25}}>
          {icon}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "#141414",
              fontFamily: "'Work Sans'",
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 13, color: "#5b5b5b"}}>
          {subtitle}
        </Typography>
      </Box>
      {pill && (
        <Box
          sx={{
            bgcolor: "#e4f0e5",
            color: "#14331b",
            fontSize: 11,
            fontWeight: 700,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {pill}
        </Box>
      )}
    </Box>
  );
}

const panelSx = {
  bgcolor: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  p: 3,
  mb: 2,
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, loading} = useAuth();
  const {whatsappPhone} = useBusiness();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const MP_FEE_RATE = 0.0729;
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
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
  const [fieldsFromDB, setFieldsFromDB] = useState(new Set());
  const [treatmentDescription, setTreatmentDescription] = useState(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [treatment, setTreatment] = useState(
    location.state?.treatment || {name: "Evaluación", slug: "evaluation"},
  );
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_type: "",
    notes: "",
  });
  const [depositAmountConfig, setDepositAmountConfig] = useState(
    DEFAULT_DEPOSIT_AMOUNT,
  );
  const [transferFile, setTransferFile] = useState(null);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);

  const appointmentData = location.state?.appointmentData || null;
  const appointmentId = location.state?.appointmentId || null;
  const selectedPackageId = location.state?.selectedPackageId || null;
  const isEvaluation = location.state?.isEvaluation ?? false;
  const campaignItemType = location.state?.campaignItemType || null;
  const productType = location.state?.productType || null;
  const selectedDate = location.state?.selectedDate || null;
  const selectedTime = location.state?.selectedTime || null;

  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [createdAppointmentId, setCreatedAppointmentId] =
    useState(appointmentId);

  const parsedBasePrice = Number(basePrice);
  const hasValidBasePrice = Number.isFinite(parsedBasePrice);
  const normalizedDepositAmount = getValidDepositAmount(depositAmountConfig);
  const effectiveDepositAmount = hasValidBasePrice
    ? Math.min(normalizedDepositAmount, Math.max(parsedBasePrice, 0))
    : normalizedDepositAmount;
  const depositRemainderAmount = Math.max(
    (hasValidBasePrice ? parsedBasePrice : 0) - effectiveDepositAmount,
    0,
  );

  // Allowed payment methods
  const allowedMethods = isEvaluation
    ? ["tarjeta", "transferencia"]
    : [
        "tarjeta",
        ...((campaignItemType || productType) && hasValidBasePrice
          ? ["deposito"]
          : []),
        "transferencia",
        ...(canPurchasePackages ? ["efectivo"] : []),
      ];

  // Initialize paymentMethod to first allowed method
  useEffect(() => {
    if (!allowedMethods.includes(paymentMethod)) {
      setPaymentMethod(allowedMethods[0] || "tarjeta");
    }
  }, [allowedMethods.join(",")]);

  useEffect(() => {
    bankService
      .getBankDetails()
      .then((data) => {
        setBankDetails({
          bank_name: data.bank_name || "",
          account_number: data.account_number || "",
          account_type: data.account_type || "",
          notes: data.notes || "",
        });
        setDepositAmountConfig(getValidDepositAmount(data.deposit_amount));
      })
      .catch(() => setDepositAmountConfig(DEFAULT_DEPOSIT_AMOUNT));
  }, []);

  useEffect(() => {
    if (treatment.slug && treatment.slug !== "evaluation") {
      setLoadingDescription(true);
      treatmentService
        .getTreatmentPackages(treatment.slug)
        .then((data) => {
          setTreatment((prev) => ({
            ...prev,
            duration_minutes: data?.duration_minutes || 90,
            category: data?.category,
          }));
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
        .catch(() => {})
        .finally(() => setLoadingDescription(false));
    }
  }, [treatment.slug, selectedPackageId, isEvaluation]);

  useEffect(() => {
    if (paymentStatus === "approved") {
      const timer = setTimeout(() => navigate("/my-appointments"), 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  useEffect(() => {
    if (!loading && user?.user_type === "employee") navigate("/admin");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && !user) setShowLoginModal(true);
  }, [loading, user]);

  useEffect(() => {
    if (
      !loading &&
      user &&
      !appointmentData &&
      !appointmentId &&
      !selectedPackageId &&
      user?.user_type !== "employee"
    ) {
      navigate("/schedule", {
        state: {treatment, isEvaluation, campaignItemType},
      });
    }
  }, [loading, user, appointmentData, appointmentId, selectedPackageId]);

  useEffect(() => {
    if (!loading && user) {
      setProfileLoading(true);
      authService
        .getCurrentUser()
        .then((profile) => {
          const fieldsLoaded = new Set();
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
        })
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user?.user_type === "customer") {
      authService
        .getPurchaseEligibility()
        .then((data) =>
          setCanPurchasePackages(data.can_purchase_packages ?? false),
        )
        .catch(() => {});
    }
  }, [loading, user]);

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return "El número de WhatsApp es requerido";
    const {country, phoneNumber} = extractCountryAndPhone(phone);
    const digits = phoneNumber.replace(/\D/g, "");
    const expectedLength = country.phoneLength;
    if (digits.length < expectedLength)
      return `Ingresa exactamente ${expectedLength} dígitos para ${country.name} (tienes ${digits.length})`;
    if (digits.length > expectedLength)
      return `El número no puede exceder ${expectedLength} dígitos para ${country.name}`;
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim())
      errs.email = "El correo electrónico es requerido";
    else if (!emailRegex.test(profileData.email.trim()))
      errs.email = "Ingresa un correo electrónico válido";
    const phoneError = validatePhoneNumber(profileData.whatsappPhone);
    if (phoneError) errs.whatsappPhone = phoneError;
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShowCardPayment = async () => {
    if (!validateProfile()) return;
    setError("");
    setPaymentStatus("processing");
    try {
      await authService.updateProfile({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        birth_date: profileData.birthDate,
        cedula: profileData.cedula.trim(),
        email: profileData.email.trim(),
        whatsapp_phone: profileData.whatsappPhone,
      });
      const preference_request = {
        treatment_id: treatment.slug,
        customer_name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`,
        customer_email: profileData.email.trim(),
        customer_phone: profileData.whatsappPhone,
        is_evaluation: isEvaluation,
      };
      if (selectedPackageId) preference_request.package_id = selectedPackageId;
      const {preference_id, payment_id} =
        await paymentService.createPaymentPreference(preference_request);
      setPreferenceId(preference_id);
      setPaymentId(payment_id);
      setPaymentStatus("payment_ready");
      setTimeout(() => {
        document.getElementById("payment-brick-container")?.scrollIntoView({behavior: "smooth", block: "start"});
      }, 100);
    } catch (err) {
      setPaymentStatus("idle");
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

  const handlePaymentSuccess = async (paymentId) => {
    paymentService.savePaymentId(paymentId);
    let appointmentIdToLink = appointmentId || createdAppointmentId;
    if (appointmentData && !appointmentIdToLink) {
      try {
        const result =
          await appointmentService.createAppointment(appointmentData);
        appointmentIdToLink = result.appointment_id;
        setCreatedAppointmentId(appointmentIdToLink);
      } catch (err) {
        setError("Error al crear la cita");
        return;
      }
    }
    if (appointmentIdToLink) {
      try {
        await paymentService.linkIntentToAppointment(
          paymentId,
          appointmentIdToLink,
        );
      } catch {}
    }
    setProfileLocked(true);
    setPaymentStatus("approved");
  };

  const handlePaymentError = (err) => {
    setError(
      err?.message || "Error al procesar el pago. Por favor intenta de nuevo.",
    );
    setPaymentStatus("payment_ready");
  };

  const handleContinueWithoutPayment = async (method) => {
    if (method !== "efectivo" && method !== "transferencia") {
      setError(`Payment method ${method} is not supported in this flow`);
      return;
    }
    if (!isProfileComplete()) {
      setError("Por favor completa todos los campos de perfil");
      return;
    }
    if (!treatment.slug || !treatment.name) {
      setError("Treatment information is missing");
      return;
    }
    setProfileLoading(true);
    try {
      const intent = await paymentService.createPaymentIntent({
        treatmentId: treatment.slug || treatment.name || "unknown",
        treatmentName: treatment.name || "Tratamiento",
        amount: basePrice,
        paymentMethod: method,
      });
      if (method === "transferencia" && transferFile) {
        try {
          await paymentService.uploadComprobanteToIntent(
            intent.payment_id,
            transferFile,
          );
          transferReceiptStore.file = null;
        } catch {}
      }
      let appointmentIdToLink = appointmentId || createdAppointmentId;
      if (appointmentData && !appointmentIdToLink) {
        try {
          const result =
            await appointmentService.createAppointment(appointmentData);
          appointmentIdToLink = result.appointment_id;
          setCreatedAppointmentId(appointmentIdToLink);
        } catch (err) {
          setError("Error al crear la cita");
          return;
        }
      }
      if (appointmentIdToLink) {
        try {
          await paymentService.linkIntentToAppointment(
            intent.payment_id,
            appointmentIdToLink,
          );
        } catch {}
      }
      setProfileLocked(true);
      navigate("/my-appointments");
    } catch (err) {
      setError(err.message || "Error creating payment intent");
    } finally {
      setProfileLoading(false);
    }
  };

  const isProfileComplete = () =>
    profileData.firstName.trim() &&
    profileData.lastName.trim() &&
    profileData.birthDate &&
    profileData.cedula.trim() &&
    profileData.email.trim() &&
    profileData.whatsappPhone.trim();

  const isFieldLocked = (fieldName) => {
    if (profileLoading || paymentStatus === "processing") return true;
    if (profileLocked) return true;
    if (fieldName === "email" && user?.auth_method === "google") return true;
    if (fieldName === "phone" && user?.auth_method === "whatsapp") return true;
    if (fieldsFromDB.has(fieldName)) return true;
    return false;
  };

  const needsCardForm =
    paymentMethod === "tarjeta" || paymentMethod === "deposito";
  const canConfirm =
    !profileLoading && (paymentMethod !== "transferencia" || !!transferFile);

  // Summary values
  const displayAmount =
    paymentMethod === "deposito"
      ? effectiveDepositAmount
      : parsedBasePrice || 0;
  const displayTotal =
    paymentMethod === "tarjeta"
      ? totalPrice || parsedBasePrice || 0
      : displayAmount;

  return (
    <>
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      <Box sx={{minHeight: "100vh", bgcolor: "#f2f2f2", pb: 6}}>
        <Container sx={{py: 3}}>
          <FlowStepper active={1} />

          <Box
            component="button"
            onClick={() =>
              navigate("/schedule", {
                state: {
                  treatment,
                  campaignItemType,
                  productType,
                  isEvaluation,
                  selectedDate,
                  selectedTime,
                },
              })
            }
            disabled={
              paymentStatus === "processing" || paymentStatus === "approved"
            }
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "transparent",
              border: 0,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "#2e7d32",
              fontFamily: "'Work Sans'",
              px: 0,
              py: 1,
              mb: 2,
              "&:hover": {opacity: 0.8},
            }}
          >
            <ArrowBackIcon sx={{fontSize: 18}} /> Volver
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{mb: 2, borderRadius: "8px"}}
              icon={<ErrorOutlineIcon />}
            >
              {error}
            </Alert>
          )}

          {paymentStatus === "approved" && (
            <Box
              sx={{
                ...panelSx,
                bgcolor: "#e4f0e5",
                border: "1px solid #2e7d32",
                textAlign: "center",
                py: 4,
              }}
            >
              <CheckCircleIcon sx={{fontSize: 48, color: "#2e7d32", mb: 1}} />
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#2e7d32",
                  fontSize: 18,
                  fontFamily: "'Work Sans'",
                }}
              >
                ¡Pago aprobado!
              </Typography>
              <Typography sx={{mt: 0.5, fontSize: 14, color: "#5b5b5b"}}>
                Redirigiendo a tus sesiones…
              </Typography>
            </Box>
          )}

          {paymentStatus !== "approved" && paymentStatus !== "pending" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {xs: "1fr", lg: "1fr 320px"},
                gap: 3,
                alignItems: "start",
              }}
            >
              {/* ── Left column ── */}
              <Box>
                {/* Profile panel */}
                <Box sx={panelSx}>
                  <Typography
                    sx={{
                      fontFamily: "'Work Sans'",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "#141414",
                      mb: 0.5,
                    }}
                  >
                    Tus datos
                  </Typography>
                  <Typography sx={{fontSize: 14, color: "#5b5b5b", mb: 3}}>
                    Usamos estos datos para confirmar tu sesión. Los campos con
                    candado ya los tenemos — si necesitás cambiarlos, escribinos
                    por WhatsApp.
                  </Typography>

                  {profileLoading ? (
                    <Box
                      sx={{display: "flex", justifyContent: "center", py: 2}}
                    >
                      <CircularProgress size={28} sx={{color: "#2e7d32"}} />
                    </Box>
                  ) : (
                    <Box
                      sx={{display: "flex", flexDirection: "column", gap: 2}}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        <LockableField
                          label="Nombre"
                          value={profileData.firstName}
                          onChange={(v) => {
                            setProfileData((p) => ({...p, firstName: v}));
                            setProfileErrors((p) => ({...p, firstName: ""}));
                          }}
                          locked={isFieldLocked("firstName")}
                          error={profileErrors.firstName}
                          placeholder="María"
                        />
                        <LockableField
                          label="Apellido"
                          value={profileData.lastName}
                          onChange={(v) => {
                            setProfileData((p) => ({...p, lastName: v}));
                            setProfileErrors((p) => ({...p, lastName: ""}));
                          }}
                          locked={isFieldLocked("lastName")}
                          error={profileErrors.lastName}
                          placeholder="González"
                        />
                      </Box>

                      <LockableField
                        label="Email"
                        value={profileData.email}
                        onChange={(v) => {
                          setProfileData((p) => ({...p, email: v}));
                          setProfileErrors((p) => ({...p, email: ""}));
                        }}
                        locked={isFieldLocked("email")}
                        error={profileErrors.email}
                        type="email"
                        placeholder="tu@email.com"
                      />

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        <LockableField
                          label="Fecha de nacimiento"
                          value={profileData.birthDate}
                          onChange={(v) => {
                            setProfileData((p) => ({...p, birthDate: v}));
                            setProfileErrors((p) => ({...p, birthDate: ""}));
                          }}
                          locked={isFieldLocked("birthDate")}
                          error={profileErrors.birthDate}
                          type="date"
                        />
                        <LockableField
                          label="C.I. / Documento"
                          value={profileData.cedula}
                          onChange={(v) => {
                            const digits = v.replace(/\D/g, "").slice(0, 8);
                            let formatted = digits.slice(0, 1);
                            if (digits.length > 1)
                              formatted += "." + digits.slice(1, 4);
                            if (digits.length > 4)
                              formatted += "." + digits.slice(4, 7);
                            if (digits.length > 7)
                              formatted += "-" + digits.slice(7, 8);
                            setProfileData((p) => ({...p, cedula: formatted}));
                            setProfileErrors((p) => ({...p, cedula: ""}));
                          }}
                          locked={isFieldLocked("cedula")}
                          error={profileErrors.cedula}
                          placeholder="1.234.567-8"
                        />
                      </Box>

                      {isFieldLocked("whatsappPhone") ? (
                        <LockableField
                          label="WhatsApp"
                          value={profileData.whatsappPhone}
                          locked={true}
                        />
                      ) : (
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#141414",
                              mb: 0.5,
                            }}
                          >
                            WhatsApp
                          </Typography>
                          <PhoneCountryInput
                            value={profileData.whatsappPhone}
                            onChange={(newPhone) => {
                              setProfileData((p) => ({
                                ...p,
                                whatsappPhone: newPhone,
                              }));
                              const phoneError = validatePhoneNumber(newPhone);
                              setProfileErrors((p) => ({
                                ...p,
                                whatsappPhone: phoneError,
                              }));
                            }}
                            error={!!profileErrors.whatsappPhone}
                            helperText={
                              profileErrors.whatsappPhone ||
                              "Te avisamos por este número si hay cambios."
                            }
                            disabled={isFieldLocked("whatsappPhone")}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Payment method panel */}
                <Box sx={panelSx}>
                  <Typography
                    sx={{
                      fontFamily: "'Work Sans'",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "#141414",
                      mb: 2,
                    }}
                  >
                    ¿Cómo querés pagar?
                  </Typography>

                  {allowedMethods.includes("tarjeta") && (
                    <PaymentRadio
                      method="tarjeta"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={
                        <CreditCardIcon sx={{fontSize: 18, color: "#2e7d32"}} />
                      }
                      title="Tarjeta de crédito o débito"
                      subtitle="Visa, Mastercard, Oca. Pago seguro con MercadoPago."
                      pill="Inmediato"
                    />
                  )}
                  {allowedMethods.includes("deposito") && (
                    <PaymentRadio
                      method="deposito"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={
                        <SavingsIcon sx={{fontSize: 18, color: "#2e7d32"}} />
                      }
                      title={`Seña $${formatMoney(effectiveDepositAmount)} + resto en clínica`}
                      subtitle={`Dejá $${formatMoney(effectiveDepositAmount)} ahora y pagá el resto el día de tu sesión.`}
                      pill="Popular"
                    />
                  )}
                  {allowedMethods.includes("transferencia") && (
                    <PaymentRadio
                      method="transferencia"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={
                        <AccountBalanceIcon
                          sx={{fontSize: 18, color: "#2e7d32"}}
                        />
                      }
                      title="Transferencia bancaria"
                      subtitle="Transferí y adjuntá el comprobante. Confirmamos en el día."
                    />
                  )}
                  {allowedMethods.includes("efectivo") && (
                    <PaymentRadio
                      method="efectivo"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                      icon={
                        <PaymentsIcon sx={{fontSize: 18, color: "#2e7d32"}} />
                      }
                      title="Efectivo en clínica"
                      subtitle="Reservás ahora y pagás al llegar."
                    />
                  )}
                </Box>

                {/* MercadoPago brick loading state */}
                {needsCardForm && paymentStatus === "processing" && (
                  <Box sx={{...panelSx, textAlign: "center", py: 4}}>
                    <CircularProgress size={40} sx={{color: "#2e7d32", mb: 2}} />
                    <Typography sx={{fontSize: 14, color: "#5b5b5b"}}>Preparando formulario de pago...</Typography>
                  </Box>
                )}

                {/* MercadoPago brick */}
                {needsCardForm && paymentStatus === "payment_ready" && (
                  <Box sx={{bgcolor: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", mb: 2, overflow: "hidden"}} id="payment-brick-container">
                    <MercadoPagoBrick
                      key="payment-brick"
                      preferenceId={preferenceId}
                      paymentId={paymentId}
                      amount={
                        paymentMethod === "deposito"
                          ? effectiveDepositAmount
                          : totalPrice
                      }
                      treatmentId={treatment.slug}
                      packageId={selectedPackageId}
                      payerEmail={profileData.email}
                      isEvaluation={isEvaluation}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  </Box>
                )}

                {/* Transferencia section */}
                {paymentMethod === "transferencia" && (
                  <Box sx={panelSx}>
                    <Typography
                      sx={{
                        fontFamily: "'Work Sans'",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "#141414",
                        mb: 0.5,
                      }}
                    >
                      Datos para la transferencia
                    </Typography>
                    <Typography sx={{fontSize: 14, color: "#5b5b5b", mb: 2}}>
                      Transferí el monto y adjuntá el comprobante aquí.
                    </Typography>

                    {bankDetails.bank_name && bankDetails.account_number ? (
                      <Box
                        sx={{
                          bgcolor: "#f2f2f2",
                          p: 2,
                          borderRadius: "8px",
                          fontSize: 14,
                          lineHeight: 1.8,
                          mb: 2,
                        }}
                      >
                        {bankDetails.bank_name && (
                          <Box>
                            <Box component="strong">Banco:</Box>{" "}
                            {bankDetails.bank_name}
                          </Box>
                        )}
                        {bankDetails.account_type && (
                          <Box>
                            <Box component="strong">Tipo:</Box>{" "}
                            {bankDetails.account_type}
                          </Box>
                        )}
                        {bankDetails.account_number && (
                          <Box>
                            <Box component="strong">Cuenta:</Box>{" "}
                            {bankDetails.account_number}
                          </Box>
                        )}
                        {bankDetails.notes && (
                          <Box sx={{mt: 0.5, color: "#5b5b5b"}}>
                            {bankDetails.notes}
                          </Box>
                        )}
                        <Box sx={{mt: 0.5}}>
                          <Box component="strong">Monto:</Box> $
                          {formatMoney(parsedBasePrice)}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{mb: 2}}>
                        <Typography
                          sx={{fontSize: 14, color: "#5b5b5b", mb: 1}}
                        >
                          Contactanos por WhatsApp para los datos de la cuenta.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<WhatsAppIcon />}
                          onClick={() =>
                            window.open(
                              `https://wa.me/${whatsappPhone}?text=Hola%2C%20quiero%20datos%20bancarios`,
                              "_blank",
                            )
                          }
                          sx={{
                            bgcolor: "#25d366",
                            "&:hover": {bgcolor: "#20c652"},
                            fontWeight: 600,
                            borderRadius: "8px",
                          }}
                        >
                          WhatsApp
                        </Button>
                      </Box>
                    )}

                    {/* File upload */}
                    <input
                      id="transfer-file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTransferFile(file);
                          transferReceiptStore.file = file;
                        }
                      }}
                      style={{display: "none"}}
                    />
                    <label htmlFor="transfer-file-input">
                      <Box
                        component="div"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          border: transferFile
                            ? "1.5px solid #2e7d32"
                            : "1.5px dashed #e0e0e0",
                          borderRadius: "10px",
                          bgcolor: transferFile ? "#f2f8f3" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          "&:hover": {
                            borderColor: "#2e7d32",
                            bgcolor: "#f2f8f3",
                          },
                        }}
                      >
                        {transferFile ? (
                          <>
                            <CheckCircleIcon
                              sx={{color: "#2e7d32", flexShrink: 0}}
                            />
                            <Box sx={{flex: 1, minWidth: 0}}>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: 14,
                                }}
                              >
                                {transferFile.name}
                              </Typography>
                              <Typography sx={{fontSize: 12, color: "#8a8a8a"}}>
                                {(transferFile.size / 1024).toFixed(0)} KB ·
                                Listo para enviar
                              </Typography>
                            </Box>
                            <Typography
                              component="span"
                              onClick={(e) => {
                                e.preventDefault();
                                setTransferFile(null);
                                transferReceiptStore.file = null;
                              }}
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#2e7d32",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              Quitar
                            </Typography>
                          </>
                        ) : (
                          <>
                            <UploadFileIcon
                              sx={{color: "#2e7d32", flexShrink: 0}}
                            />
                            <Box sx={{flex: 1}}>
                              <Typography sx={{fontWeight: 600, fontSize: 14}}>
                                Adjuntar comprobante
                              </Typography>
                              <Typography sx={{fontSize: 12, color: "#8a8a8a"}}>
                                Imagen o PDF — requerido para confirmar
                              </Typography>
                            </Box>
                            <Box
                              component="span"
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#2e7d32",
                                border: "1px solid #2e7d32",
                                borderRadius: "6px",
                                px: 1.5,
                                py: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              Elegir archivo
                            </Box>
                          </>
                        )}
                      </Box>
                    </label>
                  </Box>
                )}

                {/* Efectivo section */}
                {paymentMethod === "efectivo" && (
                  <Box sx={panelSx}>
                    <Typography
                      sx={{
                        fontFamily: "'Work Sans'",
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#141414",
                        mb: 0.5,
                      }}
                    >
                      Te esperamos en clínica
                    </Typography>
                    <Typography sx={{fontSize: 14, color: "#5b5b5b"}}>
                      Reservamos tu horario y te llamamos el día anterior para
                      confirmar al WhatsApp de arriba. El pago se hace en
                      clínica el mismo día.
                    </Typography>
                  </Box>
                )}

                {/* Bottom action bar for non-card methods */}
                {!needsCardForm && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "#fff",
                      borderTop: "1px solid #e0e0e0",
                      borderRadius: 0,
                      mt: 3,
                      position: {xs: "sticky"},
                      bottom: {xs: 0},
                      zIndex: {xs: 10},
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#8a8a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Total
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Work Sans'",
                          fontWeight: 700,
                          fontSize: 20,
                          color: "#141414",
                          lineHeight: 1,
                        }}
                      >
                        {basePrice ? `$${formatMoney(parsedBasePrice)}` : "—"}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      disabled={
                        !canConfirm || !isProfileComplete() || profileLoading
                      }
                      onClick={() =>
                        handleContinueWithoutPayment(paymentMethod)
                      }
                      sx={{
                        bgcolor: "#2e7d32",
                        "&:hover": {bgcolor: "#3b8a3f"},
                        "&:disabled": {bgcolor: "#e0e0e0", color: "#8a8a8a"},
                        fontWeight: 700,
                        fontSize: 15,
                        py: 1.5,
                        px: 3,
                        borderRadius: "8px",
                      }}
                    >
                      {profileLoading ? (
                        <CircularProgress size={20} sx={{color: "#fff"}} />
                      ) : paymentMethod === "transferencia" ? (
                        transferFile ? (
                          "Confirmar reserva"
                        ) : (
                          "Adjuntá el comprobante"
                        )
                      ) : (
                        "Reservar sesión"
                      )}
                    </Button>
                  </Box>
                )}

                {/* Pagar ahora button for card (before payment_ready) */}
                {needsCardForm && paymentStatus !== "payment_ready" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "#fff",
                      borderTop: "1px solid #e0e0e0",
                      borderRadius: 0,
                      mt: 3,
                      position: {xs: "sticky"},
                      bottom: {xs: 0},
                      zIndex: {xs: 10},
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#8a8a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Total
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Work Sans'",
                          fontWeight: 700,
                          fontSize: 20,
                          color: "#141414",
                          lineHeight: 1,
                        }}
                      >
                        {paymentMethod === "deposito"
                          ? `$${formatMoney(effectiveDepositAmount)}`
                          : totalPrice
                            ? `$${formatMoney(totalPrice)}`
                            : "—"}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      disabled={
                        profileLoading ||
                        !isProfileComplete() ||
                        totalPrice == null ||
                        !!profileErrors.whatsappPhone
                      }
                      onClick={handleShowCardPayment}
                      sx={{
                        bgcolor: "#2e7d32",
                        "&:hover": {bgcolor: "#3b8a3f"},
                        "&:disabled": {bgcolor: "#e0e0e0", color: "#8a8a8a"},
                        fontWeight: 700,
                        fontSize: 15,
                        py: 1.5,
                        px: 3,
                        borderRadius: "8px",
                      }}
                    >
                      {profileLoading ? (
                        <CircularProgress size={20} sx={{color: "#fff"}} />
                      ) : (
                        "Pagar ahora"
                      )}
                    </Button>
                  </Box>
                )}
              </Box>

              {/* ── Summary sidebar ── */}
              <Box
                component="aside"
                sx={{
                  bgcolor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  p: 3,
                  position: {lg: "sticky"},
                  top: {lg: 88},
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2e7d32",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    mb: 1,
                  }}
                >
                  Tu reserva
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Work Sans'",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#141414",
                    mb: 2,
                  }}
                >
                  {isEvaluation
                    ? `Evaluación — ${treatment.name}`
                    : treatment.name}
                </Typography>

                <Box component="ul" sx={{listStyle: "none", p: 0, m: 0, mb: 2}}>
                  {[
                    {
                      label: "Tratamiento",
                      value: isEvaluation
                        ? "Evaluación"
                        : treatment.category || "Sesión",
                    },
                    {
                      label: "Duración",
                      value: treatment.duration_minutes
                        ? `${treatment.duration_minutes} min`
                        : "—",
                    },
                    {label: "Fecha", value: formatLongDate(selectedDate)},
                    {label: "Hora", value: selectedTime || "—"},
                    ...(paymentMethod
                      ? [{label: "Pago", value: paymentLabel(paymentMethod)}]
                      : []),
                  ].map(({label, value}) => (
                    <Box
                      component="li"
                      key={label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        py: 1,
                        borderBottom: "1px dashed #e0e0e0",
                        "&:last-child": {borderBottom: 0},
                      }}
                    >
                      <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#141414",
                          textAlign: "right",
                          maxWidth: "55%",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {paymentMethod === "deposito" && (
                  <Box sx={{mb: 2}}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.75,
                        borderTop: "1px dashed #e0e0e0",
                      }}
                    >
                      <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
                        Seña hoy
                      </Typography>
                      <Typography sx={{fontSize: 13, fontWeight: 600}}>
                        ${formatMoney(effectiveDepositAmount)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
                        Resto en clínica
                      </Typography>
                      <Typography sx={{fontSize: 13, fontWeight: 600}}>
                        ${formatMoney(depositRemainderAmount)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {paymentMethod === "tarjeta" && (
                  <Box sx={{mb: 2}}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.75,
                        borderTop: "1px dashed #e0e0e0",
                      }}
                    >
                      <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
                        Subtotal
                      </Typography>
                      <Typography sx={{fontSize: 13, fontWeight: 600}}>
                        ${formatMoney(parsedBasePrice)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{fontSize: 13, color: "#8a8a8a"}}>
                        Costo de procesamiento
                      </Typography>
                      <Typography sx={{fontSize: 13, fontWeight: 600}}>
                        ${formatMoney((totalPrice || parsedBasePrice) - parsedBasePrice)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderTop: "2px solid #141414",
                    pt: 1.75,
                    mt: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#5b5b5b",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {paymentMethod === "deposito" ? "A pagar ahora" : "Total"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Work Sans'",
                      fontWeight: 800,
                      fontSize: 26,
                      color: "#141414",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {basePrice
                      ? `$${formatMoney(paymentMethod === "deposito" ? effectiveDepositAmount : paymentMethod === "tarjeta" ? totalPrice || parsedBasePrice : parsedBasePrice)}`
                      : "—"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}
