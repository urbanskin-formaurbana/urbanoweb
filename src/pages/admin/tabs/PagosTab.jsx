import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  LinearProgress,
  Alert,
  Box,
  Snackbar,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import paymentService from "../../../services/payment_service";
import ReceiptModal from "../../../components/ReceiptModal";
import DepositRemainderModal from "../../../components/DepositRemainderModal";
import PaymentCard from "../../../components/admin/PaymentCard";
import PaymentHistoryModal from "../../../components/admin/PaymentHistoryModal";

export default function PagosTab() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Deposit remainder modal
  const [depositRemainderOpen, setDepositRemainderOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [remainderAmount, setRemainderAmount] = useState("");
  const [remainderMethod, setRemainderMethod] = useState("efectivo");
  const [remainderDiscount, setRemainderDiscount] = useState("");
  const [savingRemainder, setSavingRemainder] = useState(false);

  // Receipt modal
  const [receiptItem, setReceiptItem] = useState(null);

  // History modal
  const [historyAppointmentId, setHistoryAppointmentId] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.listPayments({
        needs_attention: true,
        limit: 50,
      });
      setItems(result.items || []);
    } catch {
      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemainderClick = (payment) => {
    setSelectedDeposit(payment);
    setRemainderAmount((payment.remaining || 0).toString());
    setRemainderMethod("efectivo");
    setRemainderDiscount("");
    setDepositRemainderOpen(true);
  };

  const handleRemainderClose = () => {
    setDepositRemainderOpen(false);
    setSelectedDeposit(null);
    setRemainderAmount("");
    setRemainderMethod("efectivo");
    setRemainderDiscount("");
  };

  const handleAddDepositRemainder = async () => {
    if (!selectedDeposit || !remainderAmount || parseFloat(remainderAmount) <= 0) {
      setError("Por favor ingresa un monto válido");
      return;
    }
    setSavingRemainder(true);
    try {
      await paymentService.addDepositRemainder(selectedDeposit.appointment?.id || selectedDeposit.appointment_id, {
        method: remainderMethod,
        amount: parseFloat(remainderAmount),
        discount: parseFloat(remainderDiscount) || 0,
      });
      setSuccessMessage(`Cobro de ${remainderMethod} registrado`);
      loadPayments();
      handleRemainderClose();
    } catch {
      setError("No se pudo registrar el cobro");
    } finally {
      setSavingRemainder(false);
    }
  };

  const handleConfirmTransfer = async (paymentId) => {
    try {
      await paymentService.confirmTransferPayment(paymentId);
      setSuccessMessage("Pago de transferencia confirmado");
      loadPayments();
    } catch {
      setError("No se pudo confirmar la transferencia");
    }
  };

  // DepositRemainderModal expects the same shape as the old deposit objects.
  // Map the unified payment item to that shape.
  const depositForModal = selectedDeposit
    ? {
        customer_name:
          selectedDeposit.customer?.full_name ||
          selectedDeposit.customer_name ||
          "—",
        treatment_name:
          selectedDeposit.treatment?.name ||
          selectedDeposit.treatment_name ||
          "—",
        full_amount: selectedDeposit.full_amount || 0,
        paid_amount: selectedDeposit.paid_amount || selectedDeposit.amount || 0,
        discount_amount: 0,
      }
    : null;

  return (
    <>
      {loading && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Top-right CTA */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/admin/pagos")}
          underline="hover"
        >
          Ver histórico completo →
        </Link>
      </Box>

      {/* Queue */}
      <Stack spacing={2}>
        {!loading && items.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No hay pagos esperando acción.
          </Typography>
        )}

        {items.map((item) => (
          <PaymentCard
            key={item.id}
            payment={item}
            onAddRemainder={handleAddRemainderClick}
            onOpenComprobante={(receiptData) => setReceiptItem(receiptData)}
            onOpenHistory={(apptId) => setHistoryAppointmentId(apptId)}
          />
        ))}
      </Stack>

      {/* Deposit Remainder Modal */}
      <DepositRemainderModal
        open={depositRemainderOpen}
        onClose={handleRemainderClose}
        selectedDeposit={depositForModal}
        remainderAmount={remainderAmount}
        setRemainderAmount={setRemainderAmount}
        remainderMethod={remainderMethod}
        setRemainderMethod={setRemainderMethod}
        remainderDiscount={remainderDiscount}
        setRemainderDiscount={setRemainderDiscount}
        savingRemainder={savingRemainder}
        onConfirm={handleAddDepositRemainder}
        title="Agregar Cobro del Depósito"
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!receiptItem}
        receiptUrl={receiptItem?.url}
        isPdf={receiptItem?.isPdf}
        paymentId={receiptItem?.id}
        onClose={() => setReceiptItem(null)}
        canConfirm={receiptItem?.status === "pending"}
        onConfirm={async () => {
          await handleConfirmTransfer(receiptItem.id);
          setReceiptItem(null);
        }}
        onReject={() => {
          setReceiptItem(null);
          loadPayments();
        }}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        open={!!historyAppointmentId}
        appointmentId={historyAppointmentId}
        onClose={() => setHistoryAppointmentId(null)}
      />

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
