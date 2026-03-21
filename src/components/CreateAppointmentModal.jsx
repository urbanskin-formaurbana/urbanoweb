import {useState, useEffect} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
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
  LinearProgress,
} from "@mui/material";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import adminService from "../services/admin_service";
import appointmentService from "../services/appointment_service";
import bankService from "../services/bank_service";
import {
  isCampaignTreatment,
  filterSlotsForEmployee,
  fetchAvailableSlots,
} from "../utils/slotUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

function formatAppointmentDate(isoString) {
  return dayjs
    .utc(isoString)
    .tz("America/Montevideo")
    .format("dddd, D [de] MMMM");
}

const BUILTIN_CATEGORY_LABELS = {
  body: "Corporal",
  facial: "Facial",
  complementarios: "Complementarios",
};

const DEFAULT_DEPOSIT_AMOUNT = 500;

const PAYMENT_METHOD_LABELS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
  posnet: "POSNet",
};

function formatCategoryLabel(category) {
  if (!category) return "";
  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatGenderLabel(gender) {
  if (!gender) return "";
  if (gender === "mujeres") return "Mujeres";
  if (gender === "hombres") return "Hombres";
  return formatCategoryLabel(gender);
}

function formatItemTypeLabel(itemType) {
  if (!itemType) return "";
  if (itemType === "zona") return "Zona";
  if (itemType === "paquete") return "Paquete";
  return formatCategoryLabel(itemType);
}

function getValidDepositAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DEPOSIT_AMOUNT;
  }
  return parsed;
}

function formatPaymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] || method || "No definido";
}

function formatMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  if (Number.isInteger(parsed)) return parsed.toString();
  return parsed.toFixed(2);
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  prefilledCustomer,
}) {
  const STEPS = [
    "Cliente",
    "Tratamiento",
    "Sesión y Pago",
    "Fecha y Hora",
    "Confirmar",
  ];
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null); // { appointment_id, session_number, remaining_sessions, total_sessions, treatment_name, customer_name }

  // Step 1: Customer
  const [customerMode, setCustomerMode] = useState(
    prefilledCustomer ? "search" : "search",
  );
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(
    prefilledCustomer || null,
  );
  const [newCustomerForm, setNewCustomerForm] = useState({
    full_name: "",
    whatsapp_phone: "",
    email: "",
  });
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Step 2: Treatment
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [laserGender, setLaserGender] = useState(null);
  const [laserItemType, setLaserItemType] = useState(null);
  const [categoryConfigs, setCategoryConfigs] = useState([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  // Step 3: Payment
  const [paymentMode, setPaymentMode] = useState(null);
  const [customerCuponeras, setCustomerCuponeras] = useState([]);
  const [selectedCuponera, setSelectedCuponera] = useState(null);
  const [treatmentPackages, setTreatmentPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customerCanPurchasePackages, setCustomerCanPurchasePackages] =
    useState(null);
  const [newPurchase, setNewPurchase] = useState({
    total_sessions: "",
    amount_paid: "",
    payment_method: "efectivo",
    payment_plan: "full_now",
    payment_method_expected: "efectivo",
  });
  const [loadingStep3, setLoadingStep3] = useState(false);
  const [depositAmountConfig, setDepositAmountConfig] = useState(
    DEFAULT_DEPOSIT_AMOUNT,
  );

  // Step 4: Schedule
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableLaserDates, setAvailableLaserDates] = useState(null);
  const [loadingLaserDates, setLoadingLaserDates] = useState(false);

  // Auto-advance to Step 2 if prefilledCustomer
  useEffect(() => {
    if (prefilledCustomer && open) {
      setStep(2);
    }
  }, [prefilledCustomer, open]);

  // Sync selectedCustomer when prefilledCustomer prop changes
  useEffect(() => {
    if (prefilledCustomer) {
      setSelectedCustomer(prefilledCustomer);
    }
  }, [prefilledCustomer]);

  // Load customers on mount
  useEffect(() => {
    if (open && customerMode === "search" && customerOptions.length === 0) {
      loadCustomers();
    }
  }, [open, customerMode]);

  // Load treatments on step 2
  useEffect(() => {
    if (open && step === 2) {
      loadStep2Data();
    }
  }, [open, step]);

  // Load all step 3 data when entering step 3
  useEffect(() => {
    if (open && step === 3 && selectedTreatment && (selectedCustomer || customerMode === "new")) {
      loadStep3Data();
    }
  }, [open, step, selectedCustomer, selectedTreatment, customerMode]);

  // Update amount when package is selected
  useEffect(() => {
    if (selectedPackage) {
      setNewPurchase((prev) => ({
        ...prev,
        amount_paid: selectedPackage.price || "",
        total_sessions: selectedPackage.session_count || "",
      }));
    }
  }, [selectedPackage]);

  // Update amount for single session
  useEffect(() => {
    if (paymentMode === "single_session" && selectedTreatment) {
      const price = selectedTreatment.single_session_price || "";
      setNewPurchase((prev) => ({
        ...prev,
        amount_paid: price,
      }));
    }
  }, [paymentMode, selectedTreatment]);

  const treatmentSingleSessionAmount = Number(
    selectedTreatment?.single_session_price || 0,
  );
  const customSingleSessionAmount = Number(newPurchase.amount_paid);
  const singleSessionTotalAmount =
    paymentMode === "single_session" &&
    Number.isFinite(customSingleSessionAmount) &&
    customSingleSessionAmount > 0
      ? customSingleSessionAmount
      : treatmentSingleSessionAmount;
  const configuredDepositAmount = getValidDepositAmount(depositAmountConfig);
  const effectiveDepositAmount =
    singleSessionTotalAmount > 0
      ? Math.min(configuredDepositAmount, singleSessionTotalAmount)
      : configuredDepositAmount;
  const singleSessionRemainingAmount = Math.max(
    singleSessionTotalAmount - effectiveDepositAmount,
    0,
  );

  // Load available slots when date changes
  useEffect(() => {
    if (!scheduleDate || !selectedTreatment) {
      setAvailableSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const slotStrings = await fetchAvailableSlots(
          scheduleDate.toDate(),
          selectedTreatment,
          paymentMode,
        );
        console.log(
          "[CreateAppointmentModal] Raw slots from API:",
          slotStrings?.length,
          slotStrings?.slice(0, 3),
        );
        const filtered = filterSlotsForEmployee(slotStrings);
        console.log(
          "[CreateAppointmentModal] After filterSlotsForEmployee:",
          filtered?.length,
          filtered?.slice(0, 3),
        );
        setAvailableSlots(filtered);
      } catch (err) {
        console.error("Error loading slots:", err);
        setError("Error al cargar los horarios disponibles");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [scheduleDate, selectedTreatment, paymentMode]);

  // Load available laser dates when entering step 4 with a laser treatment
  useEffect(() => {
    if (
      step !== 4 ||
      !selectedTreatment ||
      !isCampaignTreatment(selectedTreatment)
    ) {
      setAvailableLaserDates(null);
      return;
    }

    const loadDates = async () => {
      setLoadingLaserDates(true);
      try {
        const slots = await fetchAvailableSlots(null, selectedTreatment, null);
        const dates = new Set(
          slots.map((s) =>
            dayjs.utc(s).tz("America/Montevideo").format("YYYY-MM-DD"),
          ),
        );
        setAvailableLaserDates(dates);
      } catch (err) {
        console.error("Error loading laser dates:", err);
      } finally {
        setLoadingLaserDates(false);
      }
    };

    loadDates();
  }, [step, selectedTreatment]);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const {customers} = await adminService.getCustomers(null, 0, 500);
      setCustomerOptions(customers || []);
    } catch (err) {
      console.error("Error loading customers:", err);
      setError("Error al cargar clientes");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadStep2Data = async () => {
    setLoadingTreatments(true);
    try {
      const [treatmentsResult, categoryConfigResult] = await Promise.allSettled(
        [adminService.getTreatments(), adminService.getCategoryConfigs()],
      );

      if (treatmentsResult.status !== "fulfilled") {
        throw treatmentsResult.reason;
      }

      const result = treatmentsResult.value;
      setTreatments(
        (result?.treatments || []).filter((t) => t.is_active !== false),
      );

      if (categoryConfigResult.status === "fulfilled") {
        setCategoryConfigs(categoryConfigResult.value || []);
      } else {
        console.error(
          "Error loading category configs:",
          categoryConfigResult.reason,
        );
        setCategoryConfigs([]);
      }
    } catch (err) {
      console.error("Error loading treatments:", err);
      setError("Error al cargar tratamientos");
    } finally {
      setLoadingTreatments(false);
    }
  };

  const loadStep3Data = async () => {
    setLoadingStep3(true);
    try {
      const isNewCustomer = customerMode === "new";

      // For existing customers, fetch history; for new customers, skip it
      const historyPromise = isNewCustomer
        ? Promise.resolve(null)
        : adminService.getCustomerHistory(selectedCustomer.id || selectedCustomer._id);

      const [historyResult, packagesResult, bankDetailsResult] =
        await Promise.allSettled([
          historyPromise,
          appointmentService.getTreatmentPackages(selectedTreatment.slug),
          bankService.getBankDetails(),
        ]);

      if (packagesResult.status !== "fulfilled") {
        throw packagesResult.reason;
      }

      // Load customer history (cuponeras + can_purchase_packages status)
      let activeCuponeras = [];
      let canPurchasePackages = true; // Default for new customers

      if (!isNewCustomer && historyResult.status === "fulfilled") {
        const history = historyResult.value;
        activeCuponeras = (history.timeline || []).filter(
          (item) =>
            item.kind === "cuponera" &&
            item.sessions_used < item.total_sessions &&
            item.treatment_name === selectedTreatment.name,
        );
        canPurchasePackages = history.can_purchase_packages ?? true;
      }

      setCustomerCuponeras(activeCuponeras);
      setCustomerCanPurchasePackages(canPurchasePackages);

      // Load treatment packages
      const data = packagesResult.value;
      const packages = (data.packages || []).filter(
        (p) => p.is_active !== false,
      );
      setTreatmentPackages(packages);

      if (bankDetailsResult.status === "fulfilled") {
        setDepositAmountConfig(getValidDepositAmount(bankDetailsResult.value?.deposit_amount));
      } else {
        setDepositAmountConfig(DEFAULT_DEPOSIT_AMOUNT);
      }

      // Auto-reset paymentMode if the selected mode is now unavailable
      if (paymentMode) {
        const validModes = [
          ...(activeCuponeras.length > 0 ? ["existing_cuponera"] : []),
          "single_session",
          ...(packages.length > 0 ? ["new_package"] : []),
          ...(selectedTreatment?.category === "body" && !canPurchasePackages
            ? ["evaluacion"]
            : []),
        ];
        if (!validModes.includes(paymentMode)) {
          setPaymentMode(null);
        }
      }
    } catch (err) {
      console.error("Error loading step 3 data:", err);
      setError("Error al cargar datos de la sesión");
    } finally {
      setLoadingStep3(false);
    }
  };

  const getCategoryConfig = (category) => {
    return (
      categoryConfigs.find((config) => config.category === category) || null
    );
  };

  const getCategoryLabel = (category) => {
    const config = getCategoryConfig(category);
    if (config?.label) return config.label;
    if (BUILTIN_CATEGORY_LABELS[category])
      return BUILTIN_CATEGORY_LABELS[category];
    return formatCategoryLabel(category);
  };

  const getCategoryTreatments = (category) => {
    return treatments.filter((treatment) => treatment.category === category);
  };

  const isGenderSplitCategory = (category, categoryTreatments) => {
    const config = getCategoryConfig(category);
    return (
      config?.is_gender_split === true ||
      categoryTreatments.some((treatment) => treatment.gender != null)
    );
  };

  const getGenderOptions = (categoryTreatments) => {
    const options = [
      ...new Set(
        categoryTreatments
          .map((treatment) => treatment.gender)
          .filter((gender) => gender != null),
      ),
    ];
    if (options.length > 0) return options;
    return ["mujeres", "hombres"];
  };

  const getItemTypeOptions = (categoryTreatments, gender = null) => {
    let filtered = categoryTreatments;
    if (gender) {
      filtered = filtered.filter((treatment) => treatment.gender === gender);
    }
    return [
      ...new Set(
        filtered
          .map((treatment) => treatment.item_type)
          .filter((itemType) => itemType != null),
      ),
    ];
  };

  const getAvailableCategories = () => {
    const categoryOrder = {
      body: 0,
      facial: 1,
      complementarios: 2,
    };
    const categories = [
      ...new Set(
        treatments
          .map((treatment) => treatment.category)
          .filter((category) => category != null),
      ),
    ];

    categories.sort((a, b) => {
      const orderA = categoryOrder[a] ?? Number.MAX_SAFE_INTEGER;
      const orderB = categoryOrder[b] ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return getCategoryLabel(a).localeCompare(getCategoryLabel(b), "es");
    });

    return categories.map((category) => {
      const categoryTreatments = getCategoryTreatments(category);
      return {
        key: category,
        label: getCategoryLabel(category),
        count: categoryTreatments.length,
        isGenderSplit: isGenderSplitCategory(category, categoryTreatments),
      };
    });
  };

  const getFilteredTreatments = () => {
    if (!selectedCategory) return [];

    const categoryTreatments = getCategoryTreatments(selectedCategory);
    const requiresGender = isGenderSplitCategory(
      selectedCategory,
      categoryTreatments,
    );

    let filtered = categoryTreatments;

    if (requiresGender && laserGender) {
      filtered = filtered.filter(
        (treatment) => treatment.gender === laserGender,
      );
    }

    const itemTypeOptions = getItemTypeOptions(
      categoryTreatments,
      requiresGender ? laserGender : null,
    );
    if (itemTypeOptions.length > 1 && laserItemType) {
      filtered = filtered.filter(
        (treatment) => treatment.item_type === laserItemType,
      );
    }

    return filtered;
  };

  useEffect(() => {
    if (!selectedCategory) return;
    const availableCategories = getAvailableCategories();
    if (
      !availableCategories.some((category) => category.key === selectedCategory)
    ) {
      setSelectedCategory(null);
      setLaserGender(null);
      setLaserItemType(null);
      setSelectedTreatment(null);
    }
  }, [selectedCategory, treatments, categoryConfigs]);

  useEffect(() => {
    if (!selectedTreatment) return;
    const filtered = getFilteredTreatments();
    if (!filtered.some((treatment) => treatment.id === selectedTreatment.id)) {
      setSelectedTreatment(null);
    }
  }, [
    selectedCategory,
    laserGender,
    laserItemType,
    treatments,
    categoryConfigs,
    selectedTreatment,
  ]);

  const handleNextStep = () => {
    // Validate current step
    if (step === 1) {
      if (customerMode === "search" && !selectedCustomer) {
        setError("Selecciona un cliente");
        return;
      }
      if (customerMode === "new" && !newCustomerForm.full_name) {
        setError("Ingresa el nombre del cliente");
        return;
      }
    } else if (step === 2) {
      if (!selectedTreatment) {
        setError("Selecciona un tratamiento");
        return;
      }
    } else if (step === 3) {
      if (!paymentMode) {
        setError("Selecciona un tipo de sesión");
        return;
      }
      if (paymentMode === "existing_cuponera" && !selectedCuponera) {
        setError("Selecciona una cuponera");
        return;
      }
      if (paymentMode === "new_package" && !selectedPackage) {
        setError("Selecciona un paquete");
        return;
      }
      if (paymentMode === "single_session") {
        if (!newPurchase.payment_plan) {
          setError("Selecciona cómo se manejará el pago");
          return;
        }
        if (newPurchase.payment_plan === "full_now") {
          if (
            newPurchase.amount_paid === "" ||
            isNaN(parseFloat(newPurchase.amount_paid)) ||
            parseFloat(newPurchase.amount_paid) <= 0 ||
            !newPurchase.payment_method
          ) {
            setError("Completa el monto y método de pago");
            return;
          }
        }
        if (
          newPurchase.payment_plan === "pay_later" &&
          !newPurchase.payment_method_expected
        ) {
          setError("Selecciona el método esperado para el cobro");
          return;
        }
        if (newPurchase.payment_plan === "deposit") {
          if (!newPurchase.payment_method) {
            setError("Selecciona el método de pago de la seña");
            return;
          }
          if (
            singleSessionRemainingAmount > 0 &&
            !newPurchase.payment_method_expected
          ) {
            setError("Selecciona el método esperado para cobrar el resto");
            return;
          }
        }
      }
      if (
        paymentMode === "new_package" &&
        (newPurchase.amount_paid === "" ||
          isNaN(parseFloat(newPurchase.amount_paid)) ||
          parseFloat(newPurchase.amount_paid) <= 0 ||
          !newPurchase.payment_method)
      ) {
        setError("Completa el monto y método de pago");
        return;
      }
    } else if (step === 4) {
      if (!scheduleDate || !scheduleTime) {
        setError("Selecciona una fecha y hora");
        return;
      }
    }

    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    // Handle sub-steps within step 2
    if (step === 2) {
      const categoryTreatments = selectedCategory
        ? getCategoryTreatments(selectedCategory)
        : [];
      const requiresGender = selectedCategory
        ? isGenderSplitCategory(selectedCategory, categoryTreatments)
        : false;
      const itemTypeOptions = selectedCategory
        ? getItemTypeOptions(
            categoryTreatments,
            requiresGender ? laserGender : null,
          )
        : [];
      const requiresItemType = itemTypeOptions.length > 1;

      if (requiresItemType && laserItemType) {
        setLaserItemType(null);
      } else if (requiresGender && laserGender) {
        setLaserGender(null);
      } else if (selectedCategory) {
        setSelectedCategory(null);
        setSelectedTreatment(null);
      } else {
        setStep(step - 1);
      }
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let customerId = customerMode === "new"
        ? null
        : selectedCustomer.id || selectedCustomer._id;
      let purchasedPackageId = null;
      let paymentId = null;
      let singleSessionPaymentPlan = null;
      let paymentMethodExpected = null;
      let allowConfirmWithoutPayment = false;
      const hasSingleSessionRemainder =
        newPurchase.payment_plan === "deposit" && singleSessionRemainingAmount > 0;

      // Create new customer if needed
      if (customerMode === "new") {
        const created = await adminService.createCustomer(newCustomerForm);
        customerId = created.id;
      }

      // Create payment/package if needed
      if (paymentMode === "single_session") {
        singleSessionPaymentPlan = newPurchase.payment_plan || "full_now";

        if (singleSessionPaymentPlan === "pay_later") {
          paymentMethodExpected = newPurchase.payment_method_expected;
          allowConfirmWithoutPayment = true;
        } else {
          const upfrontAmount =
            singleSessionPaymentPlan === "deposit"
              ? effectiveDepositAmount
              : parseFloat(newPurchase.amount_paid);
          if (singleSessionPaymentPlan === "deposit" && hasSingleSessionRemainder) {
            paymentMethodExpected = newPurchase.payment_method_expected;
            allowConfirmWithoutPayment = true;
          }

          const paymentData = {
            customer_id: customerId,
            treatment_id: selectedTreatment.id,
            amount: upfrontAmount,
            payment_method: newPurchase.payment_method,
            item_type: "single_session",
            payment_plan: singleSessionPaymentPlan,
            total_amount: singleSessionTotalAmount || upfrontAmount,
            payment_method_expected: paymentMethodExpected || undefined,
          };
          const payment = await adminService.createManualPayment(paymentData);
          paymentId = payment?.payment_id || payment?.id || payment?._id || null;
        }
      } else if (paymentMode === "new_package") {
        const paymentData = {
          customer_id: customerId,
          treatment_id: selectedTreatment.id,
          amount: parseFloat(newPurchase.amount_paid),
          payment_method: newPurchase.payment_method,
          item_type: "package",
          package_id: selectedPackage.id,
        };

        const payment = await adminService.createManualPayment(paymentData);
        if (payment.purchased_package_id) {
          purchasedPackageId = payment.purchased_package_id;
        }
        paymentId = payment?.payment_id || payment?.id || payment?._id || null;
      } else if (paymentMode === "existing_cuponera") {
        purchasedPackageId = selectedCuponera.purchased_package_id;
      }

      // Combine date and time in Montevideo timezone, then convert to UTC
      const dateStr = scheduleDate.format("YYYY-MM-DD");
      const scheduledAtUTC = dayjs
        .tz(`${dateStr} ${scheduleTime}`, "America/Montevideo")
        .utc()
        .toISOString();

      // Create appointment
      const appointmentData = {
        customer_id: customerId,
        treatment_id: selectedTreatment.id,
        scheduled_at: scheduledAtUTC,
        purchased_package_id: purchasedPackageId,
        is_evaluation: paymentMode === "evaluacion",
      };
      if (paymentId) {
        appointmentData.payment_id = paymentId;
      }
      if (paymentMode === "single_session") {
        appointmentData.payment_plan = singleSessionPaymentPlan || "full_now";
        if (singleSessionTotalAmount > 0) {
          appointmentData.total_amount = singleSessionTotalAmount;
        }
        if (paymentMethodExpected) {
          appointmentData.payment_method_expected = paymentMethodExpected;
        }
        if (allowConfirmWithoutPayment) {
          appointmentData.allow_confirm_without_payment = true;
        }
      }

      const appointmentResult =
        await adminService.createAdminAppointment(appointmentData);

      // Show success screen with multi-session option if there are remaining sessions
      const displayCustomerName =
        customerMode === "new"
          ? newCustomerForm.full_name
          : selectedCustomer.full_name || selectedCustomer.name;
      setSuccessState({
        appointment_id: appointmentResult.id,
        session_number: appointmentResult.session_number,
        remaining_sessions: appointmentResult.remaining_sessions,
        total_sessions:
          appointmentResult.session_number +
          (appointmentResult.remaining_sessions || 0),
        treatment_name: selectedTreatment.name,
        customer_name: displayCustomerName,
      });

      setSubmitting(false);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err.detail || "Error al crear la sesión");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setStep(prefilledCustomer ? 2 : 1);
      setError(null);
      setSelectedCustomer(prefilledCustomer || null);
      setSelectedTreatment(null);
      setSelectedCategory(null);
      setLaserGender(null);
      setLaserItemType(null);
      setPaymentMode(null);
      setScheduleDate(null);
      setScheduleTime(null);
      setAvailableLaserDates(null);
      setCustomerCuponeras([]);
      setSelectedCuponera(null);
      setCustomerCanPurchasePackages(null);
      setTreatmentPackages([]);
      setSelectedPackage(null);
      setNewPurchase({
        total_sessions: "",
        amount_paid: "",
        payment_method: "efectivo",
        payment_plan: "full_now",
        payment_method_expected: "efectivo",
      });
      setDepositAmountConfig(DEFAULT_DEPOSIT_AMOUNT);
      onClose();
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box sx={{py: 2}}>
            {prefilledCustomer ? (
              <Box sx={{mb: 3}}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{mb: 1}}>
                      Cliente seleccionado
                    </Typography>
                    <Chip
                      label={
                        prefilledCustomer.name || prefilledCustomer.full_name
                      }
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
                      checked={customerMode === "search"}
                      onChange={() => setCustomerMode("search")}
                    />
                  }
                  label="Buscar cliente existente"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={customerMode === "new"}
                      onChange={() => setCustomerMode("new")}
                    />
                  }
                  label="Crear nuevo cliente"
                />

                {customerMode === "search" ? (
                  <Autocomplete
                    options={customerOptions}
                    getOptionLabel={(opt) =>
                      `${opt.full_name} (${opt.whatsapp_phone || opt.email})`
                    }
                    value={selectedCustomer}
                    onChange={(e, val) => setSelectedCustomer(val)}
                    loading={loadingCustomers}
                    sx={{mt: 2}}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        placeholder="Buscar por nombre o teléfono"
                      />
                    )}
                  />
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
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

      case 2: {
        const categories = getAvailableCategories();
        const categoryTreatments = selectedCategory
          ? getCategoryTreatments(selectedCategory)
          : [];
        const selectedCategoryInfo = categories.find(
          (category) => category.key === selectedCategory,
        );
        const requiresGender = selectedCategory
          ? isGenderSplitCategory(selectedCategory, categoryTreatments)
          : false;
        const genderOptions = requiresGender
          ? getGenderOptions(categoryTreatments)
          : [];
        const itemTypeOptions = selectedCategory
          ? getItemTypeOptions(
              categoryTreatments,
              requiresGender ? laserGender : null,
            )
          : [];
        const requiresItemType = itemTypeOptions.length > 1;

        let subStep = "category";
        if (selectedCategory) {
          if (requiresGender && !laserGender) {
            subStep = "gender";
          } else if (requiresItemType && !laserItemType) {
            subStep = "item_type";
          } else {
            subStep = "treatments";
          }
        }

        const breadcrumb = [];
        if (selectedCategoryInfo) {
          breadcrumb.push(selectedCategoryInfo.label);
        }
        if (requiresGender && laserGender) {
          breadcrumb.push(formatGenderLabel(laserGender));
        }
        if (requiresItemType && laserItemType) {
          breadcrumb.push(formatItemTypeLabel(laserItemType));
        }

        if (loadingTreatments) {
          return (
            <Box sx={{py: 2}}>
              <CircularProgress />
            </Box>
          );
        }

        // Sub-step: category selection
        if (subStep === "category") {
          return (
            <Box sx={{py: 2}}>
              {categories.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay tratamientos activos para agendar.
                </Typography>
              )}
              <Box sx={{maxHeight: 360, overflowY: "auto", pr: 1}}>
                {categories.map((cat) => {
                  return (
                    <Card
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setLaserGender(null);
                        setLaserItemType(null);
                        setSelectedTreatment(null);
                      }}
                      sx={{
                        mb: 1.5,
                        cursor: "pointer",
                        border:
                          selectedCategory === cat.key
                            ? "2px solid #1976d2"
                            : "1px solid #e0e0e0",
                        backgroundColor:
                          selectedCategory === cat.key ? "#f5f5f5" : "white",
                        transition: "all 0.2s",
                        "&:hover": {
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {cat.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cat.count} tratamiento{cat.count !== 1 ? "s" : ""}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          );
        }

        // Sub-step: gender selection
        if (subStep === "gender") {
          return (
            <Box sx={{py: 2}}>
              <Box sx={{mb: 2, display: "flex", gap: 1, flexWrap: "wrap"}}>
                <Chip
                  label={`${selectedCategoryInfo?.label || getCategoryLabel(selectedCategory)} ›`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Box sx={{maxHeight: 360, overflowY: "auto", pr: 1}}>
                {genderOptions.map((gender) => (
                  <Card
                    key={gender}
                    onClick={() => {
                      setLaserGender(gender);
                      setLaserItemType(null);
                      setSelectedTreatment(null);
                    }}
                    sx={{
                      mb: 1.5,
                      cursor: "pointer",
                      border:
                        laserGender === gender
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                      backgroundColor:
                        laserGender === gender ? "#f5f5f5" : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatGenderLabel(gender)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        }

        // Sub-step: item type selection
        if (subStep === "item_type") {
          return (
            <Box sx={{py: 2}}>
              <Box sx={{mb: 2, display: "flex", gap: 1, flexWrap: "wrap"}}>
                <Chip
                  label={`${selectedCategoryInfo?.label || getCategoryLabel(selectedCategory)} ›`}
                  variant="outlined"
                  size="small"
                />
                {requiresGender && (
                  <Chip
                    label={`${formatGenderLabel(laserGender)} ›`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              <Box sx={{maxHeight: 360, overflowY: "auto", pr: 1}}>
                {itemTypeOptions.map((itemType) => (
                  <Card
                    key={itemType}
                    onClick={() => {
                      setLaserItemType(itemType);
                      setSelectedTreatment(null);
                    }}
                    sx={{
                      mb: 1.5,
                      cursor: "pointer",
                      border:
                        laserItemType === itemType
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                      backgroundColor:
                        laserItemType === itemType ? "#f5f5f5" : "white",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatItemTypeLabel(itemType)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        }

        // Sub-step: treatments list
        const filteredTreatments = getFilteredTreatments();

        return (
          <Box sx={{py: 2}}>
            {breadcrumb.length > 0 && (
              <Box sx={{mb: 2, display: "flex", gap: 1, flexWrap: "wrap"}}>
                {breadcrumb.map((part, idx) => (
                  <Chip
                    key={idx}
                    label={`${part} ${idx < breadcrumb.length - 1 ? "›" : ""}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            )}
            {filteredTreatments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                No hay tratamientos para los filtros seleccionados.
              </Typography>
            )}
            <Box sx={{maxHeight: 360, overflowY: "auto", pr: 1}}>
              {filteredTreatments.map((treatment) => (
                <Card
                  key={treatment.id}
                  onClick={() => setSelectedTreatment(treatment)}
                  sx={{
                    mb: 1.5,
                    cursor: "pointer",
                    border:
                      selectedTreatment?.id === treatment.id
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                    backgroundColor:
                      selectedTreatment?.id === treatment.id
                        ? "#f5f5f5"
                        : "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 2,
                    },
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
              ))}
            </Box>
          </Box>
        );
      }

      case 3:
        if (loadingStep3) {
          return (
            <Box
              sx={{
                py: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          );
        }

        return (
          <Box sx={{py: 2}}>
            <RadioGroup
              value={paymentMode || ""}
              onChange={(e) => {
                const nextMode = e.target.value;
                setPaymentMode(nextMode);
                setSelectedCuponera(null);
                setSelectedPackage(null);
                if (nextMode === "single_session") {
                  setNewPurchase((prev) => ({
                    ...prev,
                    amount_paid: selectedTreatment?.single_session_price || "",
                    payment_plan: "full_now",
                    payment_method: "efectivo",
                    payment_method_expected: "efectivo",
                  }));
                }
              }}
            >
              {customerCuponeras.length > 0 && (
                <>
                  <FormControlLabel
                    value="existing_cuponera"
                    control={<Radio />}
                    label="Usar cuponera existente"
                  />
                  {paymentMode === "existing_cuponera" && (
                    <Box sx={{ml: 4, mt: 1, mb: 2}}>
                      {customerCuponeras.map((cuponera) => (
                        <Card
                          key={cuponera.purchased_package_id}
                          sx={{
                            mb: 1,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            border: "2px solid",
                            borderColor:
                              selectedCuponera?.purchased_package_id ===
                              cuponera.purchased_package_id
                                ? "primary.main"
                                : "transparent",
                            backgroundColor:
                              selectedCuponera?.purchased_package_id ===
                              cuponera.purchased_package_id
                                ? "action.selected"
                                : "background.paper",
                            "&:hover": {
                              boxShadow: 3,
                              borderColor:
                                selectedCuponera?.purchased_package_id ===
                                cuponera.purchased_package_id
                                  ? "primary.main"
                                  : "primary.light",
                            },
                          }}
                          onClick={() => setSelectedCuponera(cuponera)}
                        >
                          <CardContent sx={{pb: 1}}>
                            <Typography>{cuponera.package_name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {cuponera.sessions_used}/{cuponera.total_sessions}{" "}
                              sesiones usadas
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </>
              )}

              <FormControlLabel
                value="single_session"
                control={<Radio />}
                label="Sesión individual"
              />
              {paymentMode === "single_session" && (
                <Box
                  sx={{
                    ml: 4,
                    mt: 1,
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Monto total de la sesión: ${formatMoney(singleSessionTotalAmount)}
                  </Typography>

                  <RadioGroup
                    value={newPurchase.payment_plan}
                    onChange={(e) =>
                      setNewPurchase((prev) => ({
                        ...prev,
                        payment_plan: e.target.value,
                      }))
                    }
                  >
                    <FormControlLabel
                      value="full_now"
                      control={<Radio />}
                      label="Pago completo ahora"
                    />
                    <FormControlLabel
                      value="pay_later"
                      control={<Radio />}
                      label="Pagar durante sesión"
                    />
                    <FormControlLabel
                      value="deposit"
                      control={<Radio />}
                      label={`Seña + resto (seña: $${formatMoney(effectiveDepositAmount)})`}
                    />
                  </RadioGroup>

                  {newPurchase.payment_plan === "full_now" && (
                    <>
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
                    </>
                  )}

                  {newPurchase.payment_plan === "pay_later" && (
                    <FormControl>
                      <InputLabel>Método esperado de cobro</InputLabel>
                      <Select
                        value={newPurchase.payment_method_expected}
                        onChange={(e) =>
                          setNewPurchase((prev) => ({
                            ...prev,
                            payment_method_expected: e.target.value,
                          }))
                        }
                        label="Método esperado de cobro"
                      >
                        <MenuItem value="efectivo">Efectivo</MenuItem>
                        <MenuItem value="transferencia">Transferencia</MenuItem>
                        <MenuItem value="posnet">POSNet</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {newPurchase.payment_plan === "deposit" && (
                    <>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: "grey.100",
                        }}
                      >
                        <Typography variant="body2">
                          Seña a cobrar ahora: ${formatMoney(effectiveDepositAmount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resto pendiente: ${formatMoney(singleSessionRemainingAmount)}
                        </Typography>
                      </Box>
                      <FormControl>
                        <InputLabel>Método de pago de la seña</InputLabel>
                        <Select
                          value={newPurchase.payment_method}
                          onChange={(e) =>
                            setNewPurchase((prev) => ({
                              ...prev,
                              payment_method: e.target.value,
                            }))
                          }
                          label="Método de pago de la seña"
                        >
                          <MenuItem value="efectivo">Efectivo</MenuItem>
                          <MenuItem value="transferencia">Transferencia</MenuItem>
                          <MenuItem value="posnet">POSNet</MenuItem>
                        </Select>
                      </FormControl>

                      {singleSessionRemainingAmount > 0 && (
                        <FormControl>
                          <InputLabel>Método esperado para el resto</InputLabel>
                          <Select
                            value={newPurchase.payment_method_expected}
                            onChange={(e) =>
                              setNewPurchase((prev) => ({
                                ...prev,
                                payment_method_expected: e.target.value,
                              }))
                            }
                            label="Método esperado para el resto"
                          >
                            <MenuItem value="efectivo">Efectivo</MenuItem>
                            <MenuItem value="transferencia">Transferencia</MenuItem>
                            <MenuItem value="posnet">POSNet</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </>
                  )}
                </Box>
              )}

              {treatmentPackages.length > 0 && (
                <>
                  <FormControlLabel
                    value="new_package"
                    control={<Radio />}
                    label="Comprar cuponera"
                  />
                  {paymentMode === "new_package" && (
                    <Box
                      sx={{
                        ml: 4,
                        mt: 1,
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Grid container spacing={1}>
                        {treatmentPackages.map((pkg) => (
                          <Grid size={{xs: 12}} key={pkg.id}>
                            <Card
                              onClick={() => setSelectedPackage(pkg)}
                              sx={{
                                cursor: "pointer",
                                border:
                                  selectedPackage?.id === pkg.id
                                    ? "2px solid #1976d2"
                                    : "1px solid #e0e0e0",
                              }}
                            >
                              <CardContent sx={{py: 1}}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                >
                                  {pkg.name} - ${pkg.price}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {pkg.session_count} sesiones
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
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
                          <MenuItem value="transferencia">
                            Transferencia
                          </MenuItem>
                          <MenuItem value="posnet">POSNet</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </>
              )}

              {selectedTreatment?.category === "body" &&
                customerCanPurchasePackages === false && (
                  <FormControlLabel
                    value="evaluacion"
                    control={<Radio />}
                    label="Sesión de evaluación"
                  />
                )}
            </RadioGroup>
          </Box>
        );

      case 4:
        return (
          <Box sx={{py: 2}}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Fecha"
                value={scheduleDate}
                onChange={setScheduleDate}
                minDate={dayjs()}
                shouldDisableDate={
                  isCampaignTreatment(selectedTreatment) && availableLaserDates
                    ? (date) =>
                        !availableLaserDates.has(date.format("YYYY-MM-DD"))
                    : undefined
                }
                disabled={
                  isCampaignTreatment(selectedTreatment) && loadingLaserDates
                }
                sx={{width: "100%", mb: 2}}
              />
            </LocalizationProvider>

            {loadingSlots ? (
              <CircularProgress />
            ) : (
              <>
                <Grid container spacing={1}>
                  {availableSlots.map((slot) => {
                    const slotTime = dayjs
                      .utc(slot)
                      .tz("America/Montevideo")
                      .format("HH:mm");
                    return (
                      <Grid size={{xs: 4}} key={slot}>
                        <Button
                          variant={
                            scheduleTime === slotTime ? "contained" : "outlined"
                          }
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
                {scheduleDate && availableSlots.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mt: 1}}
                  >
                    No hay horarios disponibles para este día
                  </Typography>
                )}
              </>
            )}
          </Box>
        );

      case 5:
        return (
          <Box sx={{py: 2}}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{mb: 2}}>
                  Resumen de la sesión
                </Typography>

                <Box sx={{mb: 2}}>
                  <Typography variant="body2">
                    <strong>Cliente:</strong>{" "}
                    {customerMode === "new"
                      ? newCustomerForm.full_name
                      : selectedCustomer?.full_name || selectedCustomer?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tratamiento:</strong> {selectedTreatment?.name}
                  </Typography>
                  <Divider sx={{my: 1}} />
                  {paymentMode === "existing_cuponera" && (
                    <>
                      <Typography variant="body2">
                        <strong>Cuponera:</strong>{" "}
                        {selectedCuponera?.package_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Sesiones disponibles:</strong>{" "}
                        {selectedCuponera?.total_sessions -
                          selectedCuponera?.sessions_used}
                      </Typography>
                    </>
                  )}
                  {paymentMode === "single_session" && (
                    <>
                      <Typography variant="body2">
                        <strong>Tipo:</strong> Sesión individual
                      </Typography>
                      {newPurchase.payment_plan === "full_now" && (
                        <>
                          <Typography variant="body2">
                            <strong>Plan de pago:</strong> Pago completo ahora
                          </Typography>
                          <Typography variant="body2">
                            <strong>Monto:</strong> ${formatMoney(newPurchase.amount_paid)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Método:</strong>{" "}
                            {formatPaymentMethodLabel(newPurchase.payment_method)}
                          </Typography>
                        </>
                      )}
                      {newPurchase.payment_plan === "pay_later" && (
                        <>
                          <Typography variant="body2">
                            <strong>Plan de pago:</strong> Pagar durante sesión
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total a cobrar luego:</strong> $
                            {formatMoney(singleSessionTotalAmount)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Método esperado:</strong>{" "}
                            {formatPaymentMethodLabel(
                              newPurchase.payment_method_expected,
                            )}
                          </Typography>
                        </>
                      )}
                      {newPurchase.payment_plan === "deposit" && (
                        <>
                          <Typography variant="body2">
                            <strong>Plan de pago:</strong> Seña + resto
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total:</strong> ${formatMoney(singleSessionTotalAmount)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Seña:</strong> ${formatMoney(effectiveDepositAmount)} (
                            {formatPaymentMethodLabel(newPurchase.payment_method)})
                          </Typography>
                          <Typography variant="body2">
                            <strong>Resto:</strong> $
                            {formatMoney(singleSessionRemainingAmount)}
                          </Typography>
                          {singleSessionRemainingAmount > 0 && (
                            <Typography variant="body2">
                              <strong>Método esperado para el resto:</strong>{" "}
                              {formatPaymentMethodLabel(
                                newPurchase.payment_method_expected,
                              )}
                            </Typography>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {paymentMode === "new_package" && (
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
                  {paymentMode === "evaluacion" && (
                    <Typography variant="body2">
                      <strong>Tipo:</strong> Evaluación (30 min)
                    </Typography>
                  )}
                  <Divider sx={{my: 1}} />
                  <Typography variant="body2">
                    <strong>Fecha:</strong>{" "}
                    {formatAppointmentDate(scheduleDate.toISOString())}
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

  // Success screen after appointment creation
  const getSuccessContent = () => {
    if (!successState) return null;

    const hasRemainingSessionsImport = successState.remaining_sessions > 0;

    return (
      <Box sx={{py: 2, textAlign: "center"}}>
        <Typography
          variant="h6"
          sx={{fontWeight: "bold", color: "success.main", mb: 2}}
        >
          ✓ Sesión creada exitosamente
        </Typography>

        <Card sx={{mb: 3, bgcolor: "success.light"}}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
              Sesión {successState.session_number} de{" "}
              {successState.total_sessions}
            </Typography>
            <Typography variant="subtitle1" sx={{fontWeight: "bold"}}>
              {successState.treatment_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
              Cliente: {successState.customer_name}
            </Typography>
          </CardContent>
        </Card>

        {hasRemainingSessionsImport && (
          <Card
            sx={{
              mb: 3,
              bgcolor: "info.light",
              border: "2px solid",
              borderColor: "info.main",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{fontWeight: "bold", color: "info.main"}}
              >
                {successState.remaining_sessions} sesione
                {successState.remaining_sessions === 1 ? "" : "s"} restante
                {successState.remaining_sessions === 1 ? "" : "s"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                ¿Deseas agendar la próxima sesión?
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear nueva sesión</DialogTitle>
      <DialogContent>
        <Box sx={{mb: 3, mt: 1}}>
          {!successState ? (
            <>
              <Box sx={{mb: 3}}>
                <Typography variant="body2" color="text.secondary">
                  Paso {step} de {STEPS.length}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {STEPS[step - 1]}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(step / STEPS.length) * 100}
                  sx={{mt: 1, borderRadius: 1}}
                />
              </Box>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{mb: 2}}
                >
                  {error}
                </Alert>
              )}

              {getStepContent()}
            </>
          ) : (
            getSuccessContent()
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!successState ? (
          <>
            <Button onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            {step > 1 && (
              <Button onClick={handlePrevStep} disabled={submitting}>
                Atrás
              </Button>
            )}
            {step < 5 ? (
              <Button
                variant="contained"
                onClick={handleNextStep}
                disabled={submitting || (step === 2 && !selectedTreatment)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : "Crear"}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                // Reset and close
                setSuccessState(null);
                setStep(prefilledCustomer ? 2 : 1);
                setSelectedCustomer(prefilledCustomer || null);
                setSelectedTreatment(null);
                setSelectedCategory(null);
                setLaserGender(null);
                setLaserItemType(null);
                setPaymentMode(null);
                setScheduleDate(null);
                setScheduleTime(null);
                setAvailableLaserDates(null);
                setCustomerCuponeras([]);
                setSelectedCuponera(null);
                setCustomerCanPurchasePackages(null);
                setTreatmentPackages([]);
                setSelectedPackage(null);
                setNewPurchase({
                  total_sessions: "",
                  amount_paid: "",
                  payment_method: "efectivo",
                  payment_plan: "full_now",
                  payment_method_expected: "efectivo",
                });
                setDepositAmountConfig(DEFAULT_DEPOSIT_AMOUNT);
                onCreated();
                handleClose();
              }}
            >
              Cerrar
            </Button>
            {successState.remaining_sessions > 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  // If using cuponera, skip step 3 and go straight to scheduling
                  const wasUsingCuponera =
                    paymentMode === "existing_cuponera" && selectedCuponera;

                  setSuccessState(null);
                  setScheduleDate(null);
                  setScheduleTime(null);
                  setAvailableSlots([]);

                  if (wasUsingCuponera) {
                    // Keep selectedCuponera and paymentMode, jump to scheduling
                    setStep(4);
                  } else {
                    // Normal flow: go to step 3 to choose payment mode again
                    setPaymentMode(null);
                    setStep(3);
                  }
                }}
              >
                Agendar próxima sesión
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
