import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import RichTextDescriptionEditor from './RichTextDescriptionEditor';
import CategoryImageUpload from './CategoryImageUpload';
import SafeDialog from './common/SafeDialog';

export default function ProductTypeDialog({
  open,
  onClose,
  isEditMode,
  productType,
  productLabel,
  productDescription,
  productCardDescription,
  productSubtitle,
  isGenderSplit,
  productImageUrl,
  productImageUrlHombres,
  productImageUrlMujeres,
  editingProductType,
  savingProduct,
  generateSlug,
  onSave,
  setProductType,
  setProductLabel,
  setProductDescription,
  setProductCardDescription,
  setProductSubtitle,
  setIsGenderSplit,
  setProductImageUrl,
  setProductImageUrlHombres,
  setProductImageUrlMujeres,
}) {
  return (
    <SafeDialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isEditMode ? `Editar producto — ${productType}` : 'Nuevo Tipo de Producto'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre visible"
            value={productLabel}
            onChange={(e) => {
              setProductLabel(e.target.value);
              if (!isEditMode) setProductType(generateSlug(e.target.value));
            }}
            placeholder="ej: HIFU Corporal, Criólisis"
            fullWidth
          />
          <TextField
            label="Identificador (slug)"
            value={productType}
            onChange={(e) => {
              if (!isEditMode) setProductType(e.target.value.replace(/[^a-z0-9_-]/g, ''));
            }}
            placeholder="ej: hifu, criolipolisis"
            helperText="Se genera automáticamente, pero puedes editarlo"
            fullWidth
            disabled={isEditMode}
          />
          <RichTextDescriptionEditor
            value={productDescription}
            onChange={setProductDescription}
            label="Definición (para la sección en la home)"
          />
          <TextField
            label="Subtítulo (home + página de agendamiento)"
            value={productSubtitle}
            onChange={(e) => setProductSubtitle(e.target.value)}
            fullWidth
            helperText="Frase corta que aparece sobre el título de la tarjeta y al elegir el tratamiento."
          />
          <RichTextDescriptionEditor
            value={productCardDescription}
            onChange={setProductCardDescription}
            label="Descripción (página de agendamiento)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={isGenderSplit}
                onChange={(e) => setIsGenderSplit(e.target.checked)}
              />
            }
            label="Dividir por género (Hombres / Mujeres)"
          />
          {isEditMode && (
            <CategoryImageUpload
              isGenderSplit={isGenderSplit}
              productImageUrl={productImageUrl}
              productImageUrlHombres={productImageUrlHombres}
              productImageUrlMujeres={productImageUrlMujeres}
              editingProductType={editingProductType}
              onImageChange={setProductImageUrl}
              onImageChangeHombres={setProductImageUrlHombres}
              onImageChangeMujeres={setProductImageUrlMujeres}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={savingProduct || !productType.trim() || !productLabel.trim()}
          startIcon={savingProduct ? <CircularProgress size={18} /> : null}
        >
          {savingProduct ? 'Guardando...' : isEditMode ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </SafeDialog>
  );
}
