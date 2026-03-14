import React, { useState, useEffect } from 'react';
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
  Grid,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
  Chip,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import laserCampaignService from '../../../services/laser_campaign_service';

export default function LaserCampaignTab() {
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

  // Waitlist state
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load campaign and slots on mount
  useEffect(() => {
    loadCampaignAndSlots();
  }, []);

  async function loadCampaignAndSlots() {
    try {
      setLoading(true);
      setError('');

      // Load active campaign
      try {
        const activeCampaign = await laserCampaignService.getActiveCampaignAdmin();
        setCampaign(activeCampaign);
        setSlots(activeCampaign.slots || []);
      } catch (err) {
        if (err.response?.status === 404 || err.message === 'No active campaign') {
          setCampaign(null);
          setSlots([]);
        } else {
          throw err;
        }
      }

      // Load waitlist (independent of campaign status)
      try {
        const waitlistData = await laserCampaignService.getWaitlist();
        setWaitlist(waitlistData);
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
      await laserCampaignService.createCampaign(
        createFormData.name,
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
      await laserCampaignService.addBulkSlots(
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

  async function handleDeleteSlot(slotId) {
    if (!window.confirm('¿Eliminar este turno?')) return;

    try {
      setLoading(true);
      await laserCampaignService.deleteSlot(campaign._id, slotId);
      setSuccess('Turno eliminado');
      await loadCampaignAndSlots();
    } catch (err) {
      setError(`Error al eliminar turno: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ========== Campaign edit ==========
  function handleEditCampaign() {
    const start = new Date(campaign.starts_on).toISOString().slice(0, 16);
    const end = new Date(campaign.ends_on).toISOString().slice(0, 16);
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
      await laserCampaignService.updateCampaign(campaign._id, {
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
    return new Date(dateStr).toLocaleString('es-UY', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-UY');
  }

  // Generate date range for day picker
  function getDateRange() {
    if (!campaign) return [];

    const start = new Date(campaign.starts_on);
    const end = new Date(campaign.ends_on);
    const dates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
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
            Campaña Activa
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

            {/* Slots table */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Cliente / Tratamiento</TableCell>
                    <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <TableRow key={slot._id}>
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
                        <TableCell>
                          {!slot.is_booked && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSlot(slot._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Lista de Espera ({waitlist.length})
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha de registro</TableCell>
                  <TableCell>Notificado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitlist.length > 0 ? (
                  waitlist.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{entry.customer_name}</TableCell>
                      <TableCell>{entry.customer_phone}</TableCell>
                      <TableCell>{formatDate(entry.created_at)}</TableCell>
                      <TableCell>
                        {entry.notified_at ? '✓' : '✗'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
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
                label={new Date(day).toLocaleDateString('es-UY', { weekday: 'long', month: 'short', day: 'numeric' })}
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
    </Box>
  );
}
