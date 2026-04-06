import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CampaignAdminTab from '../../../components/CampaignAdminTab';
import campaignService from '../../../services/campaign_service';
import adminService from '../../../services/admin_service';
import RichTextDescriptionEditor from '../../../components/RichTextDescriptionEditor';
import { Typography } from '@mui/material';

export default function CampaignsTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [productTypes, setProductTypes] = useState([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  // Shared dialog state (used for both create and edit)
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productType, setProductType] = useState('');
  const [productLabel, setProductLabel] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGenderSplit, setIsGenderSplit] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    setLoadingProductTypes(true);
    try {
      const result = await campaignService.getProductTypes();
      // Exclude body, facial, and Complementarios (handled in treatments)
      const filtered = result.filter(pt =>
        !['body', 'facial', 'complementarios'].includes(pt.product_type.toLowerCase())
      );
      setProductTypes(filtered);
      setActiveProductIndex(0);
    } catch (error) {
      console.error('Error loading product types:', error);
    } finally {
      setLoadingProductTypes(false);
    }
  };

  const generateSlug = (label) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setProductType('');
    setProductLabel('');
    setProductDescription('');
    setIsGenderSplit(false);
    setProductDialogOpen(true);
  };

  const handleOpenEdit = () => {
    const selected = productTypes[activeProductIndex];
    if (!selected) return;
    setIsEditMode(true);
    setProductType(selected.product_type);
    setProductLabel(selected.product_label || '');
    setProductDescription(selected.product_description || '');
    setIsGenderSplit(selected.is_gender_split || false);
    setProductImageUrl(selected.image_url || '');
    setEditingProductType(selected.product_type);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productType.trim() || !productLabel.trim()) return;
    setSavingProduct(true);
    try {
      await adminService.upsertCategoryConfig(
        productType.trim().toLowerCase(),
        productLabel.trim(),
        productDescription.trim(),
        isGenderSplit,
        productImageUrl
      );

      if (!isEditMode) {
        const service = campaignService.createCampaignService(productType.trim().toLowerCase());
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
        await service.createCampaign(productLabel.trim(), productLabel.trim(), today, nextYear);
      }

      setProductDialogOpen(false);
      await loadProductTypes();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSavingProduct(false);
    }
  };

  if (loadingProductTypes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (productTypes.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nuevo producto
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          No hay tipos de productos disponibles. Crea uno para comenzar.
        </Box>

        {/* Shared dialog - mounted once outside all conditionals */}
        <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{isEditMode ? `Editar producto — ${productType}` : 'Nuevo Tipo de Producto'}</DialogTitle>
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
                label="Descripción (para la sección en la home)"
              />
              <FormControlLabel
                control={<Switch checked={isGenderSplit} onChange={(e) => setIsGenderSplit(e.target.checked)} />}
                label="Dividir por género (Hombres / Mujeres)"
              />
              {isEditMode && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Imagen de la campaña
                  </Typography>
                  {productImageUrl && (
                    <Box
                      component="img"
                      src={productImageUrl}
                      alt="Imagen actual"
                      sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, mb: 1, display: 'block' }}
                    />
                  )}
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                    {uploadingImage ? 'Subiendo...' : productImageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !editingProductType) return;
                        setUploadingImage(true);
                        try {
                          const result = await adminService.uploadCategoryImage(editingProductType, file);
                          setProductImageUrl(result.image_url);
                        } catch (err) {
                          console.error('Error uploading image:', err);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </Button>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSaveProduct}
              disabled={savingProduct || !productType.trim() || !productLabel.trim()}
              startIcon={savingProduct ? <CircularProgress size={18} /> : null}
            >
              {savingProduct ? 'Guardando...' : isEditMode ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  const selectedProduct = productTypes[activeProductIndex];

  return (
    <Box>
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenEdit}
        >
          Editar producto
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Nuevo producto
        </Button>
      </Box>

      {/* Inner navigation: Tabs on desktop, Select on mobile */}
      {isMobile ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            value={activeProductIndex}
            label="Tipo de Producto"
            onChange={(e) => setActiveProductIndex(Number(e.target.value))}
          >
            {productTypes.map((pt, index) => (
              <MenuItem key={pt.product_type} value={index}>
                {pt.product_label || pt.product_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Tabs
          value={activeProductIndex}
          onChange={(_, newValue) => setActiveProductIndex(newValue)}
          sx={{ mb: 2 }}
        >
          {productTypes.map((pt) => (
            <Tab
              key={pt.product_type}
              label={pt.product_label || pt.product_type}
            />
          ))}
        </Tabs>
      )}

      {/* Campaign admin for selected product */}
      {selectedProduct && (
        <CampaignAdminTab
          key={selectedProduct.product_type}
          productType={selectedProduct.product_type}
          productLabel={selectedProduct.product_label}
        />
      )}

      {/* Shared dialog - mounted once outside all conditionals */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{isEditMode ? `Editar producto — ${productType}` : 'Nuevo Tipo de Producto'}</DialogTitle>
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
            <TextField
              label="Descripción (para la sección en la home)"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="ej: Tratamiento innovador para reducir grasa localizada"
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={isGenderSplit} onChange={(e) => setIsGenderSplit(e.target.checked)} />}
              label="Dividir por género (Hombres / Mujeres)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveProduct}
            disabled={savingProduct || !productType.trim() || !productLabel.trim()}
            startIcon={savingProduct ? <CircularProgress size={18} /> : null}
          >
            {savingProduct ? 'Guardando...' : isEditMode ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
