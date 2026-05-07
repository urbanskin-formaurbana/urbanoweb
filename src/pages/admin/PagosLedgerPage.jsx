import { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  TextField,
  Button,
  LinearProgress,
  Alert,
  FormControlLabel,
  Switch,
  Paper,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import SafeDialog from "../../components/common/SafeDialog";
import SlideToConfirm from "../../components/common/SlideToConfirm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useSearchParams } from "react-router-dom";
import paymentService from "../../services/payment_service";
import PaymentCard from "../../components/admin/PaymentCard";
import ReceiptModal from "../../components/ReceiptModal";
import AppointmentDetailModal from "../../components/admin/AppointmentDetailModal";

// ── KPI tile ──────────────────────────────────────────────────────────────────
function StatTile({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, textAlign: "center", minWidth: 80, flex: "1 1 80px" }}
    >
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

// ── Filter chip row ───────────────────────────────────────────────────────────
function ChipGroup({ label, options, value, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
        {label}:
      </Typography>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          size="small"
          onClick={() => onChange(opt.value)}
          color={value === opt.value ? "primary" : "default"}
          variant={value === opt.value ? "filled" : "outlined"}
          clickable
        />
      ))}
    </Box>
  );
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "completed", label: "Confirmados" },
  { value: "rejected", label: "Rechazados" },
];

const METHOD_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "posnet", label: "Posnet" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "deposit", label: "Depósito" },
];

const PAGE_SIZE = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────
function initFromParams(params) {
  return {
    status: params.get("status") || "all",
    method: params.get("method") || "all",
    date_from: params.get("date_from") || "",
    date_to: params.get("date_to") || "",
    customer_search: params.get("customer_search") || "",
    has_comprobante: params.get("has_comprobante") === "true",
    is_deposit: params.get("is_deposit") === "true",
  };
}

function paramsFromFilters(filters, skip) {
  const p = {};
  if (filters.status && filters.status !== "all") p.status = filters.status;
  if (filters.method && filters.method !== "all") p.method = filters.method;
  if (filters.date_from) p.date_from = filters.date_from;
  if (filters.date_to) p.date_to = filters.date_to;
  if (filters.customer_search) p.customer_search = filters.customer_search;
  if (filters.has_comprobante) p.has_comprobante = "true";
  if (filters.is_deposit) p.is_deposit = "true";
  p.limit = PAGE_SIZE;
  if (skip) p.skip = skip;
  return p;
}

// ── Feature flag — set to false to hide the delete button from all cards ──────
const ENABLE_DELETE = true;

// ── Group payment items by appointment ────────────────────────────────────────
// Items sorted newest-first by the API. For each appointment, fold all its
// payments into the first (most-recent) item's `allPayments` array so the
// ledger shows one card per appointment instead of one card per payment.
function groupByAppointment(items) {
  const seen = new Map();
  const result = [];
  for (const item of items) {
    const apptId = item.appointment?.id;
    if (!apptId) {
      result.push({ ...item, allPayments: [item] });
      continue;
    }
    if (seen.has(apptId)) {
      seen.get(apptId).allPayments.push(item);
    } else {
      const group = { ...item, allPayments: [item] };
      seen.set(apptId, group);
      result.push(group);
    }
  }
  return result;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PagosLedgerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => {
    if (!searchParams.size) {
      return {
        status: "all",
        method: "all",
        date_from: "",
        date_to: "",
        customer_search: "",
        has_comprobante: false,
        is_deposit: false,
      };
    }
    return initFromParams(searchParams);
  });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);

  // Receipt modal
  const [receiptItem, setReceiptItem] = useState(null);
  // Appointment detail modal
  const [apptDetailPayment, setApptDetailPayment] = useState(null);
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce search
  const searchDebounce = useRef(null);

  // ── Sync URL ────────────────────────────────────────────────────────────────
  const syncUrl = useCallback(
    (f) => {
      const next = new URLSearchParams();
      if (f.status && f.status !== "all") next.set("status", f.status);
      if (f.method && f.method !== "all") next.set("method", f.method);
      if (f.date_from) next.set("date_from", f.date_from);
      if (f.date_to) next.set("date_to", f.date_to);
      if (f.customer_search) next.set("customer_search", f.customer_search);
      if (f.has_comprobante) next.set("has_comprobante", "true");
      if (f.is_deposit) next.set("is_deposit", "true");
      setSearchParams(next, { replace: true });
    },
    [setSearchParams],
  );

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (currentFilters, currentSkip, append) => {
      setLoading(true);
      setError(null);
      try {
        const params = paramsFromFilters(currentFilters, currentSkip);
        const result = await paymentService.listPayments(params);
        setItems((prev) => (append ? [...prev, ...(result.items || [])] : result.items || []));
        setTotal(result.total || 0);
        setHasMore(result.has_more || false);
      } catch {
        setError("No se pudieron cargar los pagos");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/stats/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      if (res.ok) setStats(await res.json());
    } catch {
      // Stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Initial load
  useEffect(() => {
    setSkip(0);
    fetchPage(filters, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter change helpers ───────────────────────────────────────────────────
  const applyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      syncUrl(newFilters);
      setSkip(0);
      fetchPage(newFilters, 0, false);
    },
    [fetchPage, syncUrl],
  );

  const setFilter = (key, value) => {
    applyFilters({ ...filters, [key]: value });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, customer_search: val }));
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      applyFilters({ ...filters, customer_search: val });
    }, 300);
  };

  const handleLoadMore = () => {
    const nextSkip = skip + PAGE_SIZE;
    setSkip(nextSkip);
    fetchPage(filters, nextSkip, true);
  };

  const handleConfirmTransfer = async (paymentId) => {
    try {
      await paymentService.confirmTransferPayment(paymentId);
      setSkip(0);
      fetchPage(filters, 0, false);
    } catch {
      setError("No se pudo confirmar la transferencia");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await paymentService.deletePayment(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      setError("No se pudo borrar el registro");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate("/admin")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Histórico de pagos
        </Typography>
      </Box>

      {/* Two-column layout on desktop */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* ── Sidebar: KPIs + Filters ── */}
        <Box
          sx={{
            width: { xs: "100%", md: 300 },
            flexShrink: 0,
            position: { md: "sticky" },
            top: { md: 16 },
          }}
        >
          {/* KPI strip */}
          {stats && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
                mb: 2,
              }}
            >
              <StatTile label="Completados" value={stats.completed_count} />
              <StatTile label="Pendientes" value={stats.pending_count} />
              <StatTile label="Fallidos" value={stats.failed_count} />
              <StatTile
                label="Ingresos totales"
                value={`$${(stats.total_revenue || 0).toFixed(0)}`}
              />
            </Box>
          )}

          {/* Filter bar */}
          <Stack spacing={1.5}>
            <ChipGroup
              label="Estado"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(v) => setFilter("status", v)}
            />
            <ChipGroup
              label="Método"
              options={METHOD_OPTIONS}
              value={filters.method}
              onChange={(v) => setFilter("method", v)}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Desde"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.date_from}
                onChange={(e) => setFilter("date_from", e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Hasta"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.date_to}
                onChange={(e) => setFilter("date_to", e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              label="Buscar cliente"
              size="small"
              fullWidth
              value={filters.customer_search}
              onChange={handleSearchChange}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.has_comprobante}
                    onChange={(e) => setFilter("has_comprobante", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Solo con comprobante</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.is_deposit}
                    onChange={(e) => setFilter("is_deposit", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Solo depósitos</Typography>}
              />
            </Box>
          </Stack>
        </Box>

        {/* ── Main content: list ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading && !items.length && <LinearProgress sx={{ mb: 1 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Results summary */}
          {!loading && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              {total} resultado{total !== 1 ? "s" : ""}
            </Typography>
          )}

          {/* Payment list */}
          <Stack spacing={2}>
            {!loading && items.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 4 }}
              >
                No hay pagos para los filtros seleccionados.
              </Typography>
            )}

            {groupByAppointment(items).map((item) => (
              <PaymentCard
                key={item.appointment?.id || item.id}
                payment={item}
                allPayments={item.allPayments}
                variant="ledger"
                onOpenComprobante={(rd) => setReceiptItem(rd)}
                onViewAppointment={
                  item.appointment?.id
                    ? () => setApptDetailPayment(item)
                    : undefined
                }
                onDelete={ENABLE_DELETE ? (p) => setDeleteTarget(p) : undefined}
              />
            ))}
          </Stack>

          {/* Load more */}
          {hasMore && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outlined"
                size="small"
              >
                {loading ? "Cargando..." : "Cargar más"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Receipt modal — read-only from ledger, but confirm/reject still works */}
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
          setSkip(0);
          fetchPage(filters, 0, false);
        }}
      />

      {/* Appointment detail modal */}
      <AppointmentDetailModal
        open={!!apptDetailPayment}
        appointmentId={apptDetailPayment?.appointment?.id}
        payment={apptDetailPayment}
        onClose={() => setApptDetailPayment(null)}
        onDeleted={() => { setSkip(0); fetchPage(filters, 0, false); }}
      />

      {/* Delete confirmation */}
      <SafeDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Borrar registro de pago</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés borrar este pago de{" "}
            <strong>
              {deleteTarget?.customer?.full_name || deleteTarget?.customer_name || "este cliente"}
            </strong>
            {deleteTarget?.amount ? ` por $${Number(deleteTarget.amount).toFixed(2)}` : ""}?
            Esta acción es irreversible.
          </DialogContentText>
          <SlideToConfirm
            key={deleteTarget?.id}
            label="Deslizá para borrar"
            onConfirm={handleDeleteConfirmed}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        </DialogActions>
      </SafeDialog>
    </Container>
  );
}
