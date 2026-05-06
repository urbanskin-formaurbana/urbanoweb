import {useState, useMemo, useEffect, useCallback} from "react";
import {Alert} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {useNavigate, useLocation} from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoginModal from "../../components/LoginModal";
import PurchaseOptionsDialog from "../../components/PurchaseOptionsDialog.jsx";
import FlowStepper from "../../components/booking/FlowStepper.jsx";
import BookingPanel from "../../components/booking/BookingPanel.jsx";
import BookingSummaryCard from "../../components/booking/BookingSummaryCard.jsx";
import TreatmentIntroBlock from "../../components/booking/TreatmentIntroBlock.jsx";
import DateTimeSlotPicker from "../../components/DateTimeSlotPicker.jsx";
import {useAuth} from "../../contexts/AuthContext";
import appointmentService from "../../services/appointment_service";
import authService from "../../services/auth_service";
import treatmentService from "../../services/treatment_service";
import categoryConfigService from "../../services/category_config_service";
import {
  isCampaignTreatment,
  filterSlotsForCustomer,
} from "../../utils/slotUtils";
import analytics from "../../utils/analytics";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const SESSION_DURATION = 30;

function formatCurrency(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return `$${parsed.toLocaleString("es-UY", {
    minimumFractionDigits: Number.isInteger(parsed) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLongDate(selectedDate) {
  if (!selectedDate) return "—";
  return selectedDate.format("dddd D [de] MMMM");
}

const CATEGORY_LABELS = {
  body: "Estética Corporal",
  facial: "Estética Facial",
  complementarios: "Complementarios",
};

function formatCategoryLabel(category) {
  if (!category) return null;
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function SchedulingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [treatmentDescription, setTreatmentDescription] = useState(null);
  const [treatmentSubtitle, setTreatmentSubtitle] = useState(null);
  const [treatmentCategory, setTreatmentCategory] = useState(null);
  const [treatmentCategoryLabel, setTreatmentCategoryLabel] = useState(null);
  const [resolvedItemName, setResolvedItemName] = useState(null);
  const [singleSessionPrice, setSingleSessionPrice] = useState(null);
  const [evaluationPrice, setEvaluationPrice] = useState(null);
  const [duration, setDuration] = useState(null);
  const [packages, setPackages] = useState([]);
  const [notes, setNotes] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(
    location.state?.selectedPackageId || null,
  );
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [canPurchasePackages, setCanPurchasePackages] = useState(false);
  const [disableSingleSession, setDisableSingleSession] = useState(false);

  const productType = location.state?.productType;
  const rawTreatment = useMemo(
    () => location.state?.treatment || {name: "Evaluación", slug: "evaluation"},
    [location.state],
  );
  const restoredDate = location.state?.selectedDate;
  const restoredTime = location.state?.selectedTime;
  const treatment = useMemo(
    () => ({...rawTreatment, category: rawTreatment.category || productType}),
    [rawTreatment, productType],
  );

  const purchasedPackageId = location.state?.purchased_package_id;
  const sessionInfo = location.state?.sessionInfo;
  const isEvaluation = location.state?.isEvaluation ?? false;
  const campaignItemType = location.state?.campaignItemType;
  const campaignDescription = location.state?.campaignDescription;
  const isHardRefresh = !location.state;
  const isPackageMode = !!purchasedPackageId;
  const isCampaign = isCampaignTreatment(treatment);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || null,
    [packages, selectedPackageId],
  );

  const basePrice = selectedPackage
    ? selectedPackage.price
    : isEvaluation
      ? evaluationPrice
      : singleSessionPrice;
  const parsedBasePrice = Number(basePrice);
  const hasValidBasePrice = Number.isFinite(parsedBasePrice);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  useEffect(() => {
    if (treatment?.slug) {
      analytics.trackViewItem(treatment);
      analytics.trackBeginCheckout({ treatment, isEvaluation, packageId: selectedPackageId });
    }
  }, [treatment?.slug]);

  useEffect(() => {
    if (restoredDate && restoredTime) {
      setSelectedDate(dayjs(restoredDate, "YYYY-MM-DD"));
      setSelectedTime(restoredTime);
    }
  }, [restoredDate, restoredTime]);

  useEffect(() => {
    if (isCampaign || (isHardRefresh && (treatment.category || productType))) {
      const category = treatment.category || productType;
      const initialDescription = campaignDescription || null;
      const initialSubtitle = treatment.subtitle || null;

      setTreatmentDescription(initialDescription);
      setTreatmentSubtitle(initialSubtitle);
      setTreatmentCategory(category || null);

      if (treatment.slug && treatment.slug !== "evaluation") {
        treatmentService
          .getTreatmentPackages(treatment.slug)
          .then((data) => {
            if (!data) return;
            if (data.name) setResolvedItemName(data.name);
            if (data.duration_minutes) setDuration(data.duration_minutes);
            if (data.single_session_price != null) {
              setSingleSessionPrice(data.single_session_price);
            }
          })
          .catch(() => {});
      }

      if (category) {
        categoryConfigService
          .getByCategory(category)
          .then((config) => {
            if (!config) return;
            if (config.label) setTreatmentCategoryLabel(config.label);
            if (!initialDescription && config.card_description) {
              setTreatmentDescription(config.card_description);
            }
            if (!initialSubtitle && config.subtitle) {
              setTreatmentSubtitle(config.subtitle);
            }
          })
          .catch(() => {});
      }
      return;
    }

    if (treatment.slug && treatment.slug !== "evaluation") {
      treatmentService
        .getTreatmentPackages(treatment.slug)
        .then((data) => {
          if (isEvaluation) {
            setTreatmentDescription(
              "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti.",
            );
          } else {
            setTreatmentDescription(data?.description || null);
          }
          setTreatmentSubtitle(data?.subtitle || treatment.subtitle || null);
          setTreatmentCategory(
            data?.category || treatment.category || productType || null,
          );
          if (data?.single_session_price != null) {
            setSingleSessionPrice(data.single_session_price);
          }
          if (data?.evaluation_price != null) {
            setEvaluationPrice(data.evaluation_price);
          }
          if (data?.duration_minutes) setDuration(data.duration_minutes);
          setPackages(Array.isArray(data?.packages) ? data.packages : []);
          setDisableSingleSession(!!data?.disable_single_session);
        })
        .catch(() => {
          setTreatmentSubtitle(treatment.subtitle || null);
          setTreatmentCategory(treatment.category || productType || null);
          setPackages([]);
          setDisableSingleSession(false);
        });
    } else if (treatment.slug === "evaluation") {
      setTreatmentDescription(
        "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti.",
      );
      setTreatmentSubtitle(null);
      setTreatmentCategory(treatment.category || productType || null);
      setPackages([]);
      setDisableSingleSession(false);
    }
  }, [
    treatment.slug,
    treatment.category,
    treatment.subtitle,
    isEvaluation,
    productType,
    isCampaign,
    isHardRefresh,
    campaignDescription,
  ]);

  useEffect(() => {
    if (
      user?.user_type === "customer" &&
      treatment.category === "body" &&
      !isEvaluation &&
      !isPackageMode &&
      !isCampaign
    ) {
      authService
        .getPurchaseEligibility()
        .then((data) => setCanPurchasePackages(!!data?.can_purchase_packages))
        .catch(() => setCanPurchasePackages(false));
    } else {
      setCanPurchasePackages(false);
    }
  }, [user, treatment.category, isEvaluation, isPackageMode, isCampaign]);

  useEffect(() => {
    if (
      disableSingleSession &&
      !selectedPackageId &&
      packages.length > 0
    ) {
      const promo = packages.find((p) => p.is_promotional) || packages[0];
      setSelectedPackageId(promo.id);
    }
  }, [disableSingleSession, selectedPackageId, packages]);

  const handlePurchaseDialogConfirm = (packageId) => {
    if (disableSingleSession && !packageId) return;
    setSelectedPackageId(packageId || null);
    if (packageId) {
      const pkg = packages.find((p) => p.id === packageId);
      analytics.trackViewItem({...treatment, selected_package_id: packageId});
      if (pkg) {
        analytics.trackBeginCheckout({
          treatment,
          isEvaluation: false,
          packageId,
        });
      }
    }
  };

  const showCuponeraCta =
    !isEvaluation &&
    !isPackageMode &&
    packages.length > 0 &&
    (canPurchasePackages || disableSingleSession);

  const cuponeraRequired = disableSingleSession;
  const allowChangePackage = !disableSingleSession || packages.length > 1;
  const missingRequiredPackage = cuponeraRequired && !selectedPackageId;

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Por favor seleccioná fecha y hora");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const scheduled_at = dayjs
        .tz(`${dateStr} ${selectedTime}`, "America/Montevideo")
        .utc()
        .toISOString();
      const appointmentData = {
        treatment_id: treatment.slug,
        scheduled_at,
        is_evaluation: isEvaluation,
        ...(purchasedPackageId && {purchased_package_id: purchasedPackageId}),
      };

      if (isPackageMode) {
        await appointmentService.createAppointment(appointmentData);
        navigate("/my-appointments");
      } else {
        analytics.trackAddShippingInfo({
          treatment,
          selectedDate: selectedDate.format("YYYY-MM-DD"),
          selectedTime,
          isEvaluation,
        });
        navigate("/payment", {
          state: {
            treatment,
            campaignItemType,
            productType,
            isEvaluation,
            appointmentData,
            selectedDate: selectedDate.format("YYYY-MM-DD"),
            selectedTime,
            selectedPackageId,
          },
        });
      }
    } catch (err) {
      setError(err.message || "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <LoginModal open onClose={() => navigate("/")} onSuccess={() => {}} />
    );
  }

  const showSummary = Boolean(selectedDate && selectedTime);
  const resolvedCategorySlug =
    treatmentCategory || treatment.category || productType;
  const displayCategoryLabel =
    treatmentCategoryLabel || formatCategoryLabel(resolvedCategorySlug);

  return (
    <div className="fu-booking-page" style={{overflowX: "clip"}}>
      <div className="fu-container" style={{paddingTop: 12}}>
        <button
          type="button"
          className="fu-btn fu-btn--text"
          onClick={() => navigate("/")}
          style={{padding: "8px 0"}}
        >
          <ArrowBackIcon sx={{fontSize: 18}} />
          Volver
        </button>
      </div>

      <TreatmentIntroBlock
        category={displayCategoryLabel || resolvedCategorySlug}
        title={resolvedItemName || treatment.name}
        subtitle={
          treatmentSubtitle ||
          (isEvaluation
            ? "Consulta inicial con profesionales"
            : "Definición y tono muscular")
        }
        description={treatmentDescription}
        duration={
          isEvaluation ? "20 min" : `${duration || SESSION_DURATION} min`
        }
        price={hasValidBasePrice ? formatCurrency(parsedBasePrice) : "—"}
        evaluationPrice={
          isEvaluation
            ? null
            : evaluationPrice != null
              ? formatCurrency(evaluationPrice)
              : null
        }
      />

      <section className="fu-flow">
        <div className="fu-container">
          <FlowStepper active={0} />

          {error && (
            <Alert severity="error" sx={{mb: 2, borderRadius: "8px"}}>
              {error}
            </Alert>
          )}

          {isEvaluation && (
            <BookingPanel
              className="fu-panel--soft"
              title="Primero, tu evaluación"
              lead="Para tratamientos corporales pedimos una evaluación inicial antes de empezar. Reservá tu evaluación y luego te habilitamos las sesiones desde tu cuenta."
            />
          )}

          {sessionInfo && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#2e7d32",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 12px",
              }}
            >
              Sesión {sessionInfo.sessionNumber} de {sessionInfo.totalSessions}
            </p>
          )}

          <div
            className={`fu-flow__grid ${showSummary ? "" : "fu-flow__grid--single"}`.trim()}
          >
            <div>
              <BookingPanel
                title={(() => {
                  if (isEvaluation) return "Agendá tu evaluación";
                  const itemName = resolvedItemName || treatment.name;
                  if (isCampaign && displayCategoryLabel) {
                    return `Agendá tu ${displayCategoryLabel} – ${itemName}`;
                  }
                  return `Agendá tu ${itemName}`;
                })()}
                lead={`Elegí el día y horario que mejor te queden. ${isEvaluation ? "La evaluación dura ~20 min." : `La sesión dura ${duration || SESSION_DURATION} min.`}`}
              >
                {showCuponeraCta && (() => {
                  const headline = selectedPackage
                    ? `Cuponera elegida: ${selectedPackage.name}`
                    : cuponeraRequired
                      ? "Este tratamiento solo está disponible en cuponera"
                      : "¿Querés ahorrar comprando una cuponera?";
                  const detail = selectedPackage
                    ? `${selectedPackage.session_count} sesiones · pagás una sola vez`
                    : cuponeraRequired
                      ? "Elegí una de las opciones disponibles para continuar."
                      : "Pagá varias sesiones por adelantado y ahorrá en cada una.";
                  const buttonLabel = selectedPackage
                    ? "Cambiar opción"
                    : "Ver opciones de cuponera";
                  return (
                    <div
                      className="fu-panel__section"
                      style={{
                        marginBottom: 16,
                        padding: "12px 16px",
                        backgroundColor: "#f2f8f3",
                        border: "1px solid #c8e0cb",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{display: "flex", alignItems: "center", gap: 8, minWidth: 0}}>
                        <LocalOfferOutlinedIcon sx={{fontSize: 20, color: "#2e7d32"}} />
                        <div style={{minWidth: 0}}>
                          <p style={{margin: 0, fontWeight: 600, color: "#2e7d32"}}>
                            {headline}
                          </p>
                          <p style={{margin: 0, fontSize: 13, color: "var(--fu-ink-400)"}}>
                            {detail}
                          </p>
                        </div>
                      </div>
                      {allowChangePackage && (
                        <button
                          type="button"
                          className="fu-btn fu-btn--text"
                          onClick={() => setPurchaseDialogOpen(true)}
                          style={{color: "#2e7d32", fontWeight: 600, whiteSpace: "nowrap"}}
                        >
                          {buttonLabel}
                        </button>
                      )}
                    </div>
                  );
                })()}

                <DateTimeSlotPicker
                  treatment={treatment}
                  paymentMode={isEvaluation ? "evaluacion" : null}
                  selectedDate={selectedDate}
                  onDateChange={(d) => {
                    analytics.trackDateSelected({
                      treatment,
                      selectedDate: d ? d.format("YYYY-MM-DD") : null,
                    });
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  selectedTime={selectedTime}
                  onTimeChange={(nuevoTime) => {
                    analytics.trackTimeSlotSelected({
                      treatment,
                      selectedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
                      selectedTime: nuevoTime,
                    });
                    setSelectedTime(nuevoTime);
                  }}
                />

                {selectedDate && selectedTime && (
                  <div
                    className="fu-panel__section"
                    style={{
                      marginTop: 24,
                      paddingTop: 24,
                      borderTop: "1px solid var(--fu-border)",
                    }}
                  >
                    <label className="fu-field" style={{marginBottom: 0}}>
                      <span className="fu-field__label">
                        Notas para el profesional{" "}
                        <span
                          style={{color: "var(--fu-ink-400)", fontWeight: 400}}
                        >
                          (opcional)
                        </span>
                      </span>
                      <textarea
                        className="fu-input"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: cirugías previas, embarazo, medicación, zona a tratar…"
                      />
                    </label>
                  </div>
                )}

                <div className="fu-flow__foot">
                  <div className="fu-flow__foot-total">
                    <small>Total</small>
                    <b>
                      {hasValidBasePrice
                        ? formatCurrency(parsedBasePrice)
                        : "—"}
                    </b>
                  </div>
                  <button
                    type="button"
                    className="fu-btn fu-btn--primary fu-btn--lg"
                    disabled={
                      loading ||
                      !selectedDate ||
                      !selectedTime ||
                      missingRequiredPackage
                    }
                    onClick={handleCreateAppointment}
                  >
                    {loading
                      ? "Procesando…"
                      : isPackageMode
                        ? "Confirmar sesión"
                        : missingRequiredPackage
                          ? "Elegí una cuponera"
                          : "Continuar al pago"}
                    {!loading && !missingRequiredPackage && (
                      <ArrowForwardIcon sx={{fontSize: 18}} />
                    )}
                  </button>
                </div>
              </BookingPanel>
            </div>

            {showSummary && (
              <BookingSummaryCard
                title={displayCategoryLabel || treatment.name}
                rows={[
                  {
                    label: "Tratamiento",
                    value: isEvaluation
                      ? `Evaluación · ${treatment.name}`
                      : treatment.name,
                  },
                  {
                    label: "Duración",
                    value: isEvaluation
                      ? "20 min"
                      : `${duration || SESSION_DURATION} min`,
                  },
                  {label: "Fecha", value: formatLongDate(selectedDate)},
                  {label: "Hora", value: selectedTime || "—"},
                  ...(selectedPackage
                    ? [
                        {
                          label: "Cuponera",
                          value: `${selectedPackage.name} · ${selectedPackage.session_count} sesiones`,
                        },
                      ]
                    : []),
                ]}
                totalLabel={selectedPackage ? "Total cuponera" : "Total"}
                totalValue={
                  hasValidBasePrice ? formatCurrency(parsedBasePrice) : "—"
                }
              >
                <button
                  type="button"
                  className="fu-btn fu-btn--primary fu-btn--lg fu-btn--block fu-flow__summary-action"
                  disabled={
                    loading ||
                    !selectedDate ||
                    !selectedTime ||
                    missingRequiredPackage
                  }
                  onClick={handleCreateAppointment}
                >
                  {loading
                    ? "Procesando…"
                    : isPackageMode
                      ? "Confirmar sesión"
                      : missingRequiredPackage
                        ? "Elegí una cuponera"
                        : "Continuar al pago"}
                </button>
              </BookingSummaryCard>
            )}
          </div>
        </div>
      </section>

      <PurchaseOptionsDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
        treatment={treatment}
        onConfirm={handlePurchaseDialogConfirm}
      />
    </div>
  );
}
