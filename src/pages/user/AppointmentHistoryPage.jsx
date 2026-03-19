import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Container,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

import appointmentService from "../../services/appointment_service";
import paymentService from "../../services/payment_service";

export default function AppointmentHistoryPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [pendingIntents, setPendingIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error("Error loading appointments:", err);
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
      console.error("Error loading pending intents:", err);
      // Don't block the page if intents fail to load
      setPendingIntents([]);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return dayjs(isoString)
      .tz("America/Montevideo")
      .format("DD MMM YYYY HH:mm");
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

    // Group appointments by purchased_package_id to build cuponera summaries
    const byPackage = {};
    for (const apt of appts) {
      if (apt.purchased_package_id) {
        if (!byPackage[apt.purchased_package_id]) {
          byPackage[apt.purchased_package_id] = [];
        }
        byPackage[apt.purchased_package_id].push(apt);
      }
    }

    // Build cuponera summary cards
    for (const [packageId, packageAppts] of Object.entries(byPackage)) {
      // Get total_sessions from the first appointment in this package
      const totalSessions = packageAppts[0]?.total_sessions || 0;
      const treatmentName = packageAppts[0]?.treatment_name || "Tratamiento";
      const packageName = packageAppts[0]?.package_name || "Paquete";

      // Count completed sessions
      const sessionsUsed = packageAppts.filter(
        (apt) => apt.status === "completed",
      ).length;

      const available = totalSessions - sessionsUsed;

      cuponeras.push({
        package_id: packageId,
        treatment_name: treatmentName,
        package_name: packageName,
        sessions_used: sessionsUsed,
        total_sessions: totalSessions,
        available: available,
      });
    }

    // Separate appointments into pending transfers, upcoming and past
    for (const apt of appts) {
      // Check if awaiting bank transfer
      if (
        apt.payment_status === "awaiting_payment" &&
        apt.payment_method_expected === "transferencia"
      ) {
        pendingTransfers.push(apt);
      } else {
        const scheduledAt = dayjs(apt.scheduled_at);
        if (
          ["pending", "confirmed"].includes(apt.status) &&
          scheduledAt.isAfter(now)
        ) {
          upcoming.push(apt);
        } else {
          past.push(apt);
        }
      }
    }

    // Sort upcoming by scheduled_at ascending (nearest first)
    upcoming.sort((a, b) => dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at)));

    // Sort past by scheduled_at descending (most recent first)
    past.sort((a, b) => dayjs(b.scheduled_at).diff(dayjs(a.scheduled_at)));

    // Recalculate session numbers by chronological order within each package
    const allAppointments = [...upcoming, ...past];
    const byPackageNumbers = {};
    for (const apt of allAppointments) {
      if (apt.purchased_package_id) {
        if (!byPackageNumbers[apt.purchased_package_id]) {
          byPackageNumbers[apt.purchased_package_id] = [];
        }
        byPackageNumbers[apt.purchased_package_id].push(apt);
      }
    }
    for (const group of Object.values(byPackageNumbers)) {
      group.sort((a, b) => dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at)));
      group.forEach((apt, i) => {
        apt.session_number = i + 1;
      });
    }

    return {cuponeras, pendingTransfers, upcoming, past};
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "#2e7d32",
      pending: "#ed6c02",
      confirmed: "#1976d2",
      no_show: "#d32f2f",
      cancelled: "#d32f2f",
    };
    return colors[status] || "#757575";
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: "Completada",
      pending: "Pendiente",
      confirmed: "Confirmada",
      no_show: "No se presentó",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
  };

  const handleAppointmentClick = (appointment) => {
    navigate("/appointment", {state: {appointment}});
  };

  const {cuponeras, pendingTransfers, upcoming, past} =
    organizeTimeline(appointments);

  return (
    <Container maxWidth="md" sx={{py: 4}}>
      <Typography variant="h5" gutterBottom sx={{fontWeight: "bold", mb: 3}}>
        Mis Sesiones
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={3}>
          {/* Pending Transfers - Awaiting Payment */}
          {pendingTransfers.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="textSecondary"
                sx={{textTransform: "uppercase"}}
              >
                Pago Pendiente
              </Typography>
              <Stack spacing={1.5} sx={{mt: 1}}>
                {pendingTransfers.map((apt, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleAppointmentClick(apt)}
                    sx={{
                      p: 2,
                      bgcolor: "#fff8e1",
                      borderLeft: "4px solid #f57f17",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {apt.treatment_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(apt.scheduled_at)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{display: "block", mt: 0.5}}
                        >
                          Sube el comprobante para confirmar el pago
                        </Typography>
                      </Box>
                      <Chip
                        label="Pago Pendiente"
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Pending Payment Intents - Awaiting Scheduling */}
          {pendingIntents.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="textSecondary"
                sx={{textTransform: "uppercase"}}
              >
                Pendiente de Agendar
              </Typography>
              <Stack spacing={1.5} sx={{mt: 1}}>
                {pendingIntents.map((intent, idx) => (
                  <Box
                    key={idx}
                    onClick={() =>
                      navigate("/schedule", {
                        state: {
                          treatment: {
                            name: intent.treatment_name,
                            slug: intent.treatment_id,
                          },
                          paymentMethod: intent.payment_method,
                          intentPaymentId: intent._id,
                        },
                      })
                    }
                    sx={{
                      p: 2,
                      bgcolor: "#f3e5f5",
                      borderLeft: "4px solid #9c27b0",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {intent.treatment_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {intent.payment_method === "transferencia"
                            ? "Transferencia Bancaria"
                            : "Pago en Efectivo"}{" "}
                          • ${intent.amount}
                        </Typography>
                        {intent.comprobante_url && (
                          <Typography
                            variant="caption"
                            color="success"
                            sx={{display: "block", mt: 0.5}}
                          >
                            ✓ Con comprobante
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label="Agendar ahora"
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Active Cuponeras */}
          {cuponeras.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="textSecondary"
                sx={{textTransform: "uppercase"}}
              >
                Mis Paquetes
              </Typography>
              <Stack spacing={1.5} sx={{mt: 1}}>
                {cuponeras.map((cuponera, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "#fff3e0",
                      borderLeft: "4px solid #ff9800",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {cuponera.treatment_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{display: "block", mt: 0.5}}
                    >
                      {cuponera.package_name}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (cuponera.sessions_used / cuponera.total_sessions) * 100
                      }
                      sx={{my: 1.5}}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {cuponera.sessions_used}/{cuponera.total_sessions} usadas
                      • {cuponera.available} disponibles
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Upcoming Sessions */}
          {upcoming.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="textSecondary"
                sx={{textTransform: "uppercase"}}
              >
                Próximas Sesiones
              </Typography>
              <Stack spacing={1.5} sx={{mt: 1}}>
                {upcoming.map((apt, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleAppointmentClick(apt)}
                    sx={{
                      p: 2,
                      bgcolor: "#e3f2fd",
                      borderLeft: "4px solid #2196f3",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {apt.treatment_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(apt.scheduled_at)}
                        </Typography>
                        {apt.reschedule_count > 0 && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{display: "block", mt: 0.5}}
                          >
                            Reprogramada {apt.reschedule_count}{" "}
                            {apt.reschedule_count === 1 ? "vez" : "veces"}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          alignItems: "flex-end",
                        }}
                      >
                        <Chip
                          label={getStatusLabel(apt.status)}
                          color="primary"
                          size="small"
                        />
                        {apt.session_number && (
                          <Chip
                            label={`Sesión ${apt.session_number}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Past Sessions */}
          {past.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="textSecondary"
                sx={{textTransform: "uppercase"}}
              >
                Sesiones Anteriores
              </Typography>
              <Stack spacing={1.5} sx={{mt: 1}}>
                {past.map((apt, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleAppointmentClick(apt)}
                    sx={{
                      p: 2,
                      bgcolor:
                        apt.status === "completed"
                          ? "#f1f8e9"
                          : apt.status === "no_show"
                            ? "#ffebee"
                            : "#f5f5f5",
                      borderLeft: `4px solid ${getStatusColor(apt.status)}`,
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {apt.treatment_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(apt.scheduled_at)}
                        </Typography>
                        {apt.reschedule_count > 0 && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{display: "block", mt: 0.5}}
                          >
                            Reprogramada {apt.reschedule_count}{" "}
                            {apt.reschedule_count === 1 ? "vez" : "veces"}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          alignItems: "flex-end",
                        }}
                      >
                        <Chip
                          label={getStatusLabel(apt.status)}
                          sx={{
                            backgroundColor: getStatusColor(apt.status),
                            color: "white",
                          }}
                          size="small"
                        />
                        {apt.session_number && (
                          <Chip
                            label={`Sesión ${apt.session_number}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {!cuponeras.length && !upcoming.length && !past.length && (
            <Alert severity="info">No tienes sesiones registradas</Alert>
          )}

          {/* Footer action buttons */}
          <Box sx={{display: "flex", gap: 1, pt: 2}}>
            <Button fullWidth variant="outlined" onClick={() => navigate("/")}>
              Ir a Inicio
            </Button>
          </Box>
        </Stack>
      )}
    </Container>
  );
}
