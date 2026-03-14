import {useState, useEffect} from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Collapse,
  IconButton,
  Snackbar,
} from "@mui/material";
import {ExpandMore as ExpandMoreIcon, Edit as EditIcon, Check as CheckIcon, Close as CloseIcon} from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
import adminService from "../../../services/admin_service";
import CreateAppointmentModal from "../../../components/CreateAppointmentModal";

export default function SociosTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Create appointment modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalCustomer, setCreateModalCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getCustomers();
      if (result.customers) {
        setCustomers(
          result.customers.map((customer) => ({
            id: customer._id,
            name: customer.full_name,
            phone: customer.whatsapp_phone,
            email: customer.email,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading customers:", err);
      setError("No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.includes(searchTerm)),
  );

  const handleExpandCustomer = async (customerId) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }

    setExpandedCustomerId(customerId);
    setHistoryLoading(true);
    try {
      const history = await adminService.getCustomerHistory(customerId);
      setCustomerHistory(history);
    } catch (err) {
      console.error("Error loading customer history:", err);
      setError("No se pudo cargar el historial");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleApproveCustomer = async (customerId) => {
    try {
      await adminService.approveCustomer(customerId);
      // Reload history
      const history = await adminService.getCustomerHistory(customerId);
      setCustomerHistory(history);
    } catch (err) {
      console.error("Error approving customer:", err);
      setError("No se pudo aprobar al cliente");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return dayjs(isoString).tz("America/Montevideo").format("DD MMM YYYY HH:mm");
  };

  const organizeTimeline = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) return { cuponeras: [], upcoming: [], past: [] };

    const cuponeras = [];
    const upcoming = [];
    const past = [];
    const now = dayjs();

    for (const item of timeline) {
      if (item.kind === "cuponera") {
        cuponeras.push(item);
      } else if (item.kind === "appointment") {
        const scheduledAt = dayjs(item.scheduled_at);
        if (["pending", "confirmed"].includes(item.status) && scheduledAt.isAfter(now)) {
          upcoming.push(item);
        } else {
          past.push(item);
        }
      }
    }

    // Sort upcoming by scheduled_at ascending
    upcoming.sort((a, b) => dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at)));

    // Sort past by scheduled_at descending
    past.sort((a, b) => dayjs(b.scheduled_at).diff(dayjs(a.scheduled_at)));

    return { cuponeras, upcoming, past };
  };

  const handleEditFeedback = (appointment) => {
    setEditingFeedbackId(appointment.appointment_id);
    setFeedbackText(appointment.admin_feedback || "");
  };

  const handleSaveFeedback = async (appointmentId) => {
    setSavingFeedback(true);
    try {
      await adminService.updateFeedback(appointmentId, feedbackText);
      setSnackbarMsg("Feedback actualizado");
      setEditingFeedbackId(null);
      setFeedbackText("");
      // Reload history
      const history = await adminService.getCustomerHistory(expandedCustomerId);
      setCustomerHistory(history);
    } catch (err) {
      console.error("Error updating feedback:", err);
      setSnackbarMsg("Error al actualizar feedback");
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setFeedbackText("");
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

  return (
    <Box sx={{py: 2}}>
      <Typography variant="h6" gutterBottom>
        Gestión de Clientes
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre, teléfono o email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{mb: 2}}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {filteredCustomers.length === 0 ? (
            <Typography color="textSecondary">No hay clientes</Typography>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      flex={1}
                      onClick={() => handleExpandCustomer(customer.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {customer.phone} | {customer.email}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateModalCustomer({
                          id: customer.id,
                          name: customer.name,
                          phone: customer.phone,
                          email: customer.email,
                        });
                        setCreateModalOpen(true);
                      }}
                    >
                      Nueva sesión
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandCustomer(customer.id)}
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform:
                            expandedCustomerId === customer.id
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCustomerId === customer.id}>
                    <Box sx={{mt: 2, pt: 2, borderTop: "1px solid #eee"}}>
                      {historyLoading ? (
                        <CircularProgress size={24} />
                      ) : customerHistory ? (
                        <Stack spacing={2}>
                          {/* Status Badge */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 3,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              Estado:
                            </Typography>
                            <Chip
                              label={
                                customerHistory.can_purchase_packages
                                  ? "Puede comprar paquetes"
                                  : "Requiere evaluación"
                              }
                              color={
                                customerHistory.can_purchase_packages
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                            {!customerHistory.can_purchase_packages && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                sx={{ml: 1, mt: 1}}
                                onClick={() =>
                                  handleApproveCustomer(customer.id)
                                }
                              >
                                Aprobar como socio
                              </Button>
                            )}
                          </Box>

                          {/* Historial de Sesiones */}
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{mb: 2}}>
                              Historial de Sesiones
                            </Typography>
                            {(() => {
                              const { cuponeras, upcoming, past } = organizeTimeline(customerHistory.timeline);
                              return (
                                <Stack spacing={2}>
                                  {/* Pending Cuponeras */}
                                  {cuponeras.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{textTransform: "uppercase"}}>
                                        Pendientes en Cuponera
                                      </Typography>
                                      {cuponeras.map((cuponera, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            mt: 1,
                                            p: 1.5,
                                            bgcolor: "#fff3e0",
                                            borderLeft: "4px solid #ff9800",
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Typography variant="body2" fontWeight="bold">
                                            {cuponera.treatment_name}
                                          </Typography>
                                          <Typography variant="caption" color="textSecondary" sx={{display: "block", mt: 0.5}}>
                                            {cuponera.package_name}
                                          </Typography>
                                          <LinearProgress
                                            variant="determinate"
                                            value={(cuponera.sessions_used / cuponera.total_sessions) * 100}
                                            sx={{my: 1}}
                                          />
                                          <Typography variant="caption" color="textSecondary">
                                            {cuponera.sessions_used}/{cuponera.total_sessions} usadas • {cuponera.total_sessions - cuponera.sessions_used} restantes
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}

                                  {/* Upcoming Sessions */}
                                  {upcoming.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{textTransform: "uppercase"}}>
                                        Próximas Sesiones
                                      </Typography>
                                      {upcoming.map((apt, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            mt: 1,
                                            p: 1.5,
                                            bgcolor: "#e3f2fd",
                                            borderLeft: "4px solid #2196f3",
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                            <Box>
                                              <Typography variant="body2" fontWeight="bold">
                                                {apt.treatment_name}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary">
                                                {formatDate(apt.scheduled_at)}
                                              </Typography>
                                              {apt.session_number && (
                                                <Chip
                                                  label={`Sesión ${apt.session_number}`}
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{mt: 0.5}}
                                                />
                                              )}
                                              {apt.reschedule_count > 0 && (
                                                <Typography variant="caption" color="error" sx={{display: "block", mt: 0.5}}>
                                                  Reprogramada {apt.reschedule_count} {apt.reschedule_count === 1 ? "vez" : "veces"}
                                                </Typography>
                                              )}
                                            </Box>
                                            <Chip label={getStatusLabel(apt.status)} color="primary" size="small" />
                                          </Box>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}

                                  {/* Past Sessions */}
                                  {past.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{textTransform: "uppercase"}}>
                                        Sesiones Completadas
                                      </Typography>
                                      {past.map((apt, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            mt: 1,
                                            p: 1.5,
                                            bgcolor: apt.status === "completed" ? "#f1f8e9" : apt.status === "no_show" ? "#ffebee" : "#f5f5f5",
                                            borderLeft: `4px solid ${getStatusColor(apt.status)}`,
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1}}>
                                            <Box>
                                              <Typography variant="body2" fontWeight="bold">
                                                {apt.treatment_name}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary">
                                                {formatDate(apt.scheduled_at)}
                                              </Typography>
                                              {apt.session_number && (
                                                <Chip
                                                  label={`Sesión ${apt.session_number}`}
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{mt: 0.5}}
                                                />
                                              )}
                                              {apt.reschedule_count > 0 && (
                                                <Typography variant="caption" color="error" sx={{display: "block", mt: 0.5}}>
                                                  Reprogramada {apt.reschedule_count} {apt.reschedule_count === 1 ? "vez" : "veces"}
                                                </Typography>
                                              )}
                                            </Box>
                                            <Chip
                                              label={getStatusLabel(apt.status)}
                                              sx={{backgroundColor: getStatusColor(apt.status), color: "white"}}
                                              size="small"
                                            />
                                          </Box>

                                          {/* Feedback Section */}
                                          {apt.status === "completed" && (
                                            <Box sx={{mt: 1, pt: 1, borderTop: "1px solid #ddd"}}>
                                              {editingFeedbackId === apt.appointment_id ? (
                                                <Box sx={{display: "flex", gap: 1, alignItems: "flex-start"}}>
                                                  <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    size="small"
                                                    value={feedbackText}
                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                    placeholder="Escribir feedback..."
                                                  />
                                                  <Box sx={{display: "flex", gap: 0.5, mt: 0.5}}>
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleSaveFeedback(apt.appointment_id)}
                                                      disabled={savingFeedback || !feedbackText.trim()}
                                                    >
                                                      <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                      size="small"
                                                      onClick={handleCancelEdit}
                                                      disabled={savingFeedback}
                                                    >
                                                      <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                  </Box>
                                                </Box>
                                              ) : (
                                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                                  <Box sx={{flex: 1}}>
                                                    <Typography variant="caption" fontWeight="bold" color="textSecondary">
                                                      Feedback:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{mt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
                                                      {apt.admin_feedback || "(sin feedback)"}
                                                    </Typography>
                                                  </Box>
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => handleEditFeedback(apt)}
                                                  >
                                                    <EditIcon fontSize="small" />
                                                  </IconButton>
                                                </Box>
                                              )}
                                            </Box>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}

                                  {!cuponeras.length && !upcoming.length && !past.length && (
                                    <Alert severity="info">Sin historial de sesiones</Alert>
                                  )}
                                </Stack>
                              );
                            })()}
                          </Box>
                        </Stack>
                      ) : null}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={3000}
        onClose={() => setSnackbarMsg("")}
        message={snackbarMsg}
      />

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateModalCustomer(null);
        }}
        onCreated={() => {
          setCreateModalOpen(false);
          setCreateModalCustomer(null);
        }}
        prefilledCustomer={createModalCustomer}
      />
    </Box>
  );
}
