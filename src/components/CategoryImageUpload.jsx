import { useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import adminService from '../services/admin_service';

export default function CategoryImageUpload({
  isGenderSplit,
  productImageUrl,
  productImageUrlHombres,
  productImageUrlMujeres,
  editingProductType,
  onImageChange,
  onImageChangeHombres,
  onImageChangeMujeres,
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImageHombres, setUploadingImageHombres] = useState(false);
  const [uploadingImageMujeres, setUploadingImageMujeres] = useState(false);

  if (!isGenderSplit) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Imagen de la categoría
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
              if (!file) return;
              setUploadingImage(true);
              try {
                const result = await adminService.uploadCategoryImage(editingProductType, file);
                onImageChange(result.image_url);
              } catch (err) {
              } finally {
                setUploadingImage(false);
              }
            }}
          />
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Imagen para Hombres
        </Typography>
        {productImageUrlHombres && (
          <Box
            component="img"
            src={productImageUrlHombres}
            alt="Imagen Hombres"
            sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, mb: 1, display: 'block' }}
          />
        )}
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={uploadingImageHombres}
        >
          {uploadingImageHombres ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
          {uploadingImageHombres ? 'Subiendo...' : productImageUrlHombres ? 'Cambiar imagen' : 'Subir imagen'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingImageHombres(true);
              try {
                const result = await adminService.uploadCategoryImage(editingProductType, file, 'hombres');
                onImageChangeHombres(result.image_url);
              } catch (err) {
              } finally {
                setUploadingImageHombres(false);
              }
            }}
          />
        </Button>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Imagen para Mujeres
        </Typography>
        {productImageUrlMujeres && (
          <Box
            component="img"
            src={productImageUrlMujeres}
            alt="Imagen Mujeres"
            sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, mb: 1, display: 'block' }}
          />
        )}
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={uploadingImageMujeres}
        >
          {uploadingImageMujeres ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
          {uploadingImageMujeres ? 'Subiendo...' : productImageUrlMujeres ? 'Cambiar imagen' : 'Subir imagen'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingImageMujeres(true);
              try {
                const result = await adminService.uploadCategoryImage(editingProductType, file, 'mujeres');
                onImageChangeMujeres(result.image_url);
              } catch (err) {
              } finally {
                setUploadingImageMujeres(false);
              }
            }}
          />
        </Button>
      </Box>
    </Stack>
  );
}
