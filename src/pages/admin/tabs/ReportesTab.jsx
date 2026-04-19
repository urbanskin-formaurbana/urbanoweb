import {useState, useEffect} from "react";
import React from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import {ExpandMore as ExpandMoreIcon} from "@mui/icons-material";
import adminService from "../../../services/admin_service";

const CATEGORY_LABELS = {
  body: "Corporal",
  facial: "Facial",
  laser: "Depi Láser",
  complementarios: "Complementarios",
};

export default function ReportesTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [months, setMonths] = useState(6);
  const [categoryFilter, setCategoryFilter] = useState(null);

  useEffect(() => {
    loadReports(months, categoryFilter);
  }, [months, categoryFilter]);

  const loadReports = async (monthCount, category) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getMonthlyReports(monthCount, category);
      setReports(result.reports || []);
    } catch (err) {
      setError("No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTreatments = (report) => {
    if (!categoryFilter) return report.by_treatment;
    return report.by_treatment.filter((t) => t.category === categoryFilter);
  };

  const totalGross = reports.reduce((sum, r) => sum + r.gross_income, 0);
  const totalNet = reports.reduce((sum, r) => sum + r.net_income, 0);
  const currentMonth = reports.length > 0 ? reports[0] : null;
  const previousMonth = reports.length > 1 ? reports[1] : null;

  return (
    <Box sx={{py: 2}}>
      <Typography variant="h6" gutterBottom>
        Reportes de Ingresos
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {/* Filter Controls */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                display="block"
                sx={{mb: 0.5, fontWeight: "bold"}}
              >
                Período
              </Typography>
              <ToggleButtonGroup
                value={months}
                exclusive
                onChange={(_, newMonths) => newMonths && setMonths(newMonths)}
                size="small"
              >
                <ToggleButton value={3}>3 meses</ToggleButton>
                <ToggleButton value={6}>6 meses</ToggleButton>
                <ToggleButton value={12}>12 meses</ToggleButton>
                <ToggleButton value={24}>24 meses</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography
                variant="caption"
                display="block"
                sx={{mb: 0.5, fontWeight: "bold"}}
              >
                Categoría
              </Typography>
              <Box sx={{ overflowX: "auto", display: "flex", flexWrap: "nowrap" }}>
                <ToggleButtonGroup
                  value={categoryFilter}
                  exclusive
                  onChange={(_, newCategory) => setCategoryFilter(newCategory)}
                  size="small"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <ToggleButton value={null}>Todos</ToggleButton>
                  <ToggleButton value="body">Corporal</ToggleButton>
                  <ToggleButton value="facial">Facial</ToggleButton>
                  <ToggleButton value="laser">Depi Láser</ToggleButton>
                  <ToggleButton value="complementarios">Complementarios</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Box>
          {/* Summary Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
              gap: 2,
            }}
          >
            {currentMonth && (
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Mes Actual
                  </Typography>
                  <Typography variant="h5">
                    ${currentMonth.net_income.toFixed(2)}
                  </Typography>
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
                  <Typography variant="h5">
                    ${previousMonth.net_income.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {previousMonth.treatments_sold} tratamientos vendidos
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* YTD Summary */}
          <Card sx={{bgcolor: "success.light"}}>
            <CardContent>
              <Typography color="success.contrastText" gutterBottom>
                Acumulado (últimos {months} meses)
              </Typography>
              <Typography variant="h5" color="success.contrastText">
                ${totalNet.toFixed(2)}
              </Typography>
              <Typography
                variant="body2"
                color="success.contrastText"
                sx={{opacity: 0.8}}
              >
                {reports.reduce((sum, r) => sum + r.treatments_sold, 0)}{" "}
                tratamientos | Ingreso bruto: ${totalGross.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          {reports.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{bgcolor: "#f5f5f5"}}>
                  <TableCell colSpan={2} sx={{fontWeight: "bold"}}>
                    Mes
                  </TableCell>
                  <TableCell align="right" sx={{fontWeight: "bold"}}>
                    Vendidos
                  </TableCell>
                  <TableCell align="right" sx={{fontWeight: "bold"}}>
                    Ingreso Bruto
                  </TableCell>
                  <TableCell align="right" sx={{fontWeight: "bold"}}>
                    Ingreso Neto
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => {
                  const filteredTreatments = getFilteredTreatments(report);
                  return (
                    <React.Fragment key={report.month}>
                      <TableRow
                        onClick={() =>
                          setExpandedMonth(
                            expandedMonth === report.month
                              ? null
                              : report.month,
                          )
                        }
                        sx={{
                          cursor: "pointer",
                          "&:hover": {bgcolor: "#f9f9f9"},
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            sx={{
                              transform:
                                expandedMonth === report.month
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s",
                            }}
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{fontWeight: "bold"}}>
                          {report.label}
                        </TableCell>
                        <TableCell align="right">
                          {filteredTreatments.reduce(
                            (sum, t) => sum + t.count,
                            0,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          $
                          {filteredTreatments
                            .reduce((sum, t) => sum + t.gross, 0)
                            .toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{color: "primary.main", fontWeight: "bold"}}
                        >
                          $
                          {filteredTreatments
                            .reduce((sum, t) => sum + t.net, 0)
                            .toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {/* Expanded Details */}
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{p: 0, borderBottom: "none"}}
                        >
                          <Collapse in={expandedMonth === report.month}>
                            <Box sx={{p: 2, bgcolor: "#fafafa"}}>
                              <Typography
                                variant="subtitle2"
                                sx={{mb: 2, fontWeight: "bold"}}
                              >
                                Desglose por Tratamiento:
                              </Typography>
                              <Stack spacing={2}>
                                {filteredTreatments?.map((treatment) => (
                                  <Box
                                    key={treatment.treatment_name}
                                    sx={{borderLeft: "3px solid #ccc", pl: 2}}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                    >
                                      <Box sx={{flex: 1}}>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 0.5}}>
                                          <Typography
                                            variant="body2"
                                            sx={{fontWeight: "bold"}}
                                          >
                                            {treatment.treatment_name}
                                          </Typography>
                                          {treatment.category && (
                                            <Chip
                                              label={CATEGORY_LABELS[treatment.category] ?? treatment.category}
                                              size="small"
                                            />
                                          )}
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          sx={{display: "block"}}
                                        >
                                          {treatment.cuponera_count} cuponera
                                          {treatment.cuponera_count !== 1
                                            ? "s"
                                            : ""}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                        >
                                          {treatment.single_count} sesión
                                          {treatment.single_count !== 1
                                            ? "es"
                                            : ""}{" "}
                                          individual
                                          {treatment.single_count !== 1
                                            ? "es"
                                            : ""}
                                        </Typography>
                                      </Box>
                                      <Box
                                        sx={{
                                          textAlign: "right",
                                          minWidth: "150px",
                                        }}
                                      >
                                        <Typography variant="body2">
                                          Bruto: ${treatment.gross.toFixed(2)}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "primary.main",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Neto: ${treatment.net.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* Package breakdown if any cuponeras */}
                                    {treatment.packages &&
                                      treatment.packages.length > 0 && (
                                        <Box
                                          sx={{
                                            mt: 1,
                                            ml: 2,
                                            pt: 1,
                                            borderTop: "1px solid #e0e0e0",
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: "bold",
                                              display: "block",
                                              mb: 1,
                                            }}
                                          >
                                            Detalle de cuponeras:
                                          </Typography>
                                          {treatment.packages.map((pkg) => (
                                            <Box
                                              key={pkg.package_name}
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mb: 0.5,
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                sx={{flex: 1}}
                                              >
                                                {pkg.package_name}: {pkg.count}x
                                              </Typography>
                                              <Typography variant="caption">
                                                ${pkg.gross.toFixed(2)} → $
                                                {pkg.net.toFixed(2)}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      )}
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {/* Fee Explanation */}
          <Alert severity="info">
            <Typography variant="body2">
              Nota: El ingreso neto descuenta la comisión de MercadoPago
              (~7.29%) aplicada a cada transacción.
            </Typography>
          </Alert>
        </Stack>
      )}
    </Box>
  );
}
