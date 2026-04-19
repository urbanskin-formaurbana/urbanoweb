import {useState, useEffect} from "react";
import {
  Stack,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Box,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import paymentService from "../../../services/payment_service";
import ReceiptModal from "../../../components/ReceiptModal";
import DepositRemainderModal from "../../../components/DepositRemainderModal";

const FILTER_OPTIONS = {
  all: "all",
  depositos: "depositos",
  sin_agendar: "sin_agendar",
  agendadas: "agendadas",
};

export default function PagosTab() {
  const [filter, setFilter] = useState(FILTER_OPTIONS.all);
  const [deposits, setDeposits] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Modals
  const [depositRemainderModalOpen, setDepositRemainderModalOpen] =
    useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [remainderAmount, setRemainderAmount] = useState("");
  const [remainderMethod, setRemainderMethod] = useState("efectivo");
  const [savingRemainder, setSavingRemainder] = useState(false);
  const [receiptItem, setReceiptItem] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [depositsResult, transfersResult] = await Promise.all([
        paymentService.getPendingDeposits(),
        paymentService.getTransfersWithReceipt(),
      ]);
      setDeposits(depositsResult.deposits || []);
      setTransfers(transfersResult.transfers || []);
    } catch (err) {
      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    const items = [];

    if (filter === FILTER_OPTIONS.all || filter === FILTER_OPTIONS.depositos) {
      items.push(
        ...deposits.map((d) => ({
          type: "deposit",
          ...d,
        })),
      );
    }

    if (
      filter === FILTER_OPTIONS.all ||
      filter === FILTER_OPTIONS.sin_agendar
    ) {
      items.push(
        ...transfers
          .filter((t) => !t.is_scheduled)
          .map((t) => ({
            type: "transfer_pending",
            ...t,
          })),
      );
    }

    if (filter === FILTER_OPTIONS.all || filter === FILTER_OPTIONS.agendadas) {
      items.push(
        ...transfers
          .filter((t) => t.is_scheduled)
          .map((t) => ({
            type: "transfer_scheduled",
            ...t,
          })),
      );
    }

    return items;
  };

  const handleAddRemainderClick = (deposit) => {
    setSelectedDeposit(deposit);
    setRemainderAmount((deposit.remaining || 0).toString());
    setRemainderMethod("efectivo");
    setDepositRemainderModalOpen(true);
  };

  const handleRemainderModalClose = () => {
    setDepositRemainderModalOpen(false);
    setSelectedDeposit(null);
    setRemainderAmount("");
    setRemainderMethod("efectivo");
  };

  const handleAddDepositRemainder = async () => {
    if (
      !selectedDeposit ||
      !remainderAmount ||
      parseFloat(remainderAmount) <= 0
    ) {
      setError("Por favor ingresa un monto válido");
      return;
    }

    setSavingRemainder(true);
    try {
      await paymentService.addDepositRemainder(selectedDeposit.appointment_id, {
        method: remainderMethod,
        amount: parseFloat(remainderAmount),
      });
      setSuccessMessage(`Cobro de ${remainderMethod} registrado`);
      loadPayments();
      handleRemainderModalClose();
    } catch (err) {
      setError("No se pudo registrar el cobro");
    } finally {
      setSavingRemainder(false);
    }
  };

  const handleConfirmTransfer = async (transferId) => {
    try {
      await paymentService.confirmTransferPayment(transferId);
      setSuccessMessage("Pago de transferencia confirmado");
      loadPayments();
    } catch (err) {
      setError("No se pudo confirmar la transferencia");
    }
  };

  const isPdf = (item) =>
    /\.pdf($|\?)/i.test(item.comprobante_url) ||
    item.comprobante_filename?.endsWith(".pdf");

  const filteredItems = getFilteredItems();

  return (
    <>
      {loading && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Box sx={{mb: 3, overflowX: "auto", whiteSpace: "nowrap", pb: 0.5}}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => {
            if (newFilter !== null) setFilter(newFilter);
          }}
          size="small"
        >
          <ToggleButton value={FILTER_OPTIONS.all}>Todos</ToggleButton>
          <ToggleButton value={FILTER_OPTIONS.depositos}>
            Depósitos
          </ToggleButton>
          <ToggleButton value={FILTER_OPTIONS.sin_agendar}>
            Transferencias sin agendar
          </ToggleButton>
          <ToggleButton value={FILTER_OPTIONS.agendadas}>
            Transferencias agendadas
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Payment Items */}
      <Stack spacing={2}>
        {filteredItems.length === 0 && !loading && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{py: 4}}
          >
            No hay pagos en esta categoría
          </Typography>
        )}

        {filteredItems.map((item) => {
          const borderColor = item.status === "pending" ? "#ed6c02" : "#2e7d32";
          const statusLabel =
            item.status === "pending" ? "Pendiente" : "Pagado";

          if (item.type === "deposit") {
            return (
              <Card
                key={`deposit-${item.deposit_id}`}
                sx={{borderLeft: `4px solid ${borderColor}`}}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.customer_name}
                    </Typography>
                    <Chip
                      label={statusLabel}
                      color={item.status === "pending" ? "warning" : "success"}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mb: 1}}
                  >
                    {item.treatment_name}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Depósito</strong> • Total: $
                      {item.full_amount.toFixed(2)} • Pagado: $
                      {item.paid_amount.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="error"
                      fontWeight="bold"
                      sx={{mt: 0.5}}
                    >
                      Falta: ${item.remaining.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddRemainderClick(item)}
                  >
                    Agregar cobro
                  </Button>
                </CardActions>
              </Card>
            );
          } else if (item.type === "transfer_pending") {
            return (
              <Card
                key={`transfer-pending-${item.id}`}
                sx={{borderLeft: `4px solid ${borderColor}`}}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.customer_name}
                    </Typography>
                    <Chip
                      label={statusLabel}
                      color={item.status === "pending" ? "warning" : "success"}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mb: 1}}
                  >
                    {item.treatment_name}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Transferencia</strong> • Monto: $
                      {item.amount.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{mt: 0.5}}
                    >
                      Subida:{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("es-UY")
                        : "—"}
                    </Typography>
                  </Box>

                  {item.comprobante_url && (
                    <Box sx={{mt: 1}}>
                      {isPdf(item) ? (
                        <Chip
                          icon={<PictureAsPdfIcon />}
                          label="Ver comprobante PDF"
                          size="small"
                          clickable
                          onClick={() => {
                            setReceiptItem({
                              id: item.id,
                              url: item.comprobante_url,
                              isPdf: true,
                              status: item.status,
                            });
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={item.comprobante_url}
                          alt="Comprobante"
                          sx={{
                            maxWidth: "80px",
                            maxHeight: "80px",
                            objectFit: "contain",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setReceiptItem({
                              id: item.id,
                              url: item.comprobante_url,
                              isPdf: false,
                              status: item.status,
                            });
                          }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          } else if (item.type === "transfer_scheduled") {
            return (
              <Card
                key={`transfer-scheduled-${item.id}`}
                sx={{borderLeft: `4px solid ${borderColor}`}}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.customer_name}
                    </Typography>
                    <Chip
                      label={statusLabel}
                      color={item.status === "pending" ? "warning" : "success"}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mb: 1}}
                  >
                    {item.treatment_name}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Transferencia</strong> • Monto: $
                      {item.amount.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{mt: 0.5}}
                    >
                      Turno:{" "}
                      {item.appointment_date
                        ? new Date(item.appointment_date).toLocaleDateString(
                            "es-UY",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"}
                    </Typography>
                  </Box>

                  <Box sx={{mt: 1, display: "flex", gap: 1}}>
                    <Chip
                      label={item.appointment_status || "—"}
                      size="small"
                      color={
                        item.appointment_status === "confirmed"
                          ? "success"
                          : item.appointment_status === "pending"
                            ? "warning"
                            : "default"
                      }
                    />
                    <Chip
                      label={item.status}
                      size="small"
                      color={
                        item.status === "completed" ? "success" : "warning"
                      }
                    />
                  </Box>

                  {item.comprobante_url && (
                    <Box sx={{mt: 1}}>
                      {isPdf(item) ? (
                        <Chip
                          icon={<PictureAsPdfIcon />}
                          label="Ver comprobante PDF"
                          size="small"
                          clickable
                          onClick={() => {
                            setReceiptItem({
                              id: item.id,
                              url: item.comprobante_url,
                              isPdf: true,
                              status: item.status,
                            });
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={item.comprobante_url}
                          alt="Comprobante"
                          sx={{
                            maxWidth: "80px",
                            maxHeight: "80px",
                            objectFit: "contain",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setReceiptItem({
                              id: item.id,
                              url: item.comprobante_url,
                              isPdf: false,
                              status: item.status,
                            });
                          }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </Stack>

      {/* Deposit Remainder Modal */}
      <DepositRemainderModal
        open={depositRemainderModalOpen}
        onClose={handleRemainderModalClose}
        selectedDeposit={selectedDeposit}
        remainderAmount={remainderAmount}
        setRemainderAmount={setRemainderAmount}
        remainderMethod={remainderMethod}
        setRemainderMethod={setRemainderMethod}
        savingRemainder={savingRemainder}
        onConfirm={handleAddDepositRemainder}
        title="Agregar Cobro del Depósito"
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!receiptItem}
        receiptUrl={receiptItem?.url}
        isPdf={receiptItem?.isPdf}
        onClose={() => setReceiptItem(null)}
        canConfirm={receiptItem?.status === 'pending'}
        onConfirm={async () => {
          await handleConfirmTransfer(receiptItem.id);
          setReceiptItem(null);
        }}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </>
  );
}
