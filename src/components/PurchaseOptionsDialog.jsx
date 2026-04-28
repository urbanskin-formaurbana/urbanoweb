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
  Chip,
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
            {packages.map((pkg) => {
              const isPromo = !!pkg.is_promotional;
              const selected = selectedOption === pkg.id;
              return (
                <Card
                  key={pkg.id || pkg.name}
                  sx={{
                    cursor: "pointer",
                    border: selected || isPromo ? "2px solid" : "1px solid",
                    borderColor: selected
                      ? "primary.main"
                      : isPromo
                      ? "#2e7d32"
                      : "divider",
                    boxShadow: isPromo ? "0 0 0 4px #f2f8f3" : "none",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onClick={() => setSelectedOption(pkg.id)}
                >
                  {isPromo && (
                    <Chip
                      label={pkg.promo_label || "Oferta destacada"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -10,
                        left: 16,
                        backgroundColor: "#2e7d32",
                        color: "#fff",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    />
                  )}
                  <CardContent>
                    <FormControlLabel
                      control={<Radio checked={selected} />}
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
                              <Typography
                                variant="h6"
                                sx={{ color: isPromo ? "#2e7d32" : "primary.main", fontWeight: 700 }}
                              >
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
              );
            })}
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
