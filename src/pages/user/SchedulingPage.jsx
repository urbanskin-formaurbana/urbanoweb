import {useState, useMemo, useEffect, useCallback} from "react";
import {Alert} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoginModal from "../../components/LoginModal";
import FlowStepper from "../../components/booking/FlowStepper.jsx";
import BookingPanel from "../../components/booking/BookingPanel.jsx";
import BookingSummaryCard from "../../components/booking/BookingSummaryCard.jsx";
import TreatmentIntroBlock from "../../components/booking/TreatmentIntroBlock.jsx";
import DateTimeSlotPicker from "../../components/DateTimeSlotPicker.jsx";
import {useAuth} from "../../contexts/AuthContext";
import appointmentService from "../../services/appointment_service";
import treatmentService from "../../services/treatment_service";
import {
  isCampaignTreatment,
  filterSlotsForCustomer,
} from "../../utils/slotUtils";

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
  const [basePrice, setBasePrice] = useState(null);
  const [evaluationPrice, setEvaluationPrice] = useState(null);
  const [duration, setDuration] = useState(null);
  const [notes, setNotes] = useState("");

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
  const isPackageMode = !!purchasedPackageId;
  const isCampaign = isCampaignTreatment(treatment);

  const parsedBasePrice = Number(basePrice);
  const hasValidBasePrice = Number.isFinite(parsedBasePrice);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  useEffect(() => {
    if (restoredDate && restoredTime) {
      setSelectedDate(dayjs(restoredDate, "YYYY-MM-DD"));
      setSelectedTime(restoredTime);
    }
  }, [restoredDate, restoredTime]);

  useEffect(() => {
    if (treatment.slug && treatment.slug !== "evaluation") {
      treatmentService
        .getTreatmentPackages(treatment.slug)
        .then((data) => {
          if (isEvaluation) {
            setTreatmentDescription(
              "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti.",
            );
          } else if (data?.description) {
            setTreatmentDescription(data.description);
          }
          setTreatmentSubtitle(data?.subtitle || treatment.subtitle || null);
          setTreatmentCategory(
            data?.category || treatment.category || productType || null,
          );
          if (isEvaluation && data?.evaluation_price != null) {
            setBasePrice(data.evaluation_price);
          } else if (data?.single_session_price != null) {
            setBasePrice(data.single_session_price);
          }
          if (data?.evaluation_price != null) {
            setEvaluationPrice(data.evaluation_price);
          }
          if (data?.duration_minutes) setDuration(data.duration_minutes);
        })
        .catch(() => {
          setTreatmentSubtitle(treatment.subtitle || null);
          setTreatmentCategory(treatment.category || productType || null);
        });
    } else if (treatment.slug === "evaluation") {
      setTreatmentDescription(
        "Nuestros especialistas necesitan evaluar tu caso particular para orientarte hacia los servicios más adecuados para ti.",
      );
      setTreatmentSubtitle(null);
      setTreatmentCategory(treatment.category || productType || null);
    }
  }, [
    treatment.slug,
    treatment.category,
    treatment.subtitle,
    isEvaluation,
    productType,
  ]);

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
        navigate("/payment", {
          state: {
            treatment,
            campaignItemType,
            productType,
            isEvaluation,
            appointmentData,
            selectedDate: selectedDate.format("YYYY-MM-DD"),
            selectedTime,
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
        category={treatmentCategory || treatment.category || productType}
        title={treatment.name}
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
                title={`Agendá tu ${isEvaluation ? "evaluación" : treatment.name}`}
                lead={`Elegí el día y horario que mejor te queden. ${isEvaluation ? "La evaluación dura ~20 min." : `La sesión dura ${duration || SESSION_DURATION} min.`}`}
              >
                <DateTimeSlotPicker
                  treatment={treatment}
                  paymentMode={isEvaluation ? "evaluacion" : null}
                  selectedDate={selectedDate}
                  onDateChange={(d) => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  selectedTime={selectedTime}
                  onTimeChange={setSelectedTime}
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
                    disabled={loading || !selectedDate || !selectedTime}
                    onClick={handleCreateAppointment}
                  >
                    {loading
                      ? "Procesando…"
                      : isPackageMode
                        ? "Confirmar sesión"
                        : "Continuar al pago"}
                    {!loading && <ArrowForwardIcon sx={{fontSize: 18}} />}
                  </button>
                </div>
              </BookingPanel>
            </div>

            {showSummary && (
              <BookingSummaryCard
                title={treatment.name}
                rows={[
                  {
                    label: "Tratamiento",
                    value: isEvaluation
                      ? "Evaluación"
                      : treatmentSubtitle || treatment.name,
                  },
                  {
                    label: "Duración",
                    value: isEvaluation
                      ? "20 min"
                      : `${duration || SESSION_DURATION} min`,
                  },
                  {label: "Fecha", value: formatLongDate(selectedDate)},
                  {label: "Hora", value: selectedTime || "—"},
                ]}
                totalLabel="Total"
                totalValue={
                  hasValidBasePrice ? formatCurrency(parsedBasePrice) : "—"
                }
              >
                <button
                  type="button"
                  className="fu-btn fu-btn--primary fu-btn--lg fu-btn--block fu-flow__summary-action"
                  disabled={loading || !selectedDate || !selectedTime}
                  onClick={handleCreateAppointment}
                >
                  {loading
                    ? "Procesando…"
                    : isPackageMode
                      ? "Confirmar sesión"
                      : "Continuar al pago"}
                </button>
              </BookingSummaryCard>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
