import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SlideToConfirm from './common/SlideToConfirm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { createCampaignService } from '../services/campaign_service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

/**
 * Generic Campaign Admin Tab
 * Props:
 *   - productType: string (e.g., 'laser', 'hifu')
 *   - productLabel: string (e.g., 'Depilación Láser', 'HIFU Corporal')
 */
export default function CampaignAdminTab({ productType, productLabel }) {
  const campaignService = createCampaignService(productType);

  // Campaign management state
  const [campaign, setCampaign] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    startsOn: '',
    endsOn: '',
  });

  // Campaign edit state
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    startsOn: '',
    endsOn: '',
    status: '',
  });

  // Slots management state
  const [slots, setSlots] = useState([]);
  const [bulkSlotsOpen, setBulkSlotsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [bulkFormData, setBulkFormData] = useState({
    startTime: '10:00',
    endTime: '20:00',
  });

  // Bulk delete state
  const [selectedSlotIds, setSelectedSlotIds] = useState(new Set());
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  // Waitlist state
  const [waitlist, setWaitlist] = useState([]);  // Open waitlist (next campaign)
  const [campaignWaitlist, setCampaignWaitlist] = useState([]);  // This campaign
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load campaign and slots on mount
  useEffect(() => {
    loadCampaignAndSlots();
  }, [productType]);

  async function loadCampaignAndSlots() {
    try {
      setLoading(true);
      setError('');

      // Load active campaign
      let activeCampaign = null;
      try {
        activeCampaign = await campaignService.getActiveCampaignAdmin();
        if (activeCampaign) {
          setCampaign(activeCampaign);
          setSlots(activeCampaign.slots || []);
          setSelectedSlotIds(new Set());
        } else {
          setCampaign(null);
          setSlots([]);
          setSelectedSlotIds(new Set());
        }
      } catch (err) {
        throw err;
      }

      // Load waitlists (independent of campaign status)
      try {
        // Load both open waitlist and this campaign's waitlist in parallel
        const [openWL, campaignWL] = await Promise.all([
          campaignService.getWaitlist(),  // open (null campaign_id)
          activeCampaign
            ? campaignService.getWaitlist(activeCampaign._id)
            : Promise.resolve([]),
        ]);
        setWaitlist(openWL);
        setCampaignWaitlist(campaignWL);
      } catch (err) {
        setError(`Error loading waitlist: ${err.message}`);
      }
    } catch (err) {
      setError(`Error loading campaign: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ========== Campaign management ==========
  async function handleCreateCampaign() {
    try {
      if (!createFormData.name || !createFormData.startsOn || !createFormData.endsOn) {
        setError('Complete todos los campos');
        return;
      }

      const startDate = new Date(createFormData.startsOn);
      const endDate = new Date(createFormData.endsOn);

      if (endDate <= startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      setLoading(true);
      await campaignService.createCampaign(
        createFormData.name,
        productLabel,
        startDate,
        endDate
      );

      setSuccess('Campaña creada exitosamente');
      setCreateDialogOpen(false);
      setCreateFormData({ name: '', startsOn: '', endsOn: '' });
      await loadCampaignAndSlots();
    } catch (err) {
      setError(`Error al crear campaña: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ========== Slot management ==========
  function handleDayToggle(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleAddBulkSlots() {
    try {
      if (selectedDays.length === 0) {
        setError('Selecciona al menos un día');
        return;
      }

      setLoading(true);
      await campaignService.addBulkSlots(
        campaign._id,
        selectedDays,
        bulkFormData.startTime,
        bulkFormData.endTime
      );

      setSuccess(`Turnos generados exitosamente`);
      setBulkSlotsOpen(false);
      setSelectedDays([]);
      setBulkFormData({ startTime: '10:00', endTime: '20:00' });
      await loadCampaignAndSlots();
    } catch (err) {
      setError(`Error al generar turnos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleSlot(slotId) {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    const unbookedSlots = slots.filter((s) => !s.is_booked);
    const allUnbookedSelected = unbookedSlots.length > 0 && unbookedSlots.every((s) => selectedSlotIds.has(s._id));

    if (allUnbookedSelected) {
      setSelectedSlotIds(new Set());
    } else {
      setSelectedSlotIds(new Set(unbookedSlots.map((s) => s._id)));
    }
  }

  async function handleBulkDeleteSlots() {
    const count = selectedSlotIds.size;
    setConfirmBulkDeleteOpen(false);

    try {
      setLoading(true);
      await Promise.all(
        [...selectedSlotIds].map((slotId) =>
          campaignService.deleteSlot(campaign._id, slotId)
        )
      );
      setSelectedSlotIds(new Set());
      setSuccess(`${count} turno${count !== 1 ? 's' : ''} eliminado${count !== 1 ? 's' : ''}`);
      await loadCampaignAndSlots();
    } catch (err) {
      setError(`Error al eliminar turnos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ========== Campaign edit ==========
  function handleEditCampaign() {
    const start = dayjs.utc(campaign.starts_on).tz('America/Montevideo').format('YYYY-MM-DDTHH:mm');
    const end = dayjs.utc(campaign.ends_on).tz('America/Montevideo').format('YYYY-MM-DDTHH:mm');
    setEditFormData({
      name: campaign.name,
      startsOn: start,
      endsOn: end,
      status: campaign.status,
    });
    setEditMode(true);
  }

  async function handleUpdateCampaign() {
    try {
      if (!editFormData.name || !editFormData.startsOn || !editFormData.endsOn) {
        setError('Complete todos los campos');
        return;
      }

      const startDate = new Date(editFormData.startsOn);
      const endDate = new Date(editFormData.endsOn);

      if (endDate <= startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      setLoading(true);
      await campaignService.updateCampaign(campaign._id, {
        name: editFormData.name,
        starts_on: startDate,
        ends_on: endDate,
        status: editFormData.status,
      });

      setSuccess('Campaña actualizada exitosamente');
      setEditMode(false);
      await loadCampaignAndSlots();
    } catch (err) {
      setError(`Error al actualizar campaña: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditMode(false);
    setEditFormData({ name: '', startsOn: '', endsOn: '', status: '' });
  }

  // Format date/time for display
  function formatDateTime(dateStr) {
    return dayjs.utc(dateStr).tz('America/Montevideo').format('DD/MM/YYYY HH:mm');
  }

  function formatDate(dateStr) {
    return dayjs.utc(dateStr).tz('America/Montevideo').format('DD/MM/YYYY');
  }

  // Generate date range for day picker
  function getDateRange() {
    if (!campaign) return [];

    const start = dayjs.utc(campaign.starts_on).tz('America/Montevideo');
    const end = dayjs.utc(campaign.ends_on).tz('America/Montevideo');
    const dates = [];

    let d = start;
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      dates.push(d.format('YYYY-MM-DD'));
      d = d.add(1, 'day');
    }

    return dates;
  }

  if (loading && !campaign) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Campaign Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Campaña Activa — {productLabel}
          </Typography>

          {campaign ? (
            <Box sx={{ mb: 2 }}>
              {!editMode ? (
                <>
                  <Typography>
                    <strong>Nombre:</strong> {campaign.name}
                  </Typography>
                  <Typography>
                    <strong>Período:</strong> {formatDate(campaign.starts_on)} - {formatDate(campaign.ends_on)}
                  </Typography>
                  <Typography>
                    <strong>Total de turnos:</strong> {campaign.total_slots}
                  </Typography>
                  <Typography>
                    <strong>Turnos reservados:</strong> {campaign.booked_slots}
                  </Typography>
                  <Chip
                    label={campaign.status === 'active' ? 'Activa' : 'Cerrada'}
                    color={campaign.status === 'active' ? 'success' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Nombre de la campaña"
                    fullWidth
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Fecha de inicio"
                    type="datetime-local"
                    fullWidth
                    value={editFormData.startsOn}
                    onChange={(e) => setEditFormData({ ...editFormData, startsOn: e.target.value })}
                    slotProps={{ inputBase: { shrink: true } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Fecha de fin"
                    type="datetime-local"
                    fullWidth
                    value={editFormData.endsOn}
                    onChange={(e) => setEditFormData({ ...editFormData, endsOn: e.target.value })}
                    slotProps={{ inputBase: { shrink: true } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    select
                    label="Estado"
                    fullWidth
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <MenuItem value="draft">Borrador</MenuItem>
                    <MenuItem value="active">Activa</MenuItem>
                    <MenuItem value="closed">Cerrada</MenuItem>
                  </TextField>
                </>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay campaña activa. Crea una nueva para comenzar.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {campaign && !editMode && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEditCampaign}
              >
                Editar
              </Button>
            )}
            {editMode && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateCampaign}
                >
                  Guardar cambios
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
              </>
            )}
            {!editMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateDialogOpen(true)}
              >
                {campaign ? 'Crear Nueva Campaña' : 'Crear Campaña'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Slots Management Section */}
      {campaign && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Generar Turnos
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setBulkSlotsOpen(true)}
              sx={{ mb: 2 }}
            >
              Generar Turnos por Rango
            </Button>

            {selectedSlotIds.size > 0 && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmBulkDeleteOpen(true)}
                >
                  Eliminar seleccionados ({selectedSlotIds.size})
                </Button>
              </Box>
            )}

            {/* Slots table */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedSlotIds.size > 0 &&
                          !slots
                            .filter((s) => !s.is_booked)
                            .every((s) => selectedSlotIds.has(s._id))
                        }
                        checked={
                          slots.filter((s) => !s.is_booked).length > 0 &&
                          slots
                            .filter((s) => !s.is_booked)
                            .every((s) => selectedSlotIds.has(s._id))
                        }
                        onChange={handleSelectAll}
                        disabled={slots.filter((s) => !s.is_booked).length === 0}
                      />
                    </TableCell>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cliente / Tratamiento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <TableRow key={slot._id}>
                        <TableCell padding="checkbox">
                          {!slot.is_booked && (
                            <Checkbox
                              checked={selectedSlotIds.has(slot._id)}
                              onChange={() => handleToggleSlot(slot._id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(slot.starts_at)}</TableCell>
                        <TableCell>
                          <Chip
                            label={slot.is_booked ? 'Reservado' : 'Disponible'}
                            color={slot.is_booked ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {slot.is_booked
                            ? `${slot.customer_name} - ${slot.treatment_name}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay turnos. Crea algunos para comenzar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Section - Always visible */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Campaign Waitlist (if campaign exists) */}
          {campaign && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Lista de espera — {campaign.name} ({campaignWaitlist.length})
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Fecha de registro</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaignWaitlist.length > 0 ? (
                      campaignWaitlist.map((entry) => (
                        <TableRow key={entry._id}>
                          <TableCell>{entry.customer_name}</TableCell>
                          <TableCell>{entry.customer_phone}</TableCell>
                          <TableCell>{formatDate(entry.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No hay clientes en lista de espera para esta campaña
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                Nueva lista de espera (próxima campaña) ({waitlist.length})
              </Typography>
            </>
          )}

          {!campaign && (
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lista de espera ({waitlist.length})
            </Typography>
          )}

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha de registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitlist.length > 0 ? (
                  waitlist.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{entry.customer_name}</TableCell>
                      <TableCell>{entry.customer_phone}</TableCell>
                      <TableCell>{formatDate(entry.created_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No hay clientes en lista de espera
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Campaña</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Nombre de la campaña"
            fullWidth
            value={createFormData.name}
            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Fecha de inicio"
            type="datetime-local"
            fullWidth
            value={createFormData.startsOn}
            onChange={(e) => setCreateFormData({ ...createFormData, startsOn: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Fecha de fin"
            type="datetime-local"
            fullWidth
            value={createFormData.endsOn}
            onChange={(e) => setCreateFormData({ ...createFormData, endsOn: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateCampaign} variant="contained" color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Slots Dialog */}
      <Dialog open={bulkSlotsOpen} onClose={() => setBulkSlotsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generar Turnos</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Selecciona los días
          </Typography>
          <FormGroup sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
            {getDateRange().map((day) => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                }
                label={dayjs(day).format('dddd, D [de] MMM')}
              />
            ))}
          </FormGroup>

          <TextField
            label="Hora de inicio"
            type="time"
            fullWidth
            value={bulkFormData.startTime}
            onChange={(e) => setBulkFormData({ ...bulkFormData, startTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hora de fin"
            type="time"
            fullWidth
            value={bulkFormData.endTime}
            onChange={(e) => setBulkFormData({ ...bulkFormData, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Los turnos se generarán cada 30 minutos en formato :00 y :30.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkSlotsOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddBulkSlots} variant="contained" color="primary">
            Generar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={confirmBulkDeleteOpen} onClose={() => setConfirmBulkDeleteOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Eliminar {selectedSlotIds.size} turno
            {selectedSlotIds.size !== 1 ? 's' : ''} seleccionado
            {selectedSlotIds.size !== 1 ? 's' : ''}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Solo se eliminarán los turnos disponibles (sin reserva).
          </Typography>
          <SlideToConfirm
            label="Deslizá para eliminar"
            onConfirm={() => { setConfirmBulkDeleteOpen(false); handleBulkDeleteSlots(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBulkDeleteOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
