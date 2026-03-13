import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import adminService from "../../../services/admin_service";

export default function ReportesTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getMonthlyReports(6);
      setReports(result.reports || []);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const totalGross = reports.reduce((sum, r) => sum + r.gross_income, 0);
  const totalNet = reports.reduce((sum, r) => sum + r.net_income, 0);
  const currentMonth = reports.length > 0 ? reports[0] : null;
  const previousMonth = reports.length > 1 ? reports[1] : null;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reportes de Ingresos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {/* Summary Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {currentMonth && (
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Mes Actual
                  </Typography>
                  <Typography variant="h5">${currentMonth.net_income.toFixed(2)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {currentMonth.treatments_sold} tratamientos vendidos
                  </Typography>
                </CardContent>
              </Card>
            )}
            {previousMonth && (
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Mes Anterior
                  </Typography>
                  <Typography variant="h5">${previousMonth.net_income.toFixed(2)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {previousMonth.treatments_sold} tratamientos vendidos
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* YTD Summary */}
          <Card sx={{ bgcolor: "success.light" }}>
            <CardContent>
              <Typography color="success.contrastText" gutterBottom>
                Acumulado (últimos 6 meses)
              </Typography>
              <Typography variant="h5" color="success.contrastText">
                ${totalNet.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="success.contrastText" sx={{ opacity: 0.8 }}>
                {reports.reduce((sum, r) => sum + r.treatments_sold, 0)} tratamientos | Ingreso bruto: ${totalGross.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                    Mes
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Vendidos
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Ingreso Bruto
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    Ingreso Neto
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <Box key={report.month} component="tbody">
                    <TableRow
                      onClick={() =>
                        setExpandedMonth(expandedMonth === report.month ? null : report.month)
                      }
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f9f9f9" } }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          sx={{
                            transform:
                              expandedMonth === report.month ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        >
                          <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{report.label}</TableCell>
                      <TableCell align="right">{report.treatments_sold}</TableCell>
                      <TableCell align="right">${report.gross_income.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: "primary.main", fontWeight: "bold" }}>
                        ${report.net_income.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {/* Expanded Details */}
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0, borderBottom: "none" }}>
                        <Collapse in={expandedMonth === report.month}>
                          <Box sx={{ p: 2, bgcolor: "#fafafa" }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                              Desglose por Tratamiento:
                            </Typography>
                            <Box>
                              {report.by_treatment?.map((treatment) => (
                                <Box key={treatment.treatment_name} sx={{ mb: 1, pl: 2 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2">
                                      {treatment.treatment_name} ({treatment.count})
                                    </Typography>
                                    <Box>
                                      <Typography variant="body2" sx={{ mr: 2 }}>
                                        Bruto: ${treatment.gross.toFixed(2)}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "primary.main" }}>
                                        Neto: ${treatment.net.toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Box>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Fee Explanation */}
          <Alert severity="info">
            <Typography variant="body2">
              Nota: El ingreso neto descuenta la comisión de MercadoPago (~7.29%) aplicada a cada transacción.
            </Typography>
          </Alert>
        </Stack>
      )}
    </Box>
  );
}
