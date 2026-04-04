import { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import adminService from '../../../services/admin_service';
import {
  TEMPLATE_USAGES,
  TEMPLATE_USAGE_LABELS,
  BUILTIN_CATEGORY_LABELS,
  formatCategoryLabel,
  normalizeTemplate,
  toCategoryKey,
} from '../../../utils/messageTemplates';

const DEFAULT_CATEGORY_OPTION = '__default__';

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

function buildCategoryOptions(categoryConfigs) {
  const dynamic = (categoryConfigs || []).map((config) => ({
    value: config.category,
    label: config.label || formatCategoryLabel(config.category),
  }));

  const builtin = Object.entries(BUILTIN_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const dedup = new Map();
  [...builtin, ...dynamic].forEach((opt) => {
    dedup.set(opt.value, opt);
  });

  return Array.from(dedup.values());
}

function formatTemplateCategoryLabel(template, categoryOptionsMap) {
  if (!template.product_category) return 'Default';
  return categoryOptionsMap.get(template.product_category)
    || BUILTIN_CATEGORY_LABELS[template.product_category]
    || formatCategoryLabel(template.product_category);
}

function buildConfirmationTemplateName(productCategory, categoryOptionsMap) {
  const categoryLabel = productCategory
    ? (categoryOptionsMap.get(productCategory)
      || BUILTIN_CATEGORY_LABELS[productCategory]
      || formatCategoryLabel(productCategory))
    : 'Default';
  return `Confirmación - ${categoryLabel}`;
}

function hasDuplicateConfirmationTarget(templates, productCategory, currentTemplateId = null) {
  const target = productCategory ? toCategoryKey(productCategory) : null;
  return templates.some((template) => (
    template.usage_type === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
    && (template.product_category ? toCategoryKey(template.product_category) : null) === target
    && template.id !== currentTemplateId
  ));
}

function TemplateCard({ template, onEdit, onDelete, categoryOptionsMap }) {
  const usageLabel = TEMPLATE_USAGE_LABELS[template.usage_type] || template.usage_type;
  const categoryLabel =
    template.usage_type === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
      ? formatTemplateCategoryLabel(template, categoryOptionsMap)
      : null;
  const displayName =
    template.usage_type === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
      ? buildConfirmationTemplateName(template.product_category, categoryOptionsMap)
      : template.name;

  return (
    <Card key={template.id}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {displayName}
          </Typography>
          <Chip size="small" label={usageLabel} color="primary" variant="outlined" />
          {categoryLabel && (
            <Chip size="small" label={categoryLabel} color="secondary" variant="outlined" />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {template.message}
        </Typography>
      </CardContent>
      <CardActions sx={{ gap: 1 }}>
        <Button
          size="small"
          color="primary"
          onClick={() => onEdit(template)}
        >
          Editar
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(template.id)}
        >
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
}

export default function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [categoryConfigs, setCategoryConfigs] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Create template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMessage, setNewTemplateMessage] = useState('');
  const [newTemplateUsageType, setNewTemplateUsageType] = useState(TEMPLATE_USAGES.MANUAL_SEND);
  const [newTemplateProductCategory, setNewTemplateProductCategory] = useState(DEFAULT_CATEGORY_OPTION);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  // Edit template modal state
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateMessage, setEditTemplateMessage] = useState('');
  const [editTemplateUsageType, setEditTemplateUsageType] = useState(TEMPLATE_USAGES.MANUAL_SEND);
  const [editTemplateProductCategory, setEditTemplateProductCategory] = useState(DEFAULT_CATEGORY_OPTION);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatingTemplate, setUpdatingTemplate] = useState(false);

  const normalizedTemplates = useMemo(
    () => (templates || []).map(normalizeTemplate).filter(Boolean),
    [templates]
  );
  const manualTemplates = useMemo(
    () => normalizedTemplates.filter((template) => template.usage_type === TEMPLATE_USAGES.MANUAL_SEND),
    [normalizedTemplates]
  );
  const confirmationTemplates = useMemo(
    () => normalizedTemplates.filter((template) => template.usage_type === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION),
    [normalizedTemplates]
  );

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categoryConfigs),
    [categoryConfigs]
  );

  const categoryOptionsMap = useMemo(() => {
    const map = new Map();
    categoryOptions.forEach((opt) => map.set(opt.value, opt.label));
    return map;
  }, [categoryOptions]);

  useEffect(() => {
    loadTemplates();
    loadCategoryConfigs();
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

  const loadCategoryConfigs = async () => {
    try {
      const configs = await adminService.getCategoryConfigs();
      setCategoryConfigs(configs || []);
    } catch (err) {
      console.error('Error loading category configs:', err);
    }
  };

  const resetCreateForm = () => {
    setNewTemplateName('');
    setNewTemplateMessage('');
    setNewTemplateUsageType(TEMPLATE_USAGES.MANUAL_SEND);
    setNewTemplateProductCategory(DEFAULT_CATEGORY_OPTION);
  };

  const resolveCategorySelection = (selectedValue) =>
    selectedValue === DEFAULT_CATEGORY_OPTION ? null : (selectedValue || null);

  const handleCreateTemplate = async () => {
    if (!newTemplateMessage.trim()) {
      setError('Por favor completa el mensaje de la plantilla');
      return;
    }

    if (newTemplateUsageType === TEMPLATE_USAGES.MANUAL_SEND && !newTemplateName.trim()) {
      setError('Por favor completa el nombre de la plantilla');
      return;
    }

    if (
      newTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
      && hasDuplicateConfirmationTarget(
        normalizedTemplates,
        resolveCategorySelection(newTemplateProductCategory)
      )
    ) {
      setError('Ya existe una plantilla de confirmación para ese producto/categoría');
      return;
    }

    setCreatingTemplate(true);
    try {
      const selectedCategory = resolveCategorySelection(newTemplateProductCategory);
      const templateName = newTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
        ? buildConfirmationTemplateName(selectedCategory, categoryOptionsMap)
        : newTemplateName.trim();

      await adminService.createMessageTemplate({
        name: templateName,
        message: newTemplateMessage,
        usage_type: newTemplateUsageType,
        product_category:
          newTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
            ? selectedCategory
            : null,
      });
      setSuccessMessage('Plantilla creada correctamente');
      resetCreateForm();
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

    const normalized = normalizeTemplate(template);
    setEditingTemplateId(normalized.id);
    setEditTemplateName(normalized.name);
    setEditTemplateMessage(normalized.message);
    setEditTemplateUsageType(normalized.usage_type);
    setEditTemplateProductCategory(normalized.product_category || DEFAULT_CATEGORY_OPTION);
    setEditModalOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editTemplateMessage.trim()) {
      setError('Por favor completa el mensaje de la plantilla');
      return;
    }

    if (editTemplateUsageType === TEMPLATE_USAGES.MANUAL_SEND && !editTemplateName.trim()) {
      setError('Por favor completa el nombre de la plantilla');
      return;
    }

    if (
      editTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
      && hasDuplicateConfirmationTarget(
        normalizedTemplates,
        resolveCategorySelection(editTemplateProductCategory),
        editingTemplateId
      )
    ) {
      setError('Ya existe una plantilla de confirmación para ese producto/categoría');
      return;
    }

    setUpdatingTemplate(true);
    try {
      const selectedCategory = resolveCategorySelection(editTemplateProductCategory);
      const templateName = editTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
        ? buildConfirmationTemplateName(selectedCategory, categoryOptionsMap)
        : editTemplateName.trim();

      await adminService.updateMessageTemplate(editingTemplateId, {
        name: templateName,
        message: editTemplateMessage,
        usage_type: editTemplateUsageType,
        product_category:
          editTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION
            ? selectedCategory
            : null,
      });
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
    setEditTemplateUsageType(TEMPLATE_USAGES.MANUAL_SEND);
    setEditTemplateProductCategory(DEFAULT_CATEGORY_OPTION);
  });

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Plantillas para envío manual (Appointments WA)
          </Typography>
          {manualTemplates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No hay plantillas manuales
            </Typography>
          ) : (
            <Stack spacing={2}>
              {manualTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  categoryOptionsMap={categoryOptionsMap}
                />
              ))}
            </Stack>
          )}
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Plantillas de confirmación por producto
          </Typography>
          {confirmationTemplates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No hay plantillas de confirmación
            </Typography>
          ) : (
            <Stack spacing={2}>
              {confirmationTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  categoryOptionsMap={categoryOptionsMap}
                />
              ))}
            </Stack>
          )}
        </Box>

        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Crear Nueva Plantilla
            </Typography>
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="new-template-usage-label">Uso de plantilla</InputLabel>
                <Select
                  labelId="new-template-usage-label"
                  label="Uso de plantilla"
                  value={newTemplateUsageType}
                  onChange={(e) => {
                    const nextUsageType = e.target.value;
                    setNewTemplateUsageType(nextUsageType);
                    if (nextUsageType !== TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION) {
                      setNewTemplateProductCategory(DEFAULT_CATEGORY_OPTION);
                    }
                  }}
                >
                  <MenuItem value={TEMPLATE_USAGES.MANUAL_SEND}>Envío manual (Appointments WA)</MenuItem>
                  <MenuItem value={TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION}>Confirmación de cita por producto</MenuItem>
                </Select>
              </FormControl>

              {newTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION && (
                <FormControl size="small" fullWidth>
                  <InputLabel id="new-template-category-label">Producto/Categoría</InputLabel>
                  <Select
                    labelId="new-template-category-label"
                    label="Producto/Categoría"
                    value={newTemplateProductCategory}
                    onChange={(e) => setNewTemplateProductCategory(e.target.value)}
                  >
                    <MenuItem value={DEFAULT_CATEGORY_OPTION}>Default (todas las categorías)</MenuItem>
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {newTemplateUsageType === TEMPLATE_USAGES.MANUAL_SEND && (
                <TextField
                  label="Nombre de la plantilla"
                  size="small"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="ej. Confirmar cita"
                  fullWidth
                />
              )}
              <TextField
                label="Mensaje"
                size="small"
                multiline
                rows={6}
                value={newTemplateMessage}
                onChange={(e) => setNewTemplateMessage(e.target.value)}
                placeholder="Usa {{nombre}}, {{tratamiento}}, {{fecha}}, {{hora}} como variables"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Variables disponibles: {'{{nombre}}'}, {'{{tratamiento}}'}, {'{{fecha}}'}, {'{{hora}}'}, {'{{categoria}}'}
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
            <FormControl size="small" fullWidth>
              <InputLabel id="edit-template-usage-label">Uso de plantilla</InputLabel>
              <Select
                labelId="edit-template-usage-label"
                label="Uso de plantilla"
                value={editTemplateUsageType}
                onChange={(e) => {
                  const nextUsageType = e.target.value;
                  setEditTemplateUsageType(nextUsageType);
                  if (nextUsageType !== TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION) {
                    setEditTemplateProductCategory(DEFAULT_CATEGORY_OPTION);
                  }
                }}
              >
                <MenuItem value={TEMPLATE_USAGES.MANUAL_SEND}>Envío manual (Appointments WA)</MenuItem>
                <MenuItem value={TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION}>Confirmación de cita por producto</MenuItem>
              </Select>
            </FormControl>

            {editTemplateUsageType === TEMPLATE_USAGES.APPOINTMENT_CONFIRMATION && (
              <FormControl size="small" fullWidth>
                <InputLabel id="edit-template-category-label">Producto/Categoría</InputLabel>
                <Select
                  labelId="edit-template-category-label"
                  label="Producto/Categoría"
                  value={editTemplateProductCategory}
                  onChange={(e) => setEditTemplateProductCategory(e.target.value)}
                >
                  <MenuItem value={DEFAULT_CATEGORY_OPTION}>Default (todas las categorías)</MenuItem>
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {editTemplateUsageType === TEMPLATE_USAGES.MANUAL_SEND && (
              <TextField
                label="Nombre de la plantilla"
                size="small"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                fullWidth
              />
            )}
            <TextField
              label="Mensaje"
              size="small"
              multiline
              rows={6}
              value={editTemplateMessage}
              onChange={(e) => setEditTemplateMessage(e.target.value)}
              placeholder="Usa {{nombre}}, {{tratamiento}}, {{fecha}}, {{hora}} como variables"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Variables disponibles: {'{{nombre}}'}, {'{{tratamiento}}'}, {'{{fecha}}'}, {'{{hora}}'}, {'{{categoria}}'}
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

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </>
  );
}
