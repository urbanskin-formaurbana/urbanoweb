import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import adminService from '../services/admin_service';
import appointmentService from '../services/appointment_service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

function filterSlotsForEmployee(slots) {
  const now = dayjs().tz('America/Montevideo');
  return slots.filter(slot =>
    dayjs.utc(slot).tz('America/Montevideo').isAfter(now)
  );
}

function formatAppointmentDate(isoString) {
  return dayjs.utc(isoString).tz('America/Montevideo').format('dddd, D [de] MMMM');
}

function formatAppointmentTime(isoString) {
  return dayjs.utc(isoString).tz('America/Montevideo').format('HH:mm');
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  prefilledCustomer,
}) {
  const STEPS = ['Cliente', 'Tratamiento', 'Sesión y Pago', 'Fecha y Hora', 'Confirmar'];
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Customer
  const [customerMode, setCustomerMode] = useState(prefilledCustomer ? 'search' : 'search');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(prefilledCustomer || null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    full_name: '',
    whatsapp_phone: '',
    email: '',
  });
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Step 2: Treatment
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  // Step 3: Payment
  const [paymentMode, setPaymentMode] = useState(null);
  const [customerCuponeras, setCustomerCuponeras] = useState([]);
  const [selectedCuponera, setSelectedCuponera] = useState(null);
  const [treatmentPackages, setTreatmentPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newPurchase, setNewPurchase] = useState({
    total_sessions: '',
    amount_paid: '',
    payment_method: 'efectivo',
  });
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Step 4: Schedule
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Auto-advance to Step 2 if prefilledCustomer
  useEffect(() => {
    if (prefilledCustomer && open) {
      setStep(2);
    }
  }, [prefilledCustomer, open]);

  // Load customers on mount
  useEffect(() => {
    if (open && customerMode === 'search' && customerOptions.length === 0) {
      loadCustomers();
    }
  }, [open, customerMode]);

  // Load treatments on step 2
  useEffect(() => {
    if (open && step === 2 && treatments.length === 0) {
      loadTreatments();
    }
  }, [open, step]);

  // Load cuponeras when entering step 3 or selecting "cuponera existente"
  useEffect(() => {
    if (open && step === 3 && selectedCustomer && paymentMode === 'existing_cuponera') {
      loadCustomerCuponeras();
    }
  }, [open, step, selectedCustomer, paymentMode]);

  // Load packages when selecting a treatment in step 3 "new_package" mode
  useEffect(() => {
    if (
      open &&
      step === 3 &&
      paymentMode === 'new_package' &&
      selectedTreatment
    ) {
      loadTreatmentPackages();
    }
  }, [open, step, paymentMode, selectedTreatment]);

  // Update amount when package is selected
  useEffect(() => {
    if (selectedPackage) {
      setNewPurchase((prev) => ({
        ...prev,
        amount_paid: selectedPackage.price || '',
        total_sessions: selectedPackage.session_count || '',
      }));
    }
  }, [selectedPackage]);

  // Update amount for single session
  useEffect(() => {
    if (paymentMode === 'single_session' && selectedTreatment) {
      const price = selectedTreatment.single_session_price || '';
      setNewPurchase((prev) => ({
        ...prev,
        amount_paid: price,
      }));
    }
  }, [paymentMode, selectedTreatment]);

  // Load available slots when date changes
  useEffect(() => {
    if (!scheduleDate || !selectedTreatment) {
      setAvailableSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const duration =
          paymentMode === 'evaluacion' ? 30 : selectedTreatment.duration_minutes || 90;
        const slotStrings = await appointmentService.getAvailableSlots(
          scheduleDate.toDate(),
          duration
        );
        const filtered = filterSlotsForEmployee(slotStrings);
        setAvailableSlots(filtered);
      } catch (err) {
        console.error('Error loading slots:', err);
        setError('Error al cargar los horarios disponibles');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [scheduleDate, selectedTreatment, paymentMode]);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { customers } = await adminService.getCustomers(null, 0, 500);
      setCustomerOptions(customers || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadTreatments = async () => {
    setLoadingTreatments(true);
    try {
      const result = await adminService.getTreatments();
      setTreatments((result?.treatments || []).filter((t) => t.is_active !== false));
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar tratamientos');
    } finally {
      setLoadingTreatments(false);
    }
  };

  const loadCustomerCuponeras = async () => {
    try {
      const history = await adminService.getCustomerHistory(selectedCustomer.id || selectedCustomer._id);
      const active = (history.timeline || [])
        .filter(
          (item) =>
            item.kind === 'cuponera' &&
            item.sessions_used < item.total_sessions &&
            item.treatment_name === selectedTreatment.name
        );
      setCustomerCuponeras(active);
    } catch (err) {
      console.error('Error loading cuponeras:', err);
      setError('Error al cargar cuponeras');
    }
  };

  const loadTreatmentPackages = async () => {
    setLoadingPackages(true);
    try {
      const response = await fetch(`/api/v1/${selectedTreatment.slug}/packages`);
      if (!response.ok) throw new Error('Failed to load packages');
      const data = await response.json();
      const packages = (data.packages || []).filter((p) => p.is_active !== false);
      setTreatmentPackages(packages);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Error al cargar paquetes');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleNextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!selectedCustomer) {
        setError('Selecciona un cliente');
        return;
      }
    } else if (step === 2) {
      if (!selectedTreatment) {
        setError('Selecciona un tratamiento');
        return;
      }
    } else if (step === 3) {
      if (!paymentMode) {
        setError('Selecciona un tipo de sesión');
        return;
      }
      if (paymentMode === 'existing_cuponera' && !selectedCuponera) {
        setError('Selecciona una cuponera');
        return;
      }
      if (paymentMode === 'new_package' && !selectedPackage) {
        setError('Selecciona un paquete');
        return;
      }
      if (
        (paymentMode === 'single_session' || paymentMode === 'new_package') &&
        (!newPurchase.amount_paid || !newPurchase.payment_method)
      ) {
        setError('Completa el monto y método de pago');
        return;
      }
    } else if (step === 4) {
      if (!scheduleDate || !scheduleTime) {
        setError('Selecciona una fecha y hora');
        return;
      }
    }

    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let customerId = selectedCustomer.id || selectedCustomer._id;
      let purchasedPackageId = null;
      let paymentId = null;

      // Create new customer if needed
      if (customerMode === 'new') {
        const created = await adminService.createCustomer(newCustomerForm);
        customerId = created.id;
      }

      // Create payment/package if needed
      if (paymentMode === 'single_session' || paymentMode === 'new_package') {
        const paymentData = {
          customer_id: customerId,
          treatment_id: selectedTreatment.id,
          amount: parseFloat(newPurchase.amount_paid),
          payment_method: newPurchase.payment_method,
          item_type:
            paymentMode === 'single_session' ? 'single_session' : 'package',
          package_id: paymentMode === 'new_package' ? selectedPackage.id : undefined,
        };

        const payment = await adminService.createManualPayment(paymentData);
        paymentId = payment.payment_id;
        if (payment.purchased_package_id) {
          purchasedPackageId = payment.purchased_package_id;
        }
      } else if (paymentMode === 'existing_cuponera') {
        purchasedPackageId = selectedCuponera.purchased_package_id;
      }

      // Combine date and time
      const scheduledDateTime = scheduleDate
        .hour(parseInt(scheduleTime.split(':')[0], 10))
        .minute(parseInt(scheduleTime.split(':')[1], 10))
        .second(0);

      // Convert to UTC
      const scheduledAtUTC = scheduledDateTime.tz('America/Montevideo').utc().toISOString();

      // Create appointment
      const appointmentData = {
        customer_id: customerId,
        treatment_id: selectedTreatment.id,
        scheduled_at: scheduledAtUTC,
        purchased_package_id: purchasedPackageId,
        is_evaluation: paymentMode === 'evaluacion',
      };

      await adminService.createAdminAppointment(appointmentData);

      setSubmitting(false);
      onCreated();
      onClose();
      // Reset state
      setStep(prefilledCustomer ? 2 : 1);
      setSelectedCustomer(prefilledCustomer || null);
      setSelectedTreatment(null);
      setPaymentMode(null);
      setScheduleDate(null);
      setScheduleTime(null);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.detail || 'Error al crear la sesión');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setStep(prefilledCustomer ? 2 : 1);
      setError(null);
      setSelectedCustomer(prefilledCustomer || null);
      setSelectedTreatment(null);
      setPaymentMode(null);
      setScheduleDate(null);
      setScheduleTime(null);
      onClose();
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            {prefilledCustomer ? (
              <Box sx={{ mb: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Cliente seleccionado
                    </Typography>
                    <Chip
                      label={prefilledCustomer.name || prefilledCustomer.full_name}
                      onDelete={() => {
                        setSelectedCustomer(null);
                        setStep(1);
                      }}
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <>
                <FormControlLabel
                  control={
                    <Radio
                      checked={customerMode === 'search'}
                      onChange={() => setCustomerMode('search')}
                    />
                  }
                  label="Buscar cliente existente"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={customerMode === 'new'}
                      onChange={() => setCustomerMode('new')}
                    />
                  }
                  label="Crear nuevo cliente"
                />

                {customerMode === 'search' ? (
                  <Autocomplete
                    options={customerOptions}
                    getOptionLabel={(opt) => `${opt.full_name} (${opt.whatsapp_phone || opt.email})`}
                    value={selectedCustomer}
                    onChange={(e, val) => setSelectedCustomer(val)}
                    loading={loadingCustomers}
                    sx={{ mt: 2 }}
                    renderInput={(params) => (
                      <TextField {...params} label="Cliente" placeholder="Buscar por nombre o teléfono" />
                    )}
                  />
                ) : (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField
                      label="Nombre completo"
                      value={newCustomerForm.full_name}
                      onChange={(e) =>
                        setNewCustomerForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      required
                    />
                    <TextField
                      label="Teléfono WhatsApp"
                      value={newCustomerForm.whatsapp_phone}
                      onChange={(e) =>
                        setNewCustomerForm((prev) => ({
                          ...prev,
                          whatsapp_phone: e.target.value,
                        }))
                      }
                      placeholder="+598 98 123 456"
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) =>
                        setNewCustomerForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            {loadingTreatments ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={2}>
                {treatments.map((treatment) => (
                  <Grid item xs={12} sm={6} key={treatment.id}>
                    <Card
                      onClick={() => setSelectedTreatment(treatment)}
                      sx={{
                        cursor: 'pointer',
                        border:
                          selectedTreatment?.id === treatment.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        backgroundColor:
                          selectedTreatment?.id === treatment.id ? '#f5f5f5' : 'white',
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {treatment.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duración: {treatment.duration_minutes} min
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <RadioGroup
              value={paymentMode || ''}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                setSelectedCuponera(null);
                setSelectedPackage(null);
              }}
            >
              <FormControlLabel
                value="existing_cuponera"
                control={<Radio />}
                label="Usar cuponera existente"
              />
              {paymentMode === 'existing_cuponera' && (
                <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
                  {customerCuponeras.length > 0 ? (
                    customerCuponeras.map((cuponera) => (
                      <Card key={cuponera.purchased_package_id} sx={{ mb: 1 }}>
                        <CardContent sx={{ pb: 1 }}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={
                                  selectedCuponera?.purchased_package_id ===
                                  cuponera.purchased_package_id
                                }
                                onChange={() => setSelectedCuponera(cuponera)}
                              />
                            }
                            label={`${cuponera.package_name} - ${cuponera.sessions_used}/${cuponera.total_sessions} usadas`}
                          />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay cuponeras disponibles para este tratamiento
                    </Typography>
                  )}
                </Box>
              )}

              <FormControlLabel
                value="single_session"
                control={<Radio />}
                label="Sesión individual"
              />
              {paymentMode === 'single_session' && (
                <Box sx={{ ml: 4, mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="Monto"
                    type="number"
                    value={newPurchase.amount_paid}
                    onChange={(e) =>
                      setNewPurchase((prev) => ({
                        ...prev,
                        amount_paid: e.target.value,
                      }))
                    }
                  />
                  <FormControl>
                    <InputLabel>Método de pago</InputLabel>
                    <Select
                      value={newPurchase.payment_method}
                      onChange={(e) =>
                        setNewPurchase((prev) => ({
                          ...prev,
                          payment_method: e.target.value,
                        }))
                      }
                      label="Método de pago"
                    >
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="transferencia">Transferencia</MenuItem>
                      <MenuItem value="posnet">POSNet</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              <FormControlLabel
                value="new_package"
                control={<Radio />}
                label="Comprar cuponera"
              />
              {paymentMode === 'new_package' && (
                <Box sx={{ ml: 4, mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {loadingPackages ? (
                    <CircularProgress />
                  ) : (
                    <Grid container spacing={1}>
                      {treatmentPackages.map((pkg) => (
                        <Grid item xs={12} key={pkg.id}>
                          <Card
                            onClick={() => setSelectedPackage(pkg)}
                            sx={{
                              cursor: 'pointer',
                              border:
                                selectedPackage?.id === pkg.id
                                  ? '2px solid #1976d2'
                                  : '1px solid #e0e0e0',
                            }}
                          >
                            <CardContent sx={{ py: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {pkg.name} - ${pkg.price}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {pkg.session_count} sesiones
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  <TextField
                    label="Monto"
                    type="number"
                    value={newPurchase.amount_paid}
                    onChange={(e) =>
                      setNewPurchase((prev) => ({
                        ...prev,
                        amount_paid: e.target.value,
                      }))
                    }
                  />
                  <FormControl>
                    <InputLabel>Método de pago</InputLabel>
                    <Select
                      value={newPurchase.payment_method}
                      onChange={(e) =>
                        setNewPurchase((prev) => ({
                          ...prev,
                          payment_method: e.target.value,
                        }))
                      }
                      label="Método de pago"
                    >
                      <MenuItem value="efectivo">Efectivo</MenuItem>
                      <MenuItem value="transferencia">Transferencia</MenuItem>
                      <MenuItem value="posnet">POSNet</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              <FormControlLabel
                value="evaluacion"
                control={<Radio />}
                label="Sesión de evaluación"
              />
            </RadioGroup>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ py: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Fecha"
                value={scheduleDate}
                onChange={setScheduleDate}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>

            {loadingSlots ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={1}>
                {availableSlots.map((slot) => {
                  const slotTime = dayjs.utc(slot).tz('America/Montevideo').format('HH:mm');
                  return (
                    <Grid item xs={4} key={slot}>
                      <Button
                        variant={scheduleTime === slotTime ? 'contained' : 'outlined'}
                        onClick={() => setScheduleTime(slotTime)}
                        fullWidth
                        size="small"
                      >
                        {slotTime}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        );

      case 5:
        return (
          <Box sx={{ py: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  Resumen de la sesión
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Cliente:</strong>{' '}
                    {selectedCustomer?.full_name || selectedCustomer?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tratamiento:</strong> {selectedTreatment?.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {paymentMode === 'existing_cuponera' && (
                    <>
                      <Typography variant="body2">
                        <strong>Cuponera:</strong> {selectedCuponera?.package_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Sesiones disponibles:</strong>{' '}
                        {selectedCuponera?.total_sessions - selectedCuponera?.sessions_used}
                      </Typography>
                    </>
                  )}
                  {paymentMode === 'single_session' && (
                    <>
                      <Typography variant="body2">
                        <strong>Tipo:</strong> Sesión individual
                      </Typography>
                      <Typography variant="body2">
                        <strong>Monto:</strong> ${newPurchase.amount_paid}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Método:</strong> {newPurchase.payment_method}
                      </Typography>
                    </>
                  )}
                  {paymentMode === 'new_package' && (
                    <>
                      <Typography variant="body2">
                        <strong>Paquete:</strong> {selectedPackage?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Monto:</strong> ${newPurchase.amount_paid}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Método:</strong> {newPurchase.payment_method}
                      </Typography>
                    </>
                  )}
                  {paymentMode === 'evaluacion' && (
                    <Typography variant="body2">
                      <strong>Tipo:</strong> Evaluación (30 min)
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Fecha:</strong> {formatAppointmentDate(scheduleDate.toISOString())}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora:</strong> {scheduleTime}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear nueva sesión</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {getStepContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        {step > 1 && (
          <Button onClick={handlePrevStep} disabled={submitting}>
            Atrás
          </Button>
        )}
        {step < 5 ? (
          <Button variant="contained" onClick={handleNextStep} disabled={submitting}>
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Crear sesión'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
