import { useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import adminService from '../../../services/admin_service';

function closeDialogSafely(closerFn) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  const trap = (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.blur();
    }
  };
  document.addEventListener('focus', trap, true);
  requestAnimationFrame(() => {
    closerFn();
    setTimeout(() => document.removeEventListener('focus', trap, true), 100);
  });
}

export default function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Create template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMessage, setNewTemplateMessage] = useState('');
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  // Edit template modal state
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateMessage, setEditTemplateMessage] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatingTemplate, setUpdatingTemplate] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await adminService.getMessageTemplates();
      setTemplates(response.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('No se pudieron cargar las plantillas');
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateMessage.trim()) {
      setError('Por favor completa el nombre y mensaje de la plantilla');
      return;
    }

    setCreatingTemplate(true);
    try {
      await adminService.createMessageTemplate(newTemplateName, newTemplateMessage);
      setSuccessMessage('Plantilla creada correctamente');
      setNewTemplateName('');
      setNewTemplateMessage('');
      await loadTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating template:', err);
      setError('No se pudo crear la plantilla');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      try {
        await adminService.deleteMessageTemplate(templateId);
        setSuccessMessage('Plantilla eliminada correctamente');
        await loadTemplates();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('No se pudo eliminar la plantilla');
      }
    }
  };

  const handleEditTemplate = (template) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditingTemplateId(template.id);
    setEditTemplateName(template.name);
    setEditTemplateMessage(template.message);
    setEditModalOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editTemplateName.trim() || !editTemplateMessage.trim()) {
      setError('Por favor completa el nombre y mensaje de la plantilla');
      return;
    }

    setUpdatingTemplate(true);
    try {
      await adminService.updateMessageTemplate(editingTemplateId, editTemplateName, editTemplateMessage);
      setSuccessMessage('Plantilla actualizada correctamente');
      closeEditModal();
      await loadTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating template:', err);
      setError('No se pudo actualizar la plantilla');
    } finally {
      setUpdatingTemplate(false);
    }
  };

  const closeEditModal = () => closeDialogSafely(() => {
    setEditModalOpen(false);
    setEditingTemplateId(null);
    setEditTemplateName('');
    setEditTemplateMessage('');
  });

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Templates List */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Plantillas Disponibles
          </Typography>
          {templates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay plantillas aún
            </Typography>
          ) : (
            <Stack spacing={2}>
              {templates.map(template => (
                <Card key={template.id}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {template.message}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ gap: 1 }}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Eliminar
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Create New Template Form */}
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Crear Nueva Plantilla
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Nombre de la plantilla"
                size="small"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="ej. Confirmar cita"
                fullWidth
              />
              <TextField
                label="Mensaje"
                size="small"
                multiline
                rows={4}
                value={newTemplateMessage}
                onChange={(e) => setNewTemplateMessage(e.target.value)}
                placeholder="Usa {{nombre}}, {{tratamiento}}, {{fecha}}, {{hora}} como variables"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Variables disponibles: {'{{nombre}}'}, {'{{tratamiento}}'}, {'{{fecha}}'}, {'{{hora}}'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateTemplate}
                disabled={creatingTemplate}
                fullWidth
              >
                {creatingTemplate ? <CircularProgress size={20} /> : 'Crear Plantilla'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Edit Template Modal */}
      <Dialog
        open={editModalOpen}
        onClose={closeEditModal}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={false}
      >
        <DialogTitle>Editar Plantilla</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre de la plantilla"
              size="small"
              value={editTemplateName}
              onChange={(e) => setEditTemplateName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Mensaje"
              size="small"
              multiline
              rows={4}
              value={editTemplateMessage}
              onChange={(e) => setEditTemplateMessage(e.target.value)}
              placeholder="Usa {{nombre}}, {{tratamiento}}, {{fecha}}, {{hora}} como variables"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Variables disponibles: {'{{nombre}}'}, {'{{tratamiento}}'}, {'{{fecha}}'}, {'{{hora}}'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Cancelar</Button>
          <Button
            onClick={handleUpdateTemplate}
            variant="contained"
            color="primary"
            disabled={updatingTemplate}
          >
            {updatingTemplate ? <CircularProgress size={20} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </>
  );
}
