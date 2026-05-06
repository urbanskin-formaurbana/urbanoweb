import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CampaignAdminTab from '../../../components/CampaignAdminTab';
import campaignService from '../../../services/campaign_service';
import adminService from '../../../services/admin_service';
import ProductTypeDialog from '../../../components/ProductTypeDialog';

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
  const [productCardDescription, setProductCardDescription] = useState('');
  const [productSubtitle, setProductSubtitle] = useState('');
  const [isGenderSplit, setIsGenderSplit] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productImageUrlHombres, setProductImageUrlHombres] = useState('');
  const [productImageUrlMujeres, setProductImageUrlMujeres] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
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
    setProductCardDescription('');
    setProductSubtitle('');
    setIsGenderSplit(false);
    setProductImageUrl('');
    setProductImageUrlHombres('');
    setProductImageUrlMujeres('');
    setProductDialogOpen(true);
  };

  const handleOpenEdit = () => {
    const selected = productTypes[activeProductIndex];
    if (!selected) return;
    setIsEditMode(true);
    setProductType(selected.product_type);
    setProductLabel(selected.product_label || '');
    setProductDescription(selected.product_description || '');
    setProductCardDescription(selected.card_description || '');
    setProductSubtitle(selected.subtitle || '');
    setIsGenderSplit(selected.is_gender_split || false);
    setProductImageUrl(selected.image_url || '');
    setProductImageUrlHombres(selected.image_url_hombres || '');
    setProductImageUrlMujeres(selected.image_url_mujeres || '');
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
        productImageUrl,
        productCardDescription.trim(),
        productSubtitle.trim(),
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
    } finally {
      setSavingProduct(false);
    }
  };

  const dialog = (
    <ProductTypeDialog
      open={productDialogOpen}
      onClose={() => setProductDialogOpen(false)}
      isEditMode={isEditMode}
      productType={productType}
      productLabel={productLabel}
      productDescription={productDescription}
      productCardDescription={productCardDescription}
      productSubtitle={productSubtitle}
      isGenderSplit={isGenderSplit}
      productImageUrl={productImageUrl}
      productImageUrlHombres={productImageUrlHombres}
      productImageUrlMujeres={productImageUrlMujeres}
      editingProductType={editingProductType}
      savingProduct={savingProduct}
      generateSlug={generateSlug}
      onSave={handleSaveProduct}
      setProductType={setProductType}
      setProductLabel={setProductLabel}
      setProductDescription={setProductDescription}
      setProductCardDescription={setProductCardDescription}
      setProductSubtitle={setProductSubtitle}
      setIsGenderSplit={setIsGenderSplit}
      setProductImageUrl={setProductImageUrl}
      setProductImageUrlHombres={setProductImageUrlHombres}
      setProductImageUrlMujeres={setProductImageUrlMujeres}
    />
  );

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
        {dialog}
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

      {dialog}
    </Box>
  );
}
