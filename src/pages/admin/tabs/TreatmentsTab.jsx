import {useState, useEffect} from "react";
import {
  Stack,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import adminService from "../../../services/admin_service";
import RichTextDescriptionEditor from "../../../components/RichTextDescriptionEditor";
import {isHtml} from "../../../utils/richText";

function closeDialogSafely(closerFn) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  const trap = (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.blur();
    }
  };
  document.addEventListener("focus", trap, true);
  requestAnimationFrame(() => {
    closerFn();
    setTimeout(() => document.removeEventListener("focus", trap, true), 100);
  });
}

function toSlug(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function TreatmentsTab() {
  const [treatments, setTreatments] = useState([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("body");
  const [laserGender, setLaserGender] = useState("hombres");
  const [laserItemType, setLaserItemType] = useState("zona");
  const [dynamicCategories, setDynamicCategories] = useState([]);



  // Create treatment dialog state
  const [createTreatmentOpen, setCreateTreatmentOpen] = useState(false);
  const [createTreatmentForm, setCreateTreatmentForm] = useState({
    name: "",
    slug: "",
    description: "",
    duration_minutes: 90,
    single_session_price: "",
    evaluation_price: "",
    category: "body",
    subtitle: "",
    route: "",
    meta_title: "",
    meta_description: "",
    gender: "",
    item_type: "",
    is_active: true,
    is_session_promo: false,
    promo_price: "",
    is_cuponera_promo: false,
    is_new: false,
    disable_single_session: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [creatingTreatment, setCreatingTreatment] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit treatment dialog state
  const [editTreatmentOpen, setEditTreatmentOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [editTreatmentForm, setEditTreatmentForm] = useState({
    name: "",
    description: "",
    duration_minutes: "",
    single_session_price: "",
    evaluation_price: "",
    category: "",
    subtitle: "",
    route: "",
    gender: "",
    item_type: "",
    is_active: true,
    is_session_promo: false,
    promo_price: "",
    is_cuponera_promo: false,
    is_new: false,
    disable_single_session: false,
  });
  const [savingTreatment, setSavingTreatment] = useState(false);

  // Package management state
  const [expandedTreatmentId, setExpandedTreatmentId] = useState(null);
  const [treatmentPackages, setTreatmentPackages] = useState({});
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageDialogTreatmentId, setPackageDialogTreatmentId] =
    useState(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    session_count: "",
    price: "",
    original_price: "",
    is_promotional: false,
    promo_label: "",
    is_active: true,
  });
  const [savingPackage, setSavingPackage] = useState(false);

  useEffect(() => {
    loadTreatments();
    loadCategoryConfigs();
  }, []);

  const loadTreatments = async () => {
    setLoadingTreatments(true);
    try {
      const response = await adminService.getTreatments();
      setTreatments(response.treatments || []);
    } catch (err) {
      setError("No se pudieron cargar los tratamientos");
    } finally {
      setLoadingTreatments(false);
    }
  };

  const loadCategoryConfigs = async () => {
    try {
      const BUILTIN = ["body", "facial", "complementarios"];
      const configs = await adminService.getCategoryConfigs();
      setDynamicCategories(
        (configs || []).filter((c) => !BUILTIN.includes(c.category)),
      );
    } catch (err) {
    }
  };

  const handleOpenCreateTreatment = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setCreateTreatmentForm({
      name: "",
      slug: "",
      description: "",
      duration_minutes: 90,
      single_session_price: "",
      evaluation_price: "",
      category: "body",
      subtitle: "",
      route: "",
      meta_title: "",
      meta_description: "",
      gender: "",
      item_type: "",
      is_active: true,
      is_session_promo: false,
      promo_price: "",
      is_cuponera_promo: false,
      is_new: false,
      disable_single_session: false,
    });
    setSlugManuallyEdited(false);
    setCreateTreatmentOpen(true);
  };

  const closeCreateTreatmentDialog = () =>
    closeDialogSafely(() => {
      setCreateTreatmentOpen(false);
    });

  const handleCreateTreatmentNameChange = (e) => {
    const newName = e.target.value;
    setCreateTreatmentForm((f) => ({...f, name: newName}));
    if (!slugManuallyEdited && newName) {
      const categoryPart = createTreatmentForm.category ? `${createTreatmentForm.category}-` : '';
      setCreateTreatmentForm((f) => ({...f, slug: toSlug(`${categoryPart}${newName}`)}));
    }
  };

  const handleCreateTreatmentSlugChange = (e) => {
    const newSlug = e.target.value;
    setCreateTreatmentForm((f) => ({...f, slug: newSlug}));
    setSlugManuallyEdited(newSlug !== toSlug(createTreatmentForm.name));
  };

  const handleCreateTreatment = async () => {
    setCreatingTreatment(true);
    try {
      const catConfig = dynamicCategories.find(c => c.category === createTreatmentForm.category);
      await adminService.createTreatment({
        name: createTreatmentForm.name,
        slug: createTreatmentForm.slug || null,
        description: createTreatmentForm.description || null,
        duration_minutes: Number(createTreatmentForm.duration_minutes),
        single_session_price: Number(createTreatmentForm.single_session_price),
        evaluation_price:
          createTreatmentForm.category === "body" &&
          createTreatmentForm.evaluation_price
            ? Number(createTreatmentForm.evaluation_price)
            : null,
        category: createTreatmentForm.category,
        subtitle: createTreatmentForm.subtitle || null,
        route: createTreatmentForm.route || null,
        meta_title: createTreatmentForm.meta_title || null,
        meta_description: createTreatmentForm.meta_description || null,
        gender:
          catConfig?.is_gender_split
            ? createTreatmentForm.gender || null
            : null,
        item_type:
          !["body", "facial", "complementarios"].includes(createTreatmentForm.category)
            ? createTreatmentForm.item_type || null
            : null,
        is_active: createTreatmentForm.is_active,
        is_session_promo: createTreatmentForm.is_session_promo,
        promo_price:
          createTreatmentForm.is_session_promo && createTreatmentForm.promo_price !== ""
            ? Number(createTreatmentForm.promo_price)
            : null,
        is_cuponera_promo: createTreatmentForm.is_cuponera_promo,
        is_new: createTreatmentForm.is_new,
        disable_single_session: createTreatmentForm.disable_single_session,
      });
      setSuccessMessage("Tratamiento creado exitosamente");
      closeCreateTreatmentDialog();
      await loadTreatments();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err.message && err.message.includes("409")) {
        setError("Ya existe un tratamiento con este slug");
      } else {
        setError("No se pudo crear el tratamiento");
      }
    } finally {
      setCreatingTreatment(false);
    }
  };

  const handleTogglePackages = async (treatmentId) => {
    if (expandedTreatmentId === treatmentId) {
      setExpandedTreatmentId(null);
      return;
    }
    setExpandedTreatmentId(treatmentId);
    if (treatmentPackages[treatmentId]) return;
    setLoadingPackages(true);
    try {
      const response = await adminService.getTreatmentPackages(treatmentId);
      setTreatmentPackages((prev) => ({
        ...prev,
        [treatmentId]: response.packages || [],
      }));
    } catch (err) {
      setError("No se pudieron cargar los paquetes");
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleEditTreatmentClick = (treatment) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditingTreatment(treatment);
    setEditTreatmentForm({
      name: treatment.name,
      description: treatment.description || "",
      duration_minutes: treatment.duration_minutes,
      single_session_price: treatment.single_session_price,
      evaluation_price: treatment.evaluation_price || "",
      category: treatment.category || "",
      subtitle: treatment.subtitle || "",
      route: treatment.route || "",
      gender: treatment.gender || "",
      item_type: treatment.item_type || "",
      is_active: treatment.is_active,
      image_url: treatment.image_url || "",
      is_session_promo: treatment.is_session_promo || false,
      promo_price: treatment.promo_price ?? "",
      is_cuponera_promo: treatment.is_cuponera_promo || false,
      is_new: treatment.is_new || false,
      disable_single_session: treatment.disable_single_session || false,
    });
    setEditTreatmentOpen(true);
  };

  const closeEditTreatmentDialog = () =>
    closeDialogSafely(() => {
      setEditTreatmentOpen(false);
    });

  const handleSaveTreatment = async () => {
    setSavingTreatment(true);
    try {
      const catConfig = dynamicCategories.find(c => c.category === editTreatmentForm.category);
      await adminService.updateTreatment(editingTreatment.id, {
        name: editTreatmentForm.name,
        description: editTreatmentForm.description,
        duration_minutes: Number(editTreatmentForm.duration_minutes),
        single_session_price: Number(editTreatmentForm.single_session_price),
        evaluation_price:
          editTreatmentForm.category === "body" &&
          editTreatmentForm.evaluation_price
            ? Number(editTreatmentForm.evaluation_price)
            : null,
        category: editTreatmentForm.category,
        subtitle: editTreatmentForm.subtitle || null,
        route: editTreatmentForm.route || null,
        gender:
          catConfig?.is_gender_split
            ? editTreatmentForm.gender || null
            : null,
        item_type:
          !["body", "facial", "complementarios"].includes(editTreatmentForm.category)
            ? editTreatmentForm.item_type || null
            : null,
        is_active: editTreatmentForm.is_active,
        is_session_promo: editTreatmentForm.is_session_promo,
        promo_price:
          editTreatmentForm.is_session_promo && editTreatmentForm.promo_price !== ""
            ? Number(editTreatmentForm.promo_price)
            : null,
        is_cuponera_promo: editTreatmentForm.is_cuponera_promo,
        is_new: editTreatmentForm.is_new,
        disable_single_session: editTreatmentForm.disable_single_session,
      });
      setSuccessMessage("Tratamiento actualizado");
      closeEditTreatmentDialog();
      await loadTreatments();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("No se pudo actualizar el tratamiento");
    } finally {
      setSavingTreatment(false);
    }
  };

  const handleOpenCreatePackage = (treatmentId) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditingPackage(null);
    setPackageDialogTreatmentId(treatmentId);
    setPackageForm({
      name: "",
      session_count: "",
      price: "",
      original_price: "",
      is_promotional: false,
      promo_label: "",
      is_active: true,
    });
    setPackageDialogOpen(true);
  };

  const handleOpenEditPackage = (pkg) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditingPackage(pkg);
    setPackageDialogTreatmentId(pkg.treatment);
    setPackageForm({
      name: pkg.name,
      session_count: pkg.session_count,
      price: pkg.price,
      original_price: pkg.original_price ?? "",
      is_promotional: pkg.is_promotional,
      promo_label: pkg.promo_label ?? "",
      is_active: pkg.is_active,
    });
    setPackageDialogOpen(true);
  };

  const closePackageDialog = () =>
    closeDialogSafely(() => {
      setPackageDialogOpen(false);
    });

  const handleSavePackage = async () => {
    setSavingPackage(true);
    try {
      const payload = {
        name: packageForm.name,
        session_count: Number(packageForm.session_count),
        price: Number(packageForm.price),
        original_price:
          packageForm.original_price !== ""
            ? Number(packageForm.original_price)
            : null,
        is_promotional: packageForm.is_promotional,
        promo_label: packageForm.promo_label || null,
        is_active: packageForm.is_active,
      };
      if (editingPackage) {
        await adminService.updatePackage(editingPackage.id, payload);
        setSuccessMessage("Cuponera actualizada");
      } else {
        await adminService.createPackage({
          ...payload,
          treatment_id: packageDialogTreatmentId,
        });
        setSuccessMessage("Cuponera creada");
      }
      closePackageDialog();
      setTreatmentPackages((prev) => {
        const next = {...prev};
        delete next[packageDialogTreatmentId];
        return next;
      });
      if (expandedTreatmentId === packageDialogTreatmentId) {
        const response = await adminService.getTreatmentPackages(
          packageDialogTreatmentId,
        );
        setTreatmentPackages((prev) => ({
          ...prev,
          [packageDialogTreatmentId]: response.packages || [],
        }));
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("No se pudo guardar el paquete");
    } finally {
      setSavingPackage(false);
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`¿Eliminar la cuponera "${pkg.name}"?`)) return;
    try {
      await adminService.deletePackage(pkg.id);
      setSuccessMessage("Cuponera eliminada");
      setTreatmentPackages((prev) => ({
        ...prev,
        [pkg.treatment]: (prev[pkg.treatment] || []).filter(
          (p) => p.id !== pkg.id,
        ),
      }));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("No se pudo eliminar el paquete");
    }
  };

  return (
    <>
      {loadingTreatments && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button
          variant="contained"
          onClick={handleOpenCreateTreatment}
          sx={{alignSelf: "flex-start"}}
        >
          + Nuevo Tratamiento
        </Button>
        <Tabs
          value={selectedCategory}
          onChange={(_, val) => {
            setSelectedCategory(val);
            const catConfig = dynamicCategories.find(c => c.category === val);
            if (!catConfig?.is_gender_split) {
              setLaserGender("hombres");
              setLaserItemType("zona");
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{mb: 2, borderBottom: 1, borderColor: "divider"}}
        >
          <Tab label="CORPORAL" value="body" />
          <Tab label="FACIAL" value="facial" />
          <Tab label="COMPLEMENTARIOS" value="complementarios" />
          {dynamicCategories.map((cat) => (
            <Tab
              key={cat.category}
              label={cat.label.toUpperCase()}
              value={cat.category}
            />
          ))}
          <Tab label="PAGOS" value="pagos" />
        </Tabs>
        <Box sx={{display: "flex", gap: 2, mb: 1}}>
          {!!dynamicCategories.find(c => c.category === selectedCategory)?.is_gender_split && (
            <ToggleButtonGroup
              value={laserGender}
              exclusive
              onChange={(_, val) => {
                if (val) setLaserGender(val);
              }}
              size="small"
            >
              <ToggleButton value="hombres">Hombres</ToggleButton>
              <ToggleButton value="mujeres">Mujeres</ToggleButton>
            </ToggleButtonGroup>
          )}
          {!["body", "facial", "complementarios"].includes(selectedCategory) && (
            <ToggleButtonGroup
              value={laserItemType}
              exclusive
              onChange={(_, val) => {
                if (val) setLaserItemType(val);
              }}
              size="small"
            >
              <ToggleButton value="zona">Zona</ToggleButton>
              <ToggleButton value="paquete">Paquete</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
        {treatments.length === 0 && !loadingTreatments && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{py: 4}}
          >
            No hay tratamientos cargados
          </Typography>
        )}
        {treatments
          .filter((t) => {
            if (t.category !== selectedCategory) return false;
            const catConfig = dynamicCategories.find(c => c.category === selectedCategory);
            if (catConfig?.is_gender_split) {
              if (t.gender !== laserGender) return false;
            }
            if (!["body", "facial", "complementarios"].includes(selectedCategory)) {
              if (t.item_type !== laserItemType) return false;
            }
            return true;
          })
          .map((treatment) => (
            <Card key={treatment.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{flex: 1}}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {treatment.name}
                    </Typography>
                    {treatment.subtitle && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{display: "block", mb: 0.5}}
                      >
                        {treatment.subtitle}
                      </Typography>
                    )}
                    {treatment.description && (
                      isHtml(treatment.description) ? (
                        <Box
                          component="div"
                          sx={{mt: 0.5, mb: 1, fontSize: '0.875rem', color: 'text.secondary'}}
                          dangerouslySetInnerHTML={{__html: treatment.description}}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{mt: 0.5, mb: 1}}
                        >
                          {treatment.description}
                        </Typography>
                      )
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {treatment.duration_minutes} min · $
                      {treatment.single_session_price} por sesión
                      {treatment.evaluation_price && (
                        <> · ${treatment.evaluation_price} evaluación</>
                      )}
                    </Typography>
                  </Box>
                  <Chip
                    label={treatment.is_active ? "Activo" : "Inactivo"}
                    color={treatment.is_active ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{gap: 1}}>
                <Button
                  size="small"
                  onClick={() => handleEditTreatmentClick(treatment)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleTogglePackages(treatment.id)}
                >
                  {expandedTreatmentId === treatment.id
                    ? "Ocultar cuponeras"
                    : "Ver cuponeras"}
                </Button>
              </CardActions>

              {/* Inline packages panel */}
              {expandedTreatmentId === treatment.id && (
                <Box sx={{px: 2, pb: 2}}>
                  {loadingPackages && !treatmentPackages[treatment.id] && (
                    <LinearProgress sx={{mb: 1}} />
                  )}
                  <Stack spacing={1}>
                    {(treatmentPackages[treatment.id] || []).map((pkg) => (
                      <Card
                        key={pkg.id}
                        variant="outlined"
                        sx={{backgroundColor: "#fafafa"}}
                      >
                        <CardContent sx={{py: 1, "&:last-child": {pb: 1}}}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {pkg.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {pkg.session_count} sesiones · ${pkg.price}
                                {pkg.original_price &&
                                  ` (antes $${pkg.original_price})`}
                                {pkg.is_promotional &&
                                  pkg.promo_label &&
                                  ` · ${pkg.promo_label}`}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={pkg.is_active ? "Activo" : "Inactivo"}
                                size="small"
                                color={pkg.is_active ? "success" : "default"}
                              />
                              <Button
                                size="small"
                                onClick={() => handleOpenEditPackage(pkg)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeletePackage(pkg)}
                              >
                                Eliminar
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    {(treatmentPackages[treatment.id] || []).length === 0 &&
                      !loadingPackages && (
                        <Typography variant="body2" color="text.secondary">
                          No hay cuponeras para este tratamiento
                        </Typography>
                      )}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenCreatePackage(treatment.id)}
                      sx={{alignSelf: "flex-start", mt: 1}}
                    >
                      + Nueva cuponera
                    </Button>
                  </Stack>
                </Box>
              )}
            </Card>
          ))}

      </Stack>

      {/* Create Treatment Dialog */}
      <Dialog
        open={createTreatmentOpen}
        onClose={closeCreateTreatmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo Tratamiento</DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <Stack spacing={2}>
            <TextField
              label="Nombre *"
              size="small"
              fullWidth
              value={createTreatmentForm.name}
              onChange={handleCreateTreatmentNameChange}
              required
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Categoría *</InputLabel>
              <Select
                value={createTreatmentForm.category}
                label="Categoría *"
                onChange={(e) => {
                  const newCategory = e.target.value;
                  const newCatConfig = dynamicCategories.find(
                    (c) => c.category === newCategory,
                  );
                  setCreateTreatmentForm((f) => {
                    const updatedForm = {
                      ...f,
                      category: newCategory,
                      evaluation_price:
                        newCategory === "body" ? f.evaluation_price : "",
                      gender: newCatConfig?.is_gender_split ? f.gender : "",
                      item_type: !["body", "facial", "complementarios"].includes(newCategory) ? f.item_type : "",
                    };
                    if (!slugManuallyEdited && f.name) {
                      updatedForm.slug = toSlug(`${newCategory}-${f.name}`);
                    }
                    return updatedForm;
                  });
                }}
              >
                <MenuItem value="body">Corporal</MenuItem>
                <MenuItem value="facial">Facial</MenuItem>
                <MenuItem value="complementarios">Complementarios</MenuItem>
                {dynamicCategories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Slug"
              size="small"
              fullWidth
              value={createTreatmentForm.slug}
              onChange={handleCreateTreatmentSlugChange}
              helperText="Se genera automáticamente del nombre"
            />
            <RichTextDescriptionEditor
              value={createTreatmentForm.description}
              onChange={(html) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  description: html,
                }))
              }
            />
            <TextField
              label="Duración (minutos)"
              size="small"
              type="number"
              fullWidth
              value={createTreatmentForm.duration_minutes}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  duration_minutes: e.target.value,
                }))
              }
            />
            <TextField
              label="Precio sesión individual ($) *"
              size="small"
              type="number"
              fullWidth
              value={createTreatmentForm.single_session_price}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  single_session_price: e.target.value,
                }))
              }
              required
            />
            {createTreatmentForm.category === "body" && (
              <TextField
                label="Precio sesión de evaluación ($) (opcional)"
                size="small"
                type="number"
                fullWidth
                value={createTreatmentForm.evaluation_price}
                onChange={(e) =>
                  setCreateTreatmentForm((f) => ({
                    ...f,
                    evaluation_price: e.target.value,
                  }))
                }
                placeholder="ej. 500"
                helperText="Precio especial para la primera sesión de evaluación"
              />
            )}
            {!!dynamicCategories.find(
              (c) => c.category === createTreatmentForm.category,
            )?.is_gender_split && (
              <FormControl size="small" fullWidth>
                <InputLabel>Género *</InputLabel>
                <Select
                  value={createTreatmentForm.gender}
                  label="Género *"
                  onChange={(e) =>
                    setCreateTreatmentForm((f) => ({
                      ...f,
                      gender: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="hombres">Hombres</MenuItem>
                  <MenuItem value="mujeres">Mujeres</MenuItem>
                </Select>
              </FormControl>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de item *</InputLabel>
              <Select
                value={createTreatmentForm.item_type}
                label="Tipo de item *"
                onChange={(e) =>
                  setCreateTreatmentForm((f) => ({
                    ...f,
                    item_type: e.target.value,
                  }))
                }
              >
                <MenuItem value="zona">Zona</MenuItem>
                <MenuItem value="paquete">Paquete</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Subtítulo"
              size="small"
              fullWidth
              value={createTreatmentForm.subtitle}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  subtitle: e.target.value,
                }))
              }
              placeholder="ej. Nivel inicial"
            />
            <TextField
              label="Ruta"
              size="small"
              fullWidth
              value={createTreatmentForm.route}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({...f, route: e.target.value}))
              }
              placeholder="ej. /cinturon-orion"
            />
            <TextField
              label="Meta título (SEO)"
              size="small"
              fullWidth
              value={createTreatmentForm.meta_title}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  meta_title: e.target.value,
                }))
              }
            />
            <TextField
              label="Meta descripción (SEO)"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={createTreatmentForm.meta_description}
              onChange={(e) =>
                setCreateTreatmentForm((f) => ({
                  ...f,
                  meta_description: e.target.value,
                }))
              }
            />
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                PROMOCIONES DESTACADAS
              </Typography>
            </Divider>
            <FormControlLabel
              control={
                <Checkbox
                  checked={createTreatmentForm.is_session_promo}
                  onChange={(e) =>
                    setCreateTreatmentForm((f) => ({
                      ...f,
                      is_session_promo: e.target.checked,
                    }))
                  }
                />
              }
              label="Sesión en oferta destacada"
            />
            {createTreatmentForm.is_session_promo && (
              <TextField
                label="Precio de oferta ($) *"
                size="small"
                type="number"
                fullWidth
                value={createTreatmentForm.promo_price}
                onChange={(e) =>
                  setCreateTreatmentForm((f) => ({
                    ...f,
                    promo_price: e.target.value,
                  }))
                }
                helperText="Precio rebajado que se mostrará en la home"
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={createTreatmentForm.is_cuponera_promo}
                  onChange={(e) =>
                    setCreateTreatmentForm((f) => ({
                      ...f,
                      is_cuponera_promo: e.target.checked,
                    }))
                  }
                />
              }
              label="Cuponera en oferta destacada"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={createTreatmentForm.is_new}
                  onChange={(e) =>
                    setCreateTreatmentForm((f) => ({
                      ...f,
                      is_new: e.target.checked,
                    }))
                  }
                />
              }
              label="Nuevo tratamiento (destacar en home)"
            />
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                OPCIONES DE COMPRA
              </Typography>
            </Divider>
            <FormControlLabel
              control={
                <Checkbox
                  checked={createTreatmentForm.disable_single_session}
                  onChange={(e) =>
                    setCreateTreatmentForm((f) => ({
                      ...f,
                      disable_single_session: e.target.checked,
                    }))
                  }
                />
              }
              label="Deshabilitar compra por sesión individual"
            />
            {createTreatmentForm.disable_single_session && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 4, mt: -1 }}>
                Solo se mostrarán cuponeras como opciones de compra.
              </Typography>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={createTreatmentForm.is_active}
                label="Estado"
                onChange={(e) =>
                  setCreateTreatmentForm((f) => ({
                    ...f,
                    is_active: e.target.value,
                  }))
                }
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateTreatmentDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateTreatment}
            disabled={creatingTreatment}
          >
            {creatingTreatment ? (
              <CircularProgress size={20} />
            ) : (
              "Crear Tratamiento"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Treatment Dialog */}
      <Dialog
        open={editTreatmentOpen}
        onClose={closeEditTreatmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Tratamiento</DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              size="small"
              fullWidth
              value={editTreatmentForm.name}
              onChange={(e) =>
                setEditTreatmentForm((f) => ({...f, name: e.target.value}))
              }
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Categoría *</InputLabel>
              <Select
                value={editTreatmentForm.category}
                label="Categoría *"
                onChange={(e) => {
                  const newCategory = e.target.value;
                  const newCatConfig = dynamicCategories.find(
                    (c) => c.category === newCategory,
                  );
                  setEditTreatmentForm((f) => ({
                    ...f,
                    category: newCategory,
                    evaluation_price:
                      newCategory === "body" ? f.evaluation_price : "",
                    gender: newCatConfig?.is_gender_split ? f.gender : "",
                    item_type: !["body", "facial", "complementarios"].includes(newCategory) ? f.item_type : "",
                  }));
                }}
              >
                <MenuItem value="body">Corporal</MenuItem>
                <MenuItem value="facial">Facial</MenuItem>
                <MenuItem value="complementarios">Complementarios</MenuItem>
                {dynamicCategories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <RichTextDescriptionEditor
              key={editingTreatment?.id}
              value={editTreatmentForm.description}
              onChange={(html) =>
                setEditTreatmentForm((f) => ({
                  ...f,
                  description: html,
                }))
              }
            />
            {/* Image Upload Section */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Imagen del tratamiento
              </Typography>
              {editTreatmentForm.image_url && (
                <Box
                  component="img"
                  src={editTreatmentForm.image_url}
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
                {uploadingImage ? 'Subiendo...' : editTreatmentForm.image_url ? 'Cambiar imagen' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editingTreatment) return;
                    setUploadingImage(true);
                    try {
                      const result = await adminService.uploadTreatmentImage(editingTreatment.id, file);
                      setEditTreatmentForm((f) => ({ ...f, image_url: result.image_url }));
                      setSuccessMessage('Imagen subida exitosamente');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } catch (err) {
                      setError('No se pudo subir la imagen');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </Button>
            </Box>
            <TextField
              label="Duración (minutos)"
              size="small"
              type="number"
              fullWidth
              value={editTreatmentForm.duration_minutes}
              onChange={(e) =>
                setEditTreatmentForm((f) => ({
                  ...f,
                  duration_minutes: e.target.value,
                }))
              }
            />
            <TextField
              label="Precio sesión individual ($)"
              size="small"
              type="number"
              fullWidth
              value={editTreatmentForm.single_session_price}
              onChange={(e) =>
                setEditTreatmentForm((f) => ({
                  ...f,
                  single_session_price: e.target.value,
                }))
              }
            />
            {editTreatmentForm.category === "body" && (
              <TextField
                label="Precio sesión de evaluación ($) (opcional)"
                size="small"
                type="number"
                fullWidth
                value={editTreatmentForm.evaluation_price}
                onChange={(e) =>
                  setEditTreatmentForm((f) => ({
                    ...f,
                    evaluation_price: e.target.value,
                  }))
                }
                placeholder="ej. 500"
                helperText="Precio especial para la primera sesión de evaluación"
              />
            )}
            <TextField
              label="Subtítulo"
              size="small"
              fullWidth
              value={editTreatmentForm.subtitle}
              onChange={(e) =>
                setEditTreatmentForm((f) => ({...f, subtitle: e.target.value}))
              }
              placeholder="ej. Nivel inicial"
            />
            <TextField
              label="Ruta"
              size="small"
              fullWidth
              value={editTreatmentForm.route}
              onChange={(e) =>
                setEditTreatmentForm((f) => ({...f, route: e.target.value}))
              }
              placeholder="ej. /cinturon-orion"
            />
            {!!dynamicCategories.find(
              (c) => c.category === editTreatmentForm.category,
            )?.is_gender_split && (
              <FormControl size="small" fullWidth>
                <InputLabel>Género *</InputLabel>
                <Select
                  value={editTreatmentForm.gender}
                  label="Género *"
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      gender: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="hombres">Hombres</MenuItem>
                  <MenuItem value="mujeres">Mujeres</MenuItem>
                </Select>
              </FormControl>
            )}
            {!!dynamicCategories.find(
              (c) => c.category === editTreatmentForm.category,
            )?.is_gender_split && (
              <FormControl size="small" fullWidth>
                <InputLabel>Tipo de item *</InputLabel>
                <Select
                  value={editTreatmentForm.item_type}
                  label="Tipo de item *"
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      item_type: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="zona">Zona</MenuItem>
                  <MenuItem value="paquete">Paquete</MenuItem>
                </Select>
              </FormControl>
            )}
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                PROMOCIONES DESTACADAS
              </Typography>
            </Divider>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editTreatmentForm.is_session_promo}
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      is_session_promo: e.target.checked,
                    }))
                  }
                />
              }
              label="Sesión en oferta destacada"
            />
            {editTreatmentForm.is_session_promo && (
              <TextField
                label="Precio de oferta ($) *"
                size="small"
                type="number"
                fullWidth
                value={editTreatmentForm.promo_price}
                onChange={(e) =>
                  setEditTreatmentForm((f) => ({
                    ...f,
                    promo_price: e.target.value,
                  }))
                }
                helperText="Precio rebajado que se mostrará en la home"
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={editTreatmentForm.is_cuponera_promo}
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      is_cuponera_promo: e.target.checked,
                    }))
                  }
                />
              }
              label="Cuponera en oferta destacada"
            />
            {editTreatmentForm.is_cuponera_promo && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 4, mt: -1 }}>
                Recordá marcar al menos una cuponera de este tratamiento como promocional para que se muestre la oferta en el modal.
              </Typography>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={editTreatmentForm.is_new}
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      is_new: e.target.checked,
                    }))
                  }
                />
              }
              label="Nuevo tratamiento (destacar en home)"
            />
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                OPCIONES DE COMPRA
              </Typography>
            </Divider>
            <FormControlLabel
              control={
                <Checkbox
                  checked={editTreatmentForm.disable_single_session}
                  onChange={(e) =>
                    setEditTreatmentForm((f) => ({
                      ...f,
                      disable_single_session: e.target.checked,
                    }))
                  }
                />
              }
              label="Deshabilitar compra por sesión individual"
            />
            {editTreatmentForm.disable_single_session && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 4, mt: -1 }}>
                Solo se mostrarán cuponeras como opciones de compra.
              </Typography>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={editTreatmentForm.is_active}
                label="Estado"
                onChange={(e) =>
                  setEditTreatmentForm((f) => ({
                    ...f,
                    is_active: e.target.value,
                  }))
                }
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditTreatmentDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveTreatment}
            disabled={savingTreatment}
          >
            {savingTreatment ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Package Dialog */}
      <Dialog
        open={packageDialogOpen}
        onClose={closePackageDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPackage ? "Editar Cuponera" : "Nueva Cuponera"}
        </DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              size="small"
              fullWidth
              value={packageForm.name}
              onChange={(e) =>
                setPackageForm((f) => ({...f, name: e.target.value}))
              }
              placeholder="ej. Cuponera 6"
            />
            <TextField
              label="Cantidad de sesiones"
              size="small"
              type="number"
              fullWidth
              value={packageForm.session_count}
              onChange={(e) =>
                setPackageForm((f) => ({...f, session_count: e.target.value}))
              }
            />
            <TextField
              label="Precio ($)"
              size="small"
              type="number"
              fullWidth
              value={packageForm.price}
              onChange={(e) =>
                setPackageForm((f) => ({...f, price: e.target.value}))
              }
            />
            <TextField
              label="Precio original (opcional, para tachado)"
              size="small"
              type="number"
              fullWidth
              value={packageForm.original_price}
              onChange={(e) =>
                setPackageForm((f) => ({...f, original_price: e.target.value}))
              }
            />
            <FormControl size="small" fullWidth>
              <InputLabel>¿Es promocional?</InputLabel>
              <Select
                value={packageForm.is_promotional}
                label="¿Es promocional?"
                onChange={(e) =>
                  setPackageForm((f) => ({
                    ...f,
                    is_promotional: e.target.value,
                  }))
                }
              >
                <MenuItem value={false}>No</MenuItem>
                <MenuItem value={true}>Sí</MenuItem>
              </Select>
            </FormControl>
            {packageForm.is_promotional && (
              <TextField
                label="Etiqueta de promoción"
                size="small"
                fullWidth
                value={packageForm.promo_label}
                onChange={(e) =>
                  setPackageForm((f) => ({...f, promo_label: e.target.value}))
                }
                placeholder="ej. Oferta Primavera"
              />
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={packageForm.is_active}
                label="Estado"
                onChange={(e) =>
                  setPackageForm((f) => ({...f, is_active: e.target.value}))
                }
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePackageDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSavePackage}
            disabled={savingPackage}
          >
            {savingPackage ? (
              <CircularProgress size={20} />
            ) : editingPackage ? (
              "Guardar Cambios"
            ) : (
              "Crear Cuponera"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </>
  );
}
