import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import {GoogleLogin} from "@react-oauth/google";
import {useAuth} from "../contexts/AuthContext";
import {appointmentService} from "../services/appointment_service";
import PhoneIcon from "@mui/icons-material/Phone";
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginModal({open, onClose, onSuccess}) {
  const navigate = useNavigate();
  const {loginWithGoogle, sendWhatsAppOTP, verifyWhatsAppOTP} = useAuth();
  const [tabValue, setTabValue] = useState(0); // 0: Google, 1: WhatsApp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccessMessage("");
    setOtpSent(false);
    setPhone("");
    setOtp("");
  };

  const handlePostLogin = async () => {
    onClose();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.user_type === "employee") return;
    try {
      const appointment = await appointmentService.getCustomerAppointments();
      if (appointment) {
        navigate("/existing-appointment", {state: {appointment}});
        return;
      }
    } catch (err) {
      console.error("Failed to check appointments:", err);
    }
    onSuccess?.();
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        setSuccessMessage("¡Iniciaste sesión con Google!");
        setTimeout(() => {
          handlePostLogin();
        }, 1000);
      } else {
        setError("Failed to login with Google. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Google login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleSendOTP = async () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendWhatsAppOTP(phone);
      setOtpSent(true);
      setSuccessMessage("OTP sent to your WhatsApp!");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await verifyWhatsAppOTP(phone, otp);
      if (success) {
        setSuccessMessage("¡Iniciaste sesión con WhatsApp!");
        setTimeout(() => {
          handlePostLogin();
        }, 1000);
      } else {
        setError("Invalid or expired OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disablePortal={false}
      disableRestoreFocus={true}
    >
      <DialogTitle sx={{textAlign: "center", fontWeight: "bold"}}>
        Agenda tu Evaluación
      </DialogTitle>

      <DialogContent sx={{pt: 3}}>
        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{mb: 2}}>
            {successMessage}
          </Alert>
        )}
        <Stack spacing={2} sx={{alignItems: "center"}}>
          <Typography variant="body2" sx={{color: "text.secondary"}}>
            Inicia sesión con tu cuenta de Google.
          </Typography>
          <Box sx={{width: "100%", display: "flex", justifyContent: "center"}}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              locale="es"
              auto_select={false}
              popup_ux_mode="iframe"
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{p: 2}}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
