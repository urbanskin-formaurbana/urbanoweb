import { useState, useEffect } from "react";
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
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import bankService from "../../../services/bank_service";

const DEFAULT_DEPOSIT_AMOUNT = 500;
const DEFAULT_BUSINESS_HOURS = {
  monday: { enabled: true, start_time: "10:00", end_time: "20:00" },
  tuesday: { enabled: true, start_time: "10:00", end_time: "20:00" },
  wednesday: { enabled: true, start_time: "10:00", end_time: "20:00" },
  thursday: { enabled: true, start_time: "10:00", end_time: "20:00" },
  friday: { enabled: true, start_time: "10:00", end_time: "20:00" },
  saturday: { enabled: true, start_time: "10:00", end_time: "17:00" },
  sunday: { enabled: true, start_time: "17:00", end_time: "20:00" },
};
const DAY_LABELS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

function normalizeBusinessHours(value) {
  if (!value || typeof value !== "object") return { ...DEFAULT_BUSINESS_HOURS };
  const normalized = {};
  Object.entries(DEFAULT_BUSINESS_HOURS).forEach(([day, defaults]) => {
    const incoming = value[day] || {};
    normalized[day] = {
      enabled: incoming.enabled ?? defaults.enabled,
      start_time: incoming.start_time || defaults.start_time,
      end_time: incoming.end_time || defaults.end_time,
    };
  });
  return normalized;
}

function getValidDepositAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DEPOSIT_AMOUNT;
  }
  return parsed;
}

export default function BusinessDetailsTab() {
  const [businessDetails, setBusinessDetails] = useState({
    bank_name: "",
    account_number: "",
    account_type: "",
    notes: "",
    whatsapp_phone: "",
    business_email: "",
    business_address: "",
    business_hours: { ...DEFAULT_BUSINESS_HOURS },
    deposit_amount: DEFAULT_DEPOSIT_AMOUNT.toString(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadBusinessDetails();
  }, []);

  const loadBusinessDetails = async () => {
    setLoading(true);
    try {
      const data = await bankService.getBankDetails();
      setBusinessDetails({
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        account_type: data.account_type || "",
        notes: data.notes || "",
        whatsapp_phone: data.whatsapp_phone || "",
        business_email: data.business_email || "",
        business_address: data.business_address || "",
        business_hours: normalizeBusinessHours(data.business_hours),
        deposit_amount: getValidDepositAmount(data.deposit_amount).toString(),
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al cargar los datos del negocio",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setBusinessDetails({
      ...businessDetails,
      [field]: event.target.value,
    });
  };

  const handleBusinessHourChange = (day, field, value) => {
    setBusinessDetails((prev) => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalizedDepositAmount = getValidDepositAmount(
        businessDetails.deposit_amount,
      );
      await bankService.updateBankDetails({
        ...businessDetails,
        deposit_amount: normalizedDepositAmount,
      });
      setBusinessDetails((prev) => ({
        ...prev,
        deposit_amount: normalizedDepositAmount.toString(),
      }));
      setSnackbar({
        open: true,
        message: "Datos del negocio guardados exitosamente",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error de conexión al guardar",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
            Configurar Datos del Negocio
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Estos datos se mostrarán a los clientes en el sitio web.
          </Alert>

          <Stack spacing={2}>
            <TextField
              label="Número de WhatsApp del Negocio"
              value={businessDetails.whatsapp_phone}
              onChange={handleChange("whatsapp_phone")}
              placeholder="Ej: 59898123456"
              fullWidth
              helperText="Número sin espacios. Ej: 59898123456"
            />

            <TextField
              label="Correo Electrónico del Negocio"
              value={businessDetails.business_email}
              onChange={handleChange("business_email")}
              placeholder="Ej: info@formaurbana.com"
              fullWidth
              helperText="Se mostrará en el sitio web para contacto"
              type="email"
            />

            <TextField
              label="Dirección del Negocio"
              value={businessDetails.business_address}
              onChange={handleChange("business_address")}
              placeholder="Ej: Convención 1378. Galería Libertador. Local 80. Montevideo Centro"
              fullWidth
              helperText="Se mostrará en el footer del sitio web"
            />

            <TextField
              label="Monto de seña por defecto"
              value={businessDetails.deposit_amount}
              onChange={handleChange("deposit_amount")}
              type="number"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              helperText="Se usa para reservas con seña (si está vacío o inválido se toma $500)"
            />

            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
              Horarios de atención para reservas normales
            </Typography>
            <Alert severity="info">
              Estos horarios se usan para turnos estándar. Los campaigns mantienen su propia disponibilidad en CampaignsTab.
            </Alert>
            {Object.keys(DEFAULT_BUSINESS_HOURS).map((day) => {
              const dayConfig = businessDetails.business_hours?.[day] || DEFAULT_BUSINESS_HOURS[day];
              return (
                <Box
                  key={day}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "220px 1fr 1fr" },
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(dayConfig.enabled)}
                        onChange={(e) => handleBusinessHourChange(day, "enabled", e.target.checked)}
                      />
                    }
                    label={DAY_LABELS[day]}
                  />
                  <TextField
                    type="time"
                    label="Desde"
                    value={dayConfig.start_time}
                    onChange={(e) => handleBusinessHourChange(day, "start_time", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!dayConfig.enabled}
                  />
                  <TextField
                    type="time"
                    label="Hasta"
                    value={dayConfig.end_time}
                    onChange={(e) => handleBusinessHourChange(day, "end_time", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!dayConfig.enabled}
                  />
                </Box>
              );
            })}

            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
              Datos Bancarios para Transferencias
            </Typography>

            <TextField
              label="Nombre del Banco"
              value={businessDetails.bank_name}
              onChange={handleChange("bank_name")}
              placeholder="Ej: BROU, Itaú, Santander, BBVA"
              fullWidth
            />

            <TextField
              label="Tipo de Cuenta"
              value={businessDetails.account_type}
              onChange={handleChange("account_type")}
              placeholder="Ej: Cuenta Corriente, Cuenta de Ahorro"
              fullWidth
            />

            <TextField
              label="Número de Cuenta"
              value={businessDetails.account_number}
              onChange={handleChange("account_number")}
              placeholder="Ej: 001234567890123456"
              fullWidth
            />

            <TextField
              label="Notas Adicionales"
              value={businessDetails.notes}
              onChange={handleChange("notes")}
              placeholder="Ej: Datos del titular o instrucciones especiales"
              multiline
              rows={3}
              fullWidth
            />

            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <CheckIcon />}
              sx={{ mt: 2 }}
            >
              {saving ? "Guardando..." : "Guardar Datos del Negocio"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
