import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {CircularProgress} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

import appointmentService from "../../services/appointment_service";
import paymentService from "../../services/payment_service";
import {useAuth} from "../../contexts/AuthContext";
import AccountHero from "../../components/AccountHero.jsx";
import AttentionBanner from "../../components/AttentionBanner.jsx";
import CuponeraCard from "../../components/CuponeraCard.jsx";
import AppointmentRow from "../../components/AppointmentRow.jsx";
import PendingIntentRow from "../../components/PendingIntentRow.jsx";
import LandingIcon from "../../components/LandingIcon.jsx";
import {paymentLabel} from "../../utils/appointmentUtils.js";

export default function AppointmentHistoryPage() {
  const navigate = useNavigate();
  const {user} = useAuth();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const [appointments, setAppointments] = useState([]);
  const [pendingIntents, setPendingIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    loadAppointments();
    loadPendingIntents();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getAllCustomerAppointments();
      setAppointments(result || []);
    } catch (err) {
      setError("No se pudieron cargar tus sesiones");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingIntents = async () => {
    try {
      const result = await paymentService.getPendingIntents();
      setPendingIntents(result?.intents || []);
    } catch (err) {
      setPendingIntents([]);
    }
  };

  const organizeTimeline = (appts) => {
    if (!appts || !Array.isArray(appts)) {
      return {cuponeras: [], pendingTransfers: [], upcoming: [], past: []};
    }

    const cuponeras = [];
    const pendingTransfers = [];
    const upcoming = [];
    const past = [];
    const now = dayjs();

    const byPackage = {};
    for (const apt of appts) {
      if (apt.purchased_package_id) {
        if (!byPackage[apt.purchased_package_id])
          byPackage[apt.purchased_package_id] = [];
        byPackage[apt.purchased_package_id].push(apt);
      }
    }

    for (const [packageId, packageAppts] of Object.entries(byPackage)) {
      const totalSessions = packageAppts[0]?.total_sessions || 0;
      const sessionsUsed = packageAppts.filter(
        (apt) => ["completed", "confirmed", "pending"].includes(apt.status),
      ).length;
      cuponeras.push({
        package_id: packageId,
        treatment_name: packageAppts[0]?.treatment_name || "Tratamiento",
        package_name: packageAppts[0]?.package_name || "Paquete",
        sessions_used: sessionsUsed,
        total_sessions: totalSessions,
        available: totalSessions - sessionsUsed,
      });
    }

    for (const apt of appts) {
      const scheduledAt = dayjs.utc(apt.scheduled_at).tz("America/Montevideo");
      if (
        ["pending", "confirmed"].includes(apt.status) &&
        scheduledAt.isAfter(now)
      ) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    }

    upcoming.sort((a, b) => dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at)));
    past.sort((a, b) => dayjs(b.scheduled_at).diff(dayjs(a.scheduled_at)));

    const byPackageNumbers = {};
    for (const apt of [...upcoming, ...past]) {
      if (apt.purchased_package_id) {
        if (!byPackageNumbers[apt.purchased_package_id])
          byPackageNumbers[apt.purchased_package_id] = [];
        byPackageNumbers[apt.purchased_package_id].push(apt);
      }
    }
    for (const group of Object.values(byPackageNumbers)) {
      group.sort((a, b) => dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at)));
      group.forEach((apt, i) => {
        Object.assign(apt, {session_number: i + 1});
      });
    }

    return {cuponeras, pendingTransfers, upcoming, past};
  };

  const handleAppointmentClick = (appointment) => {
    navigate("/appointment", {state: {appointment}});
  };

  const {cuponeras, pendingTransfers, upcoming, past} =
    organizeTimeline(appointments);

  const PREPAID_METHODS = ["tarjeta", "seña", "deposito"];
  const upcomingPending = upcoming.filter((a) => a.status === "pending");
  const awaitingAdminConfirmation = upcomingPending.filter((a) =>
    PREPAID_METHODS.includes(a.payment_method_expected),
  );
  const cashPending = upcomingPending.filter(
    (a) => a.payment_method_expected === "efectivo",
  );
  const transferPending = upcomingPending.filter(
    (a) => a.payment_method_expected === "transferencia",
  );

  const actionableCount =
    cashPending.length + transferPending.length + pendingIntents.length;

  let banner = null;
  if (actionableCount > 0) {
    const subtitleParts = [];
    if (pendingIntents.length > 0) {
      subtitleParts.push("Agendá tu sesión ya pagada.");
    }
    if (transferPending.length > 0) {
      subtitleParts.push("Subí el comprobante de transferencia para confirmar tu sesión.");
    }
    if (cashPending.length > 0) {
      subtitleParts.push("Te esperamos en el local — recordá traer el pago en efectivo.");
    }
    banner = {
      tone: "urgent",
      title:
        actionableCount === 1
          ? "Hay una reserva que necesita tu atención"
          : `Hay ${actionableCount} reservas que necesitan tu atención`,
      subtitle: subtitleParts.join(" "),
    };
  } else if (awaitingAdminConfirmation.length > 0) {
    banner = {
      tone: "info",
      title:
        awaitingAdminConfirmation.length === 1
          ? "Tu sesión está pendiente de confirmación"
          : `Tenés ${awaitingAdminConfirmation.length} sesiones pendientes de confirmación`,
      subtitle:
        "Una de nuestras esteticistas confirmará tu reserva en breve. No necesitás hacer nada más.",
    };
  }

  const totalRemaining = cuponeras.reduce((acc, c) => acc + c.available, 0);

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.name ||
    "Bienvenido";

  let list = [];
  if (tab === "upcoming") list = upcoming;
  else if (tab === "past") list = past;
  else if (tab === "pending") list = pendingIntents;

  return (
    <section className="fu-account">
      <AccountHero
        name={fullName}
        subtitle="Acá gestionás tus sesiones y tu historial en Forma Urbana."
        stats={[
          {num: upcoming.length, label: "Próximas"},
          {num: past.length, label: "Realizadas"},
          {num: totalRemaining, label: "En cuponera"},
        ]}
      />

      <div className="fu-container">
        {loading ? (
          <div style={{display: "flex", justifyContent: "center", paddingTop: 64, paddingBottom: 64}}>
            <CircularProgress sx={{color: "#2e7d32"}} />
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: "#fff3f3",
              border: "1px solid #f5c2c2",
              borderRadius: "8px",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <p style={{fontSize: 14, color: "#b42a2a", margin: 0}}>{error}</p>
          </div>
        ) : (
          <>
            {/* Attention banner */}
            {banner && (
              <div style={{marginBottom: 32}}>
                <AttentionBanner
                  tone={banner.tone}
                  title={banner.title}
                  subtitle={banner.subtitle}
                />
              </div>
            )}

            {/* Cuponeras */}
            {cuponeras.length > 0 && (
              <div style={{mb: 3}}>
                <h3 className="fu-account__section-title">
                  Tus cuponeras activas
                </h3>
                <div className="fu-cupons">
                  {cuponeras.map((c, idx) => (
                    <CuponeraCard key={idx} cuponera={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="fu-tabs fu-account-edge">
              {[
                {key: "upcoming", label: `Próximas (${upcoming.length})`},
                {
                  key: "pending",
                  label: `Sin Agendar (${pendingIntents.length})`,
                },
                {key: "past", label: `Historial (${past.length})`},
              ].map(({key, label}) => (
                <button
                  key={key}
                  className={`fu-tab${tab === key ? " active" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Appointment list */}
            {list.length === 0 ? (
              <div
                className="fu-account-edge"
                style={{
                  textAlign: "center",
                  padding: 48,
                  border: "1px dashed #e0e0e0",
                  borderRadius: "12px",
                  background: "#fff",
                }}
              >
                <LandingIcon name="event_busy" size={40} color="#bdbdbd" />
                <h3
                  style={{
                    fontFamily: "'Work Sans'",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#141414",
                    margin: "12px 0 6px",
                  }}
                >
                  {tab === "upcoming"
                    ? "No tenés sesiones agendadas"
                    : tab === "pending"
                      ? "No hay pagos pendientes de agendar"
                      : "Todavía no tenés historial"}
                </h3>
                <p style={{fontSize: 14, color: "#5b5b5b", margin: "0 0 20px"}}>
                  {tab === "upcoming"
                    ? "Reservá tu próxima sesión en un par de clics."
                    : tab === "pending"
                      ? "Tus pagos aparecerán acá cuando necesites agendar."
                      : "Cuando hagas tu primera sesión aparecerá acá."}
                </p>
                {tab === "upcoming" && (
                  <button
                    className="fu-btn fu-btn--primary"
                    onClick={() => navigate("/")}
                  >
                    Agendar sesión
                  </button>
                )}
              </div>
            ) : (
              <div className="fu-account-edge">
                {tab === "pending"
                  ? list.map((intent, idx) => (
                      <PendingIntentRow
                        key={intent._id || idx}
                        intent={intent}
                        onClick={() => navigate("/appointment", {state: {pendingIntent: intent}})}
                      />
                    ))
                  : list.map((apt, idx) => (
                      <AppointmentRow
                        key={apt.id || idx}
                        appointment={apt}
                        onClick={() => handleAppointmentClick(apt)}
                      />
                    ))}
              </div>
            )}

            {/* Bottom action */}
            <div style={{textAlign: "center", marginTop: 32, marginBottom: 32}}>
              <button
                className="fu-btn fu-btn--outlined"
                onClick={() => navigate("/")}
              >
                Agendar otra sesión
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
