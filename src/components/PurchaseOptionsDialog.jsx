import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Radio,
  FormControlLabel,
  Box,
} from "@mui/material";
import treatmentService from "../services/treatment_service";

export default function PurchaseOptionsDialog({ open, onClose, treatment, onConfirm }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [packages, setPackages] = useState([]);
  const [singleSessionPrice, setSingleSessionPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && treatment) {
      loadPackages();
    }
  }, [open, treatment]);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await treatmentService.getTreatmentPackages(treatment.slug);
      setPackages(data.packages || []);
      setSingleSessionPrice(data.single_session_price || null);
      // Default to single session
      setSelectedOption("single");
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("No se pudieron cargar los paquetes");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedOption === "single") {
      onConfirm(null);
    } else {
      onConfirm(selectedOption);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Comprar {treatment?.name}</DialogTitle>
      <DialogContent>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Single Session Option */}
            <Card
              sx={{
                cursor: "pointer",
                border: selectedOption === "single" ? "2px solid" : "1px solid",
                borderColor: selectedOption === "single" ? "primary.main" : "divider",
                transition: "all 0.2s",
              }}
              onClick={() => setSelectedOption("single")}
            >
              <CardContent>
                <FormControlLabel
                  control={<Radio checked={selectedOption === "single"} />}
                  label={
                    <Box width="100%">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">Sesión única</Typography>
                          <Typography variant="body2" color="textSecondary">
                            1 sesión
                          </Typography>
                        </Box>
                        {singleSessionPrice && (
                          <Typography variant="h6" color="primary" sx={{ ml: 2 }}>
                            ${singleSessionPrice}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </CardContent>
            </Card>

            {/* Package Options */}
            {packages.map((pkg) => (
              <Card
                key={pkg.id || pkg.name}
                sx={{
                  cursor: "pointer",
                  border: selectedOption === pkg.id ? "2px solid" : "1px solid",
                  borderColor: selectedOption === pkg.id ? "primary.main" : "divider",
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedOption(pkg.id)}
              >
                <CardContent>
                  <FormControlLabel
                    control={<Radio checked={selectedOption === pkg.id} />}
                    label={
                      <Box width="100%">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6">{pkg.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pkg.session_count} sesiones
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6" color="primary">
                              ${pkg.price}
                            </Typography>
                            {pkg.original_price && pkg.original_price > pkg.price && (
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "textSecondary",
                                }}
                              >
                                ${pkg.original_price}
                              </Typography>
                            )}
                            {pkg.savings && (
                              <Typography variant="caption" color="success.main">
                                Ahorra ${pkg.savings}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!selectedOption || loading}
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
