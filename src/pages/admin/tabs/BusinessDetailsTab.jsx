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
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import bankService from "../../../services/bank_service";

export default function BusinessDetailsTab() {
  const [businessDetails, setBusinessDetails] = useState({
    bank_name: "",
    account_number: "",
    account_type: "",
    notes: "",
    whatsapp_phone: "",
    business_email: "",
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
      });
    } catch (error) {
      console.error("Error loading business details:", error);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await bankService.updateBankDetails(businessDetails);
      setSnackbar({
        open: true,
        message: "Datos del negocio guardados exitosamente",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving business details:", error);
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
